const db = require('../server.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function Logowanie(req, res) {
    const { firma, login, password } = req.body;
    
    // First, ensure the response headers are set correctly
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
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
        
        const token = jwt.sign(
            { id: user.idPracownik, role: user.Typ_konta },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set cookie with domain and path
        res.setHeader('Set-Cookie', [
            `token=${token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`
        ]);
        
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