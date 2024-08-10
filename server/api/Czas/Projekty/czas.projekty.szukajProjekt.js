

function SzukajProjekt(req, res) {
    const group = req.query.group;
    if (group === "undefined") {
        res.status(400).json("Nie podano grupy");
    } else {
        res.status(200).json("Znaleziono projekty w grupie: " + group);
    }
}

module.exports = SzukajProjekt;