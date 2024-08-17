const db = require('../../server');

function PobierzOgloszenia(req, res) {
    const query = `
        SELECT 
            o.idOgloszenia AS id,
            o.Tytul AS tytul,
            o.Wiadomosc AS tresc,
            o.Grupa_urlopowa_idGrupa_urlopowa AS grupa_id,
            GROUP_CONCAT(DISTINCT p.Nazwa_uzytkownika SEPARATOR ', ') AS pracownicy,
            g.Zleceniodawca AS grupa_nazwa
        FROM ogloszenia o
        LEFT JOIN pracownik_has_ogloszenia ph ON o.idOgloszenia = ph.Ogloszenia_idOgloszenia
        LEFT JOIN pracownik p ON ph.Pracownik_idPracownik = p.idPracownik
        LEFT JOIN grupa_urlopowa g ON o.Grupa_urlopowa_idGrupa_urlopowa = g.idGrupa_urlopowa
        GROUP BY o.idOgloszenia;
    `;

    db.query(query, (err, result) => {
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
            Zleceniodawca: row.grupa_nazwa || 'Brak grupy'
        }));

        res.send(formattedResult);
    });
}

module.exports = PobierzOgloszenia;