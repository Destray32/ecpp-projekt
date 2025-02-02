const jwt = require('jsonwebtoken');
const db = require('../../../server');

function MojeDane(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userId = decoded.id;

        console.log('MojeDane', userId);

        const query = `
            SELECT 
                dane_osobowe.Imie AS name, 
                dane_osobowe.Nazwisko AS surename, 
                DATE_FORMAT(dane_osobowe.Data_urodzenia, '%d.%m.%Y') AS brithday, 
                dane_osobowe.Pesel AS pesel, 
                dane_osobowe.Ulica_NrDomu AS street, 
                dane_osobowe.Kod_pocztowy AS zip, 
                dane_osobowe.Miejscowosc AS city, 
                dane_osobowe.Kraj AS country, 
                dane_osobowe.TelefonPolska AS phone1, 
                dane_osobowe.TelefonSzwecja AS phone2, 
                dane_osobowe.Email AS email, 
                dane_osobowe.Krewni AS relative1, 
                dane_osobowe.Kontakt_w_razie_wypadku AS relative2, 
                dane_osobowe.NIP AS NIP, 
                DATE_FORMAT(informacje_o_firmie.Data_rozpoczecia, '%d.%m.%Y') AS startDate, 
                IFNULL(DATE_FORMAT(informacje_o_firmie.Data_zakonczenia, '%d.%m.%Y'), '') AS endDate, 
                informacje_o_firmie.Kod_wynagrodzenia AS paycheckCode, 
                informacje_o_firmie.FK_idFirma AS company,
                informacje_o_firmie.FK_idPojazdy AS vehicle, 
                informacje_o_firmie.FK_idGrupa_urlopowa AS vacationGroup,
                informacje_o_firmie.Plan_TygodniaV AS weeklyPlan, 
                informacje_o_firmie.Drukowac_Urlop AS printVacation, 
                pracownik.Nazwa_uzytkownika AS login, 
                pracownik.Status_konta = 'Aktywne' AS active, 
                CASE pracownik.Typ_konta 
                    WHEN 'Administrator' THEN 1 
                    WHEN 'Majster' THEN 2 
                    WHEN 'Pracownik' THEN 3 
                    ELSE 4 
                END AS role 
            FROM pracownik
            JOIN dane_osobowe ON dane_osobowe.idDane_osobowe = pracownik.FK_Dane_osobowe
            JOIN informacje_o_firmie ON informacje_o_firmie.idInformacje_o_firmie = pracownik.FK_Informacje_o_firmie
            WHERE pracownik.idPracownik = ?
        `;

        db.query(query, [userId], (error, results) => {
            if (error) {
                console.error('Error fetching user data:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'No data found for this user' });
            }

            const userData = results[0];
            const responseData = {
                surename: userData.surename,
                name: userData.name,
                brithday: userData.brithday,
                pesel: userData.pesel,
                street: userData.street,
                zip: userData.zip,
                city: userData.city,
                country: userData.country,
                phone1: userData.phone1,
                phone2: userData.phone2,
                email: userData.email,
                relative1: userData.relative1,
                relative2: userData.relative2,
                NIP: userData.NIP,
                startDate: userData.startDate,
                endDate: userData.endDate,
                paycheckCode: userData.paycheckCode,
                company: userData.company,
                vehicle: userData.vehicle,
                vacationGroup: userData.vacationGroup,
                weeklyPlan: !!userData.weeklyPlan,
                printVacation: !!userData.printVacation,
                login: userData.login,
                active: !!userData.active,
                role: userData.role,
            };

            res.status(200).json(responseData);
        });
    });
}

module.exports = MojeDane;