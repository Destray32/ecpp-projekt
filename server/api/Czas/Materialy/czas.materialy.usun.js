module.exports = (req, res, db) => {
    const projektId = req.params.id;
    const materialId = req.params.materialId;

    if (!projektId || !materialId) {
        return res.status(400).json({ error: 'Brak ID' });
    }

    const checkQuery = 'SELECT id FROM projekt_materialy WHERE id = ? AND ProjektID = ?';
    db.query(checkQuery, [materialId, projektId], (checkErr, checkResult) => {
        if (checkErr) {
            console.error('Błąd sprawdzania materiału:', checkErr);
            return res.status(500).json({
                error: 'Nie udało się usunąć materiału',
                details: checkErr.message,
            });
        }

        if (!checkResult || checkResult.length === 0) {
            return res.status(404).json({ error: 'Materiał nie znaleziony' });
        }

        const deleteQuery = 'DELETE FROM projekt_materialy WHERE id = ? AND ProjektID = ?';
        db.query(deleteQuery, [materialId, projektId], (deleteErr) => {
            if (deleteErr) {
                console.error('Błąd usuwania materiału:', deleteErr);
                return res.status(500).json({
                    error: 'Nie udało się usunąć materiału',
                    details: deleteErr.message,
                });
            }

            res.json({
                success: true,
                message: 'Materiał usunięty pomyślnie',
            });
        });
    });
};
