const db = require('../../server');

function Logins(req, res) {
    const query = `SELECT Nazwa_uzytkownika from pracownik WHERE Archiwum = 0`;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error in query:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        const logins = result.map(login => login.Nazwa_uzytkownika);
        res.json(logins);
    }
    );
}

module.exports = Logins;