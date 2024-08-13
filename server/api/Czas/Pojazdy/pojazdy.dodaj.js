function DodajPojazd(req, res, db) {
    const { numerRejestracyjny, marka, uwagi } = req.body;

    const sql = `INSERT INTO 
    pojazdy 
    (Nr_Pojazdu, Nr_rejestracyjny, Marka, Uwagi) VALUES 
    (3, '${numerRejestracyjny}', '${marka}', '${uwagi}')`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.status(400).send('Błąd dodawania pojazdu');
        } else {
            res.status(200).send('Dodano pojazd');
        }
    });
}

module.exports = DodajPojazd;