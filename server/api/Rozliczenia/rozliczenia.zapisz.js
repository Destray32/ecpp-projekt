function ZapiszRozliczenia(req, res, db) {
    const { 
        Pracownik_idPracownik, Miesiac_rok, Godziny_przepracowane, 
        Nadgodziny_wyplata, Nadgodziny_z_poprzedniego, Nadgodziny_na_kolejny, 
        Atf_wykorzystane, Czerwone_dni, Mozliwe_godziny,
        Urlop_zalegly_pula, Nadgodziny_stawka, Nadgodziny_unlocked,
        Urlop, Urlop_zalegly, L4, L4cd, VAB, Pappaledi
    } = req.body;

    if (!Pracownik_idPracownik || !Miesiac_rok) {
        return res.status(400).json({ error: 'Brak identyfikatora pracownika lub miesiąca.' });
    }

    const query = `
        INSERT INTO rozliczenia_miesieczne (
            Pracownik_idPracownik, Miesiac_rok, Godziny_przepracowane, 
            Nadgodziny_wyplata, Nadgodziny_z_poprzedniego, Nadgodziny_na_kolejny, 
            Atf_wykorzystane, Czerwone_dni, Status, Mozliwe_godziny,
            Urlop_zalegly_pula, Nadgodziny_stawka, Nadgodziny_unlocked,
            Urlop, Urlop_zalegly, L4, L4cd, VAB, Pappaledi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'szkic', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            Godziny_przepracowane = VALUES(Godziny_przepracowane),
            Nadgodziny_wyplata = VALUES(Nadgodziny_wyplata),
            Nadgodziny_z_poprzedniego = VALUES(Nadgodziny_z_poprzedniego),
            Nadgodziny_na_kolejny = VALUES(Nadgodziny_na_kolejny),
            Atf_wykorzystane = VALUES(Atf_wykorzystane),
            Czerwone_dni = VALUES(Czerwone_dni),
            Mozliwe_godziny = VALUES(Mozliwe_godziny),
            Urlop_zalegly_pula = VALUES(Urlop_zalegly_pula),
            Nadgodziny_stawka = VALUES(Nadgodziny_stawka),
            Nadgodziny_unlocked = VALUES(Nadgodziny_unlocked),
            Urlop = VALUES(Urlop),
            Urlop_zalegly = VALUES(Urlop_zalegly),
            L4 = VALUES(L4),
            L4cd = VALUES(L4cd),
            VAB = VALUES(VAB),
            Pappaledi = VALUES(Pappaledi)
    `;

    const values = [
        Pracownik_idPracownik, Miesiac_rok, Godziny_przepracowane,
        Nadgodziny_wyplata, Nadgodziny_z_poprzedniego, Nadgodziny_na_kolejny,
        Atf_wykorzystane, Czerwone_dni, Mozliwe_godziny === '' ? null : Mozliwe_godziny,
        Urlop_zalegly_pula || 0, Nadgodziny_stawka || '', Nadgodziny_unlocked || 0,
        Urlop, Urlop_zalegly, L4, L4cd, VAB, Pappaledi
    ];

    const executeSave = () => {
        db.query(query, values, (err, result) => {
            if (err) {
                if (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054) {
                    // Auto-migrate missing columns in MySQL and retry
                    const alters = [
                        "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Urlop_zalegly_pula DECIMAL(7,2) DEFAULT 0",
                        "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Nadgodziny_stawka VARCHAR(255) NULL",
                        "ALTER TABLE rozliczenia_miesieczne ADD COLUMN Nadgodziny_unlocked TINYINT(1) DEFAULT 0"
                    ];
                    let completed = 0;
                    alters.forEach(alt => {
                        db.query(alt, () => {
                            completed++;
                            if (completed === alters.length) {
                                // Retry save query now that table has new columns
                                db.query(query, values, (retryErr, retryRes) => {
                                    if (retryErr) return res.status(500).json({ error: retryErr.message });
                                    return res.status(200).json({ message: 'Rozliczenie zostało zapisane pomyślnie!' });
                                });
                            }
                        });
                    });
                    return;
                }
                return res.status(500).json({ error: err.message });
            }
            return res.status(200).json({ message: 'Rozliczenie zostało zapisane pomyślnie!' });
        });
    };

    executeSave();
}

module.exports = ZapiszRozliczenia;