// function NieuzywaneProjekty(req, res, db) {
//     const sql = `
//         SELECT 
//     p.idProjekty AS id,
//     p.NazwaKod_Projektu AS Projekt,
//     MAX(d.Rozpoczecia_pracy) AS LastUsedDay,
//     DATEDIFF(CURDATE(), MAX(d.Rozpoczecia_pracy)) AS DaysUnused
// FROM 
//     projekty p
// LEFT JOIN 
//     dzien_projekty dp ON p.idProjekty = dp.Projekty_idProjekty
// LEFT JOIN 
//     dzien d ON dp.Dzien_idDzien = d.idDzien
// WHERE 
//     p.Archiwum = 0
// GROUP BY 
//     p.idProjekty, p.NazwaKod_Projektu

//     `;

//     db.query(sql, (err, result) => {
//         if (err) {
//             console.error('SQL Error:', err);
//             res.status(400).send('Błąd pobierania danych o nieużywanych projektach');
//             return;
//         }

//         const formattedResults = result.map(row => ({
//             id: row.id,
//             Projekt: row.Projekt,
//             LastUsedDay: row.LastUsedDay || null,
//             DaysUnused: row.DaysUnused !== null ? row.DaysUnused : null
//         }));

//         res.status(200).json({ nieuzywaneProjekty: formattedResults });
//     });
// }

// module.exports = NieuzywaneProjekty;
