const express = require('express');
const app = express();
app.use(express.json());
const port = 5000;
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const https = require('https');
const fs = require('fs');
const rateLimit = require('express-rate-limit');


require('dotenv').config();

const CERT = '/etc/letsencrypt/live/qubis.pl-0001/fullchain.pem';
const KEY  = '/etc/letsencrypt/live/qubis.pl-0001/privkey.pem';

function loadTLS() {
  return {
    cert: fs.readFileSync(CERT),
    key: fs.readFileSync(KEY),
  };
}

// CZAS > PROJEKTY //no-index headers for all responses
app.use((req, res, next) => {
    // Set headers to prevent indexing
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
});

// Add robots.txt route to explicitly disallow all web crawlers
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
});

const allowedOrigins = [
    'https://138.2.138.18:3000',
    'https://138.2.138.18',
    'https://www.qubis.pl:3000',
    'https://www.qubis.pl',
    'https://qubis.pl',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://localhost:3000',
    'https://localhost:5000',
]

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(cookieParser());

app.use(express.json({ type: 'application/json; charset=utf-8' }));
app.use(express.urlencoded({ extended: true, parameterLimit: 10000, charset: 'utf-8' }));

// JWT middleware
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        //console.log('No token found');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.redirect('/');
        }

        req.user = user;
        req.user.role = user.role;
        next();
    });
};

// middleware do autoryzacji endpointów na podstawie roli użytkownika
//
// użycie:
// app.get('/api/protected', authorizeRole('Administrator') <----- tutaj typ konta z bazy danych z tabeli "pracownik", (req, res) => {
//     res.json({ message: 'Protected endpoint' });
// });
const specialUsers = ['Jarosław Pajor', 'Paweł Wójtowicz', 'Małgorzata Tylicki'];

const hasSpecialAccess = (user, feature) => {
    const userFullName = `${user.name} ${user.surname}`;
    switch(feature) {
        case 'urlopy':
            return ['Jarosław Pajor', 'Paweł Wójtowicz'].includes(userFullName);
        case 'projekty':
            return ['Jarosław Pajor', 'Paweł Wójtowicz'].includes(userFullName);
        case 'raporty':
            return ['Jarosław Pajor', 'Małgorzata Tylicki'].includes(userFullName);
        case 'tydzien':
            return ['Jarosław Pajor', 'Paweł Wójtowicz', 'Małgorzata Tylicki'].includes(userFullName);
        default:
            return false;
    }
};

const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (req.user && (
            roles.includes(req.user.role) || 
            roles.some(role => {
                if (role === 'urlopy') return hasSpecialAccess(req.user, 'urlopy');
                if (role === 'projekty') return hasSpecialAccess(req.user, 'projekty');
                if (role === 'raporty') return hasSpecialAccess(req.user, 'raporty');
                if (role === 'tydzien') return hasSpecialAccess(req.user, 'tydzien');
                return false;
            })
        )) {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden' });
        }
    };
};

// Middleware to verify the global Access PIN
const verifyAccessPin = (req, res, next) => {
    const pin = req.headers['x-access-pin'];
    const expectedPin = process.env.ACCESS_PIN || '1234';
    if (pin === expectedPin) {
        next();
    } else {
        res.status(403).json({ error: 'Access PIN required or invalid' });
    }
};

// Rate limiter for authentication-related endpoints
const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { error: 'Too many authentication attempts. Please try again after 5 minutes.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;

// zmiana architektury bazy danych z jednego persistance połączenia na pulę połączeń
// zmiana ta pozwala na lepsze zarządzanie połączeniami szczególnie w przypadku wersji już produkcyjnej
//
// https://sidorares.github.io/node-mysql2/docs#using-connection-pools
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydb',
    waitForConnections: true,
    connectionLimit: 30,
    queueLimit: 0
});

module.exports = pool;

