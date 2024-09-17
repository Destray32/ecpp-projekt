const db = require('../../../server');

function UsunWpisPlan(req, res) {
    const { id } = req.body;
    console.log('id:', id);

    if (!Array.isArray(id) || id.length === 0) {
        return res.status(400).json({ error: 'Invalid input: ids must be a non-empty array' });
    }

    const idPlaceholders = id.map(() => '?').join(',');
    console.log('idPlaceholders:', idPlaceholders);
    const sql = `
        UPDATE informacje_o_firmie i
        JOIN pracownik p ON p.FK_Informacje_o_firmie = i.idInformacje_o_firmie
        SET i.Plan_TygodniaV = 0
        WHERE p.idPracownik IN (${idPlaceholders})
    `;
    console.log('sql:', sql);

    db.query(sql, id, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ error: 'An error occurred while updating records.', details: error.message });
        }
    });
}

module.exports = UsunWpisPlan;