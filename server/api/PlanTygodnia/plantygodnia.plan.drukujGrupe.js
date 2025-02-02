
function DrukujGrupe(req, res) {
    const group = req.query.group;
    // pobrac z bazy grupe i przekazać do drukowania
    console.log("Drukuję grupę: " + group);
}

module.exports = DrukujGrupe;