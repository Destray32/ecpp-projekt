const db = require('../../../server');

function UsunPracownika(req, res) {
    const id = req.params.id;
    
    db.beginTransaction(error => {
        if (error) {
            console.error('Error starting transaction:', error);
            return res.status(500).json({ error: 'Database transaction error' });
        }

        const query = `
            DELETE FROM pracownik
            WHERE idPracownik = ?
        `;
        const values = [id];

        db.query(query, values, (error, result) => {
            if (error) {
                console.error('Error deleting employee:', error);
                return db.rollback(() => {
                    res.status(500).json({ error: 'Database error' });
                });
            }

            db.commit(error => {
                if (error) {
                    console.error('Error committing transaction:', error);
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Database error' });
                    });
                }

                res.json({ message: 'Employee deleted' });
            });
        });
    });
}

module.exports = UsunPracownika;