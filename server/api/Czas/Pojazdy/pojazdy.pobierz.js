
function PobierzPojazdy(req, res, db) {
    const sql = 'SELECT * FROM pojazdy';

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(400).send('Błąd pobierania pojazdów');
        } else {
            const formattedRows = result.map(row => {
                return {
                    id: row.idPojazdy,
                    numerRejestracyjny: row.Nr_rejestracyjny,
                    marka: row.Marka,
                    uwagi: row.Uwagi
                };
            });
            res.status(200).send({ pojazdy: formattedRows });
        }
    });
}

module.exports = PobierzPojazdy;