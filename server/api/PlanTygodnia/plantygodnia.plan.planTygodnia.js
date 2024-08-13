
const dane = [
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "inni", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "inni", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "inni", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "inni", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "inni", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "inni", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "wszyscy", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "wszyscy", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "wszyscy", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "wszyscy", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "wszyscy", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "wszyscy", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "wszyscy", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
    { id: 1, name: 'John', surname: 'Doe', vacationGroup: "wszyscy", M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis' },
]


function PlanTygodniaPlan(req, res) {

    const { group } = req.query;
    console.log(group);
    if (group === undefined) {
        res.json(dane);
        return;
    } else {
        const data = dane.filter(item => item.vacationGroup === group);
        res.json(data);
    }

}

module.exports = PlanTygodniaPlan;