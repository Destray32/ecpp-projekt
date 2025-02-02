function AktualizujM1_5(req, res, db) {
    const { employeeId } = req.params;
    const { M1_5 } = req.body;


    const sql = `UPDATE Plan_Tygodnia_V SET m_value = ? WHERE idPlan_Tygodnia_V = ?`;

    db.query(sql, [M1_5, employeeId], (err, result) => {
        if (err) {
            console.error('Error updating plan:', err);
            res.status(500).send('Error updating plan');
            return;
        }

        res.json({ message: 'Plan updated successfully' });
    });
}

module.exports = AktualizujM1_5;
