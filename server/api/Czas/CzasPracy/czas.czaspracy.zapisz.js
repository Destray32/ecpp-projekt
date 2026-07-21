const { format, add } = require('date-fns');

/**
 * Validates and formats a time string to ensure it's in the proper HH:MM format
 * @param {string} timeStr - Time string to validate and format
 * @returns {string} - Properly formatted time string (HH:MM)
 */
function validateTimeFormat(timeStr) {
    // Return a default value if timeStr is null or undefined
    if (!timeStr) return '00:00';
    
    // Check if the time string matches the expected format (HH:MM)
    const timeRegex = /^([0-9]{1,2}):([0-9]{2})$/;
    const match = timeStr.match(timeRegex);
    
    if (match) {
        // If it matches the pattern, ensure hours and minutes are properly formatted
        const hours = match[1].padStart(2, '0');
        const minutes = match[2];
        return `${hours}:${minutes}`;
    } else if (timeStr.endsWith(':')) {
        // If there's a colon but no minutes, add '00'
        const hours = timeStr.slice(0, -1).padStart(2, '0');
        return `${hours}:00`;
    } else {
        // For any other invalid format, return default value
        // console.warn(`Invalid time format: ${timeStr}, using default 00:00`);
        return '00:00';
    }
}

async function ZapiszCzasPracy(req, res, db) {
    const { pracownikName, weekData, year, days, totalHours, additionalProjects } = req.body;

    try {
        days.forEach(day => {
            if (day.dayOfWeek === 'niedziela') {
                day.start = '00:00';
                day.end = '00:00';
                day.break = '00:00';
            }
            
            // Validate and format all time values to prevent database errors
            day.start = validateTimeFormat(day.start);
            day.end = validateTimeFormat(day.end);
            day.break = validateTimeFormat(day.break);
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: 'Invalid request data' });
    }

    try {
        // znajdź pracownika na podstawie jego imienia i nazwiska
        const employeeQuery = `
            SELECT idPracownik 
            FROM Pracownik 
            INNER JOIN Dane_osobowe ON Pracownik.FK_Dane_osobowe = Dane_osobowe.idDane_osobowe 
            WHERE CONCAT(Dane_osobowe.Imie, ' ', Dane_osobowe.Nazwisko) = ?
        `;
        const [pracownikResults] = await db.promise().query(employeeQuery, [pracownikName]);

        if (pracownikResults.length === 0) {
            return res.status(400).json({ message: 'Employee not found' });
        }

        const pracownikId = pracownikResults[0].idPracownik;

        // sprawdź, czy tydzień już istnieje dla tego pracownika
        const weekQuery = `SELECT * FROM Tydzien WHERE tydzienRoku = ? AND Rok = ? AND Pracownik_idPracownik = ?`;
        const [existingWeek] = await db.promise().query(weekQuery, [weekData, year, pracownikId]);

        let tydzienId = null;
        if (existingWeek.length > 0) {
            tydzienId = existingWeek[0].idTydzien;
            await db.promise().query(
                `UPDATE Tydzien SET Godziny_tygodniowe = ? WHERE idTydzien = ?`,
                [totalHours, tydzienId]
            );
        } else {
            const [insertWeekResult] = await db.promise().query(
                `INSERT INTO Tydzien (Godziny_tygodniowe, tydzienRoku, Rok, Pracownik_idPracownik) VALUES (?, ?, ?, ?)`,
                [totalHours, weekData, year, pracownikId]
            );
            tydzienId = insertWeekResult.insertId;
        }

        // wstaw lub zaktualizuj godziny pracy dla każdego dnia
        const validDays = days.filter(day => day.dayOfWeek !== null);

        for (const day of validDays) {
            if (day.dayOfWeek === 'niedziela') {
                day.start = '00:00';
                day.end = '00:00';
                day.break = '00:00';
            }

            const [existingDay] = await db.promise().query(
                `SELECT * FROM Dzien WHERE Dzien_tygodnia = ? AND Tydzien_idTydzien = ?`,
                [day.dayOfWeek, tydzienId]
            );

            let dzienId = null;
            if (existingDay.length > 0) {
                dzienId = existingDay[0].idDzien;
                await db.promise().query(
                    `UPDATE Dzien SET Rozpoczecia_pracy = ?, Zakonczenia_pracy = ?, Przerwa = ? WHERE idDzien = ?`,
                    [day.start, day.end, day.break, dzienId]
                );
            } else {
                const [insertDayResult] = await db.promise().query(
                    `INSERT INTO Dzien (Dzien_tygodnia, Rozpoczecia_pracy, Zakonczenia_pracy, Przerwa, Tydzien_idTydzien) VALUES (?, ?, ?, ?, ?)`,
                    [day.dayOfWeek, day.start, day.end, day.break, tydzienId]
                );
                dzienId = insertDayResult.insertId;
            }

            // Obsługa dodatkowych projektów dla tego dnia
            for (const project of additionalProjects) {
                const projectDay = project.days.find(pDay => pDay.dayOfWeek === day.dayOfWeek);
                if (projectDay) {
                    // znajdź ID projektu na podstawie nazwy projektu, zleceniodawcy i firmy
                    const [projektyResults] = await db.promise().query(
                        `SELECT idProjekty FROM Projekty WHERE NazwaKod_Projektu = ? AND Grupa_urlopowa_idGrupa_urlopowa = ? AND Firma_idFirma = ?`,
                        [project.projekt, project.zleceniodawca, project.firma]
                    );

                    if (projektyResults.length === 0) {
                        console.error('Project lookup error. Project name:', project.projekt, 'Zleceniodawca:', project.zleceniodawca, 'Firma:', project.firma);
                        throw new Error(`Project not found: ${project.projekt} for client: ${project.zleceniodawca}`);
                    }

                    const projektyId = projektyResults[0].idProjekty;

                    // znajdź ID samochodu na podstawie numeru rejestracyjnego, jeśli jest podany
                    let pojazdyId = null;
                    if (projectDay.car) {
                        const [carResults] = await db.promise().query(
                            `SELECT idPojazdy FROM Pojazdy WHERE Nr_rejestracyjny = ?`,
                            [projectDay.car]
                        );
                        pojazdyId = carResults[0]?.idPojazdy || null;
                    }

                    // sprawdź, czy kombinacja dnia i projektu już istnieje w tabeli 'Dzien_Projekty'
                    const [existingProjectDay] = await db.promise().query(
                        `SELECT * FROM Dzien_Projekty WHERE Dzien_idDzien = ? AND Projekty_idProjekty = ?`,
                        [dzienId, projektyId]
                    );

                    if (existingProjectDay.length > 0) {
                        // if the record exists, update all fields
                        await db.promise().query(
                            `UPDATE Dzien_Projekty SET 
                                Pojazdy_idPojazdy = ?, 
                                Godziny_przepracowane = ?, 
                                Komentarz = ?, 
                                Parking = ?, 
                                Kilometry = ?, 
                                Diety = ?, 
                                Wypozyczenie_narzedzi = ?
                            WHERE idDzien_Projekty = ?`,
                            [
                                pojazdyId, 
                                projectDay.hoursWorked, 
                                projectDay.comment, 
                                projectDay.parking, 
                                projectDay.km, 
                                projectDay.diet, 
                                projectDay.tools, 
                                existingProjectDay[0].idDzien_Projekty
                            ]
                        );
                    } else {
                        // jeśli rekord nie istnieje, wstaw nowy wpis
                        await db.promise().query(
                            `INSERT INTO Dzien_Projekty 
                                (Dzien_idDzien, Projekty_idProjekty, Godziny_przepracowane, Pojazdy_idPojazdy, 
                                Komentarz, Parking, Kilometry, Diety, Wypozyczenie_narzedzi) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                dzienId, 
                                projektyId, 
                                projectDay.hoursWorked, 
                                pojazdyId, 
                                projectDay.comment, 
                                projectDay.parking, 
                                projectDay.km, 
                                projectDay.diet, 
                                projectDay.tools
                            ]
                        );
                    }
                }
            }
        }

        res.status(200).json({ message: 'Czas pracy został zapisany' });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Błąd podczas zapisywania czasu pracy' });
        }
    }
}

module.exports = ZapiszCzasPracy;