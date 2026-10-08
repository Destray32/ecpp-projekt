const {
    loadOAuthClient,
    loadOAuthToken,
    saveToken,
    handleOAuthError,
} = require('../../Drive/drive.oauth');
const { google } = require('googleapis');

const buildDriveClient = () => {
    const token = loadOAuthToken();
    if (!token) {
        throw new Error('Brak tokenu OAuth. Wejdź na /api/drive/oauth/start');
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
    const driveId = req.params.driveId;

    if (!driveId) {
        return res.status(400).json({ error: 'Brak ID pliku z Google Drive' });
    }

    try {
        const drive = buildDriveClient();
        const response = await drive.files.get(
            { fileId: driveId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.send(Buffer.from(response.data));
    } catch (error) {
        console.error('Błąd pobierania treści PDF z Google Drive:', error);
        if (handleOAuthError(error)) {
            return res.status(401).json({
                error: 'Autoryzacja Google Drive wygasła lub jest niepoprawna.',
                details: error.message,
            });
        }
        return res.status(500).json({
            error: 'Nie udało się pobrać pliku PDF z Google Drive',
            details: error.message,
        });
    }
};
