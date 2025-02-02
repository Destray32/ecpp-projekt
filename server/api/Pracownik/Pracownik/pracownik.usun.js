const db = require('../../../server');

function UsunPracownika(req, res) {
    const id = req.params.id;

    db.getConnection((error, connection) => {
        if (error) {
            console.error('Error getting connection from pool:', error);
            return res.status(500).json({ error: 'Database connection error' });
        }

        connection.beginTransaction(error => {
            if (error) {
                console.error('Error starting transaction:', error);
                connection.release();
                return res.status(500).json({ error: 'Database transaction error' });
            }

            const query = `UPDATE pracownik SET Archiwum = 1 WHERE idPracownik = ?;`;
            const values = [id];

            connection.query(query, values, (error, result) => {
                if (error) {
                    console.error('Error deleting employee:', error);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: 'Database error' });
                    });
                }

                connection.commit(error => {
                    if (error) {
                        console.error('Error committing transaction:', error);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: 'Database error' });
                        });
                    }

                    connection.release();
                    res.json({ message: 'Employee deleted' });
                });
            });
        });
    });
}

module.exports = UsunPracownika;
