const sampleData = [
    {
        id: 1,
        Nazwa: "Projekt 1",
        kodprojektu: "2021-10-01",
        statusprojektu: "2021-10-10",
    },
    {
        id: 2,
        Nazwa: "Projekt 1",
        kodprojektu: "2021-10-01",
        statusprojektu: "2021-10-10",
    },
    {
        id: 3,
        Nazwa: "Projekt 1",
        kodprojektu: "2021-10-01",
        statusprojektu: "2021-10-10",
    }
];

function GetProjekty(req, res) {
    res.json(sampleData);
}

module.exports = GetProjekty;