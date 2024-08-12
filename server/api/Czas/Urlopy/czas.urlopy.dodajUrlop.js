

function DodajUrlop(req, res) {
    const { imie_nazwisko, status, urlop_od, urlop_do, komentarz } = req.body;
    console.log(imie_nazwisko, status, urlop_od, urlop_do, komentarz);

    res.status(200).send("Dodano urlop");
}

module.exports = DodajUrlop;