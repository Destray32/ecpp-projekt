function OtworzTydzienCzas(req, res, db) {
    // Sprawdź czy użytkownik ma odpowiednie uprawnienia
    if (!req.user.role === 'Administrator' && !hasSpecialAccess(req.user, 'tydzien')) {
        return res.status(403).json({ error: 'Brak uprawnień do otwierania tygodnia' });
    }

    const { tydzienRoku, pracownikId } = req.body; 

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
