const db = require('../../server');

function UsunOgloszenie(req, res) {
    const id = req.params.id;

    if (!Number.isInteger(parseInt(id))) {
        return res.status(400).send('Invalid ID');
    }

    db.beginTransaction((err) => {
        if (err) {
            console.error('Transaction error:', err);
            return res.status(500).send('Internal server error');
        }

        db.query('DELETE FROM pracownik_has_ogloszenia WHERE Ogloszenia_idOgloszenia = ?', [id], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error('Error deleting related records:', err);
                    res.status(500).send('Error deleting related records');
                });
            }

            db.query('DELETE FROM ogloszenia WHERE idOgloszenia = ?', [id], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error deleting announcement:', err);
                        res.status(500).send('Error deleting announcement');
                    });
                }

                if (result.affectedRows === 0) {
                    return db.rollback(() => {
                        res.status(404).send('Announcement not found');
                    });
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Transaction commit error:', err);
                            res.status(500).send('Internal server error');
                        });
                    }

                    console.log(`Deleted announcement with id: ${id}`);
                    res.send('Announcement deleted');
                });
            });
        });
    });
}

module.exports = UsunOgloszenie;