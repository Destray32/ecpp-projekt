
const sampleData = [
    {
        dataOd: "05.08.2024",
        dataDo: "12.08.2024",
        naziwsko: "Kowalski",
        imie: "Jan",
        firma: "Firma1",
        grupa: "Grupa1",
        opis: "Irure aliquip anim eu et esse officia fugiat anim esse sunt magna."
    },
    {
        dataOd: "12.08.2024",
        dataDo: "19.08.2024",
        naziwsko: "Kowalski",
        imie: "Jan",
        firma: "Firma1",
        grupa: "Grupa1",
        opis: "Irure aliquip anim eu et esse officia fugiat anim esse sunt magna."
    },
];

function GetPlany(req, res) {
    const data = sampleData;
    const { from, to } = req.query;
    if (from && to) {
        const filteredData = data.filter((item) => item.dataOd >= from && item.dataDo <= to);
        return res.json(filteredData);
    }

    return res.json(data);
}

module.exports = GetPlany;