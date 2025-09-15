function GetProjekty(req, res, db) {
    
    const sql = 'SELECT * FROM projekty p JOIN Grupa_urlopowa gu ON p.Grupa_urlopowa_idGrupa_urlopowa = gu.idGrupa_urlopowa WHERE p.Archiwum = 0 AND p.Status = "Aktywny"';

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
                Zleceniodawca: row.Zleceniodawca,
                data_dodania: new Date(row.data_dodania).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' }),
            }));
            res.status(200).send({ projekty: formattedRows });
        }
    });
}

module.exports = GetProjekty;
