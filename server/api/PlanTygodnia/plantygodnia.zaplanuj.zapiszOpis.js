function ZapiszOpis(req, res, db) {
    const { idPlanTygodnia, opis } = req.body;

    if (!idPlanTygodnia || typeof opis !== 'string') {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const sql = 'UPDATE Plan_Tygodnia_V SET opis = ? WHERE idPlan_Tygodnia_V = ?';
    db.query(sql, [opis, idPlanTygodnia], (err, result) => {
        if (err) {
            console.error('Database update error:', err);
            return res.status(500).json({ status: 'error', message: 'Database update error' });
        }
        res.status(200).json({ status: 'success', message: 'Opis updated successfully' });
    });
}

module.exports = ZapiszOpis;
