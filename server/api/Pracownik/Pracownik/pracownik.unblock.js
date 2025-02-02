
async function unblockUser(req, res, db) {
    const promisePool = db.promise();
    const { id } = req.params;

    try {
        await promisePool.query(
            `UPDATE Pracownik_ostrzezenia
            SET czy_zablokowany = 0
            WHERE Pracownik_idPracownik = ?`,
            [id]
        );

        return res.status(200).send();
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = unblockUser;