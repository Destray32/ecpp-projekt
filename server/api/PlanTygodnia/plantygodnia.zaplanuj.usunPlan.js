


function UsunPlan(req, res) {
    // w przyszlosci baza udostepni id do usuniecia, lub bede trzeba
    // znaleźć wpis po innych danych
    const id = req.query.id;
    console.log(id);

    // w tym miejscu, usunąć plan z bazy danych

    res.json({
        "status": "success",
        "message": "Plan został usunięty"
    });
}

module.exports = UsunPlan;