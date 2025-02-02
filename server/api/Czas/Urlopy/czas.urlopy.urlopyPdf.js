function urlopyPdf(req, res, db) {
    const { Zleceniodawca } = req.body;
    const sql = `
        SELECT
    u.idUrlopy, 
    do.Imie,
    do.Nazwisko,
    gu.Zleceniodawca,
    u.Urlop_od,
    u.Urlop_do,
    u.Status,
    u.FK_idPracownik
    FROM 
        Pracownik p
    JOIN 
        Dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
    JOIN 
        Informacje_o_firmie io ON p.FK_Informacje_o_firmie = io.idInformacje_o_firmie
    JOIN 
        Firma f ON io.FK_idFirma = f.idFirma
    JOIN 
        Grupa_urlopowa gu ON io.FK_idGrupa_urlopowa = gu.idGrupa_urlopowa
    JOIN 
        Urlopy u ON p.idPracownik = u.FK_idPracownik
    WHERE
        gu.Zleceniodawca IN (?) AND io.Drukowac_Urlop = 1
    ORDER BY 
    do.Nazwisko, do.Imie;
    `;

    db.query(sql, [Zleceniodawca], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Błąd podczas pobierania danych urlopów' });
        } else {
            const data = result.map(row => ({
                idUrlopy: row.idUrlopy,
                Imie: row.Imie,
                Nazwisko: row.Nazwisko,
                Zleceniodawca: row.Zleceniodawca,
                Urlop_od: row.Urlop_od,
                Urlop_do: row.Urlop_do,
                Status: row.Status
            }));
            res.status(200).json(data);
        }
    });
}

module.exports = urlopyPdf;
