
async function GetBlockedUsers(req, res, db) {
    const promisePool = db.promise();

    try {
        const [blockedUsers] = await promisePool.query(
            `SELECT DISTINCT do.Imie as name, do.Nazwisko as surname, po.czy_zablokowany, p.idPracownik as id
            FROM Pracownik_ostrzezenia po
            JOIN Pracownik p ON po.Pracownik_idPracownik = p.idPracownik
            JOIN Dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
            WHERE po.czy_zablokowany = 1`
        )

        if (blockedUsers.length === 0) {
            return res.status(404).json({
                message: 'Brak zablokowanych użytkowników'
            });
        } else {
            return res.status(200).json(blockedUsers);
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = GetBlockedUsers;