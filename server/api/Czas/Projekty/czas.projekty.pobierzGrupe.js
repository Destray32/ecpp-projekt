function PobierzGrupe (req, res, db) {
    const { id } = req.params;

    const sql = `SELECT * FROM grupa_urlopowa WHERE idGrupa_urlopowa = ${id}`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Error updating project');
            return;
        }
        res.status(200).send(result);
    });
}

module.exports = PobierzGrupe;