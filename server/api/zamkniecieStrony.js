const db = require('../../server');
const jwt = require('jsonwebtoken');

function ZamkniecieStrony(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const query = `
            INSERT INTO logi (FK_idPracownik, Data, Komentarz) 
            VALUES (?, NOW(), 'Wylogowano')
        `;
        const values = [decoded.id];

        db.query(query, values, (logErr) => {
            if (logErr) {
                console.error('Error logging user logout:', logErr);
            }
        });

        res.clearCookie('token');
        res.status(200).send('Success');
    });
}

module.exports = ZamkniecieStrony;