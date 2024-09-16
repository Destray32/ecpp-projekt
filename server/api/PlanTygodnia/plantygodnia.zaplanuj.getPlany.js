const { format } = require('date-fns');

function GetPlany(req, res, db) {
    const { from, to } = req.query;

    let sql = `SELECT
        p.idPlan_Tygodnia_V AS id,
        prac.idPracownik AS pracownikId,
        p.data_od,
        p.data_do,
        p.Opis,
        dane.imie,
        dane.nazwisko,
        grupa.Zleceniodawca,
        pojazd.idPojazdy AS pojazdId,
        pojazd.Nr_rejestracyjny AS pojazd
    FROM Plan_Tygodnia_V p
    LEFT JOIN Pracownik prac ON p.Pracownik_idPracownik = prac.idPracownik
    LEFT JOIN Dane_osobowe dane ON prac.FK_Dane_osobowe = dane.idDane_osobowe
    LEFT JOIN Grupa_urlopowa grupa ON p.Grupa_urlopowa_idGrupa_urlopowa = grupa.idGrupa_urlopowa
    LEFT JOIN Pojazdy pojazd ON p.Pojazdy_idPojazdy = pojazd.idPojazdy
    `;

    const sqlParts = [];
    const values = [];

    if (from && to) {
        sqlParts.push('WHERE p.data_od >= ? AND p.data_do <= ?');
        values.push(from, to);
    }

    sql += ' ' + sqlParts.join(' ');

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error fetching plans:', err);
            res.status(500).send('Error fetching plans');
            return;
        }

        const formattedResult = result.map(row => ({
            ...row,
            id: row.id,
            data_od: format(new Date(row.data_od), 'yyyy-MM-dd'),
            data_do: format(new Date(row.data_do), 'yyyy-MM-dd')
        }));

        res.json(formattedResult);
    });
}

module.exports = GetPlany;