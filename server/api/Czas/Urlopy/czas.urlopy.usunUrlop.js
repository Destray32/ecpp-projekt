function UsunUrlop(req, res, db) {
    const { id } = req.body;


    if (!id) {
        return res.status(400).send('Id jest wymagane');
    }

    const deleteUrlopQuery = `
        DELETE FROM Urlopy 
        WHERE idUrlopy = ?`;

    db.query(deleteUrlopQuery, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Błąd usuwania urlopu');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Urlop o podanym ID nie istnieje');
        }

        res.status(200).send(`Usunięto urlop dla id: ${id}`);
    });
}

module.exports = UsunUrlop;
