const db = require('../../../server');

function ListaPracownikow(req, res) {
    const query = `
        SELECT 
            p.idPracownik AS id,
            do.Imie AS name,
            do.Nazwisko AS surname,
            do.Pesel AS pesel,
            iof.FK_idGrupa_urlopowa AS vacationGroup,
            f.Nazwa_firmy AS company,
            do.TelefonPolska AS phone1,
            do.TelefonSzwecja AS phone2,
            iof.Plan_TygodniaV as weeklyPlan,
            do.Email AS email,
            (SELECT CONCAT(do2.Imie, ' ', do2.Nazwisko) 
            FROM dane_osobowe do2 
            JOIN pracownik p2 ON p2.FK_Dane_osobowe = do2.idDane_osobowe
            WHERE p2.idPracownik = (SELECT MIN(idPracownik) FROM pracownik WHERE FK_Informacje_o_firmie = iof.idInformacje_o_firmie)) AS manager
        FROM 
            pracownik p
        JOIN 
            dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
        JOIN 
            informacje_o_firmie iof ON p.FK_Informacje_o_firmie = iof.idInformacje_o_firmie
        JOIN 
            Firma f ON iof.FK_idFirma = f.idFirma
        LEFT JOIN 
            grupa_urlopowa gu ON iof.FK_idGrupa_urlopowa = gu.idGrupa_urlopowa
        WHERE
            p.Archiwum = 0;
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Błąd pobierania pracowników:', err);
            res.status(500).send('Błąd pobierania pracowników');
            return;
        }
        res.json(result);
    });
}

module.exports = ListaPracownikow;