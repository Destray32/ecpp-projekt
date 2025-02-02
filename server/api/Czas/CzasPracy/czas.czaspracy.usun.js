
function UsunDodatkowyProject(req, res, db) {
    const id = req.params.id;

    // query może prawodpodobnie używać klauzuli IN do lepszego usuwania i czytelności
    // ale akutalnie usuwanie wykonuje 6 requestów prawdobodobnie
    const query = `
        DELETE FROM Dzien_Projekty
        WHERE idDzien_Projekty = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Błąd serwera' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Nie znaleziono projektu' });
        }

        return res.status(200).json({ message: 'Usunięto projekt' });
    });
}

module.exports = UsunDodatkowyProject;