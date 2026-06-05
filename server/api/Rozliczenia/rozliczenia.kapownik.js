function PobierzKapownik(req, res, db) {
    const { miesiacRok } = req.query; // format 'YYYY-MM'

    if (!miesiacRok) {
        return res.status(400).json({ error: 'Brak wymaganego parametru (miesiacRok)' });
    }

    const query = `
        SELECT 
            p.idPracownik AS idPracownik,
            do.Imie AS Imie,
            do.Nazwisko AS Nazwisko,
            rm.idRozliczenia AS idRozliczenia,
            IFNULL(
                (
                    SELECT SUM(
                        FLOOR(dp.Godziny_przepracowane) + 
                        ROUND((dp.Godziny_przepracowane - FLOOR(dp.Godziny_przepracowane)) * 100) / 60
                    )
                    FROM dzien_projekty dp
                    JOIN dzien d ON dp.Dzien_idDzien = d.idDzien
                    JOIN tydzien t ON d.Tydzien_idTydzien = t.idTydzien
                    WHERE t.Pracownik_idPracownik = p.idPracownik
                      AND DATE_FORMAT(
                          STR_TO_DATE(
                              CONCAT(t.Rok, ' ', LPAD(t.tydzienRoku, 2, '0'), ' ',
                                  CASE LOWER(d.Dzien_tygodnia)
                                      WHEN 'poniedziałek' THEN 1
                                      WHEN 'poniedzialek' THEN 1
                                      WHEN 'wtorek' THEN 2
                                      WHEN 'środa' THEN 3
                                      WHEN 'sroda' THEN 3
                                      WHEN 'czwartek' THEN 4
                                      WHEN 'piątek' THEN 5
                                      WHEN 'piatek' THEN 5
                                      WHEN 'sobota' THEN 6
                                      WHEN 'niedziela' THEN 0
                                  END
                              ),
                              '%x %v %w'
                          ),
                          '%Y-%m'
                      ) = ?
                ),
                0
            ) AS Godziny_przepracowane,
            rm.Nadgodziny_wyplata AS Nadgodziny_wyplata,
            rm.Nadgodziny_z_poprzedniego AS Nadgodziny_z_poprzedniego,
            rm.Nadgodziny_na_kolejny AS Nadgodziny_na_kolejny,
            rm.Atf_wykorzystane AS Atf_wykorzystane,
            rm.Czerwone_dni AS Czerwone_dni,
            rm.Status AS Status,
            rm.Mozliwe_godziny AS Mozliwe_godziny,
            rm.Urlop AS Urlop,
            rm.Urlop_zalegly AS Urlop_zalegly,
            rm.L4 AS L4,
            rm.L4cd AS L4cd,
            rm.VAB AS VAB,
            rm.Pappaledi AS Pappaledi
        FROM pracownik p
        JOIN dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
        LEFT JOIN rozliczenia_miesieczne rm ON p.idPracownik = rm.Pracownik_idPracownik AND rm.Miesiac_rok = ?
        WHERE p.Archiwum = 0 AND p.Status_konta = 'Aktywne' AND do.Nazwisko != 'Wachala'
        ORDER BY do.Nazwisko, do.Imie
    `;

    db.query(query, [miesiacRok, miesiacRok], (err, results) => {
        if (err) {
            console.error('Błąd pobierania kapownika:', err);
            return res.status(500).json({ error: err.message });
        }

        // Parsowanie pól tekstowych/JSON i formatowanie wyników
        const formattedResults = results.map(row => {
            const parseJsonValue = (val, fallback) => {
                if (val === null || val === undefined || val === '') return fallback;
                if (typeof val === 'string') {
                    try {
                        return JSON.parse(val);
                    } catch (e) {
                        return fallback;
                    }
                }
                return val;
            };

            return {
                idPracownik: row.idPracownik,
                Imie: row.Imie,
                Nazwisko: row.Nazwisko,
                idRozliczenia: row.idRozliczenia || null,
                Godziny_przepracowane: row.Godziny_przepracowane !== null ? Number(row.Godziny_przepracowane) : 0,
                Nadgodziny_wyplata: row.Nadgodziny_wyplata !== null ? Number(row.Nadgodziny_wyplata) : 0,
                Nadgodziny_z_poprzedniego: row.Nadgodziny_z_poprzedniego !== null ? Number(row.Nadgodziny_z_poprzedniego) : 0,
                Nadgodziny_na_kolejny: row.Nadgodziny_na_kolejny !== null ? Number(row.Nadgodziny_na_kolejny) : 0,
                Atf_wykorzystane: row.Atf_wykorzystane !== null ? Number(row.Atf_wykorzystane) : 0,
                Czerwone_dni: row.Czerwone_dni !== null ? Number(row.Czerwone_dni) : 0,
                Status: row.Status || 'szkic',
                Mozliwe_godziny: row.Mozliwe_godziny !== null ? Number(row.Mozliwe_godziny) : 0,
                Urlop: parseJsonValue(row.Urlop, []),
                Urlop_zalegly: parseJsonValue(row.Urlop_zalegly, []),
                L4: parseJsonValue(row.L4, { from: '', to: '' }),
                L4cd: parseJsonValue(row.L4cd, { from: '', to: '' }),
                VAB: parseJsonValue(row.VAB, { from: '', to: '' }),
                Pappaledi: parseJsonValue(row.Pappaledi, { from: '', to: '' })
            };
        });

        return res.status(200).json({ status: 'success', data: formattedResults });
    });
}

module.exports = PobierzKapownik;
