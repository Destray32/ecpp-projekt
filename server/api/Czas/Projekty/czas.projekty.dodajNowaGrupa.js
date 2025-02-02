function DodajGrupe(req, res, db) {
    const { zleceniodawca, cennik, stawka, czyPlanTygV } = req.body;

    if (!zleceniodawca) {
        return res.status(400).json({ message: 'Brak wymaganych danych' });
    }

    const sql = `INSERT INTO Grupa_urlopowa (Zleceniodawca, Cennik, Stawka, Plan_tygodniaV) VALUES (?, ?, ?, ?)`;
    db.query(sql, [zleceniodawca, cennik, stawka, czyPlanTygV], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(400).send('Błąd dodawania grupy');
        }
        res.status(200).json({ message: 'Grupa dodana pomyślnie' });
    });
}

module.exports = DodajGrupe;
