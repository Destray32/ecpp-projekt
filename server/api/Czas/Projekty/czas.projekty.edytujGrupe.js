function EdytujGrupe(req, res, db) {
    const { id } = req.params;
    const { zleceniodawca, cennik, stawka, czyPlanTygV } = req.body;

    if (!zleceniodawca || !cennik || !stawka) {
        return res.status(400).json({ message: 'Brak wymaganych danych' });
    }

    const sql = `UPDATE Grupa_urlopowa SET Zleceniodawca = ?, Cennik = ?, Stawka = ?, Plan_tygodniaV = ? WHERE idGrupa_urlopowa = ?`;
    db.query(sql, [zleceniodawca, cennik, stawka, czyPlanTygV, req.params.id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(400).send('Błąd edycji grupy');
        }
        res.status(200).json({ message: 'Grupa edytowana pomyślnie' });
    });
}

module.exports = EdytujGrupe;