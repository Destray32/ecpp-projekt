const db = require('../../server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
    keyPrefix: 'login_fail_ip',
    points: 5, // ilosc prob
    duration: 300,
    blockDuration: 300, // blok na 300 sekund (5 minut)
});

// schemat walidacji danych wejsciowych
const schema = Joi.object({
    firma: Joi.string().required(),
    login: Joi.string().required(),
    password: Joi.string().required(),
});

async function logowanie(req, res) {
    const clientIp = req.ip;

    try {
        await rateLimiter.consume(clientIp);
        
        // walidacja przy użyciu joi - jeśli dane są niepoprawne, zwróć błąd 400
        const { firma, login, password } = req.body;
        const { error } = schema.validate({ firma, login, password });
        if (error) {
            console.error('Validation error:', error.details[0].message);
            return res.status(400).json({ error: error.details[0].message });
        }

        const query = `
        SELECT p.idPracownik, p.Haslo, f.Nazwa_firmy
        FROM pracownik p
        JOIN informacje_o_firmie i ON p.FK_Informacje_o_firmie = i.idInformacje_o_firmie
        JOIN firma f ON i.FK_idFirma = f.idFirma
        WHERE p.Nazwa_uzytkownika = ?
    `;
        const values = [login];

        db.query(query, values, async (err, result) => {
            if (err) {
                console.error('Error in query:', err);
                return res.status(500).json({ error: 'Database query error' });
            }

            if (result.length === 0) {
                return res.status(401).json({ error: 'Wrong login or password' });
            }

            const user = result[0];

            if (user.Nazwa_firmy !== firma) {
                return res.status(401).json({ error: 'Wrong login or company name' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.Haslo);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Wrong login or password' });
            }

            // usuń blokadę po poprawnym zalogowaniu
            await rateLimiter.delete(clientIp);

            const token = jwt.sign({ id: user.idPracownik }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.cookie('token', token, {
                httpOnly: true,
                //secure: process.env.NODE_ENV === 'production',  // zmienic jak bedziemy oddawac apke
                secure: false,
                sameSite: 'strict',
                maxAge: 3600000,
            });

            const logQuery = `
            INSERT INTO logi (FK_idPracownik, Data, Komentarz) 
            VALUES (?, NOW(), 'Zalogowano')
        `;
            const logValues = [user.idPracownik];

            db.query(logQuery, logValues, (logErr) => {
                if (logErr) {
                    console.error('Error logging user login:', logErr);
                }
            });

            res.json({ message: 'Logged in' });
        });
    } catch (err) {
        res.set('Retry-After', String(Math.round(err.msBeforeNext / 1000)));
        return res.status(429).json({
            error: 'Too many login attempts, please try again later.',
            retryAfter: Math.round(err.msBeforeNext / 1000),
        });

    }
}

module.exports = logowanie;