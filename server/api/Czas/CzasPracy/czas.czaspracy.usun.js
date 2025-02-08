
function UsunDodatkowyProject(req, res, db) {
    const id = req.params.id;
    // query może prawodpodobnie używać klauzuli IN do lepszego usuwania i czytelności
    // ale akutalnie usuwanie wykonuje 6 requestów prawdobodobnie
    
    //jak jest undefined czyli ktos nie wpisał nic tylko przez przypadek dodal zły projekt i chce usunac traktuje jakby projekt juz byl usuniety
    if (!id || id === 'undefined' || isNaN(id)) {
        console.warn("Invalid ID received, skipping deletion.");
        return res.status(200).json({ message: 'Projekt już nie istnieje' });
    }
    
    
    const checkQuery = `SELECT * FROM Dzien_Projekty WHERE idDzien_Projekty = ?`;
    
    const query = `
        DELETE FROM Dzien_Projekty
        WHERE idDzien_Projekty = ?
    `;

    db.query(checkQuery, [id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: 'Błąd serwera' });
        }

        // jak projekt nie istnieje już to uznaje za sukces
        if (result.length === 0) {
            console.warn("Project ID not found, returning success.");
            return res.status(200).json({ message: 'Projekt już nie istnieje' });
        }

        // proces usuwania
        const deleteQuery = `DELETE FROM Dzien_Projekty WHERE idDzien_Projekty = ?`;

        db.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error("Delete error:", err);
                return res.status(500).json({ message: 'Błąd serwera' });
            }

            return res.status(200).json({ message: 'Usunięto projekt' });
        });
    });
}

module.exports = UsunDodatkowyProject;