function DostepneGrupy(req, res, db) {
    const sql = 'SELECT * FROM Grupa_urlopowa WHERE Archiwum = 0;';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('SQL Error:', err);
            res.status(400).send('Błąd pobierania grup');
        } else {
            const formattedRows = result.map(row => ({
                id: row.idGrupa_urlopowa,
                Zleceniodawca: row.Zleceniodawca,
                Cennik: row.Cennik,
                Stawka: row.Stawka,
                Plan_tygodniaV: row.Plan_tygodniaV,
            }));

            const sortedRows = formattedRows.sort((a, b) => {
                const customOrder = {
                    "NCW": 1,
                    "do dyspozycji": 98,
                    "urlopy": 99
                };

                const orderA = customOrder[a.Zleceniodawca] || 50;
                const orderB = customOrder[b.Zleceniodawca] || 50;

                return orderA - orderB;
            });

            res.status(200).send({ grupy: sortedRows });
        }
    });
}

module.exports = DostepneGrupy;
