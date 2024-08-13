const db = require('../../server');

function DodajOgloszenie(req, res) {
    const { tytul, tresc, grupa, osoby } = req.body;

    const grupaIds = grupa ? grupa.join(',') : null;
    const osobyIds = osoby && osoby.length > 0 ? osoby.join(',') : null;

    const query = `INSERT INTO ogloszenia (Tytul, Wiadomosc, Grupa_urlopowa_idGrupa_urlopowa, Pracownik_idPracownik) VALUES (?, ?, ?, ?)`;

    const values = [tytul, tresc, grupaIds, osobyIds];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Błąd dodawania ogłoszenia:', err);
            res.status(500).send('Błąd dodawania ogłoszenia');
            return;
        }
        res.status(201).send('Ogłoszenie dodane');
    });
}

module.exports = DodajOgloszenie;
