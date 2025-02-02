const db = require('../../../server');

function PobierzPracownicyFirme(req, res) {
    const query = `SELECT idFirma, Nazwa_firmy FROM firma WHERE Archiwum = 0;`;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Błąd pobierania firm:', err);
            res.status(500).send('Błąd pobierania firm');
            return;
        }
        res.json(result);
    });
}

module.exports = PobierzPracownicyFirme;