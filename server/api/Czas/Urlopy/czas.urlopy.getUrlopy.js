const sampleData = [
    {
        id: 1,
        name: "Jan Kowalski",
        urlopOd: "2021-10-01",
        urlopDo: "2021-10-10",
        komentarz: "Testowy urlop",
        status: "Do zatwierdzenia"
    },
    {
        id: 2,
        name: "Anna Nowak",
        urlopOd: "2021-10-15",
        urlopDo: "2021-10-20",
        komentarz: "Urlop na urlopie",
        status: "Zatwierdzone"
    },
    {
        id: 3,
        name: "Marek Zając",
        urlopOd: "2021-11-01",
        urlopDo: "2021-11-07",
        komentarz: "Chorobowe",
        status: "Anulowane"
    }
];


function GetUrlopy(req, res) {
  res.status(200).json(sampleData);
}

module.exports = GetUrlopy;