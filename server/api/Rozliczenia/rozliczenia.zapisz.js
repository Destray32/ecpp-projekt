function ZapiszRozliczenia(req, res, db) {
    const { 
        Pracownik_idPracownik, Miesiac_rok, Godziny_przepracowane, 
        Nadgodziny_wyplata, Nadgodziny_z_poprzedniego, Nadgodziny_na_kolejny, 
        Atf_wykorzystane, Czerwone_dni, Mozliwe_godziny,
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
            Urlop, Urlop_zalegly, L4, L4cd, VAB, Pappaledi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'szkic', ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            Godziny_przepracowane = VALUES(Godziny_przepracowane),
            Nadgodziny_wyplata = VALUES(Nadgodziny_wyplata),
            Nadgodziny_z_poprzedniego = VALUES(Nadgodziny_z_poprzedniego),
            Nadgodziny_na_kolejny = VALUES(Nadgodziny_na_kolejny),
            Atf_wykorzystane = VALUES(Atf_wykorzystane),
            Czerwone_dni = VALUES(Czerwone_dni),
            Mozliwe_godziny = VALUES(Mozliwe_godziny),
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
        Atf_wykorzystane, Czerwone_dni, Mozliwe_godziny,
        Urlop, Urlop_zalegly, L4, L4cd, VAB, Pappaledi
    ];

    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({ message: 'Rozliczenie zostało zapisane pomyślnie!' });
    });
}

module.exports = ZapiszRozliczenia;