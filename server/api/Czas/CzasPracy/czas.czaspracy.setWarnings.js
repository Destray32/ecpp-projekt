async function setWarnings(req, res, db) {
    const userId = req.body.id;
    const weeklyHours = req.body.weeklyHours;

    const promisePool = db.promise();

    try {
        if (weeklyHours > 60) {
            // pobranie ilosci warningow z ostatnich 6 miesiecy
            const [warningResults] = await promisePool.query(
                `SELECT COUNT(*) as count
                FROM Pracownik_ostrzezenia
                WHERE Pracownik_idPracownik = ?
                AND data_ostrzezenia >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)`,
                [userId]
            );
            console.log('Warning count query results:', warningResults);

            // dodanie warningu do bazy
            const [insertResults] = await promisePool.query(
                `INSERT INTO Pracownik_ostrzezenia (Pracownik_idPracownik, godziny_tygodniowe, data_ostrzezenia)
                VALUES (?, ?, CURRENT_DATE)`,
                [userId, weeklyHours]
            );
            console.log('Insert warning query results:', insertResults);

            const warningCount = warningResults[0].count;

            if (warningCount >= 1) {
                // zablokowanie konta
                const [updateResults] = await promisePool.query(
                    `UPDATE Pracownik_ostrzezenia
                    SET czy_zablokowany = 1
                    WHERE Pracownik_idPracownik = ?`,
                    [userId]
                );
                console.log('Update blocked status query results:', updateResults);

                return res.status(403).json({
                    message: 'Konto zablokowane, Skontaktuj się z administratorem'
                });
            }

            return res.status(400).json({
                message: 'Przekroczono limit 60 godzin. To twoje pierwsze ostrzeżenie'
            });
        } else {
            return res.status(200).json({
                message: 'Brak ostrzeżeń'
            });
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = setWarnings;