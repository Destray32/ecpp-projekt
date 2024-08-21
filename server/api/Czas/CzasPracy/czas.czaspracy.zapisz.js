function ZapiszCzasPracy(req, res, db) {
    const { pracownikName, projektyName, weekData, year, days, totalHours, additionalProjects } = req.body;

    console.log(pracownikName, weekData, year, days, totalHours, additionalProjects);

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

                // Jeśli podano nazwę projektu, znajdź jego ID
                if (projektyName) {
                    db.query(
                        `SELECT idProjekty FROM Projekty WHERE NazwaKod_Projektu = ?`,
                        [projektyName],
                        function (err, projektyResults) {
                            if (err || projektyResults.length === 0) {
                                console.error(err);
                                return res.status(400).json({ message: 'Nie znaleziono projektu' });
                            }

                            const projektyId = projektyResults[0].idProjekty;
                            handleWeekAndDays(pracownikId, projektyId);
                        }
                    );
                } else {
                    handleWeekAndDays(pracownikId, null);
                }

                function handleWeekAndDays(pracownikId, projektyId) {
                    // Sprawdzamy, czy wpis dla tego tygodnia już istnieje dla danego pracownika i projektu
                    db.query(
                        `SELECT * FROM Tydzien WHERE tydzienRoku = ? AND Rok = ? AND Pracownik_idPracownik = ? AND (Projekty_idProjekty = ? OR ? IS NULL)`,
                        [weekData, year, pracownikId, projektyId, projektyId],
                        function (err, existingWeek) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: 'Wystąpił błąd podczas zapisywania czasu pracy' });
                            }

                            let tydzienId = null;

                            const updateOrInsertDays = () => {
                                const allDays = [...days];

                                // Dodajemy dodatkowe dni projektowe do allDays
                                additionalProjects.forEach(project => {
                                    project.days.forEach(day => {
                                        allDays.push(day);
                                    });
                                });

                                // Filtrujemy dni, w których godziny rozpoczęcia i zakończenia są obie ustawione na "00:00"
                                const validDays = allDays.filter(day => !(day.start === '00:00' && day.end === '00:00'));

                                let completed = 0; // licznik zakończonych operacji
                                const totalDays = validDays.length; // liczba dni do przetworzenia

                                validDays.forEach(day => {
                                    const { dayOfWeek, start, end } = day;

                                    // Sprawdzamy, czy dzień już istnieje w bazie
                                    db.query(
                                        `SELECT * FROM Dzien WHERE Dzien_tygodnia = ? AND Tydzien_idTydzien = ?`,
                                        [dayOfWeek, tydzienId],
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
                                                    res.status(200).json({ message: 'Czas pracy został zapisany' });
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
                                                    [dayOfWeekFormatted, start, end, tydzienId],
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
                                    [totalHours, 'Otwarty', tydzienId],
                                    function (err, result) {
                                        if (err) {
                                            console.error(err);
                                            if (!res.headersSent) {
                                                return res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji tygodnia' });
                                            }
                                        } else {
                                            updateOrInsertDays(); // Po aktualizacji tygodnia, aktualizujemy/wstawiamy dni
                                        }
                                    }
                                );
                            } else {
                                // Jeśli tydzień nie istnieje, dodajemy nowy wpis
                                db.query(
                                    `INSERT INTO Tydzien (Godziny_Tygodniowe, Firma, Zleceniodawca, Projekty, Status_tygodnia, tydzienRoku, Rok, Pracownik_idPracownik, Projekty_idProjekty)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                    [totalHours, null, null, projektyId ? 'projekty_name' : null, 'Otwarty', weekData, year, pracownikId, projektyId],
                                    function (err, result) {
                                        if (err) {
                                            console.error(err);
                                            if (!res.headersSent) {
                                                return res.status(500).json({ message: 'Wystąpił błąd podczas dodawania tygodnia' });
                                            }
                                        } else {
                                            tydzienId = result.insertId; // Zapisujemy nowe id tygodnia
                                            updateOrInsertDays(); // Po utworzeniu tygodnia, aktualizujemy/wstawiamy dni
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
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
