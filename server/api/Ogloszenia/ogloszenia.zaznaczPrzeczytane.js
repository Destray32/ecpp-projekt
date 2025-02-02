const db = require('../../server');
const jwt = require('jsonwebtoken');

function ZaznaczOgloszeniePrzeczytane(req, res) {
    const { idOgloszenia } = req.body;

    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const idPracownik = decoded.id;

    const query = `UPDATE pracownik_has_ogloszenia SET Przeczytane = 1 WHERE Ogloszenia_idOgloszenia = ? AND Pracownik_idPracownik = ?`;
    const values = [idOgloszenia, idPracownik];

    db.query(query, values, (err) => {
        if (err) {
            console.error('Błąd zaznaczania ogłoszenia jako przeczytanego:', err);
            res.status(500).send('Błąd zaznaczania ogłoszenia jako przeczytanego');
            return;
        }

        res.status(200).send('Ogłoszenie zaznaczone jako przeczytane');
    });
}

module.exports = ZaznaczOgloszeniePrzeczytane;