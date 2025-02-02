function GetProjekty(req, res, db) {
    
    const sql = 'SELECT * FROM projekty WHERE Archiwum = 0 AND Status = "Aktywny"';

    db.query(sql, (err, result) => {
        if (err) {
            console.log('SQL Error:', err);
            res.status(400).send('Błąd pobierania projektów');
        } else {
            const formattedRows = result.map(row => ({
                id: row.idProjekty,
                NazwaKod_Projektu: row.NazwaKod_Projektu,
                Status: row.Status,
                Grupa_urlopowa_idGrupa_urlopowa: row.Grupa_urlopowa_idGrupa_urlopowa,
                Firma_idFirma: row.Firma_idFirma,
            }));
            res.status(200).send({ projekty: formattedRows });
        }
    });
}

module.exports = GetProjekty;
