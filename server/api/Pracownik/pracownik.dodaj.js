function DodajPracownika(req, res) {
    const db = require('../../db.js');
    const pracownik = [req.body.imie, req.body.nazwisko, req.body.login, req.body.haslo, req.body.email, req.body.telefon, req.body.data_zatrudnienia, req.body.data_zwolnienia, req.body.id_grupy];
    console.log("Dodaje pracownika: " + pracownik);
    res.status(200).send();
}

module.exports = DodajPracownika;