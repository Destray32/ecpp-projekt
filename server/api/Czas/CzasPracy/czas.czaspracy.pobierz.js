function PobierzCzasPracy(req, res, db) {
    const { pracownikName, weekData, year } = req.query;

    // zapytanie, aby uzyskać ID pracownika na podstawie imienia i nazwiska
    const employeeQuery = `SELECT idPracownik FROM Pracownik INNER JOIN Dane_osobowe ON Pracownik.FK_Dane_osobowe = Dane_osobowe.idDane_osobowe WHERE CONCAT(Dane_osobowe.Imie, ' ', Dane_osobowe.Nazwisko) = ?`;

    db.query(employeeQuery, [pracownikName], (err, employeeResult) => {
        if (err || employeeResult.length === 0) {
            return res.status(400).json({ message: 'Nie znaleziono pracownika' });
        }

        const pracownikId = employeeResult[0].idPracownik;

        // zapytanie, aby uzyskać dane dotyczące tygodnia i odpowiadających godzin pracy
        const timeQuery = `SELECT Dzien_tygodnia as dayOfWeek, Rozpoczecia_pracy as start, Zakonczenia_pracy as end, Przerwa as break 
                           FROM Dzien 
                           INNER JOIN Tydzien ON Dzien.Tydzien_idTydzien = Tydzien.idTydzien 
                           WHERE Tydzien.tydzienRoku = ? AND Tydzien.Rok = ? AND Tydzien.Pracownik_idPracownik = ?`;

        db.query(timeQuery, [weekData, year, pracownikId], (err, timeResults) => {
            if (err) {
                return res.status(500).json({ message: 'Błąd podczas pobierania godzin pracy' });
            }

            // konwertujemy nazwy dni na daty na podstawie podanego tygodnia
            const normalizedData = {};
            timeResults.forEach((day) => {
                const dayKey = getDateFromDayName(day.dayOfWeek, weekData, year);
                normalizedData[dayKey] = {
                    start: formatTime(day.start),
                    end: formatTime(day.end),
                    break: formatTime(day.break),
                };
            });

            res.json({ days: normalizedData });
        });
    });
};

function formatTime(time) {
    // funkcja formatująca czas, aby zawierał tylko godziny i minuty
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
}

// funkcja pomocnicza, która konwertuje nazwy dni tygodnia na daty
const getDateFromDayName = (dayName, weekNumber, year) => {
    const dayNames = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
    const targetDayIndex = dayNames.indexOf(dayName.toLowerCase());

    // uzyskanie pierwszego dnia tygodnia w danym roku
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    const weekStartDate = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset - firstDayOfYear.getDay() + 1));

    // uzyskanie konkretnego dnia tygodnia
    const specificDay = new Date(weekStartDate.setDate(weekStartDate.getDate() + targetDayIndex));
    return specificDay.toISOString().split('T')[0]; // zwraca datę w formacie yyyy-MM-dd
};

module.exports = PobierzCzasPracy;
