const db = require('../../../server');

function PobierzCennik(req, res) {
    const query = `
        SELECT 
            p.idPracownik,
            CONCAT(do.Imie, ' ', do.Nazwisko) AS pracownik_nazwa,
            gu.idGrupa_urlopowa,
            gu.Zleceniodawca,
            ps.stawka_indywidualna,
            gu.Cennik AS stawka_globalna,
            COALESCE(
                CASE WHEN ps.aktywna = 1 THEN ps.stawka_indywidualna END,
                gu.Cennik
            ) AS stawka_obowiazujaca
        FROM 
            pracownik p
        JOIN 
            dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
        CROSS JOIN 
            grupa_urlopowa gu
        LEFT JOIN 
            pracownik_stawki ps ON p.idPracownik = ps.FK_idPracownik 
                AND gu.idGrupa_urlopowa = ps.FK_idGrupa_urlopowa
                AND ps.aktywna = 1
        WHERE 
            p.Archiwum = 0 
            AND gu.Archiwum = 0
            AND do.Nazwisko != 'Wachala'
        ORDER BY 
            do.Nazwisko, do.Imie, gu.Zleceniodawca
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Błąd pobierania danych cennika:', err);
            return res.status(500).json({ error: 'Błąd pobierania danych cennika' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Brak danych cennika' });
        }
       
        res.json(results);
    });

}

module.exports = PobierzCennik;
