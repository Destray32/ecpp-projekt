const db = require('../../server');
const jwt = require('jsonwebtoken');

function PobierzOgloszenia(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send('Unauthorized');
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).send('Unauthorized');
    }
    
    const idPracownik = decoded.id;

    const checkRoleQuery = 'SELECT Typ_konta FROM pracownik WHERE idPracownik = ?';
    
    db.query(checkRoleQuery, [idPracownik], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Internal server error');
        }

        if (result.length === 0) {
            return res.status(404).send('User not found');
        }

        const isAdministrator = result[0].Typ_konta === 'Administrator';

        let query;
        let queryParams = [];

        // zrobilem 2 querry bo nie wiedzialem czy robic rozroznianie admina po froncie czy backendzie
        // ale tak powinno byc prosciej xd

        if (isAdministrator) {
            query = `
                SELECT 
                    o.idOgloszenia AS id,
                    o.Tytul AS tytul,
                    o.Wiadomosc AS tresc,
                    o.Grupa_urlopowa_idGrupa_urlopowa AS grupa_id,
                    GROUP_CONCAT(DISTINCT do.Imie, ' ', do.Nazwisko) AS pracownicy,
                    g.Zleceniodawca AS grupa_nazwa,
                    0 AS przeczytane
                FROM ogloszenia o
                LEFT JOIN pracownik_has_ogloszenia ph ON o.idOgloszenia = ph.Ogloszenia_idOgloszenia
                LEFT JOIN pracownik p ON ph.Pracownik_idPracownik = p.idPracownik
                LEFT JOIN dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
                LEFT JOIN grupa_urlopowa g ON o.Grupa_urlopowa_idGrupa_urlopowa = g.idGrupa_urlopowa
                GROUP BY o.idOgloszenia;
            `;
        } else {
            query = `
                SELECT 
                    o.idOgloszenia AS id,
                    o.Tytul AS tytul,
                    o.Wiadomosc AS tresc,
                    o.Grupa_urlopowa_idGrupa_urlopowa AS grupa_id,
                    GROUP_CONCAT(DISTINCT do.Imie, ' ', do.Nazwisko) AS pracownicy,
                    g.Zleceniodawca AS grupa_nazwa,
                    ph.Przeczytane AS przeczytane
                FROM ogloszenia o
                LEFT JOIN pracownik_has_ogloszenia ph ON o.idOgloszenia = ph.Ogloszenia_idOgloszenia
                LEFT JOIN pracownik p ON ph.Pracownik_idPracownik = p.idPracownik
                LEFT JOIN dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
                LEFT JOIN grupa_urlopowa g ON o.Grupa_urlopowa_idGrupa_urlopowa = g.idGrupa_urlopowa
                WHERE ph.Pracownik_idPracownik = ?
                GROUP BY o.idOgloszenia;
            `;
            queryParams = [idPracownik];
        }

        db.query(query, queryParams, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Internal server error');
                return;
            }

            const formattedResult = result.map(row => ({
                idOgloszenia: row.id,
                Tytul: row.tytul,
                Wiadomosc: row.tresc,
                Grupa_urlopowa_idGrupa_urlopowa: row.grupa_id,
                Pracownik_idPracownik: row.pracownicy ? row.pracownicy.split(', ') : [],
                Zleceniodawca: row.grupa_nazwa || 'Brak grupy',
                Przeczytane: row.przeczytane === 1
            }));

            res.send(formattedResult);
        });
    });
}

module.exports = PobierzOgloszenia;