module.exports = (req, res, db) => {
    const projektId = req.params.id;

    if (!projektId) {
        return res.status(400).json({ error: 'Brak ID projektu' });
    }

    const query = `SELECT
        id,
        ProjektID,
        NazwaFaktury,
                DATE_FORMAT(Data, '%Y-%m-%d') AS Data,
        Koszty,
                Opis,
                pdf_drive_id AS PdfDriveId,
                pdf_drive_name AS PdfDriveName,
                pdf_drive_link AS PdfDriveLink,
                pdf_mime AS PdfMime,
                pdf_size AS PdfSize,
                pdf_uploaded_at AS PdfUploadedAt
      FROM projekt_materialy
      WHERE ProjektID = ?
      ORDER BY Data DESC, id DESC`;

    db.query(query, [projektId], (err, result) => {
        if (err) {
            console.error('Błąd pobierania materiałów:', err);
            return res.status(500).json({
                error: 'Nie udało się pobrać materiałów',
                details: err.message,
            });
        }

        res.json({
            success: true,
            materialy: result || [],
        });
    });
};
