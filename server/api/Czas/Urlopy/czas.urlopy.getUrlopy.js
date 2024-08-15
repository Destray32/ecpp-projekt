function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function GetUrlopy(req, res, db) {
    const sql = 'SELECT * FROM Urlopy';

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
            }));

            return res.status(200).json({ urlopy: formattedRows });
        }
    });
}

module.exports = GetUrlopy;
