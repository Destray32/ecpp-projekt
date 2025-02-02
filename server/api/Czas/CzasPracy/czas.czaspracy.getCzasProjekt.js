const { format, startOfWeek, addDays, setWeek, setYear } = require('date-fns');

function getCzasProjekt(req, res, db) {
    const { pracownikName, projektyName, weekData, year } = req.body;

    // zapytanie do bazy danych, aby znaleźć ID pracownika na podstawie jego imienia i nazwiska
    // łączymy tabele 'Pracownik' i 'Dane_osobowe', żeby uzyskać odpowiedni rekord
    const employeeQuery = `
        SELECT idPracownik 
        FROM Pracownik 
        INNER JOIN Dane_osobowe 
        ON Pracownik.FK_Dane_osobowe = Dane_osobowe.idDane_osobowe 
        WHERE CONCAT(Dane_osobowe.Imie, ' ', Dane_osobowe.Nazwisko) = ?`;

    // wykonujemy zapytanie do bazy z imieniem i nazwiskiem pracownika
    db.query(employeeQuery, [pracownikName], (err, employeeResult) => {
        // jeśli wystąpił błąd lub pracownik nie został znaleziony, zwracamy odpowiedni komunikat
        if (err || employeeResult.length === 0) {
            return res.status(400).json({ message: 'Nie znaleziono pracownika' });
        }

        // przechowujemy id pracownika z wyniku zapytania
        const pracownikId = employeeResult[0].idPracownik;

        // zapytanie do bazy danych, aby uzyskać godziny pracy projektu dla wybranego tygodnia
        // łączymy kilka tabel: 'Dzien_Projekty', 'Dzien', 'Tydzien', 'Projekty' i 'Pojazdy'
        const projectQuery = `
            SELECT 
                Dzien.Dzien_tygodnia AS dayOfWeek,
                Dzien_Projekty.Godziny_przepracowane AS hoursWorked,
                Pojazdy.Nr_rejestracyjny AS car
            FROM Dzien_Projekty
            INNER JOIN Dzien ON Dzien_Projekty.Dzien_idDzien = Dzien.idDzien
            INNER JOIN Tydzien ON Dzien.Tydzien_idTydzien = Tydzien.idTydzien
            INNER JOIN Projekty ON Dzien_Projekty.Projekty_idProjekty = Projekty.idProjekty
            INNER JOIN Pojazdy ON Dzien_Projekty.Pojazdy_idPojazdy = Pojazdy.idPojazdy
            WHERE Tydzien.tydzienRoku = ?
            AND Tydzien.Rok = ?
            AND Tydzien.Pracownik_idPracownik = ?
            AND Projekty.NazwaKod_Projektu = ?`;

        // wykonujemy zapytanie do bazy z danymi tygodnia, roku, id pracownika i nazwą projektu
        db.query(projectQuery, [weekData, year, pracownikId, projektyName], (err, projectResults) => {
            // jeśli wystąpił błąd podczas pobierania danych, zwracamy komunikat o błędzie
            if (err) {
                return res.status(500).json({ message: 'Błąd podczas pobierania godzin projektu' });
            }

            // jeśli zapytanie zwróciło wyniki, przetwarzamy je
            if (projectResults.length > 0) {
                const projectHours = {};

                // iterujemy przez wyniki, zapisując godziny pracy i używany samochód dla każdego dnia
                projectResults.forEach(day => {
                    projectHours[getDateFromDayName(day.dayOfWeek, weekData, year)] = {
                        hoursWorked: day.hoursWorked || 0, // ustawiamy godziny pracy, jeśli są, lub 0
                        car: day.car || null, // ustawiamy samochód, jeśli jest, lub null
                    };
                });

                // zwracamy przetworzone dane w odpowiedzi jako obiekt JSON
                res.json({ hours: projectHours });
            } else {
                // jeśli nie ma wyników, zwracamy null dla godzin
                res.json({ hours: null });
            }
        });
    });
}

// funkcja pomocnicza do konwersji nazw dni tygodnia na daty w formacie yyyy-MM-dd dla określonego tygodnia i roku
const getDateFromDayName = (dayName, weekData, year) => {
    // mapa do zamiany nazw dni na indeksy dni tygodnia
    const dayNames = {
        'Poniedziałek': 0,
        'Wtorek': 1,
        'Środa': 2,
        'Czwartek': 3,
        'Piątek': 4,
        'Sobota': 5,
        'Niedziela': 6
    };
    const dayIndex = dayNames[dayName];

    // ustawiamy odpowiedni rok i tydzień w oparciu o podane dane
    const startOfGivenWeek = startOfWeek(setYear(setWeek(new Date(), weekData), year), { weekStartsOn: 1 });

    // dodajemy indeks dnia do początku tygodnia, aby uzyskać właściwą datę
    const date = addDays(startOfGivenWeek, dayIndex);

    return format(date, 'yyyy-MM-dd'); // zwracamy datę w formacie yyyy-MM-dd
};

module.exports = getCzasProjekt;
