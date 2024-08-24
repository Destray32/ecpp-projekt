const db = require('../../../server');

function PrzeniesWpisPlan(req, res) {
    const { ids, groupId } = req.body;

    console.log('ids:', ids);

    if (!Array.isArray(ids) || typeof groupId !== 'number') {
        return res.status(400).send('Invalid input');
    }

    const idsList = ids.join(',');

    const query = `
        UPDATE informacje_o_firmie
        SET FK_idGrupa_urlopowa = ?
        WHERE idInformacje_o_firmie IN (${idsList})
    `;

    db.query(query, [groupId], (error, results) => {
        if (error) {
            console.error('Error updating records:', error);
            return res.status(500).send('Database update failed');
        }
        res.status(200).send('Records updated successfully');
    });
}

module.exports = PrzeniesWpisPlan;