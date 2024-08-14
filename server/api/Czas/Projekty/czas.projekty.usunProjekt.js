function UsunProjekt(req, res, db) {
    const id = req.query.id;
    console.log(id);
    const sql = `DELETE FROM projekty WHERE idProjekty = ${id}`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log('SQL Error:', err);
            res.status(400).send('Błąd usuwania projektu');
        } else {
            res.status(200).send('Projekt usunięty');
        }
    });
}

module.exports = UsunProjekt;
