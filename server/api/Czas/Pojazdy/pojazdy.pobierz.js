function PobierzPojazdy(req, res, db) {
    const id = req.query.id;

    if (id) {
        const sql = 'SELECT * FROM pojazdy WHERE idPojazdy = ? AND Archiwum = 0'; 
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Błąd pobierania pojazdu');
            }
            if (result.length === 0) {
                return res.status(404).send('Pojazd nie znaleziony');
            }
            const vehicle = {
                id: result[0].idPojazdy,
                numerRejestracyjny: result[0].Nr_rejestracyjny,
                marka: result[0].Marka,
                uwagi: result[0].Uwagi,
            };
            return res.status(200).send({ pojazd: vehicle });
        });
    } else {
        const sql = 'SELECT * FROM pojazdy WHERE Archiwum = 0';
        db.query(sql, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Błąd pobierania pojazdów');
            }
            const formattedRows = result.map(row => ({
                id: row.idPojazdy,
                numerRejestracyjny: row.Nr_rejestracyjny,
                marka: row.Marka,
                uwagi: row.Uwagi,
            }));
            return res.status(200).send({ pojazdy: formattedRows });
        });
    }
}

module.exports = PobierzPojazdy;
