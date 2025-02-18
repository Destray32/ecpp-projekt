function generujRaport(req, res, db) {

    const sql = `SELECT
                      STR_TO_DATE(
                        CONCAT(t.Rok, ' ', t.tydzienRoku, ' ', 
                          CASE d.Dzien_tygodnia
                            WHEN 'Poniedziałek' THEN 1
                            WHEN 'Wtorek' THEN 2
                            WHEN 'Środa' THEN 3
                            WHEN 'Czwartek' THEN 4
                            WHEN 'Piątek' THEN 5
                            WHEN 'Sobota' THEN 6
                            WHEN 'Niedziela' THEN 0
                          END
                        ), '%x%v %w'
                      ) AS Data,
                      t.Rok AS Rok,
                      t.tydzienRoku AS TydzienRoku,
                      d.Dzien_tygodnia AS DzienTygodnia,
                      CASE d.Dzien_tygodnia
                          WHEN 'Poniedziałek' THEN 1
                          WHEN 'Wtorek' THEN 2
                          WHEN 'Środa' THEN 3
                          WHEN 'Czwartek' THEN 4
                          WHEN 'Piątek' THEN 5
                          WHEN 'Sobota' THEN 6
                          WHEN 'Niedziela' THEN 0
                      END AS NumericDay,
                      CONCAT(do.Imie, ' ', do.Nazwisko) AS Pracownik,
                      p.idPracownik AS PracownikID,
                      pr.idProjekty AS ProjektID,
                      pr.NazwaKod_Projektu AS Projekt,
                      dp.Godziny_przepracowane AS GodzinyPrzepracowane,
                      dp.Komentarz AS Komentarz,
                      dp.Kilometry AS Kilometry,
                      dp.Parking as Parking,
                      dp.Diety as Diety,
                      dp.Inne_koszty as Inne_koszty
                  FROM
                      Dzien_Projekty dp
                  JOIN
                      Dzien d ON dp.Dzien_idDzien = d.idDzien
                  JOIN
                      Tydzien t ON d.Tydzien_idTydzien = t.idTydzien
                  JOIN
                      Pracownik p ON t.Pracownik_idPracownik = p.idPracownik
                  JOIN
                      Dane_osobowe do ON p.FK_Dane_osobowe = do.idDane_osobowe
                  LEFT JOIN
                      Pojazdy pj ON dp.Pojazdy_idPojazdy = pj.idPojazdy
                  JOIN
                      Projekty pr ON dp.Projekty_idProjekty = pr.idProjekty
                  WHERE
                      dp.Godziny_przepracowane > 0;`;

    db.query(sql, (err, result) => {
        if (err) {
            console.log('SQL Error:', err);
            res.status(400).send('Błąd generowania raportu');
        } else {
            const formattedResults = result.map(record => {
                return {
                    ...record,
                    Data: convertToPolishTime(record.Data)
                };
            });
            res.status(200).send({ raport: formattedResults });
        }
    });
}


function convertToPolishTime(utcDate) {
    const date = new Date(utcDate); 

    const options = {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    };


    return new Intl.DateTimeFormat('pl-PL', options).format(date);
}

module.exports = generujRaport;
