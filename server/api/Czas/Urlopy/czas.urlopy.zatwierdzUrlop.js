function ZatwierdzUrlop(req, res, db) {
    let { ids, status } = req.body;
    
    if (!Array.isArray(ids)) {
        if (typeof ids === 'string') {
            ids = ids.split(',').map(id => id.trim());
        } else {
            return res.status(400).send('IDs must be an array or a comma-separated string');
        }
    }

    if (!ids.length || !status) {
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
