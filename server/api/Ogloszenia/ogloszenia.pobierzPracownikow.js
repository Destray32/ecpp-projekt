const db = require('../../server');

function PobierzOgloszeniaPracownicy(req, res) {
    const query = `SELECT p.idPracownik, d.Imie, d.Nazwisko FROM pracownik p JOIN dane_osobowe d ON p.FK_Dane_osobowe = d.idDane_osobowe WHERE p.Archiwum = 0;`;

    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
            return;
        }

        res.send(result);
    });
}

module.exports = PobierzOgloszeniaPracownicy;