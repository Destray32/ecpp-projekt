async function PobierzDodaneProjekty(req, res, db) {
    const { pracownikName, weekData, year } = req.query;

    try {
        // pobieramy id pracownika na podstawie imienia i nazwiska
        const employeeQuery = `
            SELECT p.idPracownik
            FROM Pracownik p
            INNER JOIN Dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
            WHERE CONCAT(do.Imie, ' ', do.Nazwisko) = ?
        `;
        const [employeeResult] = await db.promise().query(employeeQuery, [pracownikName]);

        if (employeeResult.length === 0) {
            return res.status(404).json({ message: 'Nie znaleziono pracownika' });
        }

        const pracownikId = employeeResult[0].idPracownik;

        // pobieramy wpis tygodnia z tabeli 'Tydzien' dla podanego tygodnia i roku
        const weekQuery = `
            SELECT t.idTydzien
            FROM Tydzien t
            WHERE t.tydzienRoku = ? AND t.Rok = ? AND t.Pracownik_idPracownik = ?
        `;
        const [weekResult] = await db.promise().query(weekQuery, [weekData, year, pracownikId]);

        if (weekResult.length === 0) {
            return res.status(404).json({ message: 'Nie znaleziono projektów dla tego tygodnia i roku' });
        }

        const tydzienId = weekResult[0].idTydzien;

        // pobieramy szczegóły projektów (firma, zleceniodawca, projekt, godziny, pojazdy) dla danego tygodnia
        const projectQuery = `
            SELECT
                dp.idDzien_Projekty AS id, 
                dp.Godziny_przepracowane AS hoursWorked,
                p.NazwaKod_Projektu AS projectName,
                po.Nr_rejestracyjny AS car,
                d.Dzien_tygodnia AS dayOfWeek,
                dp.Komentarz AS comment,
                dp.Parking AS parking,
                dp.Kilometry AS km,
                dp.Diety as diet,
                dp.Wypozyczenie_narzedzi AS tools
            FROM 
                Dzien_Projekty dp
            INNER JOIN 
                Projekty p ON dp.Projekty_idProjekty = p.idProjekty
            LEFT JOIN 
                Pojazdy po ON dp.Pojazdy_idPojazdy = po.idPojazdy
            INNER JOIN 
                Dzien d ON dp.Dzien_idDzien = d.idDzien
            INNER JOIN 
                Tydzien t ON d.Tydzien_idTydzien = t.idTydzien
            WHERE 
                d.Tydzien_idTydzien = ?
        `;
        const [projectsResult] = await db.promise().query(projectQuery, [tydzienId]);

        if (projectsResult.length === 0) {
            return res.status(404).json({ message: 'Nie znaleziono dodatkowych projektów' });
        }

        // grupujemy dane po projektach i dniach, z godzinami i informacjami o pojazdach
        const projectsMap = {};

        projectsResult.forEach((project) => {
            if (!projectsMap[project.projectName]) {
                projectsMap[project.projectName] = {
                    firma: project.firma,
                    zleceniodawca: project.zleceniodawca,
                    projekt: project.projectName,
                    hours: {}, // tu przechowujemy godziny dla poszczególnych dni
                };
            }

            // dodajemy godziny pracy i informacje o samochodzie dla każdego dnia w tygodniu
            projectsMap[project.projectName].hours[project.dayOfWeek] = {
                id: project.id,
                hoursWorked: project.hoursWorked,
                car: project.car || null,
                comment: project.comment || null,
                parking: project.parking || null,
                km: project.km || null,
                diet: project.diet || null,
                tools: project.tools || null,
            };
        });

        // zamieniamy mapę na tablicę, żeby zwrócić uporządkowane dane
        const structuredProjects = Object.values(projectsMap);
        res.status(200).json({ projects: structuredProjects });
    } catch (error) {
        console.error('Błąd podczas pobierania dodatkowych projektów', error);
        res.status(500).json({ message: 'Błąd serwera' });
    }
}

module.exports = PobierzDodaneProjekty;
