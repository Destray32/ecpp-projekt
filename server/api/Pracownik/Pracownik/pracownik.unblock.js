async function unblockUser(req, res, db) {
    const promisePool = db.promise();
    const { id } = req.params;

    try {
        // Odblokowanie użytkownika
        await promisePool.query(
            `UPDATE Pracownik_ostrzezenia
            SET czy_zablokowany = 0
            WHERE Pracownik_idPracownik = ?`,
            [id]
        );

        // Usunięcie ostrzeżeń dla użytkownika
        await promisePool.query(
            `DELETE FROM Pracownik_ostrzezenia
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