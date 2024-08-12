

function ZatwierdzUrlop(req, res) {
    const { id, status } = req.body;
    console.log(id, status);

    res.status(200).send("Zmieniam urlop dla id: " + id + " na status: " + status);
}

module.exports = ZatwierdzUrlop;