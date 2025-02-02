function OtworzTydzienCzas(req, res, db) {
    const { tydzienRoku, pracownikId } = req.body; 
    console.log(tydzienRoku, pracownikId);

    const sql = "UPDATE tydzien SET Status_tygodnia = 'Otwarty' WHERE tydzienRoku = ? AND Pracownik_idPracownik IN (?)";
    
    db.query(sql, [tydzienRoku, pracownikId], (err, result) => {
        if (err) {
            console.log(err);
            res.status(400).send('Błąd otwierania tygodnia');
        } else {
            res.status(200).send('Otwarto tydzień');
        }
    });
}

module.exports = OtworzTydzienCzas;
