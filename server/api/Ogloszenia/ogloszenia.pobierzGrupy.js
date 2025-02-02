const db = require('../../server');

function PobierzOgloszeniaGrupy(req, res) {
    db.query('SELECT idGrupa_urlopowa, Zleceniodawca FROM grupa_urlopowa WHERE Archiwum = 0;', (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
            return;
        }

        res.send(result);
    });
}

module.exports = PobierzOgloszeniaGrupy;