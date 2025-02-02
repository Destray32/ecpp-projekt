function EdytujGrupe(req, res, db) {
    const { id } = req.params;
    let { zleceniodawca, cennik, stawka, czyPlanTygV } = req.body;

    if (!zleceniodawca) {
        return res.status(400).json({ message: 'Brak wymaganych danych' });
    }
    
    if(stawka){
        stawka = stawka.replace(',', '.');  
    }

    const sql = `UPDATE Grupa_urlopowa SET Zleceniodawca = ?, Cennik = ?, Stawka = ?, Plan_tygodniaV = ? WHERE idGrupa_urlopowa = ?`;
    db.query(sql, [zleceniodawca, cennik || null, stawka || null, czyPlanTygV, id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(400).send('Błąd edycji grupy');
        }
        res.status(200).json({ message: 'Grupa edytowana pomyślnie' });
    });
}

module.exports = EdytujGrupe;