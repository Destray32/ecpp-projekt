const db = require('../../../server');

function PobierzPracownicyGrupy(req, res) {
    const query = `SELECT idGrupa_urlopowa, Zleceniodawca FROM grupa_urlopowa WHERE Archiwum = 0;`;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Błąd pobierania firm:', err);
            res.status(500).send('Błąd pobierania firm');
            return;
        }
        res.json(result);
    }
    );
}

module.exports = PobierzPracownicyGrupy;