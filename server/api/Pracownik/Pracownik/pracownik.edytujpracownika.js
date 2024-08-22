const db = require('../../../server');

function EdytujPracownika(req, res) {
    const idPracownik = req.params.id;
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

                // Check if newPassword is provided
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
                        newPassword,
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