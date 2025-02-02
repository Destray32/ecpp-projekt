function GetTydzien(req, res, db) {
    const { numericWeek } = req.params;

    const sqlPracownicy = `SELECT t.tydzienRoku,
    p.idPracownik,
    t.Pracownik_idPracownik,
    do.Imie, 
    do.Nazwisko, 
    gu.Zleceniodawca, 
    t.Status_tygodnia 
    FROM pracownik p JOIN Dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
    JOIN Informacje_o_firmie iof ON p.FK_Informacje_o_firmie = iof.idInformacje_o_firmie
    LEFT JOIN Grupa_urlopowa gu ON iof.FK_idGrupa_urlopowa = gu.idGrupa_urlopowa
    JOIN tydzien t ON p.idPracownik = t.Pracownik_idPracownik
    WHERE t.tydzienRoku = ? AND p.Archiwum = 0;`;
    db.query(sqlPracownicy, [numericWeek], (err, result) => {
        if (err) {
            console.log(err);
            res.status(400).send('Błąd pobierania danych');
        }
        else {
            res.status(200).send(result);
        }
    });
}

module.exports = GetTydzien;