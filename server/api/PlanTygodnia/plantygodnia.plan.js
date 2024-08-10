
function PlanTygodniaPlan(req, res) {
    res.json([
        {id: 1, name: 'John', surname: 'Doe', M1: 'X', M2: 'X', M3: 'X', M4: 'X', M5: 'X', description: 'testowy opis'},
    ])
}

module.exports = PlanTygodniaPlan;