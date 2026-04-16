function DodajUrlop(req, res, db) {
    const { nazwisko_imie, status, urlop_od, urlop_do, komentarz, mergeOverlap } = req.body;

    if (!nazwisko_imie) {
        return res.status(400).send('Imie i nazwisko są wymagane');
    }

    const [nazwisko, ...imieParts] = String(nazwisko_imie).trim().split(' ');
    const imie = imieParts.join(' ').trim();

    if (!imie || !nazwisko) {
        return res.status(400).send('Imie i nazwisko są wymagane');
    }

    const getPracownikIdQuery = `
        SELECT idPracownik 
        FROM Pracownik p 
        JOIN Dane_osobowe d ON p.FK_Dane_osobowe = d.idDane_osobowe 
        WHERE d.Imie = ? AND d.Nazwisko = ?
    `;

    db.query(getPracownikIdQuery, [imie, nazwisko], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(400).send('Błąd pobierania pracownika');
        }

        if (result.length === 0) {
            return res.status(404).send('Pracownik nie znaleziony');
        }

        const pracownikId = result[0].idPracownik;

        const checkOverlapQuery = `
            SELECT
                idUrlopy,
                DATE_FORMAT(Urlop_od, '%Y-%m-%d') AS Urlop_od,
                DATE_FORMAT(Urlop_do, '%Y-%m-%d') AS Urlop_do,
                Status,
                Komentarz
            FROM Urlopy 
            WHERE FK_idPracownik = ? AND (
                (Urlop_od <= ? AND Urlop_do >= ?) OR 
                (Urlop_od >= ? AND Urlop_od <= ?)
            )
        `;

        db.query(checkOverlapQuery, [pracownikId, urlop_do, urlop_od, urlop_od, urlop_do], (err, overlapResult) => {
            if (err) {
                console.log(err);
                return res.status(400).send('Błąd sprawdzania istniejącego urlopu');
            }

            if (overlapResult.length > 0) {
                const toIsoDate = (value) => {
                    if (!value) return null;

                    if (value instanceof Date) {
                        const year = value.getUTCFullYear();
                        const month = String(value.getUTCMonth() + 1).padStart(2, '0');
                        const day = String(value.getUTCDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    }

                    if (typeof value === 'string') {
                        const trimmed = value.trim();

                        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
                            return trimmed.slice(0, 10);
                        }

                        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
                            const [day, month, year] = trimmed.split('/');
                            return `${year}-${month}-${day}`;
                        }

                        const parsed = new Date(trimmed);
                        if (!Number.isNaN(parsed.getTime())) {
                            const year = parsed.getUTCFullYear();
                            const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
                            const day = String(parsed.getUTCDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                        }
                    }

                    return null;
                };

                const allStarts = [toIsoDate(urlop_od), ...overlapResult.map(item => toIsoDate(item.Urlop_od))].filter(Boolean);
                const allEnds = [toIsoDate(urlop_do), ...overlapResult.map(item => toIsoDate(item.Urlop_do))].filter(Boolean);

                const suggestedStart = allStarts.reduce((min, current) => current < min ? current : min);
                const suggestedEnd = allEnds.reduce((max, current) => current > max ? current : max);

                if (!mergeOverlap) {
                    return res.status(409).json({
                        code: 'VACATION_OVERLAP',
                        message: 'Urlop w tym okresie już istnieje',
                        overlaps: overlapResult.map(item => ({
                            id: item.idUrlopy,
                            urlop_od: item.Urlop_od,
                            urlop_do: item.Urlop_do,
                            status: item.Status,
                            komentarz: item.Komentarz,
                        })),
                        suggestedRange: {
                            urlop_od: suggestedStart,
                            urlop_do: suggestedEnd,
                        },
                    });
                }

                const overlapIds = overlapResult.map(item => item.idUrlopy);

                return db.getConnection((connectionError, connection) => {
                    if (connectionError) {
                        console.log(connectionError);
                        return res.status(500).send('Błąd połączenia z bazą danych');
                    }

                    connection.beginTransaction((transactionError) => {
                        if (transactionError) {
                            connection.release();
                            console.log(transactionError);
                            return res.status(500).send('Błąd rozpoczęcia transakcji');
                        }

                        const deleteQuery = 'DELETE FROM Urlopy WHERE idUrlopy IN (?)';
                        connection.query(deleteQuery, [overlapIds], (deleteErr) => {
                            if (deleteErr) {
                                return connection.rollback(() => {
                                    connection.release();
                                    console.log(deleteErr);
                                    res.status(500).send('Błąd podczas usuwania nakładających się urlopów');
                                });
                            }

                            const insertMergedQuery = `
                                INSERT INTO Urlopy (Imie, Nazwisko, Urlop_od, Urlop_do, Status, Komentarz, FK_idPracownik)
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            `;

                            connection.query(
                                insertMergedQuery,
                                [imie, nazwisko, suggestedStart, suggestedEnd, status, komentarz, pracownikId],
                                (insertErr) => {
                                    if (insertErr) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            console.log(insertErr);
                                            res.status(500).send('Błąd podczas łączenia nakładających się urlopów');
                                        });
                                    }

                                    connection.commit((commitErr) => {
                                        if (commitErr) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                console.log(commitErr);
                                                res.status(500).send('Błąd zatwierdzenia łączenia urlopów');
                                            });
                                        }

                                        connection.release();
                                        return res.status(200).json({
                                            message: 'Połączono nakładające się urlopy',
                                            merged: true,
                                            mergedRange: {
                                                urlop_od: suggestedStart,
                                                urlop_do: suggestedEnd,
                                            }
                                        });
                                    });
                                }
                            );
                        });
                    });
                });
            }

            const insertUrlopQuery = `
                INSERT INTO Urlopy (Imie, Nazwisko, Urlop_od, Urlop_do, Status, Komentarz, FK_idPracownik) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(insertUrlopQuery, [imie, nazwisko, urlop_od, urlop_do, status, komentarz, pracownikId], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send('Błąd dodawania urlopu');
                }
                res.status(200).send("Dodano urlop");
            });
        });
    });
}

module.exports = DodajUrlop;