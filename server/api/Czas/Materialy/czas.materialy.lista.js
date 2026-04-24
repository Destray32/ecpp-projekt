module.exports = (req, res, db) => {
    const query = `SELECT
        pm.id,
        pm.ProjektID,
        pm.NazwaFaktury,
        DATE_FORMAT(pm.Data, '%Y-%m-%d') AS Data,
        pm.Koszty,
        pm.Opis,
        pr.NazwaKod_Projektu AS Projekt,
        gr.Zleceniodawca
      FROM projekt_materialy pm
      JOIN Projekty pr ON pm.ProjektID = pr.idProjekty
      JOIN Grupa_urlopowa gr ON pr.Grupa_urlopowa_idGrupa_urlopowa = gr.idGrupa_urlopowa
      ORDER BY pm.Data DESC, pm.id DESC`;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Blad pobierania listy materialow:', err);
            return res.status(500).json({
                error: 'Nie udalo sie pobrac listy materialow',
                details: err.message,
            });
        }

        res.json({
            success: true,
            materialy: result || [],
        });
    });
};
