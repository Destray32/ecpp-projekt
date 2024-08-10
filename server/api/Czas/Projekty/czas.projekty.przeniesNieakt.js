

function PrzeniesNieakt(req, res) {
    const ids = req.body.ids;

    if (ids.length === 0) {
        res.status(400).send('Brak zaznaczonych rekordów');
        return;
    } else {
        res.status(200).send("przeniesiono rekordy: " + ids + " do niekatywnych");
    }
}

module.exports = PrzeniesNieakt;