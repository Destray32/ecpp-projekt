const db = require('../../server');

function UsunOgloszenie(req, res) {
    const id = req.params.id;

    if (!Number.isInteger(parseInt(id))) {
        return res.status(400).send('Invalid ID');
    }

    const query = 'DELETE FROM ogloszenia WHERE idOgloszenia = ?';

    console.log(`Usuwam ogłoszenie o id: ${id}`);

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(`Błąd usuwania ogłoszenia o id: ${id}`, err);
            return res.status(500).send('Błąd usuwania ogłoszenia');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Ogłoszenie nie znalezione');
        }

        console.log(`Usunięto ogłoszenie o id: ${id}`);
        res.send('Usunięto ogłoszenie');
    });
}

module.exports = UsunOgloszenie;
