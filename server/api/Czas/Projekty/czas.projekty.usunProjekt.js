
function UsunProjekt(req, res) {
    const id = req.query.id;
    res.json("Usunieto projekt o id: " + id);
}

module.exports = UsunProjekt;
