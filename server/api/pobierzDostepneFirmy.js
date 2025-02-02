function PobierzDostepneFirmy(req, res, db) {
    var sql = "SELECT * FROM firma WHERE Archiwum = 0";
    db.query(sql, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
}

module.exports = PobierzDostepneFirmy;