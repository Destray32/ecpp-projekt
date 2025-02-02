const db = require('../../../server');

function PobierzArchiwum(req, res) {
    const selectedOption = req.params.selectedOption;

    const tableMap = {
        'Pracownicy': 'pracownik',
        'Firmy': 'firma',
        'Projekty': 'projekty',
        'Pojazdy': 'pojazdy',
        'Grupy Urlopowe': 'grupa_urlopowa'
    };

    const tableName = tableMap[selectedOption];

    if (!tableName) {
        return res.status(404).json({ message: 'Option not found' });
    }

    let query;
    if (tableName === 'pracownik') {
        query = `
            SELECT p.*, d.Imie, d.Nazwisko
            FROM pracownik p
            JOIN dane_osobowe d ON p.FK_Dane_osobowe = d.idDane_osobowe
            WHERE p.Archiwum = 1
        `;
    } else {
        query = `SELECT * FROM ${tableName} WHERE Archiwum = 1`;
    }

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error in query:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        console.log('Archiwum:', result);
        res.json(result);
    });
}

module.exports = PobierzArchiwum;