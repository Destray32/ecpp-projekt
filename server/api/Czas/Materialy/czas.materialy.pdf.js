const path = require('path');
const stream = require('stream');
const multer = require('multer');
const { google } = require('googleapis');
const {
    loadOAuthClient,
    loadOAuthToken,
    saveToken,
} = require('../../Drive/drive.oauth');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
});

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1yAQbpRxHYapJtwzrD1hj65BoMA4gULtI';
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

const uploadPdfToDrive = async (drive, fileBuffer, fileName) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const response = await drive.files.create({
        requestBody: {
            name: fileName,
            parents: [DRIVE_FOLDER_ID],
            mimeType: 'application/pdf',
        },
        media: {
            mimeType: 'application/pdf',
            body: bufferStream,
        },
        fields: 'id, webViewLink',
    });

    const fileId = response?.data?.id;
    if (!fileId) {
        throw new Error('Brak ID pliku z Google Drive');
    }

    await drive.permissions.create({
        fileId,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });

    return {
        id: fileId,
        link: response?.data?.webViewLink || null,
    };
};

module.exports = (db) => [
    upload.single('pdf'),
    async (req, res) => {
        const projektId = req.params.id;
        const materialId = req.params.materialId;

        if (!projektId || !materialId) {
            return res.status(400).json({ error: 'Brak ID projektu lub faktury' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Brak pliku PDF' });
        }

        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'Nieprawidlowy format pliku (PDF)' });
        }

        try {
            const drive = buildDriveClient();
            const safeName = req.file.originalname || `faktura_${materialId}.pdf`;
            const driveFile = await uploadPdfToDrive(drive, req.file.buffer, safeName);

            const updateQuery = `UPDATE projekt_materialy
              SET pdf_drive_id = ?, pdf_drive_name = ?, pdf_drive_link = ?, pdf_mime = ?, pdf_size = ?, pdf_uploaded_at = NOW()
              WHERE id = ? AND ProjektID = ?`;

            db.query(
                updateQuery,
                [
                    driveFile.id,
                    safeName,
                    driveFile.link,
                    req.file.mimetype,
                    req.file.size,
                    materialId,
                    projektId,
                ],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Blad zapisu PDF w DB:', updateErr);
                        return res.status(500).json({
                            error: 'Nie udalo sie zapisac metadanych PDF',
                            details: updateErr.message,
                        });
                    }

                    return res.json({
                        success: true,
                        pdf: {
                            id: driveFile.id,
                            name: safeName,
                            link: driveFile.link,
                            size: req.file.size,
                        },
                    });
                }
            );
        } catch (error) {
            console.error('Blad uploadu PDF:', error);
            return res.status(500).json({
                error: 'Nie udalo sie przeslac PDF do Google Drive',
                details: error.message,
            });
        }
    },
];
