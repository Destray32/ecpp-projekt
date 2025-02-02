
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function getBlockStatus(req, res, db) {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const promisePool = db.promise();

    try {
            // pobranie ilosci warningow z ostatnich 6 miesiecy
            const [blockResult] = await promisePool.query(
                `SELECT czy_zablokowany
                FROM Pracownik_ostrzezenia
                WHERE Pracownik_idPracownik = ?`,
                [userId]
            );
            if (blockResult.length === 0) {
                return res.status(200).send();
            }
            if (blockResult[0].czy_zablokowany == 1) {
                return res.status(403).json({
                    message: 'Konto zablokowane, Skontaktuj się z administratorem'
                });
            } else {
                return res.status(200).send();
            }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = getBlockStatus;