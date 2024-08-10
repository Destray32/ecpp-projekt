
function DodajZaplanuj(req, res) {
    console.log(req.body);
    // w tym miejscu, dodać plan do bazy danych
    
    res.json({
        "status": "success",
        "message": "Plan został zaplanowany"
    });
}

module.exports = DodajZaplanuj;