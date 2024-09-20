const db = require('../../../server');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const schema = Joi.object({
    surename: Joi.string().required(),
    name: Joi.string().required(),
    brithday: Joi.date().required(),
    pesel: Joi.string().allow(null),
    street: Joi.string().required(),
    zip: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    phone1: Joi.string().required(),
    phone2: Joi.string().allow(null),
    email: Joi.string().email().required(),
    relative1: Joi.string().required(),
    relative2: Joi.string().allow(null),
    NIP: Joi.string().allow(null),
    startDate: Joi.date().required(),
    endDate: Joi.date().allow(null),
    paycheckCode: Joi.string().allow(null),
    vehicle: Joi.number().allow(null),
    vacationGroup: Joi.number().required(),
    weeklyPlan: Joi.boolean().allow(null),
    printVacation: Joi.boolean().allow(null),
    login: Joi.string().required(),
    active: Joi.boolean().allow(null),
    role: Joi.number().required(),
    newPassword: Joi.string().min(6).allow(null),
    company: Joi.number().required()
});

function EdytujPracownika(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    let idPracownik = req.params.id;

    if (!idPracownik || idPracownik === 'zmienMoje') {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            idPracownik = decoded.id;
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    const {
        surename,
        name,
        brithday,
        pesel,
        street,
        zip,
        city,
        country,
        phone1,
        phone2,
        email,
        relative1,
        relative2,
        NIP,
        startDate,
        endDate,
        paycheckCode,
        vehicle,
        vacationGroup,
        weeklyPlan,
        printVacation,
        login,
        active,
        role,
        newPassword,
        company
    } = req.body;

    // ten sposób na walidacje też działa i nie wiem czy nie lepszy od walidowania 
    // całego req.body jak w innym pliku
    const { error } = schema.validate({
        surename,
        name,
        brithday,
        pesel,
        street,
        zip,
        city,
        country,
        phone1,
        phone2,
        email,
        relative1,
        relative2,
        NIP,
        startDate,
        endDate,
        paycheckCode,
        vehicle,
        vacationGroup,
        weeklyPlan,
        printVacation,
        login,
        active,
        role,
        newPassword,
        company
    });

    if (error) {
        console.error('Validation error:', error);
        return res.status(400).json({ error: error.details[0].message });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    db.beginTransaction(error => {
        if (error) {
            console.error('Error starting transaction:', error);
            return res.status(500).json({ error: 'Database transaction error' });
        }

        const queryUpdateDaneOsobowe = `
            UPDATE dane_osobowe SET 
                Imie = ?, 
                Nazwisko = ?, 
                Data_urodzenia = ?, 
                Pesel = ?, 
                Ulica_NrDomu = ?, 
                Kod_pocztowy = ?, 
                Miejscowosc = ?, 
                Kraj = ?, 
                TelefonPolska = ?, 
                TelefonSzwecja = ?, 
                Email = ?, 
                Krewni = ?, 
                Kontakt_w_razie_wypadku = ?, 
                NIP = ? 
            WHERE idDane_osobowe = (SELECT FK_Dane_osobowe FROM pracownik WHERE idPracownik = ?)
        `;
        const valuesUpdateDaneOsobowe = [
            name,
            surename,
            new Date(brithday).toISOString().slice(0, 19).replace('T', ' '),
            pesel,
            street,
            zip,
            city,
            country,
            phone1,
            phone2,
            email,
            relative1,
            relative2,
            NIP,
            idPracownik
        ];

        db.query(queryUpdateDaneOsobowe, valuesUpdateDaneOsobowe, (error, results) => {
            if (error) {
                return db.rollback(() => {
                    console.error('Error updating dane_osobowe:', error);
                    res.status(500).json({ error: 'Database error' });
                });
            }

            const queryUpdateInformacjeOFirmie = `
                UPDATE informacje_o_firmie SET 
                    Data_rozpoczecia = ?, 
                    Data_zakonczenia = ?, 
                    Kod_wynagrodzenia = ?, 
                    Plan_TygodniaV = ?, 
                    Drukowac_Urlop = ?, 
                    FK_idPojazdy = ?, 
                    FK_idFirma = ?, 
                    FK_idGrupa_urlopowa = ? 
                WHERE idInformacje_o_firmie = (SELECT FK_Informacje_o_firmie FROM pracownik WHERE idPracownik = ?)
            `;
            const valuesUpdateInformacjeOFirmie = [
                new Date(startDate).toISOString().slice(0, 19).replace('T', ' '),
                endDate ? new Date(endDate).toISOString().slice(0, 19).replace('T', ' ') : null,
                paycheckCode,
                weeklyPlan ? 1 : 0,
                printVacation ? 1 : 0,
                vehicle,
                company,
                vacationGroup,
                idPracownik
            ];

            db.query(queryUpdateInformacjeOFirmie, valuesUpdateInformacjeOFirmie, (error, results) => {
                if (error) {
                    return db.rollback(() => {
                        console.error('Error updating informacje_o_firmie:', error);
                        res.status(500).json({ error: 'Database error' });
                    });
                }

                let queryUpdatePracownik;
                let valuesUpdatePracownik;

                if (newPassword) {
                    queryUpdatePracownik = `
                        UPDATE pracownik SET 
                            Nazwa_uzytkownika = ?, 
                            Status_konta = ?, 
                            Typ_konta = ?, 
                            Haslo = ? 
                        WHERE idPracownik = ?
                    `;
                    valuesUpdatePracownik = [
                        login,
                        active ? 'Aktywne' : 'Nieaktywne',
                        role === 1 ? 'Administrator' : role === 2 ? 'Majster' : role === 3 ? 'Pracownik' : 'Gosc',
                        hashedPassword,
                        idPracownik
                    ];
                } else {
                    queryUpdatePracownik = `
                        UPDATE pracownik SET 
                            Nazwa_uzytkownika = ?, 
                            Status_konta = ?, 
                            Typ_konta = ? 
                        WHERE idPracownik = ?
                    `;
                    valuesUpdatePracownik = [
                        login,
                        active ? 'Aktywne' : 'Nieaktywne',
                        role === 1 ? 'Administrator' : role === 2 ? 'Majster' : role === 3 ? 'Pracownik' : 'Gosc',
                        idPracownik
                    ];
                }

                db.query(queryUpdatePracownik, valuesUpdatePracownik, (error, results) => {
                    if (error) {
                        return db.rollback(() => {
                            console.error('Error updating pracownik:', error);
                            res.status(500).json({ error: 'Database error' });
                        });
                    }

                    db.commit(error => {
                        if (error) {
                            return db.rollback(() => {
                                console.error('Error committing transaction:', error);
                                res.status(500).json({ error: 'Database commit error' });
                            });
                        }

                        res.status(200).json({ message: 'Data updated successfully' });
                    });
                });
            });
        });
    });
}

module.exports = EdytujPracownika;