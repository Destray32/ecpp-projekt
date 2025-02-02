const db = require('../../../server');
const bcrypt = require('bcryptjs');

function DodajPracownika(req, res) {
    console.log(req.body);
    const {
        surename,
        name,
        brithday,
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

    db.getConnection((error, connection) => {
        if (error) {
            console.error('Error getting connection from pool:', error);
            return res.status(500).json({ error: 'Database connection error' });
        }

        connection.beginTransaction(error => {
            if (error) {
                console.error('Error starting transaction:', error);
                connection.release();
                return res.status(500).json({ error: 'Database transaction error' });
            }

            const queryDaneOsobowe = `
                INSERT INTO dane_osobowe (Imie, Nazwisko, Data_urodzenia, Pesel, Ulica_NrDomu, Kod_pocztowy, Miejscowosc, Kraj, TelefonPolska, TelefonSzwecja, Email, Krewni, Kontakt_w_razie_wypadku, NIP)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const valuesDaneOsobowe = [
                name,
                surename,
                brithday ? new Date(brithday).toISOString().slice(0, 19).replace('T', ' ') : null,
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

            connection.query(queryDaneOsobowe, valuesDaneOsobowe, (error, results) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error('Error inserting dane_osobowe:', error);
                        connection.release();
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

                connection.query(queryInformacjeOFirmie, valuesInformacjeOFirmie, (error, results) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error('Error inserting informacje_o_firmie:', error);
                            connection.release();
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
                        role === 1 ? 'Administrator' : role === 2 ? 'Kierownik' : role === 3 ? 'Pracownik' : 'Biuro',
                        hashedPassword,
                        daneOsoboweId,
                        informacjeOFirmieId
                    ];

                    connection.query(queryPracownik, valuesPracownik, (error, results) => {
                        if (error) {
                            return connection.rollback(() => {
                                console.error('Error inserting pracownik:', error);
                                connection.release();
                                res.status(500).json({ error: 'Database error' });
                            });
                        }

                        connection.commit(error => {
                            if (error) {
                                return connection.rollback(() => {
                                    console.error('Error committing transaction:', error);
                                    connection.release();
                                    res.status(500).json({ error: 'Database commit error' });
                                });
                            }

                            connection.release();
                            res.status(200).json({ message: 'Data inserted successfully' });
                        });
                    });
                });
            });
        });
    });
}

module.exports = DodajPracownika;
