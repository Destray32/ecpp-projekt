function DodajPojazd(req, res, db) {
    const { numerRejestracyjny, marka, uwagi } = req.body;

    const sql = `INSERT INTO 
    pojazdy 
    (Nr_rejestracyjny, Marka, Uwagi) VALUES 
    ('${numerRejestracyjny}', '${marka}', '${uwagi}')`;

    db.query(sql, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send('Pojazd o podanym numerze rejestracyjnym już istnieje');
            }
            console.log(err); 
            return res.status(500).send('Błąd dodawania pojazdu');
        }
        res.status(200).send('Dodano pojazd');
    });
}

module.exports = DodajPojazd;
