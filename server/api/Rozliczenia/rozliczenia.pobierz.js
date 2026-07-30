function PobierzRozliczenia(req, res, db) {
    const { pracownikId, miesiacRok } = req.query; // miesiacRok: 'YYYY-MM'

    if (!pracownikId || !miesiacRok) {
        return res.status(400).json({ error: 'Brak wymaganych parametrów (pracownikId, miesiacRok)' });
    }

    // Wyliczamy na żywo godziny z systemu Czas Pracy
    // Zmiana: Poprawione wyliczanie daty. 
    // %u = tydzień zaczynający się w poniedziałek (00-53)
    // %w = dzień tygodnia (0=Niedziela, 1=Poniedziałek... 6=Sobota)
    const sumHoursQuery = `
        SELECT SUM(
            FLOOR(dp.Godziny_przepracowane) + 
            ROUND((dp.Godziny_przepracowane - FLOOR(dp.Godziny_przepracowane)) * 100) / 60
        ) as suma_godzin
        FROM dzien_projekty dp
        JOIN dzien d ON dp.Dzien_idDzien = d.idDzien
        JOIN tydzien t ON d.Tydzien_idTydzien = t.idTydzien
        WHERE t.Pracownik_idPracownik = ?
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
    `;

    db.query(sumHoursQuery, [pracownikId, miesiacRok], (sumErr, sumResult) => {
        if (sumErr) {
            console.error("Błąd SQL przy sumowaniu godzin:", sumErr);
            return res.status(500).json({ error: sumErr.message });
        }

        const sumDayHoursQuery = `
            SELECT
                SUM(
                    GREATEST(
                        TIME_TO_SEC(TIMEDIFF(d.Zakonczenia_pracy, d.Rozpoczecia_pracy)) - TIME_TO_SEC(d.Przerwa),
                        0
                    )
                ) / 3600 AS suma_godzin
            FROM dzien d
            JOIN tydzien t ON d.Tydzien_idTydzien = t.idTydzien
            WHERE t.Pracownik_idPracownik = ?
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
        `;

        db.query(sumDayHoursQuery, [pracownikId, miesiacRok], (dayErr, dayResult) => {
            if (dayErr) {
                console.error("Błąd SQL przy sumowaniu godzin z dni:", dayErr);
                return res.status(500).json({ error: dayErr.message });
            }

            const projectSum = Number(sumResult[0]?.suma_godzin) || 0;
            const daySum = Number(dayResult[0]?.suma_godzin) || 0;
            const finishResponse = (obliczoneGodziny) => {
                const checkQuery = `SELECT * FROM rozliczenia_miesieczne WHERE Pracownik_idPracownik = ? AND Miesiac_rok = ?`;

                db.query(checkQuery, [pracownikId, miesiacRok], (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });

                    const year = miesiacRok.slice(0, 4);
                    const yearQuery = `
                        SELECT Miesiac_rok, Atf_wykorzystane, Urlop, Urlop_zalegly, IFNULL(Urlop_zalegly_pula, 0) as Urlop_zalegly_pula
                        FROM rozliczenia_miesieczne
                        WHERE Pracownik_idPracownik = ?
                          AND Miesiac_rok LIKE ?
                    `;

                    const fetchYearData = () => {
                        db.query(yearQuery, [pracownikId, `${year}-%`], (yearErr, yearRows) => {
                            if (yearErr) {
                                if (yearErr.code === 'ER_BAD_FIELD_ERROR' || yearErr.errno === 1054) {
                                    // Missing column in DB, auto-add columns and retry query
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
                                                db.query(yearQuery, [pracownikId, `${year}-%`], (retryErr, retryRows) => {
                                                    processYearRows(retryRows || []);
                                                });
                                            }
                                        });
                                    });
                                    return;
                                }
                                console.error("Błąd SQL przy pobieraniu danych rocznych:", yearErr);
                                return processYearRows([]);
                            }
                            processYearRows(yearRows || []);
                        });
                    };

                    const processYearRows = (yearRows) => {
                        let otherAtf = 0;
                        let urlopOtherMonthsTotal = 0;
                        let urlopZaleglyOtherMonthsTotal = 0;
                        let urlopYearTotal = 0;
                        let urlopZaleglyYearTotal = 0;
                        let foundZaleglyPula = 0;

                        (yearRows || []).forEach(row => {
                            const isOtherMonth = row.Miesiac_rok !== miesiacRok;

                            if (isOtherMonth) {
                                otherAtf += Number(row.Atf_wykorzystane) || 0;
                            }

                            if (Number(row.Urlop_zalegly_pula) > 0) {
                                foundZaleglyPula = Number(row.Urlop_zalegly_pula);
                            }

                            const parseLeave = (val) => {
                                if (!val) return [];
                                try { return typeof val === 'string' ? JSON.parse(val) : val; } catch (e) { return []; }
                            };

                            const urlopArr = parseLeave(row.Urlop);
                            urlopArr.forEach(entry => {
                                const days = Number(entry.days) || 0;
                                urlopYearTotal += days;
                                if (isOtherMonth) urlopOtherMonthsTotal += days;
                            });

                            const zaleglyArr = parseLeave(row.Urlop_zalegly);
                            zaleglyArr.forEach(entry => {
                                const days = Number(entry.days) || 0;
                                urlopZaleglyYearTotal += days;
                                if (isOtherMonth) urlopZaleglyOtherMonthsTotal += days;
                            });
                        });

                        if (result.length > 0) {
                            let savedData = result[0];

                            // Zmiana: Zawsze używamy godzin wyliczonych na żywo z zablokowanych tygodni
                            // Nie ufamy zapisowi w rozliczeniach, ufamy głównemu systemowi czasu pracy
                            savedData.Godziny_przepracowane = obliczoneGodziny;

                            return res.status(200).json({
                                status: 'success',
                                data: savedData,
                                isDraft: false,
                                atfOtherMonthsTotal: otherAtf,
                                urlopOtherMonthsTotal: urlopOtherMonthsTotal,
                                urlopZaleglyOtherMonthsTotal: urlopZaleglyOtherMonthsTotal,
                                urlopYearTotal: urlopYearTotal,
                                urlopZaleglyYearTotal: urlopZaleglyYearTotal,
                                yearlyZaleglyPula: foundZaleglyPula || Number(savedData.Urlop_zalegly_pula || 0)
                            });
                        } else {
                            // Brak wiersza - całkowicie czysty szkic
                            const draftData = {
                                Pracownik_idPracownik: parseInt(pracownikId),
                                Miesiac_rok: miesiacRok,
                                Godziny_przepracowane: obliczoneGodziny,
                                Mozliwe_godziny: '',
                                Nadgodziny_wyplata: 0.00,
                                Nadgodziny_z_poprzedniego: 0.00,
                                Nadgodziny_na_kolejny: 0.00,
                                Atf_wykorzystane: 0.00,
                                Czerwone_dni: 0,
                                Urlop_zalegly_pula: foundZaleglyPula || 0,
                                Nadgodziny_stawka: '',
                                Nadgodziny_unlocked: 0,
                                Urlop: [],
                                Urlop_zalegly: [],
                                L4: { from: '', to: '' },
                                L4cd: { from: '', to: '' },
                                VAB: { from: '', to: '' },
                                Pappaledi: { from: '', to: '' }
                            };

                            return res.status(200).json({
                                status: 'success',
                                data: draftData,
                                isDraft: true,
                                atfOtherMonthsTotal: otherAtf,
                                urlopOtherMonthsTotal: urlopOtherMonthsTotal,
                                urlopZaleglyOtherMonthsTotal: urlopZaleglyOtherMonthsTotal,
                                urlopYearTotal: urlopYearTotal,
                                urlopZaleglyYearTotal: urlopZaleglyYearTotal,
                                yearlyZaleglyPula: foundZaleglyPula
                            });
                        }
                    };

                    fetchYearData();
                });
            };

            if (projectSum > 0 || daySum > 0) {
                const obliczoneGodziny = Number(((projectSum > 0 ? projectSum : daySum) || 0).toFixed(2));
                return finishResponse(obliczoneGodziny);
            }

            const sumViewQuery = `
                SELECT SUM(
                    FLOOR(GodzinyPrzepracowane) + 
                    ROUND((GodzinyPrzepracowane - FLOOR(GodzinyPrzepracowane)) * 100) / 60
                ) AS suma_godzin
                FROM view_dzien_projekty
                WHERE Pracownik = (
                    SELECT CONCAT(do.Imie, ' ', do.Nazwisko)
                    FROM Pracownik p
                    JOIN Dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
                    WHERE p.idPracownik = ?
                )
                AND DATE_FORMAT(Data, '%Y-%m') = ?
            `;

            db.query(sumViewQuery, [pracownikId, miesiacRok], (viewErr, viewResult) => {
                if (viewErr) {
                    console.error("Błąd SQL przy sumowaniu godzin z view:", viewErr);
                    return res.status(500).json({ error: viewErr.message });
                }

                const viewSum = Number(viewResult[0]?.suma_godzin) || 0;
                const obliczoneGodziny = Number((viewSum || 0).toFixed(2));
                return finishResponse(obliczoneGodziny);
            });
        });
    });
}

module.exports = PobierzRozliczenia;