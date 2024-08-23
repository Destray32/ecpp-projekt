function ZapiszCzasPracy(req, res, db) {
    const { pracownikName, projektyName, weekData, year, days, totalHours, additionalProjects } = req.body;

    try {
        // Znajdujemy pracownika na podstawie podanej nazwy
        db.query(
            `SELECT idPracownik FROM Pracownik INNER JOIN Dane_osobowe ON Pracownik.FK_Dane_osobowe = Dane_osobowe.idDane_osobowe WHERE CONCAT(Dane_osobowe.Imie, ' ', Dane_osobowe.Nazwisko) = ?`,
            [pracownikName],
            function (err, pracownikResults) {
                if (err || pracownikResults.length === 0) {
                    console.error(err);
                    return res.status(400).json({ message: 'Nie znaleziono pracownika' });
                }

                const pracownikId = pracownikResults[0].idPracownik;

                const handleProject = (projektyId, projektyName, firmaName, zleceniodawcaName, projectTotalHours, callback) => {
                    db.query(
                        `SELECT * FROM Tydzien WHERE tydzienRoku = ? AND Rok = ? AND Pracownik_idPracownik = ? AND Projekty_idProjekty = ?`,
                        [weekData, year, pracownikId, projektyId],
                        function (err, existingWeek) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: 'Wystąpił błąd podczas zapisywania czasu pracy' });
                            }

                            let tydzienId = null;

                            const updateOrInsertDays = (tid) => {
                                const projectDays = additionalProjects.find(project => project.projekt === projektyName).days;

                                const validDays = projectDays.filter(day => !(day.start === '00:00' && day.end === '00:00'));

                                let completed = 0;
                                const totalDays = validDays.length;

                                validDays.forEach(day => {
                                    const { dayOfWeek, start, end } = day;

                                    db.query(
                                        `SELECT * FROM Dzien WHERE Dzien_tygodnia = ? AND Tydzien_idTydzien = ?`,
                                        [dayOfWeek, tid],
                                        function (err, existingDay) {
                                            if (err) {
                                                console.error(err);
                                                if (!res.headersSent) {
                                                    return res.status(500).json({ message: 'Wystąpił błąd podczas zapisywania dnia' });
                                                }
                                            }

                                            const queryCallback = (err) => {
                                                if (err) {
                                                    console.error(err);
                                                    if (!res.headersSent) {
                                                        return res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji/dodawania dnia' });
                                                    }
                                                }

                                                completed += 1;
                                                if (completed === totalDays && !res.headersSent) {
                                                    callback();
                                                }
                                            };

                                            if (existingDay.length > 0) {
                                                // Jeśli dzień już istnieje, aktualizujemy jego godziny pracy
                                                db.query(
                                                    `UPDATE Dzien SET Rozpoczecia_pracy = ?, Zakonczenia_pracy = ? WHERE idDzien = ?`,
                                                    [start, end, existingDay[0].idDzien],
                                                    queryCallback
                                                );
                                            } else {
                                                // Jeśli dzień nie istnieje, dodajemy nowy wpis
                                                const daysMapping = {
                                                    'poniedziałek': 'Poniedziałek',
                                                    'wtorek': 'Wtorek',
                                                    'środa': 'Środa',
                                                    'czwartek': 'Czwartek',
                                                    'piątek': 'Piątek',
                                                    'sobota': 'Sobota',
                                                    'niedziela': 'Niedziela'
                                                };

                                                const dayOfWeekFormatted = daysMapping[dayOfWeek.toLowerCase()];

                                                db.query(
                                                    `INSERT INTO Dzien (Dzien_tygodnia, Rozpoczecia_pracy, Zakonczenia_pracy, Tydzien_idTydzien)
                                                     VALUES (?, ?, ?, ?)`,
                                                    [dayOfWeekFormatted, start, end, tid],
                                                    queryCallback
                                                );
                                            }
                                        }
                                    );
                                });
                            };

                            if (existingWeek.length > 0) {
                                // Jeśli tydzień już istnieje, aktualizujemy jego dane
                                tydzienId = existingWeek[0].idTydzien;
                                db.query(
                                    `UPDATE Tydzien SET Godziny_tygodniowe = ?, Status_tygodnia = ? WHERE idTydzien = ?`,
                                    [projectTotalHours, 'Otwarty', tydzienId],
                                    function (err, result) {
                                        if (err) {
                                            console.error(err);
                                            if (!res.headersSent) {
                                                return res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji tygodnia' });
                                            }
                                        } else {
                                            updateOrInsertDays(tydzienId);
                                        }
                                    }
                                );
                            } else {
                                // Jeśli tydzień nie istnieje, dodajemy nowy wpis
                                db.query(
                                    `INSERT INTO Tydzien (Godziny_Tygodniowe, Firma, Zleceniodawca, Projekty, Status_tygodnia, tydzienRoku, Rok, Pracownik_idPracownik, Projekty_idProjekty)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                    [projectTotalHours, firmaName, zleceniodawcaName, projektyName, 'Otwarty', weekData, year, pracownikId, projektyId],
                                    function (err, result) {
                                        if (err) {
                                            console.error(err);
                                            if (!res.headersSent) {
                                                return res.status(500).json({ message: 'Wystąpił błąd podczas dodawania tygodnia' });
                                            }
                                        } else {
                                            tydzienId = result.insertId;
                                            updateOrInsertDays(tydzienId);
                                        }
                                    }
                                );
                            }
                        }
                    );
                };

                const processAdditionalProjects = (index) => {
                    if (index >= additionalProjects.length) {
                        res.status(200).json({ message: 'Czas pracy został zapisany' });
                        return;
                    }

                    const project = additionalProjects[index];

                    db.query(
                        `SELECT idProjekty FROM Projekty WHERE NazwaKod_Projektu = ?`,
                        [project.projekt],
                        function (err, projektyResults) {
                            if (err || projektyResults.length === 0) {
                                console.error(err);
                                return res.status(400).json({ message: 'Nie znaleziono projektu' });
                            }

                            const projektyId = projektyResults[0].idProjekty;
                            const projectTotalHours = project.totalHours || 0; // Make sure you calculate total hours for each project on the frontend

                            handleProject(projektyId, project.projekt, project.firma, project.zleceniodawca, projectTotalHours, () => {
                                processAdditionalProjects(index + 1);
                            });
                        }
                    );
                };

                processAdditionalProjects(0);
            }
        );
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Wystąpił błąd podczas zapisywania czasu pracy' });
        }
    }
}

module.exports = ZapiszCzasPracy;
