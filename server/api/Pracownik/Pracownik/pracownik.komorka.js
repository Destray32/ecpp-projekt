const db = require('../../../server');

function KomorkaPracownika(req, res) {
    const { id } = req.params;
    const { field, value } = req.body;

    let columnName;

    if (field === 'Firma') {
        columnName = 'FK_idFirma';
    } else if (field === 'Grupa urlopowa') {
        columnName = 'FK_idGrupa_urlopowa';
    } else {
        return res.status(400).json({ message: 'Invalid field' });
    }

    const getInformacjeQuery = `SELECT FK_Informacje_o_firmie FROM pracownik WHERE idPracownik = ?`;

    db.query(getInformacjeQuery, [id], (error, results) => {
        if (error) {
            console.error('Query failed:', error);
            return res.status(500).json({ message: 'Query failed' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Pracownik not found' });
        }

        const idInformacje_o_firmie = results[0].FK_Informacje_o_firmie;

        const updateQuery = `UPDATE informacje_o_firmie SET ${columnName} = ? WHERE idInformacje_o_firmie = ?`;

        db.query(updateQuery, [value, idInformacje_o_firmie], (error, results) => {
            if (error) {
                console.error('Update failed:', error);
                return res.status(500).json({ message: 'Update failed' });
            }
            res.status(200).json({ message: 'Update successful' });
        });
    });
}

module.exports = KomorkaPracownika;