function PobierzPojazdy(req, res) {
    res.json({
        pojazdy: [
            {
                id: 1,
                numerRejestracyjny: "BJO042",
                marka: "Volvo",
                uwagi: "Brak",
            },
            {
                id: 2,
                numerRejestracyjny: "BJO042",
                marka: "Volvo",
                uwagi: "Brak",
            },
            {
                id: 3,
                numerRejestracyjny: "BJO042",
                marka: "Volvo",
                uwagi: "Brak",
            }
        ]
    });
}

module.exports = PobierzPojazdy;