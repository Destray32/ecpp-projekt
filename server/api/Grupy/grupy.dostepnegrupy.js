function DostepneGrupy(req, res, db) {
    const sql = 'SELECT * FROM Grupa_urlopowa WHERE Archiwum = 0;';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('SQL Error:', err);
            res.status(400).send('Błąd pobierania grup');
        } else {
            let formattedRows = result.map(row => ({
                id: row.idGrupa_urlopowa,
                Zleceniodawca: row.Zleceniodawca,
                Cennik: row.Cennik,
                Stawka: row.Stawka,
                Plan_tygodniaV: row.Plan_tygodniaV,
            }));

            const specialOrder = {
                "NCW Plåt": 1,
                "NCC": 2,
                "Do dyspozycji": 98,
                "-------------------------------": 99,
                "Urlopy": 100,
                "Urlop tacierzyński /L4": 101
            };

            formattedRows.push({
                id: "separator",
                Zleceniodawca: "-------------------------------",
                Cennik: null,
                Stawka: null,
                Plan_tygodniaV: null
            });

            formattedRows = formattedRows.map(row => ({
                ...row,
                order: specialOrder[row.Zleceniodawca] ?? 50
            }));

            // sortowanie: order potem po alfabecie
            const sortedRows = formattedRows.sort((a, b) => {
                if (a.order !== b.order) return a.order - b.order;
                return a.Zleceniodawca.localeCompare(b.Zleceniodawca, 'pl', { sensitivity: 'base' });
            });

            res.status(200).send({ grupy: sortedRows });
        }
    });
}

module.exports = DostepneGrupy;