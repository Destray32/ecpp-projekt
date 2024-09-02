const db = require('../../server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function Logowanie(req, res) {
    console.log(req.body);
    const { firma, login, password } = req.body;

    const query = `
        SELECT * FROM pracownik WHERE Nazwa_uzytkownika = ?
    `;
    const values = [login];

    db.query(query, values, async (err, result) => {
        if (err) {
            console.error('Error in query:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        console.log(result);

        if (result.length === 0) {
            return res.status(401).json({ error: 'Wrong login or password' });
        }

        const user = result[0];
        const isPasswordValid = await bcrypt.compare(password, user.Haslo);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Wrong login or password' });
        }

        const token = jwt.sign({ id: user.idPracownik }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            //secure: process.env.NODE_ENV === 'production',    trzeba zmienic jak wyjdzie z developmentu
            secure: false,
            sameSite: 'lax',
            maxAge: 3600000,
        });

        res.json({ message: 'Logged in' });
    });
}

module.exports = Logowanie;