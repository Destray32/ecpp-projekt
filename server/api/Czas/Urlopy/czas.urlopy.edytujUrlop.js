function convertDateFormat(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}

function EdytujUrlop(req, res, db) {
    const { urlopOd, urlopDo, status, komentarz } = req.body;
    const { vacationId } = req.params;

    const formattedUrlopOd = convertDateFormat(urlopOd);
    const formattedUrlopDo = convertDateFormat(urlopDo);

    const query = `UPDATE urlopy SET Urlop_od = ?, Urlop_do = ?, Status = ?, Komentarz = ? WHERE idUrlopy = ?`;
    const values = [formattedUrlopOd, formattedUrlopDo, status, komentarz, vacationId];

    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            res.status(400).send('Nie udało się edytować urlopu');
        } else {
            res.status(200).send('Urlop został zedytowany');
        }
    });
}

module.exports = EdytujUrlop;
