function SzukajProjekt(req, res, db) {
    const group = req.query.group;
    const name = req.query.name;

    let sql = `
        SELECT 
            p.idProjekty AS id,
            g.Zleceniodawca,
            p.NazwaKod_Projektu,
            p.Status,
            p.data_dodania,
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

    if (name) {
        sql += ' AND g.Zleceniodawca LIKE ?';
        queryParams.push('%' + name + '%');
    }

    sql += ' ORDER BY p.data_dodania DESC';

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
                data_dodania: row.data_dodania,
                DodanePrzez: row.DodanePrzez || '—'
            }));
            res.status(200).json({ projekty: formattedRows });
        }
    });
}

module.exports = SzukajProjekt;
