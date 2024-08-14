function GetProjekty(req, res, db) {
    
    const sql = 'SELECT * FROM projekty';

    db.query(sql, (err, result) => {
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
            res.status(200).send({ projekty: formattedRows });
        }
    });
}

module.exports = GetProjekty;
