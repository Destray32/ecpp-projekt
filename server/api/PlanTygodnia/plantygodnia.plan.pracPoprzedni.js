function PracownicyPoprzedniTydz(req, res, db) {
    const planData = req.body;

    if (!Array.isArray(planData) || planData.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Invalid data format' });
    }

    const values = planData.map(item => [
        item.data_od,
        item.data_do,
        item.tydzienRoku,
        new Date(item.data_od).getFullYear(),
        item.pracownikId,
        item.grupaId,
        item.Opis,
        item.pojazdId,
        item.m_value
    ]);

    const sql = `
        INSERT INTO Plan_Tygodnia_V (data_od, data_do, tydzienRoku, Rok, Pracownik_idPracownik, Grupa_urlopowa_idGrupa_urlopowa, opis, Pojazdy_idPojazdy, m_value)
        VALUES ?
    `;

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error('Database insertion error:', err);
            return res.status(500).json({ status: 'error', message: 'Database insertion error' });
        }
        res.status(200).json({ status: 'success', message: 'Data inserted successfully' });
    });
}

module.exports = PracownicyPoprzedniTydz;