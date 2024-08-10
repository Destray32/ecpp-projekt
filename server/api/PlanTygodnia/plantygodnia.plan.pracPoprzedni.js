
function PracownicyPoprzedniTydz(req, res) {
    console.log("Pracownicy z poprzedniego tygodnia");
    res.json([
        {id: 1, name: 'Janusz', surname: 'Kowalski', vacationGroup: 1, M1: '', M2: '', M3: '', M4: '', M5: '', description: 'testowy opis'},
        ])
}

module.exports = PracownicyPoprzedniTydz;