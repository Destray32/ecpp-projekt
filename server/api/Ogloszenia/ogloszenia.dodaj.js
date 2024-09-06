const db = require('../../server');

function DodajOgloszenie(req, res) {
    const { tytul, tresc, grupa, osoby } = req.body;
    const grupaId = grupa && grupa.length > 0 ? grupa[0] : null;

    console.log('Dodawanie ogłoszenia:', tytul, tresc, grupaId, osoby);

    const query = `INSERT INTO ogloszenia (Tytul, Wiadomosc, Grupa_urlopowa_idGrupa_urlopowa) VALUES (?, ?, ?)`;

    const values = [tytul, tresc, grupaId];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Błąd dodawania ogłoszenia:', err);
            res.status(500).send('Błąd dodawania ogłoszenia');
            return;
        }

        const ogloszeniaId = result.insertId;

        if (osoby && osoby.length > 0) {
            const queryInsertPracownikHasOgloszenia = `INSERT INTO pracownik_has_ogloszenia (Pracownik_idPracownik, Ogloszenia_idOgloszenia) VALUES ?`;
            const valuesInsertPracownikHasOgloszenia = osoby.map(id => [id, ogloszeniaId]);

            db.query(queryInsertPracownikHasOgloszenia, [valuesInsertPracownikHasOgloszenia], (err) => {
                if (err) {
                    console.error('Błąd dodawania pracowników do ogłoszenia:', err);
                    res.status(500).send('Błąd dodawania pracowników do ogłoszenia');
                    return;
                }

                res.status(201).send('Ogłoszenie dodane');
            });
        } else {
            res.status(201).send('Ogłoszenie dodane');
        }
    });
}

module.exports = DodajOgloszenie;