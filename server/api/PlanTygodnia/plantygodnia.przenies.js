
function PrzeniesWpisPlan(req, res) {
    const { id, grupa } = req.body
    console.log("Przenosze wpis z id: " + id + " do grupy: " + grupa)

    res.status(200).send();
}

module.exports = PrzeniesWpisPlan;