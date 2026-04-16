module.exports = (req, res, db) => {
    const projektId = req.params.id;

    if (!projektId) {
        return res.status(400).json({ error: 'Brak ID projektu' });
    }

    const query = `SELECT
        id,
        ProjektID,
        NazwaFaktury,
        Data,
        Koszty,
        Opis
      FROM projekt_materialy
      WHERE ProjektID = ?
      ORDER BY Data DESC, id DESC`;

    db.query(query, [projektId], (err, result) => {
        if (err) {
            console.error('Błąd pobierania materiałów:', err);
            return res.status(500).json({
                error: 'Nie udało się pobrać materiałów',
                details: err.message,
            });
        }

        res.json({
            success: true,
            materialy: result || [],
        });
    });
};
