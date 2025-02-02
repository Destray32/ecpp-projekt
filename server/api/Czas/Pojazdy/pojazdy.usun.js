function UsunPojazd(req, res, db) {
    const { id } = req.params;
    console.log(id);
    const sql = `UPDATE pojazdy SET Archiwum = 1 WHERE idPojazdy = ${id}`;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(400).send('Błąd usuwania pojazdu');
        } else {
            res.status(200).send('Pojazd usunięty');
        }
    });
}

module.exports = UsunPojazd;