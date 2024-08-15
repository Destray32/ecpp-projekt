function ZatwierdzUrlop(req, res, db) {
    const { ids, status } = req.body;
    console.log(ids, status);
    
    if (!ids || !status) {
        return res.status(400).send('IDs and status are required');
    }

    const placeholders = ids.map(() => '?').join(', ');
    const updateStatusQuery = `
        UPDATE Urlopy 
        SET Status = ? 
        WHERE idUrlopy IN (${placeholders})`;

    db.query(updateStatusQuery, [status, ...ids], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error updating status');
        }

        res.status(200).send('Status updated successfully');
    });
}

module.exports = ZatwierdzUrlop;
