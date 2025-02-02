function PobierzLogi(req, res, db) {
    const query = `
        SELECT 
            logi.idLogi, 
            logi.Data, 
            logi.Komentarz, 
            dane_osobowe.Imie AS imie_pracownika, 
            dane_osobowe.Nazwisko AS nazwisko_pracownika
        FROM 
            logi
        JOIN 
            pracownik ON logi.FK_idPracownik = pracownik.idPracownik
        JOIN 
            dane_osobowe ON pracownik.FK_Dane_osobowe = dane_osobowe.idDane_osobowe
        ORDER BY 
            logi.Data DESC;
    `;

    db.query(query, (err, rows) => {
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