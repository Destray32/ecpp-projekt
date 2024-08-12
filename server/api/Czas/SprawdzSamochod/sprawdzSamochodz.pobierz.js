function PobierzSamochody(req, res) {
    const samochody = [
        {
            id: 1,
            data: "2024-08-01",
            dane: "Marek Zając",
            pojazd: "BJO075 Volkswagen VW Czarny / 3os.",
            projekt: "NCW",
            godziny: "8"
        },
        {
            id: 2,
            data: "2024-08-02",
            dane: "Marek Zając",
            pojazd: "Jakies inne losowe auto",
            projekt: "NCW",
            godziny: "8"
        },
        {
            id: 3,
            data: "2024-08-03",
            dane: "Marek Zając",
            pojazd: "BJO075 Volkswagen VW Czarny / 3os.",
            projekt: "NCW",
            godziny: "8"
        },
        {
            id: 4,
            data: "2024-08-04",
            dane: "Marek Zając",
            pojazd: "BJO075 Volkswagen VW Czarny / 3os.",
            projekt: "NCW",
            godziny: "8"
        },
        {
            id: 5,
            data: "2024-08-05",
            dane: "Marek Zając",
            pojazd: "Jakies inne losowe auto",
            projekt: "NCW",
            godziny: "8"
        },
        {
            id: 6,
            data: "2024-08-06",
            dane: "Marek Zając",
            pojazd: "Jakies inne losowe auto",
            projekt: "NCW",
            godziny: "8"
        },
        {
            id: 7,
            data: "2024-08-07",
            dane: "Marek Zając",
            pojazd: "BJO075 Volkswagen VW Czarny / 3os.",
            projekt: "NCW",
            godziny: "8"
        },
        {
            id: 8,
            data: "2024-08-08",
            dane: "Marek Zając",
            pojazd: "BJO075 Volkswagen VW Czarny / 3os.",
            projekt: "NCW",
            godziny: "8"
        },
        {
            id: 9,
            data: "2024-08-09",
            dane: "Marek Zając",
            pojazd: "BJO075 Volkswagen VW Czarny / 3os.",
            projekt: "NCW",
            godziny: "8"
        },
        {
            id: 10,
            data: "2024-08-10",
            dane: "Marek Zając",
            pojazd: "BJO075 Volkswagen VW Czarny / 3os.",
            projekt: "NCW",
            godziny: "8"
        }
    ];
    res.json(samochody);
}

module.exports = PobierzSamochody;