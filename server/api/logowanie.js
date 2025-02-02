const db = require('../../server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function Logowanie(req, res) {
    const { firma, login, password } = req.body;

    const query = `
        SELECT p.idPracownik, p.Haslo, f.Nazwa_firmy, p.Typ_konta
        FROM pracownik p
        JOIN informacje_o_firmie i ON p.FK_Informacje_o_firmie = i.idInformacje_o_firmie
        JOIN firma f ON i.FK_idFirma = f.idFirma
        WHERE p.Nazwa_uzytkownika = ?
    `;
    const values = [login];

    db.query(query, values, async (err, result) => {
        if (err) {
            console.error('Error in query:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (result.length === 0) {
            return res.status(401).json({ error: 'Wrong login or password' });
        }

        const user = result[0];

        if (user.Nazwa_firmy !== firma) {
            return res.status(401).json({ error: 'Wrong login or company name' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.Haslo);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Wrong login or password' });
        }

        const token = jwt.sign({ id: user.idPracownik, role: user.Typ_konta }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            //secure: process.env.NODE_ENV === 'production',  // zmienic jak bedziemy oddawac apke
            secure: false,
            sameSite: 'strict',
            maxAge: 3600000,
        });

        const logQuery = `
            INSERT INTO logi (FK_idPracownik, Data, Komentarz) 
            VALUES (?, NOW(), 'Zalogowano')
        `;
        const logValues = [user.idPracownik];

        db.query(logQuery, logValues, (logErr) => {
            if (logErr) {
                console.error('Error logging user login:', logErr);
            }
        });

        res.json({ message: 'Logged in' });
    });
}

module.exports = Logowanie;