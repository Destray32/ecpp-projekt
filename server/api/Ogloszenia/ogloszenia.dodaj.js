const db = require('../../server');

function DodajOgloszenie(req, res) {
    const { tytul, tresc, grupa, osoby } = req.body;

    let query;
    let values;

    if (grupa && Number.isInteger(grupa)) {
        query = `INSERT INTO ogloszenia (Tytul, Wiadomosc, Grupa_urlopowa_idGrupa_urlopowa) VALUES (?, ?, ?)`;
        values = [tytul, tresc, grupa];
    } else {
        query = `INSERT INTO ogloszenia (Tytul, Wiadomosc, Grupa_urlopowa_idGrupa_urlopowa) VALUES (?, ?, NULL)`;
        values = [tytul, tresc];
    }

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Błąd dodawania ogłoszenia:', err);
            res.status(500).send('Błąd dodawania ogłoszenia');
            return;
        }

        const ogloszeniaId = result.insertId;

        let pracownicyIds = [];

        if (grupa && Number.isInteger(grupa)) {
            const groupQuery = `SELECT idPracownik FROM pracownik JOIN informacje_o_firmie ON pracownik.FK_Informacje_o_firmie = informacje_o_firmie.idInformacje_o_firmie WHERE informacje_o_firmie.FK_idGrupa_urlopowa = ?`;

            db.query(groupQuery, [grupa], (err, groupEmployees) => {
                if (err) {
                    console.error('Błąd pobierania pracowników z grupy:', err);
                    res.status(500).send('Błąd pobierania pracowników z grupy');
                    return;
                }

                const groupEmployeeIds = groupEmployees.map(emp => emp.idPracownik);
                pracownicyIds = [...pracownicyIds, ...groupEmployeeIds];

                if (osoby && osoby.length > 0) {
                    pracownicyIds = [...pracownicyIds, ...osoby];
                }

                insertPracownicyOgloszenia(pracownicyIds, ogloszeniaId, res);
            });
        } else if (osoby && osoby.length > 0) {
            pracownicyIds = [...pracownicyIds, ...osoby];
            insertPracownicyOgloszenia(pracownicyIds, ogloszeniaId, res);
        } else {
            res.status(201).send('Ogłoszenie dodane bez pracowników');
        }
    });
}

function insertPracownicyOgloszenia(pracownicyIds, ogloszeniaId, res) {
    if (pracownicyIds.length > 0) {
        const queryInsertPracownikHasOgloszenia = `INSERT INTO pracownik_has_ogloszenia (Pracownik_idPracownik, Ogloszenia_idOgloszenia, Przeczytane) VALUES ?`;
        const valuesInsertPracownikHasOgloszenia = pracownicyIds.map(id => [id, ogloszeniaId, 0]);

        db.query(queryInsertPracownikHasOgloszenia, [valuesInsertPracownikHasOgloszenia], (err) => {
            if (err) {
                console.error('Błąd dodawania pracowników do ogłoszenia:', err);
                res.status(500).send('Błąd dodawania pracowników do ogłoszenia');
                return;
            }

            res.status(201).send('Ogłoszenie dodane');
        });
    } else {
        res.status(201).send('Ogłoszenie dodane bez pracowników');
    }
}

module.exports = DodajOgloszenie;