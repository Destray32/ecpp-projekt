function AktualizujM1_5(req, res, db) {
    const { employeeId } = req.params;
    const { M1_5 } = req.body;

    const query = `
        UPDATE informacje_o_firmie 
        JOIN pracownik ON pracownik.FK_Informacje_o_firmie = informacje_o_firmie.idInformacje_o_firmie
        SET informacje_o_firmie.m = ?
        WHERE pracownik.idPracownik = ?`;

    db.query(query, [M1_5, employeeId], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Błąd serwera');
        } else {
            res.status(200).send('Zaktualizowano M1_5');
        }
    });
}

module.exports = AktualizujM1_5;
