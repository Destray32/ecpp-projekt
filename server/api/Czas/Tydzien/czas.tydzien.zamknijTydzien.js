
function ZamknijTydzienCzas(req, res, db) {
    const {tydzienRoku, pracownikId} = req.body;
    console.log(tydzienRoku, pracownikId);

    const sql = "UPDATE tydzien SET Status_tygodnia = 'Zamkniety' WHERE tydzienRoku = ? AND Pracownik_idPracownik = ?";
    db.query(sql, [tydzienRoku, pracownikId], (err, result) => {
        if (err) {
            console.log(err);
            res.status(400).send('Błąd zamykania tygodnia');
        } else {
            res.status(200).send('Zamknięto tydzień');
        }
    });
}

module.exports = ZamknijTydzienCzas;