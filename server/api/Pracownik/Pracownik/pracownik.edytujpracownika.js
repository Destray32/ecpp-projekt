const db = require('../../../server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

            connection.query(queryUpdateDaneOsobowe, valuesUpdateDaneOsobowe, (error, results) => {
                if (error) {
                    return connection.rollback(() => {
                        console.error('Error updating dane_osobowe:', error);
                        connection.release();
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

                connection.query(queryUpdateInformacjeOFirmie, valuesUpdateInformacjeOFirmie, (error, results) => {
                    if (error) {
                        return connection.rollback(() => {
                            console.error('Error updating informacje_o_firmie:', error);
                            connection.release();
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
                            role === 1 ? 'Administrator' : role === 2 ? 'Kierownik' : role === 3 ? 'Pracownik' : 'Biuro',
                            newPassword ? bcrypt.hashSync(newPassword, 10) : null,
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
                            role === 1 ? 'Administrator' : role === 2 ? 'Kierownik' : role === 3 ? 'Pracownik' : 'Biuro',
                            idPracownik
                        ];
                    }

                    connection.query(queryUpdatePracownik, valuesUpdatePracownik, (error, results) => {
                        if (error) {
                            return connection.rollback(() => {
                                console.error('Error updating pracownik:', error);
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
                            res.status(200).json({ message: 'Data updated successfully' });
                        });
                    });
                });
            });
        });
    });
}

module.exports = EdytujPracownika;
