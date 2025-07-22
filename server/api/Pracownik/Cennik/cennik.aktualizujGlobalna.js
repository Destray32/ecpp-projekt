const db = require('../../../server');

function AktualizujStawkeGlobalna(req, res) {
    const { grupaId, stawka } = req.body;

    if (!grupaId) {
        return res.status(400).json({ error: 'Wymagany parametr: grupaId' });
    }

    // Allow null values for global rates
    let query;
    let params;

    if (stawka === null || stawka === '') {
        query = `UPDATE grupa_urlopowa SET Stawka = NULL WHERE idGrupa_urlopowa = ?`;
        params = [grupaId];
    } else if (isNaN(parseFloat(stawka)) || parseFloat(stawka) < 0) {
        return res.status(400).json({ error: 'Nieprawidłowa wartość stawki' });
    } else {
        const stawkaDecimal = Number(parseFloat(stawka).toFixed(2));
        query = `UPDATE grupa_urlopowa SET Stawka = ? WHERE idGrupa_urlopowa = ?`;
        params = [stawkaDecimal, grupaId];
    }

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Błąd aktualizacji globalnej stawki:', err);
            return res.status(500).json({ error: 'Błąd aktualizacji globalnej stawki' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Nie znaleziono grupy urlopowej' });
        }

        res.json({ 
            message: stawka === null || stawka === '' 
                ? 'Globalna stawka została usunięta' 
                : 'Globalna stawka została zaktualizowana pomyślnie'
        });
    });
}

module.exports = AktualizujStawkeGlobalna;
