function ZapiszCzasPracy(req, res, db) {

    const { pracownikName, weekData, year, days, totalHours } = req.body;
    // na sztywno przypisujemy nazwę pracownika i projektu (zamiast tego można by je przekazać w req.body)
    // jeśli używacie tego skryptu co wysłalem to chyba to jest gotowe do użycia
    // const pracownikName = "Anna Smith";
    const projektyName = "";

    console.log(pracownikName, projektyName, weekData, year, days, totalHours);

    try {
        // zapytanie do bazy danych, aby znaleźć id pracownika na podstawie imienia i nazwiska
        db.query(
            `SELECT idPracownik FROM Pracownik INNER JOIN Dane_osobowe ON Pracownik.FK_Dane_osobowe = Dane_osobowe.idDane_osobowe WHERE CONCAT(Dane_osobowe.Imie, ' ', Dane_osobowe.Nazwisko) = ?`,
            [pracownikName],
            function (err, pracownikResults) {
                // sprawdzamy czy wystąpił błąd albo nie znaleziono pracownika
                if (err || pracownikResults.length === 0) {
                    console.error(err);
                    return res.status(400).json({ message: 'Nie znaleziono pracownika' });
                }

                // zapisujemy id pracownika
                const pracownikId = pracownikResults[0].idPracownik;

                // Jeśli nazwa projektu jest podana, szukamy jego id
                if (projektyName) {
                    db.query(
                        `SELECT idProjekty FROM Projekty WHERE NazwaKod_Projektu = ?`,
                        [projektyName],
                        function (err, projektyResults) {
                            // sprawdzamy czy wystąpił błąd albo nie znaleziono projektu
                            if (err || projektyResults.length === 0) {
                                console.error(err);
                                return res.status(400).json({ message: 'Nie znaleziono projektu' });
                            }

                            // zapisujemy id projektu
                            const projektyId = projektyResults[0].idProjekty;
                            saveWeekAndDays(pracownikId, projektyId);
                        }
                    );
                } else {
                    // Jeśli nazwa projektu nie jest podana, zapisujemy NULL jako projektyId
                    saveWeekAndDays(pracownikId, null);
                }

                function saveWeekAndDays(pracownikId, projektyId) {
                    // sprawdzamy czy już istnieje wpis dla tego tygodnia, roku, pracownika i projektu (lub bez projektu)
                    db.query(
                        `SELECT * FROM Tydzien WHERE tydzienRoku = ? AND Rok = ? AND Pracownik_idPracownik = ? AND (Projekty_idProjekty = ? OR ? IS NULL)`,
                        [weekData, year, pracownikId, projektyId, projektyId],
                        function (err, existingWeek) {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ message: 'Wystąpił błąd podczas zapisywania czasu pracy' });
                            }

                            // zmienna do przechowywania id tygodnia, czy to istniejącego, czy nowo dodanego
                            let tydzienId = null;

                            // funkcja do aktualizacji lub wstawiania dni do bazy
                            const updateOrInsertDays = () => {
                                let completed = 0; // licznik zakończonych operacji
                                const totalDays = days.length; // liczba dni do przetworzenia

                                days.forEach(day => {
                                    const { dayOfWeek, start, end } = day;

                                    // sprawdzamy czy dzień już istnieje w bazie
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

                                            // callback, który będzie wywołany po zakończeniu aktualizacji lub wstawiania dnia
                                            const queryCallback = (err) => {
                                                if (err) {
                                                    console.error(err);
                                                    if (!res.headersSent) {
                                                        return res.status(500).json({ message: 'Wystąpił błąd podczas aktualizacji/dodawania dnia' });
                                                    }
                                                }

                                                completed += 1; // zwiększamy licznik zakończonych operacji
                                                if (completed === totalDays && !res.headersSent) {
                                                    res.status(200).json({ message: 'Czas pracy został zapisany' });
                                                }
                                            };

                                            if (existingDay.length > 0) {
                                                // jeśli dzień już istnieje, aktualizujemy jego dane (godziny pracy)
                                                db.query(
                                                    `UPDATE Dzien SET Rozpoczecia_pracy = ?, Zakonczenia_pracy = ? WHERE idDzien = ?`,
                                                    [start, end, existingDay[0].idDzien],
                                                    queryCallback
                                                );
                                            } else {
                                                // jeśli dzień nie istnieje, wstawiamy nowy wpis
                                                const daysMapping = {
                                                    'poniedziałek': 'Poniedziałek',
                                                    'wtorek': 'Wtorek',
                                                    'środa': 'Środa',
                                                    'czwartek': 'Czwartek',
                                                    'piątek': 'Piątek',
                                                    'sobota': 'Sobota',
                                                    'niedziela': 'Niedziela'
                                                };

                                                // mapujemy nazwę dnia tygodnia na format odpowiedni dla bazy danych 
                                                // (bez chyba tez działa, najważniejszy jest encoding "piątek" ale to już w bazie trzeba zrobić)
                                                const dayOfWeekFormatted = daysMapping[dayOfWeek.toLowerCase()];

                                                db.query(
                                                    `INSERT INTO Dzien (Dzien_tygodnia, Rozpoczecia_pracy, Zakonczenia_pracy, Tydzien_idTydzien)
                                                     VALUES (?, ?, ?, ?)`,
                                                    [dayOfWeekFormatted, start, end, tydzienId],
                                                    function (err) {
                                                        if (err) {
                                                            console.error(err);
                                                            if (!res.headersSent) {
                                                                return res.status(500).json({ message: 'Wystąpił błąd podczas dodawania dnia' });
                                                            }
                                                        }
                                                    }
                                                );
                                            }
                                        }
                                    );
                                });
                            };

                            if (existingWeek.length > 0) {
                                // jeśli tydzień już istnieje, aktualizujemy jego dane
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
                                            updateOrInsertDays(); // po aktualizacji tygodnia, aktualizujemy/wstawiamy dni
                                        }
                                    }
                                );
                            } else {
                                // jeśli tydzień nie istnieje, wstawiamy nowy wpis
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
                                            tydzienId = result.insertId; // zapisujemy id nowego tygodnia
                                            updateOrInsertDays(); // po wstawieniu tygodnia, aktualizujemy/wstawiamy dni
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
