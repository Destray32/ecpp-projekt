function DodajUrlop(req, res, db) {
    const { nazwisko_imie, status, urlop_od, urlop_do, komentarz } = req.body;

    if (!nazwisko_imie) {
        return res.status(400).send('Imie i nazwisko są wymagane');
    }

    const [nazwisko, imie] = nazwisko_imie.split(' ');

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
            SELECT * 
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
                return res.status(400).send('Urlop w tym okresie już istnieje');
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