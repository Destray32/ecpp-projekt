
function UsunUrlop(req, res) {
    const {id} = req.body;
    console.log(id);

    res.status(200).send("Usuwam urlop dla id: " + id);
}

module.exports = UsunUrlop;