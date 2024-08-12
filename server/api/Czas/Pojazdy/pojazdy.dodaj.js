function DodajPojazd(req, res) {
    const { numerRejestracyjny, marka, uwagi } = req.body;
    console.log(req.body);
    res.json({ message: "Dodano pojazd" });
}

module.exports = DodajPojazd;