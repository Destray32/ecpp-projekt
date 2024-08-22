const { format, startOfWeek, addDays, setWeek, setYear } = require('date-fns');

function getCzasProjekt(req, res, db) {
    const { pracownikName, projektyName, weekData, year } = req.query;

    // zapytanie, aby uzyskać ID pracownika na podstawie imienia i nazwiska
    const employeeQuery = `SELECT idPracownik FROM Pracownik INNER JOIN Dane_osobowe ON Pracownik.FK_Dane_osobowe = Dane_osobowe.idDane_osobowe WHERE CONCAT(Dane_osobowe.Imie, ' ', Dane_osobowe.Nazwisko) = ?`;

    db.query(employeeQuery, [pracownikName], (err, employeeResult) => {
        if (err || employeeResult.length === 0) {
            return res.status(400).json({ message: 'Nie znaleziono pracownika' });
        }

        const pracownikId = employeeResult[0].idPracownik;

        // zapytanie, aby uzyskać godziny projektu, jeśli istnieją dla wybranego tygodnia
        const projectQuery = `
            SELECT Dzien_tygodnia as dayOfWeek, Rozpoczecia_pracy as start, Zakonczenia_pracy as end
            FROM Dzien
            INNER JOIN Tydzien ON Dzien.Tydzien_idTydzien = Tydzien.idTydzien
            WHERE Tydzien.tydzienRoku = ?
            AND Tydzien.Rok = ?
            AND Tydzien.Pracownik_idPracownik = ?
            AND Tydzien.Projekty_idProjekty = (
                SELECT idProjekty FROM Projekty WHERE NazwaKod_Projektu = ?
            )`;

        db.query(projectQuery, [weekData, year, pracownikId, projektyName], (err, projectResults) => {
            if (err) {
                return res.status(500).json({ message: 'Błąd podczas pobierania godzin projektu' });
            }

            if (projectResults.length > 0) {
                const projectHours = {};

                // iteracja przez dni i zapisywanie godzin w obiekcie projectHours
                projectResults.forEach(day => {
                    projectHours[getDateFromDayName(day.dayOfWeek, weekData, year)] = {
                        start: day.start || "00:00", // ustawiamy "00:00" jeśli start jest pusty
                        end: day.end || "00:00", // ustawiamy "00:00" jeśli end jest pusty
                    };
                });

                res.json({ hours: projectHours });
            } else {
                res.json({ hours: null });
            }
        });
    });
}

// funkcja pomocnicza do konwersji nazw dni na daty w formacie yyyy-MM-dd dla określonego tygodnia i roku
const getDateFromDayName = (dayName, weekData, year) => {
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

    // ustawiamy odpowiedni rok i tydzień
    const startOfGivenWeek = startOfWeek(setYear(setWeek(new Date(), weekData), year), { weekStartsOn: 1 });

    // dodajemy indeks dnia do początku tygodnia, aby uzyskać właściwą datę
    const date = addDays(startOfGivenWeek, dayIndex);

    return format(date, 'yyyy-MM-dd'); // zwracamy datę w formacie yyyy-MM-dd
};

module.exports = getCzasProjekt;
