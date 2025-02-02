const db = require('../../server');
const jwt = require('jsonwebtoken');

async function GetBadgeCount(req, res) {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const query = `
            SELECT COUNT(*) as count 
            FROM pracownik_has_ogloszenia 
            WHERE Pracownik_idPracownik = ? AND Przeczytane = 0
        `;
        db.query(query, [userId], (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                return res.status(500).json({ error: 'Database query error' });
            }
            const unreadCount = results[0].count;
            res.json({ count: unreadCount });
        });
    } catch (error) {
        console.error('Error in GetBadgeCount:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = GetBadgeCount;