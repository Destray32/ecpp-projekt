function PlanTygodniaPlan(req, res, db) {
    const { group, weekNumber} = req.query;
    console.log(weekNumber);

    let sql = `
        SELECT
            p.idPracownik as id,
            d.Imie as name,
            d.Nazwisko as surname,
            g.Zleceniodawca AS vacationGroup,
            i.M AS M1_5,
            i.Opis as description
        FROM
            pracownik p
        JOIN
            dane_osobowe d ON p.FK_Dane_osobowe = d.idDane_osobowe
        JOIN
            informacje_o_firmie i ON p.FK_Informacje_o_firmie = i.idInformacje_o_firmie
        JOIN
            grupa_urlopowa g ON i.FK_idGrupa_urlopowa = g.idGrupa_urlopowa
        WHERE
            i.Plan_TygodniaV = 1
    `;

    let sql2 = `
        SELECT
        plan.Pracownik_idPracownik as idPracownik,
        

        `

    if (group) {
        sql += ` AND g.Zleceniodawca = ?`;
    }

    db.query(sql, group ? [group] : [], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'An error occurred while fetching data.' });
            return;
        }
        res.json(results);
    });
}

module.exports = PlanTygodniaPlan;