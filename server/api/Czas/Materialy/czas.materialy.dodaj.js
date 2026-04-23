module.exports = (req, res, db) => {
    const projektId = req.params.id;
    const { materialId, nazwafaktury, data, koszty, opis } = req.body;

    if (!projektId || !nazwafaktury || !data || koszty === undefined) {
        return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    if (materialId) {
        const checkQuery = 'SELECT id FROM projekt_materialy WHERE id = ? AND ProjektID = ?';

        return db.query(checkQuery, [materialId, projektId], (checkErr, checkResult) => {
            if (checkErr) {
                console.error('Błąd sprawdzania faktury materiałowej:', checkErr);
                return res.status(500).json({
                    error: 'Nie udało się zapisać faktury',
                    details: checkErr.message,
                });
            }

            if (!checkResult || checkResult.length === 0) {
                return res.status(404).json({ error: 'Faktura nie znaleziona' });
            }

            const updateQuery = `UPDATE projekt_materialy
              SET NazwaFaktury = ?, Data = ?, Koszty = ?, Opis = ?
              WHERE id = ? AND ProjektID = ?`;

            db.query(updateQuery, [nazwafaktury, data, parseFloat(koszty), opis || null, materialId, projektId], (updateErr) => {
                if (updateErr) {
                    console.error('Błąd edycji faktury materiałowej:', updateErr);
                    return res.status(500).json({
                        error: 'Nie udało się zapisać faktury',
                        details: updateErr.message,
                    });
                }

                res.json({
                    success: true,
                    id: Number(materialId),
                    message: 'Faktura zaktualizowana pomyślnie',
                });
            });
        });
    }

    const insertQuery = `INSERT INTO projekt_materialy (ProjektID, NazwaFaktury, Data, Koszty, Opis)
      VALUES (?, ?, ?, ?, ?)`;

    db.query(insertQuery, [projektId, nazwafaktury, data, parseFloat(koszty), opis || null], (insertErr, insertResult) => {
        if (insertErr) {
            console.error('Błąd dodawania faktury materiałowej:', insertErr);
            return res.status(500).json({
                error: 'Nie udało się zapisać faktury',
                details: insertErr.message,
            });
        }

        res.json({
            success: true,
            id: insertResult.insertId,
            message: 'Faktura zapisana pomyślnie',
        });
    });
};
