function UsuwanieGrupy(req, res, db) {
    const id = req.params.id;

    console.log(`Attempting to delete group with ID: ${id}`);

    if (!id) {
        return res.status(400).json({ message: 'Brak identyfikatora grupy' });
    }

    const sql = `UPDATE grupa_urlopowa SET Archiwum = 1 WHERE idGrupa_urlopowa = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('SQL Error:', err);
            return res.status(500).json({ message: 'Błąd usuwania grupy' });
        }

        if (result.affectedRows === 0) {
            console.log(`No group found with ID: ${id}`);
            return res.status(404).json({ message: 'Grupa nie znaleziona' });
        }

        console.log(`Group with ID: ${id} deleted successfully`);
        res.status(200).json({ message: 'Grupa usunięta pomyślnie' });
    });
}

module.exports = UsuwanieGrupy;