// api importy z folderu api
// Logowanie
const Logowanie = require('./api/logowanie');
const Companies = require('./api/companies');
const Logins = require('./api/logins');
const GetImie = require('./api/home.getImie');
const ZamkniecieStrony = require('./api/zamkniecieStrony');
const UzupelnoneDane = require('./api/uzupelnioneDane');

// Grupy
const UsuwanieGrupy = require('./api/Grupy/grupy.usuwaniegrupy');

// Pracownik
const ListaPracownikow = require('./api/Pracownik/Pracownik/pracownik.lista');
const UsunPracownika = require('./api/Pracownik/Pracownik/pracownik.usun');
const MojeDane = require('./api/Pracownik/Pracownik/pracownik.mojedane');
const DodajPracownika = require('./api/Pracownik/Pracownik/pracownik.dodaj');
const PobierzPracownika = require('./api/Pracownik/Pracownik/pracownik.pobierzpracownika');
const EdytujPracownika = require('./api/Pracownik/Pracownik/pracownik.edytujpracownika');
const PobierzLogi = require('./api/Pracownik/pracownik.logowanie');
const PobierzPracownicyFirme = require('./api/Pracownik/Pracownik/pacownik.pobierzfirma');
const PobierzPracownicyGrupy = require('./api/Pracownik/Pracownik/pracownik.pobierzgrupy');
const PobierzPracownicyPojazd = require('./api/Pracownik/Pracownik/pracownik.pobierzpojazd');
const KomorkaPracownika = require('./api/Pracownik/Pracownik/pracownik.komorka');
const GetBlockedUsers = require('./api/Pracownik/Pracownik/pracownik.getBlockedUsers');
const OdblokujPracownika = require('./api/Pracownik/Pracownik/pracownik.unblock');

// Pracownik > Cennik
const PobierzCennik = require('./api/Pracownik/Cennik/cennik.pobierz.js');
const AktualizujStawke = require('./api/Pracownik/Cennik/cennik.aktualizuj');
const AktualizujStawkeGlobalna = require('./api/Pracownik/Cennik/cennik.aktualizujGlobalna');


// Czas > Czas Pracy
const ZapiszCzasPracy = require('./api/Czas/CzasPracy/czas.czaspracy.zapisz');
const PobierzCzasPracy = require('./api/Czas/CzasPracy/czas.czaspracy.pobierz');
const GetCzasProjekt = require('./api/Czas/CzasPracy/czas.czaspracy.getCzasProjekt');
const PobierzDodaneProjekty = require('./api/Czas/CzasPracy/czas.czaspracy.projektyDodane');
const UsunDodatkowyProject = require('./api/Czas/CzasPracy/czas.czaspracy.usun');
const SetWarnings = require('./api/Czas/CzasPracy/czas.czaspracy.setWarnings');
const GetBlockStatus = require('./api/Czas/CzasPracy/czas.czaspracy.getBlockStatus');

// Rozliczenia Szwecja
const PobierzRozliczenia = require('./api/Rozliczenia/rozliczenia.pobierz.js');
const ZapiszRozliczenia = require('./api/Rozliczenia/rozliczenia.zapisz.js');
const PobierzKapownik = require('./api/Rozliczenia/rozliczenia.kapownik.js');

// Plan Tygodnia
const DostepneGrupy = require('./api/Grupy/grupy.dostepnegrupy');
const DrukujGrupe = require('./api/PlanTygodnia/plantygodnia.plan.drukujGrupe');
const PrzeniesWpisPlan = require('./api/PlanTygodnia/plantygodnia.plan.przenies');
const UsunWpisPlan = require('./api/PlanTygodnia/plantygodnia.plan.usun');
const PracownicyPoprzedniTydz = require('./api/PlanTygodnia/plantygodnia.plan.pracPoprzedni');
const DodajZaplanuj = require('./api/PlanTygodnia/plantygodnia.zaplanuj.dodajPlan');
const GetPlany = require('./api/PlanTygodnia/plantygodnia.zaplanuj.getPlany');
const UsunPlan = require('./api/PlanTygodnia/plantygodnia.zaplanuj.usunPlan');
const AktualizujM1_5 = require('./api/PlanTygodnia/plantygodnia.zaplanuj.aktualizujM1_5');
const ZapiszOpis = require('./api/PlanTygodnia/plantygodnia.zaplanuj.zapiszOpis');

