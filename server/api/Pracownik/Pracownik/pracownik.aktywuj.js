async function aktywujUser(req, res, db) {
    const promisePool = db.promise();
    const { id } = req.params;

    try {
        await promisePool.query(
            `UPDATE pracownik
            SET Status_konta = 'Aktywne'
            WHERE idPracownik = ?`,
            [id]
        );

        return res.status(200).json({ message: 'User activated successfully' });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = aktywujUser;
