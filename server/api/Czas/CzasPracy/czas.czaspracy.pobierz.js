function PobierzCzasPracy(req, res) {
    const sampleData = [
        {
            "pracownik": "Kierownik 1",
            "firma": "firma1",
            "zleceniodawca": "zleceniodawca1",
            "projekty": "projekt1",
            "godziny_0": ["08:00", "12:00"],
            "godziny_1": ["13:00", "17:00"]
        },
        {
            "pracownik": "Kierownik 2",
            "firma": "firma2",
            "zleceniodawca": "zleceniodawca2",
            "projekty": "projekt2",
            "godziny_0": ["09:00", "11:00"],
            "godziny_1": ["12:00", "16:00"]
        },
        {
            "pracownik": "Kierownik 2",
            "firma": "firma2",
            "zleceniodawca": "zleceniodawca2",
            "projekty": "projekt2",
            "godziny_0": ["15:00", "17:00"],
            "godziny_1": ["18:00", "20:00"]
        }
    ];    

    res.json(sampleData);
}

module.exports = PobierzCzasPracy;