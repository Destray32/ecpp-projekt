function EdytujProjekt(req, res, db) {
    const { firma, zleceniodawca, nazwa, ulica, miejscowosc, kodPocztowy, kraj } = req.body;
    const { id } = req.params;

    if (!firma || !zleceniodawca || !nazwa || !ulica || !miejscowosc || !kodPocztowy || !kraj) {
        res.status(400).send('Brak wymaganych danych');
        return;
    }

    const sql = `
        UPDATE projekty
        SET Firma = ?, Zleceniodawca = ?, NazwaKod_Projektu = ?, Ulica = ?, Miejscowosc = ?, Kod_Pocztowy = ?, Kraj = ?
        WHERE idProjekty = ?
    `;

    const values = [firma, zleceniodawca, nazwa, ulica, miejscowosc, kodPocztowy, kraj, id];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Error updating project');
            return;
        }
        res.status(200).send(`Zaktualizowano projekt: ${nazwa}`);
    });
}

module.exports = EdytujProjekt;