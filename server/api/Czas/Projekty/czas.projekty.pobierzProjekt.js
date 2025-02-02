function PobierzProjekt (req, res, db) {
    const idProjekty = req.params.id;

    const query = `SELECT p.*, gu.Zleceniodawca, f.Nazwa_firmy as Firma FROM projekty p JOIN grupa_urlopowa gu ON p.Grupa_urlopowa_idGrupa_urlopowa = gu.idGrupa_urlopowa JOIN firma f ON p.Firma_idFirma = f.idFirma WHERE p.idProjekty = ?;`;

    db.query(query, [idProjekty], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else {
            res.status(200).send(result);
        }
    }
    );
}

module.exports = PobierzProjekt;