
function PobierzLogi(req, res, db) {
    db.query('SELECT * FROM logi ORDER BY Data DESC', (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).send('Błąd serwera');
        } else if (rows.length === 0) {
            res.status(404).send('Brak danych');
        } else {
            const formattedRows = rows.map(row => {
                const date = new Date(row.Data);
                const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
                return {
                    idLogi: row.idLogi,
                    name: row.imie_pracownika,
                    surname: row.nazwisko_pracownika,
                    date: `${formattedDate} ${formattedTime}`,
                    komentarz: row.Komentarz
                };
            });
            res.status(200).send(formattedRows);
        }
    });
}

module.exports = PobierzLogi;