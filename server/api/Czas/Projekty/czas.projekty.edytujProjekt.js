function EdytujProjekt(req, res, db) {
    const { firma, zleceniodawca, nazwa, ulica, miejscowosc, kodPocztowy, kraj } = req.body;
    const { id } = req.params;

    if (!firma || !zleceniodawca || !nazwa) {
        res.status(400).send('Brak wymaganych danych');
        return;
    }

    const sql = "UPDATE projekty SET NazwaKod_Projektu = ?, Ulica = ?, Miejscowosc = ?, Kod_pocztowy = ?, Kraj = ?, Grupa_urlopowa_idGrupa_urlopowa = ?, Firma_idFirma = ? WHERE idProjekty = ?;";

    const values = [nazwa, ulica, miejscowosc, kodPocztowy, kraj, zleceniodawca, firma, id];

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