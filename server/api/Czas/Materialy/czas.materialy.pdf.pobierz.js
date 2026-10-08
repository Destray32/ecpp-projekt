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

const fetchPublicDriveFile = async (driveId) => {
    const urls = [
        `https://drive.usercontent.google.com/download?id=${driveId}&export=download`,
        `https://drive.google.com/uc?export=download&id=${driveId}`,
        `https://docs.google.com/uc?export=download&id=${driveId}`,
    ];

    for (const url of urls) {
        try {
            const resp = await fetch(url, { redirect: 'follow' });
            if (resp.ok) {
                const arrayBuffer = await resp.arrayBuffer();
                if (arrayBuffer.byteLength > 100) {
                    return Buffer.from(arrayBuffer);
                }
            }
        } catch (e) {
            // try next URL
        }
    }
    return null;
};

module.exports = (db) => async (req, res) => {
    const driveId = req.params.driveId;

    if (!driveId) {
        return res.status(400).json({ error: 'Brak ID pliku z Google Drive' });
    }

    // 1. Try OAuth Google Drive API
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
        console.warn('OAuth Google Drive pobieranie nie powiodło się, próba pobrania bezpośredniego:', error.message);
    }

    // 2. Fallback to direct public Google Drive stream
    try {
        const publicBuffer = await fetchPublicDriveFile(driveId);
        if (publicBuffer) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.send(publicBuffer);
        }
    } catch (fallbackErr) {
        console.error('Błąd pobierania publicznego PDF z Google Drive:', fallbackErr);
    }

    return res.status(500).json({
        error: 'Nie udało się pobrać pliku PDF z Google Drive',
    });
};
