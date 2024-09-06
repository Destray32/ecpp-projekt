
function DodajNowyProjekt(req, res, db) {
    const {firma, zleceniodawca, nazwa, ulica, miejscowosc, kodPocztowy, kraj} = req.body;
    const sql = `INSERT INTO projekty (Firma, Zleceniodawca, NazwaKod_Projektu, Ulica, Miejscowosc, Kod_Pocztowy, Kraj)
     VALUES ('${firma}', '${zleceniodawca}', '${nazwa}', '${ulica}', '${miejscowosc}', '${kodPocztowy}', '${kraj}')`;
    
    db.query(sql, (err, result) => {
    if (err) {
        res.status(400).send('Brak wymaganych danych');
        return;
    } else {

        res.status(200).send("Dodano nowy projekt: " + nazwa);
    }
});
}

module.exports = DodajNowyProjekt;