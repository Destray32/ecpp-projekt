function PobierzProjekt (req, res, db) {
    const idProjekty = req.params.id;

    const query = `SELECT * FROM Projekty WHERE idProjekty = ?`;

    db.query(query, [idProjekty], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else {
            res.status(200).send(result);
        }
    }
    );
}

module.exports = PobierzProjekt;