// Czas > Projekty
const GetProjekty = require('./api/Czas/Projekty/czas.projekty.getProjekty');
const UsunProjekt = require('./api/Czas/Projekty/czas.projekty.usunProjekt');
const SzukajProjekt = require('./api/Czas/Projekty/czas.projekty.szukajProjekt');
const PrzeniesAkt = require('./api/Czas/Projekty/czas.projekty.przeniesAkt');
const PrzeniesNieakt = require('./api/Czas/Projekty/czas.projekty.przeniesNieakt');
const DodajNowyProjekt = require('./api/Czas/Projekty/czas.projekty.dodajNowy');
const DodajNowaGrupe = require('./api/Czas/Projekty/czas.projekty.dodajNowaGrupa');
const PobierzProjekt = require('./api/Czas/Projekty/czas.projekty.pobierzProjekt');
const EdytujProjekt = require('./api/Czas/Projekty/czas.projekty.edytujProjekt');
const PobierzGrupe = require('./api/Czas/Projekty/czas.projekty.pobierzGrupe');
const EdytujGrupe = require('./api/Czas/Projekty/czas.projekty.edytujGrupe');
const NieuzywaneProjekty = require('./api/Czas/Projekty/czas.projekty.nieuzywane');

// Czas > Urlopy
const GetUrlopy = require('./api/Czas/Urlopy/czas.urlopy.getUrlopy');
const DodajUrlop = require('./api/Czas/Urlopy/czas.urlopy.dodajUrlop');
const ZatwierdzUrlop = require('./api/Czas/Urlopy/czas.urlopy.zatwierdzUrlop');
const UsunUrlop = require('./api/Czas/Urlopy/czas.urlopy.usunUrlop');
const urlopyPdf = require('./api/Czas/Urlopy/czas.urlopy.urlopyPdf');
const EdytujUrlop = require('./api/Czas/Urlopy/czas.urlopy.edytujUrlop');

// Czas > Pojazdy
const PobierzPojazdy = require('./api/Czas/Pojazdy/pojazdy.pobierz');
const UsunPojazd = require('./api/Czas/Pojazdy/pojazdy.usun');
const DodajPojazd = require('./api/Czas/Pojazdy/pojazdy.dodaj');
const EdytujPojazd = require('./api/Czas/Pojazdy/pojazdy.edytuj');

// Czas > Materialy
const PobierzMaterialy = require('./api/Czas/Materialy/czas.materialy.pobierz');
const PobierzMaterialyLista = require('./api/Czas/Materialy/czas.materialy.lista');
const DodajMaterial = require('./api/Czas/Materialy/czas.materialy.dodaj');
const UsunMaterial = require('./api/Czas/Materialy/czas.materialy.usun');
const UploadMaterialPdf = require('./api/Czas/Materialy/czas.materialy.pdf');
const UsunMaterialPdf = require('./api/Czas/Materialy/czas.materialy.pdf.usun');
const DriveOAuth = require('./api/Drive/drive.oauth');

// Czas > Tydzien
const GetTydzien = require('./api/Czas/Tydzien/czas.tydzien.getTydzien');
const OtworzTydzienCzas = require('./api/Czas/Tydzien/czas.tydzien.otworzTydzien');
const ZamknijTydzienCzas = require('./api/Czas/Tydzien/czas.tydzien.zamknijTydzien');

// Czas > SprawdzSamochod
const PobierzSamochody = require('./api/Czas/SprawdzSamochod/sprawdzSamochodz.pobierz');

// Czas > Raporty
const PobierzRaporty = require('./api/Czas/Raporty/raporty.pobierz');
const GenerujRaport = require('./api/Czas/Raporty/raporty.generuj');

