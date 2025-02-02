const db = require('../../../server');

const tableMap = {
    'Pracownicy': 'pracownik',
    'Firmy': 'firma',
    'Projekty': 'projekty',
    'Pojazdy': 'pojazdy',
    'Grupy Urlopowe': 'grupa_urlopowa'
};

function PrzywrocArchiwum(req, res) {
    const tableNameReadable = req.body.tableName;
    const recordId = req.body.recordId;

    if (!tableNameReadable || !recordId) {
        return res.status(400).send('Table name and record ID are required.');
    }

    const tableName = tableMap[tableNameReadable];
    if (!tableName) {
        return res.status(400).send('Invalid table name.');
    }

    const sql = `UPDATE ?? SET Archiwum = ? WHERE id${tableName.charAt(0).toUpperCase() + tableName.slice(1)} = ?`;

    db.query(sql, [tableName, 0, recordId], (error, results) => {
        if (error) {
            console.error('Error updating archive flag:', error);
            return res.status(500).send('Server error.');
        }

        res.status(200).send('Archive flag updated successfully.');
    });
}

module.exports = PrzywrocArchiwum;