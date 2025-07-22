const db = require('../../../server');

function AktualizujStawke(req, res) {
    const { pracownikId, grupaId, stawka } = req.body;

    if (!pracownikId || !grupaId) {
        return res.status(400).json({ error: 'Wymagane parametry: pracownikId, grupaId' });
    }

    if (stawka === null || stawka === '' || stawka === undefined) {
        const deleteQuery = `
            UPDATE pracownik_stawki 
            SET aktywna = 0 
            WHERE FK_idPracownik = ? AND FK_idGrupa_urlopowa = ?
        `;

        db.query(deleteQuery, [pracownikId, grupaId], (err) => {
            if (err) {
                console.error('Błąd usuwania indywidualnej stawki:', err);
                return res.status(500).json({ error: 'Błąd usuwania indywidualnej stawki' });
            }

            return res.json({ message: 'Indywidualna stawka została usunięta, będzie używana stawka globalna' });
        });
        return;
    }

    if (isNaN(parseFloat(stawka)) || parseFloat(stawka) < 0) {
        return res.status(400).json({ error: 'Nieprawidłowa wartość stawki' });
    }

    const stawkaDecimal = parseFloat(parseFloat(stawka).toFixed(2));

    const checkQuery = `
        SELECT 1 
        FROM pracownik_stawki 
        WHERE FK_idPracownik = ? AND FK_idGrupa_urlopowa = ? 
        LIMIT 1
    `;

    db.query(checkQuery, [pracownikId, grupaId], (err, existingRecords) => {
        if (err) {
            console.error('Błąd sprawdzania istniejącej stawki:', err);
            return res.status(500).json({ error: 'Błąd sprawdzania istniejącej stawki' });
        }

        let query;
        let params;

        if (existingRecords.length > 0) {
            query = `
                UPDATE pracownik_stawki 
                SET stawka_indywidualna = ?, aktywna = 1, data_modyfikacji = CURRENT_TIMESTAMP 
                WHERE FK_idPracownik = ? AND FK_idGrupa_urlopowa = ?
            `;
            params = [stawkaDecimal, pracownikId, grupaId];
        } else {
            query = `
                INSERT INTO pracownik_stawki (FK_idPracownik, FK_idGrupa_urlopowa, stawka_indywidualna, aktywna) 
                VALUES (?, ?, ?, 1)
            `;
            params = [pracownikId, grupaId, stawkaDecimal];
        }

        db.query(query, params, (err) => {
            if (err) {
                console.error('Błąd aktualizacji stawki:', err);
                return res.status(500).json({ error: 'Błąd aktualizacji stawki' });
            }

            return res.json({ message: 'Stawka została zaktualizowana pomyślnie' });
        });
    });
}


module.exports = AktualizujStawke;
