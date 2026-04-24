const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CLIENT_PATH = path.join(__dirname, '..', '..', 'drive-oauth-client.json');
const TOKEN_PATH = path.join(__dirname, '..', '..', 'drive-oauth-token.json');

const loadOAuthClient = (redirectUri) => {
    if (!fs.existsSync(CLIENT_PATH)) {
        throw new Error('Brak pliku drive-oauth-client.json');
    }

    const raw = JSON.parse(fs.readFileSync(CLIENT_PATH, 'utf8'));
    const creds = raw.web || raw.installed;
    if (!creds) {
        throw new Error('Nieprawidlowy format pliku OAuth');
    }

    const resolvedRedirect = redirectUri || (creds.redirect_uris && creds.redirect_uris[0]);
    if (!resolvedRedirect) {
        throw new Error('Brak redirect URI dla OAuth');
    }

    return new google.auth.OAuth2(
        creds.client_id,
        creds.client_secret,
        resolvedRedirect
    );
};

const saveToken = (token) => {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
};

const buildRedirectUri = (req) => {
    const envRedirect = process.env.GOOGLE_DRIVE_REDIRECT_URI;
    if (envRedirect) return envRedirect;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    return `${protocol}://${req.get('host')}/api/drive/oauth/callback`;
};

const startOAuth = (req, res) => {
    try {
        const redirectUri = buildRedirectUri(req);
        const oauth2Client = loadOAuthClient(redirectUri);

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/drive.file'],
            prompt: 'consent',
        });

        return res.redirect(authUrl);
    } catch (error) {
        console.error('Blad startu OAuth:', error);
        return res.status(500).json({ error: error.message });
    }
};

const handleOAuthCallback = async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).json({ error: 'Brak kodu OAuth' });
    }

    try {
        const redirectUri = buildRedirectUri(req);
        const oauth2Client = loadOAuthClient(redirectUri);
        const { tokens } = await oauth2Client.getToken(code);
        saveToken(tokens);
        return res.send('OAuth skonfigurowany. Mozesz zamknac to okno.');
    } catch (error) {
        console.error('Blad callback OAuth:', error);
        return res.status(500).json({ error: 'Nie udalo sie zapisac tokenu', details: error.message });
    }
};

const loadOAuthToken = () => {
    if (!fs.existsSync(TOKEN_PATH)) return null;
    return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
};

module.exports = {
    startOAuth,
    handleOAuthCallback,
    loadOAuthClient,
    loadOAuthToken,
    saveToken,
    buildRedirectUri,
    TOKEN_PATH,
};
