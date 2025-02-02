const db = require('../../../server');

function PobierzSamochody(req, res) {
    let sql = `SELECT * FROM view_dzien_projekty`;

    db.query(sql, [], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'An error occurred while fetching data.' });
            return;
        }
        res.json(results);
    });
}

module.exports = PobierzSamochody;