// Ogloszenia
const PobierzOgloszenia = require('./api/Ogloszenia/ogloszenia.pobierz');
const DodajOgloszenie = require('./api/Ogloszenia/ogloszenia.dodaj');
const UsunOgloszenie = require('./api/Ogloszenia/ogloszenia.usun');
const PobierzOgloszeniaPracownicy = require('./api/Ogloszenia/ogloszenia.pobierzPracownikow');
const PobierzOgloszeniaGrupy = require('./api/Ogloszenia/ogloszenia.pobierzGrupy');
const ZaznaczOgloszeniePrzeczytane = require('./api/Ogloszenia/ogloszenia.zaznaczPrzeczytane');
const GetBadgeCount = require('./api/Ogloszenia/ogloszenia.badgeCount');

// Archiwum
const PobierzArchiwum = require('./api/Czas/Archiwum/archiwum.pobierz');
const PrzywrocArchiwum = require('./api/Czas/Archiwum/archiwum.przywroc');

const PobierzDostepneFirmy = require('./api/pobierzDostepneFirmy');

app.get('/api/home/pobierz', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'files', 'skrot.bat');
    res.download(filePath, 'skort.bat', (err) => {
        if (err) {
            console.error('File download error:', err);
            res.status(500).send('Unable to download the file.');
        }
    });
});

// Logowanie

app.post('/api/verify-pin', authLimiter, (req, res) => {
    const { pin } = req.body;
    const expectedPin = process.env.ACCESS_PIN || '1234';
    if (pin === expectedPin) {
        res.json({ valid: true });
    } else {
        res.status(400).json({ valid: false, error: 'Incorrect PIN' });
    }
});

app.post('/api/logowanie', authLimiter, verifyAccessPin, (req, res) => {
    Logowanie(req, res);
});

app.post('/api/zamkniecieStrony', (req, res) => {
    ZamkniecieStrony(req, res);
});

app.get('/api/companies', verifyAccessPin, (req, res) => {
    Companies(req, res);
});

app.get('/api/logins', verifyAccessPin, (req, res) => {
    Logins(req, res);
});

app.post('/api/logout', (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        expires: new Date(0)
    });
    res.json({ message: "Logged out successfully" });
});

// Drive OAuth (bez JWT)
app.get('/api/drive/oauth/start', DriveOAuth.startOAuth);
app.get('/api/drive/oauth/callback', DriveOAuth.handleOAuthCallback);

//                                                                                  WAŻNE!!!!
//                                                   JAKBY NIE DZIAŁ JWT MIDDLEWARE TO ZAKOMENTOWAĆ TEN APP.USE POD KOMENTAŻEM
//                                                            ORAZ SKONTAKTOWAĆ SIĘ Z OSOBĄ ZA NIEGO ODPOWIEDZIALNĄ
//                                                                      BO PRAWDOPODOBNIE COŚ ZJEBAŁA
app.use(authenticateJWT);

