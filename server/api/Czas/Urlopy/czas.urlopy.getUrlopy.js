function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function GetUrlopy(req, res, db) {
    const sql = `
        SELECT 
            u.idUrlopy, 
            u.Imie, 
            u.Nazwisko, 
            u.Urlop_od, 
            u.Urlop_do, 
            u.Komentarz, 
            u.Status,
            g.Zleceniodawca
        FROM Urlopy u
        JOIN Pracownik p ON u.FK_idPracownik = p.idPracownik
        JOIN Informacje_o_firmie i ON p.FK_Informacje_o_firmie = i.idInformacje_o_firmie
        JOIN Grupa_urlopowa g ON i.FK_idGrupa_urlopowa = g.idGrupa_urlopowa
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log('SQL Error:', err);
            return res.status(400).send('Błąd pobierania urlopów');
        } else {
            const formattedRows = result.map(row => ({
                id: row.idUrlopy,
                imie: row.Imie,
                nazwisko: row.Nazwisko,
                dataOd: formatDate(row.Urlop_od),
                dataDo: formatDate(row.Urlop_do), 
                komentarz: row.Komentarz,
                status: row.Status,
                zleceniodawca: row.Zleceniodawca
            }));

            return res.status(200).json({ urlopy: formattedRows });
        }
    });
}

module.exports = GetUrlopy;
