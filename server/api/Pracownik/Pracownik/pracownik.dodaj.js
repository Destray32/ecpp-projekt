const db = require('../../../server');

function DodajPracownika(req, res) {
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

    const queryDaneOsobowe = `
        INSERT INTO dane_osobowe (Imie, Nazwisko, Data_urodzenia, Pesel, Ulica_NrDomu, Kod_pocztowy, Miejscowość, Kraj, TelefonPolska, TelefonSzwecja, E-mail, Krewni, Kontakt_w_razie_wypadku, NIP)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const valuesDaneOsobowe = [
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
        NIP
    ];

    db.query(queryDaneOsobowe, valuesDaneOsobowe, (error, results) => {
        if (error) {
            console.error('Error inserting dane_osobowe:', error);
            return res.status(500).json({ error: 'Database error' });
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
                console.error('Error inserting informacje_o_firmie:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            const informacjeOFirmieId = results.insertId;

            const queryPracownik = `
                INSERT INTO pracownik (Nazwa_uzytkownika, Status_konta, Typ_konta, Hasło, FK_Dane_osobowe, FK_Informacje_o_firmie)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const valuesPracownik = [
                login,
                active ? 'Aktywne' : 'Nieaktywne',
                role === 1 ? 'Administrator' : role === 2 ? 'Majster' : role === 3 ? 'Pracownik' : 'Gosc',
                newPassword,
                daneOsoboweId,
                informacjeOFirmieId
            ];

            db.query(queryPracownik, valuesPracownik, (error, results) => {
                if (error) {
                    console.error('Error inserting pracownik:', error);
                    return res.status(500).json({ error: 'Database error' });
                }

                res.status(200).json({ message: 'Data inserted successfully' });
            }
            );
        }
        );
    }
    );
}

module.exports = DodajPracownika;