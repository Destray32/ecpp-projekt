function UsunWpisPlan(req, res,db ) {
    const { id } = req.body;

    if (!Array.isArray(id) || id.length === 0) {
        return res.status(400).json({ error: 'Invalid input: ids must be a non-empty array' });
    }

    const idPlaceholders = id.map(() => '?').join(',');

    const sql = `
        DELETE FROM Plan_Tygodnia_V
        WHERE idPlan_Tygodnia_V IN (${idPlaceholders})
    `;

    db.query(sql, id, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ error: 'An error occurred while updating records.', details: error.message });
        }
    });
}

module.exports = UsunWpisPlan;