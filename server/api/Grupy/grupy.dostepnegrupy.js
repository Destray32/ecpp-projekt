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
            res.status(200).send({ grupy: formattedRows });
        }
    });
}

module.exports = DostepneGrupy;