function EdytujPojazd(req, res, db) {
    const vehicleId = req.params.id;
    const updatedData = req.body;

    if (!updatedData.numerRejestracyjny || !updatedData.marka) {
        return res.status(400).json({ message: "Brak wymaganych danych" });
    }

    const sql = `UPDATE pojazdy SET Nr_rejestracyjny = ?, Marka = ?, Uwagi = ? WHERE idPojazdy = ?`;
    const params = [updatedData.numerRejestracyjny, updatedData.marka, updatedData.uwagi || null, vehicleId];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Błąd podczas aktualizacji pojazdu:", err);
            return res.status(500).json({ error: "Wystąpił błąd podczas aktualizacji pojazdu." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Pojazd nie został znaleziony." });
        }

        res.status(200).json({ message: "Pojazd zaktualizowany pomyślnie." });
    });
}

module.exports = EdytujPojazd;
