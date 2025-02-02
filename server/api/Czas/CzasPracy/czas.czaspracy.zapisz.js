const { format, add } = require('date-fns');

function ZapiszCzasPracy(req, res, db) {
    const { pracownikName, weekData, year, days, totalHours, additionalProjects } = req.body;

    try {
        days.forEach(day => {
            if (day.dayOfWeek === 'niedziela') {
                day.start = '00:00';
                day.end = '00:00';
                day.break = '00:00';
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Invalid request data' });
    }

    try {
        // znajdź pracownika na podstawie jego imienia i nazwiska
        db.query(
            `SELECT idPracownik FROM Pracownik INNER JOIN Dane_osobowe ON Pracownik.FK_Dane_osobowe = Dane_osobowe.idDane_osobowe WHERE CONCAT(Dane_osobowe.Imie, ' ', Dane_osobowe.Nazwisko) = ?`,
            [pracownikName],
            function (err, pracownikResults) {
                if (err || pracownikResults.length === 0) {
                    console.error(err);
                    return res.status(400).json({ message: 'Employee not found' });
                }

                const pracownikId = pracownikResults[0].idPracownik;

                // sprawdź, czy tydzień już istnieje dla tego pracownika
                db.query(
                    `SELECT * FROM Tydzien WHERE tydzienRoku = ? AND Rok = ? AND Pracownik_idPracownik = ?`,
                    [weekData, year, pracownikId],
                    function (err, existingWeek) {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ message: 'Error while saving work time' });
                        }

                        let tydzienId = null;

                        // funkcja do obsługi dni i projektów
                        const handleDaysAndProjects = (tid) => {
                            // wstaw lub zaktualizuj godziny pracy dla każdego dnia w tabeli 'Dzien'
                            const validDays = days.filter(day => day.dayOfWeek !== null);

                            let projectInsertionPromises = [];

                            validDays.forEach(day => {
                                if (day.dayOfWeek === 'niedziela') {
                                    day.start = '00:00';
                                    day.end = '00:00';
                                    day.break = '00:00';
                                }

                                db.query(
                                    `SELECT * FROM Dzien WHERE Dzien_tygodnia = ? AND Tydzien_idTydzien = ?`,
                                    [day.dayOfWeek, tid],
                                    function (err, existingDay) {
                                        if (err) {
                                            console.error(err);
                                            return res.status(500).json({ message: 'Error while saving day' });
                                        }

                                        let dzienId = null;

                                        // funkcja do obsługi dodatkowych projektów i zapisania godzin pracy dla tych projektów w tabeli 'Dzien_Projekty'
                                        const saveOrUpdateProjects = (dzienId) => {
                                            additionalProjects.forEach(project => {
                                                const projectDay = project.days.find(pDay => pDay.dayOfWeek === day.dayOfWeek);
                                                if (projectDay) {
                                                    projectInsertionPromises.push(new Promise((resolve, reject) => {
                                                        // znajdź ID projektu na podstawie nazwy projektu
                                                        db.query(
                                                            `SELECT idProjekty FROM Projekty WHERE NazwaKod_Projektu = ?`,
                                                            [project.projekt],
                                                            function (err, projektyResults) {
                                                                if (err || projektyResults.length === 0) {
                                                                    console.error(err);
                                                                    return reject(new Error('Project not found'));
                                                                }

                                                                const projektyId = projektyResults[0].idProjekty;

                                                                // znajdź ID samochodu na podstawie numeru rejestracyjnego, jeśli jest podany
                                                                const carQuery = projectDay.car 
                                                                    ? `SELECT idPojazdy FROM Pojazdy WHERE Nr_rejestracyjny = ?`
                                                                    : `SELECT NULL AS idPojazdy`;  // if no car was selected
                                                                
                                                                const carParams = projectDay.car 
                                                                    ? [projectDay.car] 
                                                                    : [];

                                                                db.query(carQuery, carParams, function (err, carResults) {
                                                                    if (err) {
                                                                        console.error(err);
                                                                        return reject(new Error('Error while finding car'));
                                                                    }

                                                                    const pojazdyId = carResults[0]?.idPojazdy || null;

                                                                    // sprawdź, czy kombinacja dnia, projektu i samochodu już istnieje w tabeli 'Dzien_Projekty'
                                                                    db.query(
                                                                        `SELECT * FROM Dzien_Projekty WHERE Dzien_idDzien = ? AND Projekty_idProjekty = ?`,
                                                                        [dzienId, projektyId],
                                                                        function (err, existingProjectDay) {
                                                                            if (err) {
                                                                                console.error(err);
                                                                                return reject(err);
                                                                            }

                                                                            const queryCallback = (err) => {
                                                                                if (err) {
                                                                                    console.error(err);
                                                                                    return reject(err);
                                                                                }
                                                                                resolve();
                                                                            };

                                                                            if (existingProjectDay.length > 0) {
                                                                                // if the record exists, update all fields
                                                                                db.query(
                                                                                    `UPDATE Dzien_Projekty SET 
                                                                                        Pojazdy_idPojazdy = ?, 
                                                                                        Godziny_przepracowane = ?, 
                                                                                        Komentarz = ?, 
                                                                                        Parking = ?, 
                                                                                        Kilometry = ?, 
                                                                                        Diety = ?, 
                                                                                        Wypozyczenie_narzedzi = ?
                                                                                    WHERE idDzien_Projekty = ?`,
                                                                                    [pojazdyId, projectDay.hoursWorked, projectDay.comment, projectDay.parking, projectDay.km, projectDay.diet, projectDay.tools, existingProjectDay[0].idDzien_Projekty],
                                                                                    queryCallback
                                                                                );
                                                                            } else {
                                                                                // jeśli rekord nie istnieje, wstaw nowy wpis
                                                                                db.query(
                                                                                    `INSERT INTO Dzien_Projekty 
                                                                                        (Dzien_idDzien, Projekty_idProjekty, Godziny_przepracowane, Pojazdy_idPojazdy, 
                                                                                        Komentarz, Parking, Kilometry,  Diety, Wypozyczenie_narzedzi) 
                                                                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                                                                    [dzienId, projektyId, projectDay.hoursWorked, pojazdyId, projectDay.comment, projectDay.parking, projectDay.km, projectDay.diet, projectDay.tools],
                                                                                    queryCallback
                                                                                );
                                                                            }
                                                                        }
                                                                    );
                                                                });
                                                            }
                                                        );
                                                    }));
                                                }
                                            });
                                        };

                                        if (existingDay.length > 0) {
                                            // jeśli dzień już istnieje, zaktualizuj go
                                            dzienId = existingDay[0].idDzien;
                                            db.query(
                                                `UPDATE Dzien SET Rozpoczecia_pracy = ?, Zakonczenia_pracy = ?, Przerwa = ? WHERE idDzien = ?`,
                                                [day.start, day.end, day.break, dzienId],
                                                function (err) {
                                                    if (err) {
                                                        console.error(err);
                                                    } else {
                                                        saveOrUpdateProjects(dzienId);
                                                    }
                                                }
                                            );
                                        } else {
                                            // jeśli dzień nie istnieje, wstaw nowy rekord
                                            db.query(
                                                `INSERT INTO Dzien (Dzien_tygodnia, Rozpoczecia_pracy, Zakonczenia_pracy, Przerwa, Tydzien_idTydzien) VALUES (?, ?, ?, ?, ?)`,
                                                [day.dayOfWeek, day.start, day.end, day.break, tid],
                                                function (err, result) {
                                                    if (err) {
                                                        console.error(err);
                                                    } else {
                                                        dzienId = result.insertId;
                                                        saveOrUpdateProjects(dzienId);
                                                    }
                                                }
                                            );
                                        }
                                    }
                                );
                            });

                            // poczekaj na zakończenie wszystkich operacji dodawania projektów
                            Promise.all(projectInsertionPromises)
                                .then(() => {
                                    res.status(200).json({ message: 'Czas pracy został zapisany' });
                                })
                                .catch(error => {
                                    console.error(error);
                                    res.status(500).json({ message: 'Error while saving projects' });
                                });
                        };

                        if (existingWeek.length > 0) {
                            // jeśli tydzień już istnieje, zaktualizuj go
                            tydzienId = existingWeek[0].idTydzien;
                            db.query(
                                `UPDATE Tydzien SET Godziny_tygodniowe = ? WHERE idTydzien = ?`,
                                [totalHours, tydzienId],
                                function (err) {
                                    if (err) {
                                        console.error(err);
                                        return res.status(500).json({ message: 'Error while updating week' });
                                    }
                                    handleDaysAndProjects(tydzienId);
                                }
                            );
                        } else {
                            // if the week doesn't exist, insert a new record
                            db.query(
                                `INSERT INTO Tydzien (Godziny_tygodniowe, tydzienRoku, Rok, Pracownik_idPracownik) VALUES (?, ?, ?, ?)`,
                                [totalHours, weekData, year, pracownikId],
                                function (err, result) {
                                    if (err) {
                                        console.error(err);
                                        return res.status(500).json({ message: 'Błąd podczas dodawania tygodnia' });
                                    }
                                    tydzienId = result.insertId;
                                    handleDaysAndProjects(tydzienId);
                                }
                            );
                        }
                    }
                );
            }
        );
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Błąd podczas zapisywania czasu pracy' });
        }
    }
}

module.exports = ZapiszCzasPracy;