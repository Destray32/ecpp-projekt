function SzukajProjekt(req, res, db) {
    const group = req.query.group;

    let sql = 'SELECT * FROM projekty WHERE Archiwum = 0';
    const queryParams = [];

    if (group && group !== 'Wszystkie') {
        sql += ' AND Status = ?';
        queryParams.push(group);
    }

    db.query(sql, queryParams, (err, result) => {
        if (err) {
            console.log('SQL Error:', err);
            res.status(400).send('Błąd pobierania projektów');
        } else {
            const formattedRows = result.map(row => ({
                id: row.idProjekty,
                Firma: row.Firma,
                Zleceniodawca: row.Zleceniodawca,
                NazwaKod_Projektu: row.NazwaKod_Projektu,
                Status: row.Status,
            }));
            res.status(200).json({ projekty: formattedRows });
        }
    });
}

module.exports = SzukajProjekt;
