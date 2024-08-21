function PobierzDostepneFirmy(req, res, db) {
    var sql = "SELECT * FROM firma";
    db.query(sql, function (err, result) {
        if (err) throw err;
        res.json(result);
    });
}

module.exports = PobierzDostepneFirmy;