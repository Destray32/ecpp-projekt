function UsunWpisPlan(req, res) {
    const {id} = req.body;
    console.log("Usuwam wpis z id: " + id);
    res.status(200).send();
}

module.exports = UsunWpisPlan;