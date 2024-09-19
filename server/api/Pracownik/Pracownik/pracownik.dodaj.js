const db = require('../../../server');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const schema = Joi.object({
    surname: Joi.string().required(),
    name: Joi.string().required(),
    birthday: Joi.date().required(),
    pesel: Joi.string().allow(null),
    street: Joi.string().required(),
    zip: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    company: Joi.number().required(),
    phone1: Joi.string().required(),
    phone2: Joi.string().allow(null),
    email: Joi.string().required(),
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
    newPassword: Joi.string().required(),
    confirmPassword: Joi.string().required()
});


function DodajPracownika(req, res) {
    console.log(req.body);
    const {
        surname,
        name,
        birthday,
        pesel,
        street,
        zip,
        city,
        country,
        company,
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
        confirmPassword
    } = req.body;

    const { error } = schema.validate(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
    }

    console.log('newPassword:', newPassword);
    console.log('confirmPassword:', confirmPassword);

    if (!newPassword) {
        console.error('Password is required');
        return res.status(400).json({ error: 'Password is required' });
    }

    if (newPassword !== confirmPassword) {
        console.error('Passwords do not match');
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (typeof newPassword !== 'string') {
        console.error('Invalid newPassword type:', typeof newPassword);
        return res.status(400).json({ error: 'Invalid password format' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    db.beginTransaction(error => {
        if (error) {
            console.error('Error starting transaction:', error);
            return res.status(500).json({ error: 'Database transaction error' });
        }

        const queryDaneOsobowe = `
            INSERT INTO dane_osobowe (Imie, Nazwisko, Data_urodzenia, Pesel, Ulica_NrDomu, Kod_pocztowy, Miejscowosc, Kraj, TelefonPolska, TelefonSzwecja, Email, Krewni, Kontakt_w_razie_wypadku, NIP)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const valuesDaneOsobowe = [
            name,
            surname,
            new Date(birthday).toISOString().slice(0, 19).replace('T', ' '),
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
            NIP
        ];

        db.query(queryDaneOsobowe, valuesDaneOsobowe, (error, results) => {
            if (error) {
                return db.rollback(() => {
                    console.error('Error inserting dane_osobowe:', error);
                    res.status(500).json({ error: 'Database error' });
                });
            }

            const daneOsoboweId = results.insertId;

            const queryInformacjeOFirmie = `
                INSERT INTO informacje_o_firmie (Data_rozpoczecia, Data_zakonczenia, Kod_wynagrodzenia, Plan_TygodniaV, Drukowac_Urlop, FK_idPojazdy, FK_idFirma, FK_idGrupa_urlopowa)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const valuesInformacjeOFirmie = [
                new Date(startDate).toISOString().slice(0, 19).replace('T', ' '),
                endDate ? new Date(endDate).toISOString().slice(0, 19).replace('T', ' ') : null,
                paycheckCode,
                weeklyPlan ? 1 : 0,
                printVacation ? 1 : 0,
                vehicle,
                company,
                vacationGroup
            ];

            db.query(queryInformacjeOFirmie, valuesInformacjeOFirmie, (error, results) => {
                if (error) {
                    return db.rollback(() => {
                        console.error('Error inserting informacje_o_firmie:', error);
                        res.status(500).json({ error: 'Database error' });
                    });
                }

                const informacjeOFirmieId = results.insertId;

                const queryPracownik = `
                    INSERT INTO pracownik (Nazwa_uzytkownika, Status_konta, Typ_konta, Haslo, FK_Dane_osobowe, FK_Informacje_o_firmie)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                const valuesPracownik = [
                    login,
                    active ? 'Aktywne' : 'Nieaktywne',
                    role === 1 ? 'Administrator' : role === 2 ? 'Majster' : role === 3 ? 'Pracownik' : 'Gosc',
                    hashedPassword,
                    daneOsoboweId,
                    informacjeOFirmieId
                ];

                db.query(queryPracownik, valuesPracownik, (error, results) => {
                    if (error) {
                        return db.rollback(() => {
                            console.error('Error inserting pracownik:', error);
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

                        res.status(200).json({ message: 'Data inserted successfully' });
                    });
                });
            });
        });
    });
}

module.exports = DodajPracownika;