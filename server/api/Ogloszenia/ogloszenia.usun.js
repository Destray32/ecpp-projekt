const db = require('../../server');

function UsunOgloszenie(req, res) {
    const id = req.params.id;

    if (!Number.isInteger(parseInt(id))) {
        return res.status(400).send('Invalid ID');
    }

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Connection error:', err);
            return res.status(500).send('Internal server error');
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error('Transaction error:', err);
                connection.release();
                return res.status(500).send('Internal server error');
            }

            connection.query('DELETE FROM pracownik_has_ogloszenia WHERE Ogloszenia_idOgloszenia = ?', [id], (err) => {
                if (err) {
                    return connection.rollback(() => {
                        console.error('Error deleting related records:', err);
                        connection.release();
                        res.status(500).send('Error deleting related records');
                    });
                }

                connection.query('DELETE FROM ogloszenia WHERE idOgloszenia = ?', [id], (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error('Error deleting announcement:', err);
                            connection.release();
                            res.status(500).send('Error deleting announcement');
                        });
                    }

                    if (result.affectedRows === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(404).send('Announcement not found');
                        });
                    }

                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error('Transaction commit error:', err);
                                connection.release();
                                res.status(500).send('Internal server error');
                            });
                        }

                        console.log(`Deleted announcement with id:${id}`);
                        connection.release();
                        res.send('Announcement deleted');
                    });
                });
            });
        });
    });
}

module.exports = UsunOgloszenie;
