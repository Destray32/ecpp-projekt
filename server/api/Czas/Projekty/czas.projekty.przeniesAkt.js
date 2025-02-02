function PrzeniesAkt(req, res, db) {
    const ids = req.body.ids;

    // Sprawdzenie, czy ids jest tablicą i czy nie jest pusta
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send('Brak zaznaczonych rekordów');
    }

    // Tworzenie miejsca na parametry w zapytaniu SQL
    const placeholders = ids.map(() => '?').join(',');

    // Użycie zapytań parametryzowanych w celu ochrony przed SQL Injection
    const sql = `UPDATE projekty SET Status = 'Aktywny' WHERE idProjekty IN (${placeholders})`;

    db.query(sql, ids, (err, result) => {
        if (err) {
            console.error('Błąd przy aktualizacji projektów:', err);
            return res.status(500).send('Błąd przy aktualizacji rekordów');
        }


        res.status(200).send(`Przeniesiono rekordy: ${ids.join(', ')} do aktywnych`);
    });
}


module.exports = PrzeniesAkt;