app.get('/api/check-token', (req, res) => {
    const refreshedToken = jwt.sign(
        { id: req.user.id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.cookie('token', refreshedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000,
    });

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresAt = nowInSeconds + 3600;
    const remainingSeconds = 3600;

    res.json({
        message: 'Token is valid',
        expiresAt,
        remainingSeconds,
    });
});

app.get('/api/imie', (req, res) => {
    GetImie(req, res);
});

app.get('/api/dane-uzupelnione', (req, res) => {
    UzupelnoneDane(req, res);
});

// PRACOWNIK > PRACOWNIK //
app.route('/api/pracownicy')
    .get((req, res) => {
        ListaPracownikow(req, res, pool);
    })
    .post(authorizeRole('Administrator'), (req, res) => {
        DodajPracownika(req, res);
    });

app.get('/api/pracownik/blocked', authorizeRole('Administrator'), (req, res) => {
    GetBlockedUsers(req, res, pool);
});

app.put('/api/pracownik/unblock/:id', authorizeRole('Administrator'), (req, res) => {
    OdblokujPracownika(req, res, pool);
});

app.get('/api/pracownik/firmy', (req, res) => {
    PobierzPracownicyFirme(req, res);
});

app.get('/api/pracownik/grupy', (req, res) => {
    PobierzPracownicyGrupy(req, res);
});

app.get('/api/pracownik/pojazdy', (req, res) => {
    PobierzPracownicyPojazd(req, res);
});

app.put('/api/pracownik/komorka/:id', (req, res) => {
    KomorkaPracownika(req, res);
});

app.route('/api/pracownik/:id')
    .get((req, res) => {
        PobierzPracownika(req, res);
    })
    .delete(authorizeRole('Administrator'), (req, res) => {
        UsunPracownika(req, res);
    })
    .put((req, res) => {
        EdytujPracownika(req, res);
    });

app.get('/api/mojedane', (req, res) => {
    MojeDane(req, res);
});
app.put('/api/pracownik/zmienMoje', (req, res) => {
    EdytujPracownika(req, res);
});


app.get('/api/logi', authenticateJWT, authorizeRole('Administrator'), (req, res) => {
    PobierzLogi(req, res, pool);
}
);

// CZAS > CZAS PRACY //
app.route('/api/czas')
    .get((req, res) => {
        PobierzCzasPracy(req, res, pool);
    })
    .post((req, res) => {
        ZapiszCzasPracy(req, res, pool);
    });

app.route('/api/czas/warnings')
    .post((req, res) => {
        SetWarnings(req, res, pool);
    })
    .get((req, res) => {
        GetBlockStatus(req, res, pool);
    });

app.route('/api/czas/projekt')
    .post((req, res) => {
        GetCzasProjekt(req, res, pool);
    });

app.delete('/api/czas/projekt/:id', (req, res) => {
    UsunDodatkowyProject(req, res, pool);
});

app.get('/api/czas/projekty/dodane', (req, res) => {
    PobierzDodaneProjekty(req, res, pool);
});
/////////////////////////////////////////

// PLAN TYGODNIA "V" > PLAN TYGODNIA //
app.post('/api/planTygodniaPrev', (req, res) => {
    PracownicyPoprzedniTydz(req, res, pool);
});
app.route('/api/planTygodnia')
    .get((req, res) => {
        PlanTygodniaPlan(req, res, pool);
    })
    .put(authorizeRole('Administrator'), (req, res) => {
        PrzeniesWpisPlan(req, res, pool);
    })
    .delete(authorizeRole('Administrator'), (req, res) => {
        UsunWpisPlan(req, res, pool);
    });

app.get('/api/planTygodnia/drukuj', (req, res) => {
    DrukujGrupe(req, res, pool);
});

app.put('/api/planTygodnia/:employeeId', authorizeRole('Administrator'), (req, res ) => {
    AktualizujM1_5(req, res, pool);
});
/////////////////////////////////////////

// PLAN TYGODNIA "V" > ZAPLANUJ //
app.route('/api/planTygodnia/zaplanuj')
    .get((req, res) => {
        GetPlany(req, res, pool);
    })
    .post(authorizeRole('Administrator'), (req, res) => {
        DodajZaplanuj(req, res, pool);
    })
    .delete(authorizeRole('Administrator'), (req, res) => {
        UsunPlan(req, res, pool);
    });

// Endpoint do zapisywania opisu
app.put('/api/planTygodnia/zaplanuj/opis', authorizeRole('Administrator'), (req, res) => {
    ZapiszOpis(req, res, pool);
});
/////////////////////////////////////////

// CZAS > PROJEKTY //
app.get('/api/czas/projekty', (req, res) => {
    GetProjekty(req, res, pool);
});
app.post('/api/czas/projekty', authorizeRole('Administrator', 'Kierownik', 'Biuro', 'projekty'), (req, res) => {
    DodajNowyProjekt(req, res, pool);
});
app.post('/api/czas/grupa', authorizeRole('Administrator', 'Kierownik', 'Biuro', 'projekty'), (req, res) => {
    DodajNowaGrupe(req, res, pool);
});
app.get('/api/czas/szukaj', (req, res) => {
    SzukajProjekt(req, res, pool);
});
app.get('/api/czas/szukajZleceniodawca', (req, res) => {
    SzukajProjekt(req, res, pool);
});
app.put('/api/czas/przeniesAkt', authorizeRole('Administrator'), (req, res) => {
    PrzeniesAkt(req, res, pool);
});
app.put('/api/czas/przeniesNieakt', authorizeRole('Administrator'), (req, res) => {
    PrzeniesNieakt(req, res, pool);
});
app.delete('/api/czas/usun', authorizeRole('Administrator', 'Kierownik', 'Biuro'), (req, res) => {
    UsunProjekt(req, res, pool);
});
app.get('/api/czas/projekty/nieuzywane', (req, res) => {
    NieuzywaneProjekty(req, res, pool);
});
app.get('/api/czas/projekty/:id', (req, res) => {
    PobierzProjekt(req, res, pool);
});
app.put('/api/czas/edytujProjekt/:id', authorizeRole('Administrator', 'Kierownik', 'Biuro'), (req, res) => {
    EdytujProjekt(req, res, pool);
});
app.get('/api/czas/pobierzGrupe/:id', (req, res) => {
    PobierzGrupe(req, res, pool);
});
app.put('/api/czas/edytujGrupe/:id', authorizeRole('Administrator', 'Kierownik', 'Biuro'), (req, res) => {
    EdytujGrupe(req, res, pool);
});

/////////////////////////////////////////
// CZAS > MATERIALY //
app.get('/api/czas/materialy/lista', authorizeRole('Administrator'), (req, res) => {
    PobierzMaterialyLista(req, res, pool);
});
app.get('/api/czas/materialy/:id', authorizeRole('Administrator'), (req, res) => {
    PobierzMaterialy(req, res, pool);
});
app.post('/api/czas/materialy/:id', authorizeRole('Administrator'), (req, res) => {
    DodajMaterial(req, res, pool);
});
app.post('/api/czas/materialy/:id/:materialId/pdf', authorizeRole('Administrator'), UploadMaterialPdf(pool));
app.delete('/api/czas/materialy/:id/:materialId/pdf', authorizeRole('Administrator'), UsunMaterialPdf(pool));
app.delete('/api/czas/materialy/:id/:materialId', authorizeRole('Administrator'), (req, res) => {
    UsunMaterial(req, res, pool);
});
/////////////////////////////////////////

//Rozliczenia Szwecja
app.route('/api/rozliczenia')
    .get((req, res) => {
        PobierzRozliczenia(req, res, pool);
    })
    .post((req, res) => { 
        ZapiszRozliczenia(req, res, pool);
    });

app.get('/api/rozliczenia/kapownik', authorizeRole('Administrator'), (req, res) => {
    PobierzKapownik(req, res, pool);
});

// CZAS > URLOPY //
app.get('/api/urlopy', (req, res) => {
    GetUrlopy(req, res, pool);
});
app.post('/api/urlopy', (req, res) => {
    DodajUrlop(req, res, pool);
});
app.put('/api/urlopy', (req, res) => {
    ZatwierdzUrlop(req, res, pool);
});
app.delete('/api/urlopy', (req, res) => {
    UsunUrlop(req, res, pool);
});
// pobieranie danych dla drukowania pdf urlopow
app.post('/api/urlopy/pdf', (req, res) => {
    urlopyPdf(req, res, pool);
});
app.put('/api/urlopy/:vacationId', (req, res) => {
    EdytujUrlop(req, res, pool);
});

/////////////////////////////////////////

app.get('/api/cennik', (req, res) => {
    PobierzCennik(req, res);
});


app.put('/api/cennik/stawka', (req, res) => {
    AktualizujStawke(req, res);
});

app.put('/api/cennik/globalna', (req, res) => {
    AktualizujStawkeGlobalna(req, res);
});

// CZAS > TYDZIEN //
app.get('/api/tydzien/:year/:numericWeek', (req, res) => {
    GetTydzien(req, res, pool);
});
app.post('/api/tydzien', (req, res) => {
    OtworzTydzienCzas(req, res, pool);
});
app.delete('/api/tydzien', (req, res) => {
    ZamknijTydzienCzas(req, res, pool);
});

    // app.post((req, res) => {
    //     OtworzTydzienCzas(req, res);
    // })
    // .delete((req, res) => {
    //     ZamknijTydzienCzas(req, res);
    // });
/////////////////////////////////////////

// CZAS > POJAZDY //
app.route('/api/pojazdy')
    .get((req, res) => {
        PobierzPojazdy(req, res, pool);
    })
    .post(authorizeRole('Administrator'), (req, res) => {
        DodajPojazd(req, res, pool);
    });


app.route('/api/pojazdy/:id')
    .get(authorizeRole('Administrator'), (req, res) => {
        PobierzPojazdy(req, res, pool);
    })
    .delete(authorizeRole('Administrator'), (req, res) => {
        UsunPojazd(req, res, pool);
    })
    .put(authorizeRole('Administrator'), (req, res) => {
        EdytujPojazd(req, res, pool);
    });

////////////////////////////////////////
// CZAS > SPRAWDZ SAMOCHOD //
app.get('/api/samochody', (req, res) => {
    PobierzSamochody(req, res, pool);
});
/////////////////////////////////////////

// CZAS > RAPORTY //
app.get('/api/raporty', (req, res) => {
    PobierzRaporty(req, res, pool);
});

app.get('/api/generujRaport', (req, res) => {
    GenerujRaport(req, res, pool);
});
/////////////////////////////////////////

// OGLOSZENIA //
app.route('/api/ogloszenia')
    .get((req, res) => {
        PobierzOgloszenia(req, res);
        
    })
    .post((req, res) => {
        DodajOgloszenie(req, res);
    });

app.get('/api/ogloszenia/pracownicy', (req, res) => {
    PobierzOgloszeniaPracownicy(req, res);
});

app.get('/api/ogloszenia/grupy', (req, res) => {
    PobierzOgloszeniaGrupy(req, res);
});

app.delete('/api/ogloszenia/:id', (req, res) => {
    UsunOgloszenie(req, res);
});

app.post('/api/ogloszenia/przeczytane', (req, res) => {
    ZaznaczOgloszeniePrzeczytane(req, res);
});

app.get('/api/ogloszenia/count', (req, res) => {
    GetBadgeCount(req, res);
});
/////////////////////////////////////////

// ARCHIWUM //
app.get('/api/czas/archiwum/:selectedOption', (req, res) => {
    PobierzArchiwum(req, res);
});
app.post('/api/czas/archiwum/przywroc', (req, res) => {
    PrzywrocArchiwum(req, res);
});
/////////////////////////////////////////

// pobieranie grup z bazy danych
app.get('/api/grupy', (req, res) => {
    DostepneGrupy(req, res, pool);
});

app.delete('/api/grupy/:id', authorizeRole('Administrator'), (req, res) => {
    UsuwanieGrupy(req, res, pool);
});

app.get('/api/firmy', (req, res) => {
    PobierzDostepneFirmy(req, res, pool);
});

const isProduction = NODE_ENV === 'production';

if (isProduction) {
    try {
        const server = https.createServer(loadTLS(), app);

        server.listen(port, () => {
            console.log(`Server running on https://qubis.pl:${port}`);
        });

        // automatyczne przeładowanie TLS po odnowieniu certów
        const reloadTLS = () => {
            try {
                server.setSecureContext(loadTLS());
                console.log('TLS context reloaded (cert renewed)');
            } catch (e) {
                console.error('TLS reload failed:', e);
            }
        };

        [KEY, CERT].forEach((filePath) => {
            fs.watchFile(filePath, { interval: 30000 }, reloadTLS);
        });
    } catch (error) {
        console.error('HTTPS startup failed, fallback to HTTP:', error);
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    }
} else {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}




