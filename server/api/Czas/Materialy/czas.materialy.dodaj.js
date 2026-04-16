module.exports = (req, res, db) => {
    const projektId = req.params.id;
    const { nazwafaktury, data, koszty, opis } = req.body;

    if (!projektId || !nazwafaktury || !data || koszty === undefined) {
        return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    const checkQuery = `SELECT id FROM projekt_materialy WHERE ProjektID = ? ORDER BY DataDodania ASC, id ASC LIMIT 1`;

    db.query(checkQuery, [projektId], (checkErr, checkResult) => {
        if (checkErr) {
            console.error('Błąd sprawdzania faktury materiałowej:', checkErr);
            return res.status(500).json({
                error: 'Nie udało się zapisać faktury',
                details: checkErr.message,
            });
        }

        const existing = Array.isArray(checkResult) && checkResult.length > 0 ? checkResult[0] : null;

        if (existing) {
            const updateQuery = `UPDATE projekt_materialy
              SET NazwaFaktury = ?, Data = ?, Koszty = ?, Opis = ?
              WHERE id = ?`;

            db.query(updateQuery, [nazwafaktury, data, parseFloat(koszty), opis || null, existing.id], (updateErr) => {
                if (updateErr) {
                    console.error('Błąd aktualizacji faktury materiałowej:', updateErr);
                    return res.status(500).json({
                        error: 'Nie udało się zapisać faktury',
                        details: updateErr.message,
                    });
                }

                res.json({
                    success: true,
                    id: existing.id,
                    message: 'Faktura zaktualizowana pomyślnie',
                });
            });

            return;
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
    });
};
