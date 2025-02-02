const db = require('../../../server');

function PrzeniesWpisPlan(req, res) {
    const { ids, groupId } = req.body;


    if (!Array.isArray(ids) || typeof groupId !== 'number') {
        return res.status(400).send('Invalid input');
    }

    const idsList = ids.join(',');

    const query = `
        UPDATE Plan_Tygodnia_V
        SET Grupa_urlopowa_idGrupa_urlopowa = ?
        WHERE idPlan_Tygodnia_V IN (${idsList})
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