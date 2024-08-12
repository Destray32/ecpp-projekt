const sampleData = [
    {
        id: 1,
        name: "Marek Zając",
        grupaurlopowa: "NCC",
        status1: "Otwarty",
        status2: "Zamknięty"
    },
    {
        id: 2,
        name: "Marek Zając",
        grupaurlopowa: "NCC",
        status1: "Otwarty",
        status2: "Zamknięty"
    },
    {
        id: 3,
        name: "Marek Zając",
        grupaurlopowa: "NCC",
        status1: "Otwarty",
        status2: "Zamknięty"
    }
];

function GetTydzien(req, res) {
    res.json(sampleData);
}

module.exports = GetTydzien;