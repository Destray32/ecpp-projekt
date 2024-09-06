function PracownicyPoprzedniTydz(req, res) {
    console.log("Pracownicy z poprzedniego tygodnia");

    const employeesPreviousWeek = [
        {
            id: 13,
            name: "Alice",
            surname: "Johnson",
            vacationGroup: "Zleceniodawca C",
            M1_5: "M1",
            description: "Opis z poprzedniego tygodnia"
        },
        {
            id: 14,
            name: "Bob",
            surname: "Brown",
            vacationGroup: "Zleceniodawca B",
            M1_5: "M2",
            description: "Opis z poprzedniego tygodnia"
        },
        {
            id: 15,
            name: "Charlie",
            surname: "Davis",
            vacationGroup: "Zleceniodawca A",
            M1_5: "M1",
            description: "Opis z poprzedniego tygodnia"
        },
        {
            id: 16,
            name: "Diana",
            surname: "Evans",
            vacationGroup: "Zleceniodawca C",
            M1_5: "M3",
            description: "Opis z poprzedniego tygodnia"
        }
    ];

    res.json(employeesPreviousWeek);
}

module.exports = PracownicyPoprzedniTydz;