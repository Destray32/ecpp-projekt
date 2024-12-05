const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
const port = 5000;
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

require('dotenv').config();

// app.use(cors({
//     origin: 'http://47.76.209.242:3000',
//     credentials: true
// }));

app.use(cors({
    origin: function(origin, callback) {
        return callback(null, true);
    },
    credentials: true
}));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../client/build')));

app.use(express.json({ type: 'application/json; charset=utf-8' }));
app.use(express.urlencoded({ extended: true, parameterLimit: 10000, charset: 'utf-8' }));

// JWT middleware
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        console.log('No token found');
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
const authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden' });
        }
    };
};


const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;

// zmiana architektury bazy danych z jednego persistance połączenia na pulę połączeń
// zmiana ta pozwala na lepsze zarządzanie połączeniami szczególnie w przypadku wersji już produkcyjnej
//
// https://sidorares.github.io/node-mysql2/docs#using-connection-pools
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
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

// Czas > Czas Pracy
const ZapiszCzasPracy = require('./api/Czas/CzasPracy/czas.czaspracy.zapisz');
const PobierzCzasPracy = require('./api/Czas/CzasPracy/czas.czaspracy.pobierz');
const GetCzasProjekt = require('./api/Czas/CzasPracy/czas.czaspracy.getCzasProjekt');
const PobierzDodaneProjekty = require('./api/Czas/CzasPracy/czas.czaspracy.projektyDodane');
const UsunDodatkowyProject = require('./api/Czas/CzasPracy/czas.czaspracy.usun');
const SetWarnings = require('./api/Czas/CzasPracy/czas.czaspracy.setWarnings');
const GetBlockStatus = require('./api/Czas/CzasPracy/czas.czaspracy.getBlockStatus');

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

app.post('/api/logowanie', (req, res) => {
    Logowanie(req, res);
});

app.post('/api/zamkniecieStrony', (req, res) => {
    ZamkniecieStrony(req, res);
});

app.get('/api/companies', (req, res) => {
    Companies(req, res);
});

app.get('/api/logins', (req, res) => {
    Logins(req, res);
});

app.post('/api/logout', (req, res) => {
    res.cookie("token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", expires: new Date(0) });
    res.json({ message: "Logged out successfully" });
});

//                                                                                  WAŻNE!!!!
//                                                   JAKBY NIE DZIAŁ JWT MIDDLEWARE TO ZAKOMENTOWAĆ TEN APP.USE POD KOMENTAŻEM
//                                                            ORAZ SKONTAKTOWAĆ SIĘ Z OSOBĄ ZA NIEGO ODPOWIEDZIALNĄ
//                                                                      BO PRAWDOPODOBNIE COŚ ZJEBAŁA
app.use(authenticateJWT);

app.get('/api/check-token', (req, res) => {
    res.json({ message: 'Token is valid' });
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
/////////////////////////////////////////

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
/////////////////////////////////////////


// CZAS > PROJEKTY //
app.get('/api/czas/projekty', (req, res) => {
    GetProjekty(req, res, pool);
});
app.post('/api/czas/projekty', authorizeRole('Administrator'), (req, res) => {
    DodajNowyProjekt(req, res, pool);
});
app.post('/api/czas/grupa', authorizeRole('Administrator'), (req, res) => {
    DodajNowaGrupe(req, res, pool);
});
app.get('/api/czas/szukaj', (req, res) => {
    SzukajProjekt(req, res, pool);
});
app.put('/api/czas/przeniesAkt', authorizeRole('Administrator'), (req, res) => {
    PrzeniesAkt(req, res, pool);
});
app.put('/api/czas/przeniesNieakt', authorizeRole('Administrator'), (req, res) => {
    PrzeniesNieakt(req, res, pool);
});
app.delete('/api/czas/usun', authorizeRole('Administrator'), (req, res) => {
    UsunProjekt(req, res, pool);
});
app.get('/api/czas/projekty/:id', (req, res) => {
    PobierzProjekt(req, res, pool);
});
app.put('/api/czas/edytujProjekt/:id', authorizeRole('Administrator'), (req, res) => {
    EdytujProjekt(req, res, pool);
});
app.get('/api/czas/pobierzGrupe/:id', (req, res) => {
    PobierzGrupe(req, res, pool);
});
app.put('/api/czas/edytujGrupe/:id', authorizeRole('Administrator'), (req, res) => {
    EdytujGrupe(req, res, pool);
});
/////////////////////////////////////////

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

// CZAS > TYDZIEN //
app.get('/api/tydzien/:numericWeek', (req, res) => {
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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://47.76.209.242:5000:${port}`);
}
);