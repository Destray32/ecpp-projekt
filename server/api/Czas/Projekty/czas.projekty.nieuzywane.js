function NieuzywaneProjekty(req, res, db) {
    const sql = `
        SELECT 
            p.idProjekty AS id,
            p.NazwaKod_Projektu AS Projekt,
            MAX(DATE(CONCAT(
                t.Rok, '-01-01'
            )) + INTERVAL (t.tydzienRoku - 1) WEEK + 
            INTERVAL (
                CASE d.Dzien_tygodnia
                    WHEN 'Poniedziałek' THEN 0
                    WHEN 'Wtorek' THEN 1
                    WHEN 'Środa' THEN 2
                    WHEN 'Czwartek' THEN 3
                    WHEN 'Piątek' THEN 4
                    WHEN 'Sobota' THEN 5
                    WHEN 'Niedziela' THEN 6
                END
            ) DAY) AS LastUsedDay,
            CASE 
                WHEN MAX(DATE(CONCAT(
                    t.Rok, '-01-01'
                )) + INTERVAL (t.tydzienRoku - 1) WEEK + 
                INTERVAL (
                    CASE d.Dzien_tygodnia
                        WHEN 'Poniedziałek' THEN 0
                        WHEN 'Wtorek' THEN 1
                        WHEN 'Środa' THEN 2
                        WHEN 'Czwartek' THEN 3
                        WHEN 'Piątek' THEN 4
                        WHEN 'Sobota' THEN 5
                        WHEN 'Niedziela' THEN 6
                    END
                ) DAY) IS NULL THEN NULL
                ELSE GREATEST(0, DATEDIFF(DATE(UTC_TIMESTAMP()), MAX(DATE(CONCAT(
                    t.Rok, '-01-01'
                )) + INTERVAL (t.tydzienRoku - 1) WEEK + 
                INTERVAL (
                    CASE d.Dzien_tygodnia
                        WHEN 'Poniedziałek' THEN 0
                        WHEN 'Wtorek' THEN 1
                        WHEN 'Środa' THEN 2
                        WHEN 'Czwartek' THEN 3
                        WHEN 'Piątek' THEN 4
                        WHEN 'Sobota' THEN 5
                        WHEN 'Niedziela' THEN 6
                    END
                ) DAY)))
            END AS DaysUnused
        FROM 
            projekty p
        LEFT JOIN 
            dzien_projekty dp ON p.idProjekty = dp.Projekty_idProjekty 
            AND dp.Godziny_przepracowane > 0
        LEFT JOIN 
            dzien d ON dp.Dzien_idDzien = d.idDzien
        LEFT JOIN 
            tydzien t ON d.Tydzien_idTydzien = t.idTydzien
        WHERE 
            p.Archiwum = 0
        GROUP BY 
            p.idProjekty, p.NazwaKod_Projektu
        ORDER BY 
            p.NazwaKod_Projektu
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('SQL Error:', err);
            res.status(400).send('Błąd pobierania danych o nieużywanych projektach');
            return;
        }

        const formattedResults = result.map(row => ({
            id: row.id,
            Projekt: row.Projekt,
            LastUsedDay: row.LastUsedDay || null,
            DaysUnused: row.DaysUnused !== null ? row.DaysUnused : null
        }));

        res.status(200).json({ nieuzywaneProjekty: formattedResults });
    });
}

module.exports = NieuzywaneProjekty;