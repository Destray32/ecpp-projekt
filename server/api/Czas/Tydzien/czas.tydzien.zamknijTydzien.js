function ZamknijTydzienCzas(req, res, db) {
    const { tydzienRoku, pracownikId } = req.body;
    console.log(tydzienRoku, pracownikId);

    // if (!Array.isArray(pracownikId) || pracownikId.length === 0) {
    //     return res.status(400).send('No employees selected');
    // }

    const sql = `UPDATE tydzien SET Status_tygodnia = 'Zamkniety' WHERE tydzienRoku = ? AND Pracownik_idPracownik IN (?)`;

    db.query(sql, [tydzienRoku, pracownikId], (err, result) => {
        if (err) {
            console.log(err);
            res.status(400).send('Błąd zamykania tygodnia');
        } else {
            res.status(200).send('Zamknięto tydzień dla wybranych pracowników');
        }
    });
}

module.exports = ZamknijTydzienCzas;
