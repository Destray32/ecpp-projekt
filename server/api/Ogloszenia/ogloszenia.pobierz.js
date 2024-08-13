const db = require('../../server');

function PobierzOgloszenia(req, res) {
    db.query('SELECT * FROM ogloszenia', (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
            return;
        }

        res.send(result);
    });
}

module.exports = PobierzOgloszenia;