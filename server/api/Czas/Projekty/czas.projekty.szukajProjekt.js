function SzukajProjekt(req, res, db) {
    const group = req.query.group;

    let sql = `
        SELECT 
            p.idProjekty AS id,
            g.Zleceniodawca,
            p.NazwaKod_Projektu,
            p.Status,
            CONCAT(do.Imie, ' ', do.Nazwisko) AS DodanePrzez
        FROM 
            Projekty p
        JOIN
            Grupa_urlopowa g ON p.Grupa_urlopowa_idGrupa_urlopowa = g.idGrupa_urlopowa
        LEFT JOIN 
            pracownik w ON p.Dodane_przez = w.idPracownik
        LEFT JOIN 
            dane_osobowe do ON w.FK_Dane_osobowe = do.idDane_osobowe
        WHERE 
            p.Archiwum = 0
    `;

    const queryParams = [];

    if (group && group !== 'Wszystkie') {
        sql += ' AND p.Status = ?';
        queryParams.push(group);
    }

    db.query(sql, queryParams, (err, result) => {
        if (err) {
            console.log('SQL Error:', err);
            res.status(400).send('Błąd pobierania projektów');
        } else {
            const formattedRows = result.map(row => ({
                id: row.id,
                Zleceniodawca: row.Zleceniodawca,
                NazwaKod_Projektu: row.NazwaKod_Projektu,
                Status: row.Status,
                DodanePrzez: row.DodanePrzez || '—'
            }));
            res.status(200).json({ projekty: formattedRows });
        }
    });
}

module.exports = SzukajProjekt;
