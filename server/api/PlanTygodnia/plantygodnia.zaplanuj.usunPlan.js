function UsunPlan(req, res, db) {
    const { id } = req.query;

    if (!id) {
        res.status(400).send('Missing id parameter');
        return;
    }

    const sql = 'DELETE FROM Plan_Tygodnia_V WHERE idPlan_Tygodnia_V = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting plan:', err);
            res.status(500).send('Error deleting plan');
            return;
        }
        res.status(200).send('Plan deleted successfully');
    });
}

module.exports = UsunPlan;