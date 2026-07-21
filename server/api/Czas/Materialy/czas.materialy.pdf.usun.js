const { google } = require('googleapis');
const {
    loadOAuthClient,
    loadOAuthToken,
    saveToken,
    handleOAuthError,
} = require('../../Drive/drive.oauth');

const buildDriveClient = () => {
    const token = loadOAuthToken();
    if (!token) {
        throw new Error('Brak tokenu OAuth. Wejdz na /api/drive/oauth/start');
    }

    const oauth2Client = loadOAuthClient(process.env.GOOGLE_DRIVE_REDIRECT_URI);
    oauth2Client.setCredentials(token);
    oauth2Client.on('tokens', (tokens) => {
        if (tokens.refresh_token || tokens.access_token) {
            const updated = { ...token, ...tokens };
            saveToken(updated);
        }
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
};

module.exports = (db) => async (req, res) => {
    const projektId = req.params.id;
    const materialId = req.params.materialId;

    if (!projektId || !materialId) {
        return res.status(400).json({ error: 'Brak ID projektu lub faktury' });
    }

    const selectQuery = 'SELECT pdf_drive_id FROM projekt_materialy WHERE id = ? AND ProjektID = ?';
    db.query(selectQuery, [materialId, projektId], async (selectErr, rows) => {
        if (selectErr) {
            console.error('Blad pobierania PDF:', selectErr);
            return res.status(500).json({
                error: 'Nie udalo sie pobrac danych PDF',
                details: selectErr.message,
            });
        }

        const driveId = rows && rows[0] ? rows[0].pdf_drive_id : null;

        try {
            if (driveId) {
                const drive = buildDriveClient();
                await drive.files.delete({ fileId: driveId });
            }

            const updateQuery = `UPDATE projekt_materialy
              SET pdf_drive_id = NULL,
                  pdf_drive_name = NULL,
                  pdf_drive_link = NULL,
                  pdf_mime = NULL,
                  pdf_size = NULL,
                  pdf_uploaded_at = NULL
              WHERE id = ? AND ProjektID = ?`;

            db.query(updateQuery, [materialId, projektId], (updateErr) => {
                if (updateErr) {
                    console.error('Blad czyszczenia PDF:', updateErr);
                    return res.status(500).json({
                        error: 'Nie udalo sie wyczyscic danych PDF',
                        details: updateErr.message,
                    });
                }

                return res.json({ success: true });
            });
        } catch (error) {
            console.error('Blad usuwania PDF z Drive:', error);
            if (handleOAuthError(error)) {
                return res.status(401).json({
                    error: 'Autoryzacja Google Drive wygasła lub jest niepoprawna. Zaloguj się ponownie przechodząc na /api/drive/oauth/start',
                    details: error.message,
                });
            }
            return res.status(500).json({
                error: 'Nie udalo sie usunac PDF z Google Drive',
                details: error.message,
            });
        }
    });
};
