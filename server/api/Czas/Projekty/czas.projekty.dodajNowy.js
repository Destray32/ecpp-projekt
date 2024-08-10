
function DodajNowyProjekt(req, res) {
    const {firma, zleceniodawca, nazwa, kodProjektu, ulica, miejscowosc, kodPocztowy, kraj} = req.body;

    if (!firma || !zleceniodawca || !nazwa || !kodProjektu || !ulica || !miejscowosc || !kodPocztowy || !kraj) {
        res.status(400).send('Brak wymaganych danych');
        return;
    } else {
        res.status(200).send("Dodano nowy projekt: " + nazwa);
    }
}

module.exports = DodajNowyProjekt;