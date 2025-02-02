const db = require('../../../server');

function PobierzPracownika(req, res) {
    const id = req.params.id;

    const query = `
        SELECT 
            do.Imie AS name,
            do.Nazwisko AS surename,
            do.Data_urodzenia AS birthday,
            do.Pesel AS pesel,
            do.Ulica_NrDomu AS street,
            do.Kod_pocztowy AS zip,
            do.Miejscowosc AS city,
            do.Kraj AS country,
            f.idFirma AS company,
            do.TelefonPolska AS phone1,
            do.TelefonSzwecja AS phone2,
            do.Email AS email,
            do.Krewni AS relative1,
            do.Kontakt_w_razie_wypadku AS relative2,
            do.NIP AS NIP,
            io.Data_rozpoczecia AS startDate,
            io.Data_zakonczenia AS endDate,
            io.Kod_wynagrodzenia AS paycheckCode,
            poj.idPojazdy AS vehicle,
            gu.idGrupa_urlopowa AS vacationGroup,
            io.Plan_TygodniaV AS weeklyPlan,
            io.Drukowac_Urlop AS printVacation,
            p.Nazwa_uzytkownika AS login,
            p.Status_konta = 'Aktywne' AS active,
            p.Typ_konta AS role
        FROM 
            pracownik p
        JOIN
            dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
        JOIN
            informacje_o_firmie io ON p.FK_Informacje_o_firmie = io.idInformacje_o_firmie
        JOIN
            Firma f ON io.FK_idFirma = f.idFirma
        LEFT JOIN
            grupa_urlopowa gu ON io.FK_idGrupa_urlopowa = gu.idGrupa_urlopowa
        LEFT JOIN
            pojazdy poj ON io.FK_idPojazdy = poj.idPojazdy
        WHERE
            p.idPracownik = ?;
    `;

    db.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error fetching employee data:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const employeeData = results[0];
        
        employeeData.startDate = formatDate(employeeData.startDate);
        employeeData.endDate = formatDate(employeeData.endDate);
        employeeData.birthday = formatDate(employeeData.birthday);

        res.json({
            ...employeeData,
            weeklyPlan: !!employeeData.weeklyPlan,
            printVacation: !!employeeData.printVacation,
            active: !!employeeData.active,
            role: mapRoleToNumber(employeeData.role)
        });
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function mapRoleToNumber(role) {
    switch (role) {
        case 'Administrator':
            return 1;
        case 'Majster':
            return 2;
        case 'Pracownik':
            return 3;
        case 'Gosc':
            return 4;
        default:
            return 4;
    }
}

module.exports = PobierzPracownika;