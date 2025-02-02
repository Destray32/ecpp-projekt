const db = require('../server');
const jwt = require('jsonwebtoken');

function UzupelnoneDane(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userId = decoded.id;

        const query = `
            SELECT do.Imie, do.Nazwisko, do.Data_urodzenia, do.Pesel, do.Ulica_NrDomu, do.Kod_pocztowy, do.Miejscowosc, do.TelefonPolska, do.TelefonSzwecja, do.Email, do.Kontakt_w_razie_wypadku
            FROM dane_osobowe do
            JOIN pracownik p ON p.FK_Dane_osobowe = do.idDane_osobowe
            WHERE p.idPracownik = ?
        `;

        db.query(query, [userId], (err, result) => {
            if (err) {
                return res.status(500).send('Error querying database');
            }

            if (result.length === 0) {
                return res.status(404).send('User not found');
            }

            const personalData = result[0];

            const requiredFields = [
                'Imie', 'Nazwisko', 'Data_urodzenia', 'Pesel', 
                'Ulica_NrDomu', 'Kod_pocztowy', 'Miejscowosc', 
                'Email', 'Kontakt_w_razie_wypadku'
            ];

            const isDataComplete = requiredFields.every(field => personalData[field] && (typeof personalData[field] === 'string' ? personalData[field].trim() !== '' : true));

            if (!personalData.TelefonPolska && !personalData.TelefonSzwecja) {
                return res.json(false);
            }

            return res.json(isDataComplete);
        });
    });
}

module.exports = UzupelnoneDane;