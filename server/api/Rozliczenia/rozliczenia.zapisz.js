const jwt = require('jsonwebtoken');

function ZapiszRozliczenia(req, res, db) {
    const { 
        Pracownik_idPracownik, Miesiac_rok, Godziny_przepracowane, 
        Nadgodziny_wyplata, Nadgodziny_z_poprzedniego, Nadgodziny_na_kolejny, 
        Atf_wykorzystane, Atf_zielone, Czerwone_dni, Mozliwe_godziny,
        Urlop_zalegly_pula, Nadgodziny_stawka, Nadgodziny_unlocked,
        Mieszkanie,
        Urlop, Urlop_zalegly, L4, L4cd, VAB, Pappaledi,
        Email, Nr_konta, Konto_typ, Zapisal_admin, userAccountType
    } = req.body;

    if (!Pracownik_idPracownik || !Miesiac_rok) {
        return res.status(400).json({ error: 'Brak identyfikatora pracownika lub miesiąca.' });
    }

    // Sprawdzenie uprawnień osoby zapisującej
    const token = req.cookies?.token;
    let isUserAdmin = false;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const role = decoded.role || decoded.Typ_konta;
            if (['Administrator', 'Kierownik', 'Biuro'].includes(role)) {
                isUserAdmin = true;
            }
        } catch (e) {}
    }
    if (['Administrator', 'Kierownik', 'Biuro'].includes(userAccountType)) {
        isUserAdmin = true;
    }

    // 1. Sprawdzenie czy rozliczenie nie zostało już zablokowane przez administratora
    const lockCheckQuery = `SELECT Zapisal_admin FROM rozliczenia_miesieczne WHERE Pracownik_idPracownik = ? AND Miesiac_rok = ?`;
    db.query(lockCheckQuery, [Pracownik_idPracownik, Miesiac_rok], (checkErr, checkRows) => {
        // Jeśli zapisał admin, a obecny użytkownik NIE jest adminem -> blokada
        if (!isUserAdmin && checkRows && checkRows.length > 0 && Number(checkRows[0].Zapisal_admin) === 1) {
            return res.status(403).json({ 
                error: 'Rozliczenie za ten miesiąc zostało zatwierdzone przez administratora i jest zablokowane przed edycją.' 
            });
        }

        // Ustalenie flagi Zapisal_admin:
        // Jeśli zapisuje admin -> domyślnie 1 (chyba że admin celowo odznaczył)
        // Jeśli zapisuje pracownik -> zachowaj poprzednią wartość lub 0
        let finalZapisalAdmin = 0;
        if (isUserAdmin) {
            finalZapisalAdmin = (Zapisal_admin !== undefined && Zapisal_admin !== null) ? Number(Zapisal_admin) : 1;
        } else if (checkRows && checkRows.length > 0) {
            finalZapisalAdmin = Number(checkRows[0].Zapisal_admin) || 0;
        }

        const query = `
            INSERT INTO rozliczenia_miesieczne (
                Pracownik_idPracownik, Miesiac_rok, Godziny_przepracowane, 
                Nadgodziny_wyplata, Nadgodziny_z_poprzedniego, Nadgodziny_na_kolejny, 
                Atf_wykorzystane, Atf_zielone, Czerwone_dni, Status, Mozliwe_godziny,
                Urlop_zalegly_pula, Nadgodziny_stawka, Nadgodziny_unlocked,
                Mieszkanie,
                Urlop, Urlop_zalegly, L4, L4cd, VAB, Pappaledi,
                Email, Nr_konta, Konto_typ, Zapisal_admin
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'szkic', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                Godziny_przepracowane = VALUES(Godziny_przepracowane),
                Nadgodziny_wyplata = VALUES(Nadgodziny_wyplata),
                Nadgodziny_z_poprzedniego = VALUES(Nadgodziny_z_poprzedniego),
                Nadgodziny_na_kolejny = VALUES(Nadgodziny_na_kolejny),
                Atf_wykorzystane = VALUES(Atf_wykorzystane),
                Atf_zielone = VALUES(Atf_zielone),
                Czerwone_dni = VALUES(Czerwone_dni),
                Mozliwe_godziny = VALUES(Mozliwe_godziny),
                Urlop_zalegly_pula = VALUES(Urlop_zalegly_pula),
                Nadgodziny_stawka = VALUES(Nadgodziny_stawka),
                Nadgodziny_unlocked = VALUES(Nadgodziny_unlocked),
                Mieszkanie = VALUES(Mieszkanie),
                Urlop = VALUES(Urlop),
                Urlop_zalegly = VALUES(Urlop_zalegly),
                L4 = VALUES(L4),
                L4cd = VALUES(L4cd),
                VAB = VALUES(VAB),
                Pappaledi = VALUES(Pappaledi),
                Email = VALUES(Email),
                Nr_konta = VALUES(Nr_konta),
                Konto_typ = VALUES(Konto_typ),
                Zapisal_admin = VALUES(Zapisal_admin)
        `;

        const values = [
            Pracownik_idPracownik, Miesiac_rok, Godziny_przepracowane,
            Nadgodziny_wyplata, Nadgodziny_z_poprzedniego, Nadgodziny_na_kolejny,
            Atf_wykorzystane, Atf_zielone || 0, Czerwone_dni, Mozliwe_godziny === '' ? null : Mozliwe_godziny,
            Urlop_zalegly_pula || 0, Nadgodziny_stawka || '', Nadgodziny_unlocked || 0,
            Mieszkanie || 0,
            Urlop, Urlop_zalegly, L4, L4cd, VAB, Pappaledi,
            Email || null, Nr_konta || null, Konto_typ || 'PL', finalZapisalAdmin
        ];

        const syncProfileContact = () => {
            if (Email || Nr_konta) {
                const updateDaneQuery = `
                    UPDATE dane_osobowe do
                    JOIN pracownik p ON p.FK_Dane_osobowe = do.idDane_osobowe
                    SET do.Email = COALESCE(?, do.Email)
                    WHERE p.idPracownik = ?
                `;
                db.query(updateDaneQuery, [Email || null, Pracownik_idPracownik], () => {});
            }
        };

        const executeSave = () => {
            db.query(query, values, (err, result) => {
                if (err) {
                    if (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054) {
                        // Auto-migrate missing columns in MySQL and retry
                        const alters = [
                            "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Urlop_zalegly_pula DECIMAL(7,2) DEFAULT 0",
                            "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Nadgodziny_stawka VARCHAR(255) NULL",
                            "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Nadgodziny_unlocked TINYINT(1) DEFAULT 0",
                            "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Mieszkanie DECIMAL(10,2) DEFAULT 0",
                            "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Atf_zielone DECIMAL(7,2) DEFAULT 0",
                            "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Email VARCHAR(255) NULL",
                            "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Nr_konta VARCHAR(64) NULL",
                            "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Konto_typ VARCHAR(10) DEFAULT 'PL'",
                            "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Zapisal_admin TINYINT(1) DEFAULT 0"
                        ];
                        let completed = 0;
                        alters.forEach(alt => {
                            db.query(alt, () => {
                                completed++;
                                if (completed === alters.length) {
                                    db.query(query, values, (retryErr, retryRes) => {
                                        if (retryErr) {
                                            console.error('Błąd ponownego zapisu rozliczenia po migracji:', retryErr);
                                            return res.status(500).json({ error: retryErr.message });
                                        }
                                        syncProfileContact();
                                        return res.status(200).json({ message: 'Rozliczenie zostało zapisane pomyślnie!' });
                                    });
                                }
                            });
                        });
                        return;
                    }
                    return res.status(500).json({ error: err.message });
                }
                syncProfileContact();
                return res.status(200).json({ message: 'Rozliczenie zostało zapisane pomyślnie!' });
            });
        };

        executeSave();
    });
}

module.exports = ZapiszRozliczenia;