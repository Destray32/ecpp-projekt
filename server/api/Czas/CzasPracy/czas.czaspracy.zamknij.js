const db = require('../../../server');

function ZamknijTydzień(req, res) {
    const { tydzienRoku, pracownikId, year } = req.body;
    
    if (!tydzienRoku || !pracownikId || !year) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const query = `
        UPDATE tydzien
        SET Status_tygodnia = 'Zamkniety'
        WHERE tydzienRoku = ? AND Rok = ? AND Pracownik_idPracownik = ?
    `;

    db.query(query, [tydzienRoku, year, pracownikId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: err });
        }

        res.status(200).json({ message: 'Tydzien zamkniety' });
    });

}

module.exports = ZamknijTydzień;