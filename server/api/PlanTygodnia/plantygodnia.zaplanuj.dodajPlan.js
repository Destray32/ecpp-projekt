function DodajZaplanuj(req, res, db) {
    const { dataOd, dataDo, pracownicy, grupa, opis } = req.body;

    if (!dataOd || !dataDo || !pracownicy || !grupa) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    function getWeekOfYear(date) {
        const startDate = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    }

    const startDate = new Date(dataOd);
    const weekOfYear = getWeekOfYear(startDate);
    const year = startDate.getFullYear();

    const formattedDataOd = startDate.toISOString().split('T')[0];
    const formattedDataDo = new Date(dataDo).toISOString().split('T')[0];


    const sql = 'INSERT INTO Plan_Tygodnia_V (data_od, data_do, tydzienRoku, Rok, Pracownik_idPracownik, Grupa_urlopowa_idGrupa_urlopowa, opis) VALUES ?';
    const values = pracownicy.map(pracownik => [formattedDataOd, formattedDataDo, weekOfYear, year, pracownik, grupa, opis]);

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error('Error adding plan:', err);
            return res.status(500).json({ status: 'error', message: 'Error adding plan' });
        }
        res.json({ status: 'success', message: 'Plan został zaplanowany' });
    });
}

module.exports = DodajZaplanuj;