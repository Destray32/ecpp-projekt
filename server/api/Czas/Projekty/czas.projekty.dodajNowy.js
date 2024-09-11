function DodajNowyProjekt(req, res, db) {
    const {firma, zleceniodawca, nazwa, ulica, miejscowosc, kodPocztowy, kraj} = req.body;

    const sql = `INSERT INTO projekty (Firma, Zleceniodawca, NazwaKod_Projektu, Ulica, Miejscowosc, Kod_Pocztowy, Kraj)
     VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [firma, zleceniodawca, nazwa, ulica, miejscowosc, kodPocztowy, kraj], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(400).send('Brak wymaganych danych');
            return;
        } else {
            res.status(200).send("Dodano nowy projekt: " + nazwa);
        }
    });
}

module.exports = DodajNowyProjekt;