const db = require('../../server');
const jwt = require('jsonwebtoken');

function GetImie(req, res) {
    const token = req.cookies.token;

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userId = decoded.id;

        const query = `
            SELECT 
                dane_osobowe.Imie AS name,
                dane_osobowe.Nazwisko AS surename,
                pracownik.Typ_konta AS accountType
            FROM pracownik
            JOIN dane_osobowe ON dane_osobowe.idDane_osobowe = pracownik.FK_Dane_osobowe
            WHERE pracownik.idPracownik = ?
        `;

        db.query(query, [userId], (error, results) => {
            if (error) {
                console.error('Error fetching user data:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            res.json(results[0]);
        });
    });
}

module.exports = GetImie;