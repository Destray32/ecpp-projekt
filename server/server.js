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

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(cookieParser());

app.use(express.json({ type: 'application/json; charset=utf-8' }));
app.use(express.urlencoded({ extended: true, parameterLimit: 10000, charset: 'utf-8' }));

app.use(express.static(path.join(__dirname, '../client/build')));

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
            return res.status(403).json({ error: 'Forbidden' });
        }

        req.user = user;
        next();
    });
};

const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'mydb'
});

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to MySQL');
    }
});

module.exports = db;

// api importy z folderu api
// Logowanie
const Logowanie = require('./api/logowanie');
const Companies = require('./api/companies');
const Logins = require('./api/logins');
const GetImie = require('./api/home.getImie');
const ZamkniecieStrony = require('./api/zamkniecieStrony');

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

// Czas > Czas Pracy
const ZapiszCzasPracy = require('./api/Czas/CzasPracy/czas.czaspracy.zapisz');
const PobierzCzasPracy = require('./api/Czas/CzasPracy/czas.czaspracy.pobierz');
const GetCzasProjekt = require('./api/Czas/CzasPracy/czas.czaspracy.getCzasProjekt');
const PobierzDodaneProjekty = require('./api/Czas/CzasPracy/czas.czaspracy.projektyDodane');

// Plan Tygodnia
const PlanTygodniaPlan = require('./api/PlanTygodnia/plantygodnia.plan.planTygodnia');
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

// PRACOWNIK > PRACOWNIK //
app.route('/api/pracownicy')
    .get((req, res) => {
        ListaPracownikow(req, res, db);
    })
    .post((req, res) => {
        DodajPracownika(req, res);
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
    .delete((req, res) => {
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

app.get('/api/logi', authenticateJWT, (req, res) => {
    PobierzLogi(req, res, db);
}
);

// CZAS > CZAS PRACY //
app.route('/api/czas')
    .get((req, res) => {
        PobierzCzasPracy(req, res, db);
    })
    .post((req, res) => {
        ZapiszCzasPracy(req, res, db);
    });

app.route('/api/czas/projekt')
    .post((req, res) => {
        GetCzasProjekt(req, res, db);
    });

app.get('/api/czas/projekty/dodane', (req, res) => {
    PobierzDodaneProjekty(req, res, db);
});
/////////////////////////////////////////

// PLAN TYGODNIA "V" > PLAN TYGODNIA //
app.route('/api/planTygodnia')
    .get((req, res) => {
        if (req.query.previous) {
            PracownicyPoprzedniTydz(req, res);
        } else {
            PlanTygodniaPlan(req, res);
        }
    })
    .put((req, res) => {
        PrzeniesWpisPlan(req, res);
    })
    .delete((req, res) => {
        UsunWpisPlan(req, res);
    });

app.get('/api/planTygodnia/drukuj', (req, res) => {
    DrukujGrupe(req, res);
});

app.put('/api/planTygodnia/:employeeId', (req, res ) => {
    AktualizujM1_5(req, res, db);
});
/////////////////////////////////////////

// PLAN TYGODNIA "V" > ZAPLANUJ //
app.route('/api/planTygodnia/zaplanuj')
    .get((req, res) => {
        GetPlany(req, res);
    })
    .post((req, res) => {
        DodajZaplanuj(req, res);
    })
    .delete((req, res) => {
        UsunPlan(req, res);
    });
/////////////////////////////////////////


// CZAS > PROJEKTY //
app.get('/api/czas/projekty', (req, res) => {
    GetProjekty(req, res, db);
});
app.post('/api/czas/projekty', (req, res) => {
    DodajNowyProjekt(req, res, db);
});
app.post('/api/czas/grupa', (req, res) => {
    DodajNowaGrupe(req, res, db);
});
app.get('/api/czas/szukaj', (req, res) => {
    SzukajProjekt(req, res, db);
});
app.put('/api/czas/przeniesAkt', (req, res) => {
    PrzeniesAkt(req, res, db);
});
app.put('/api/czas/przeniesNieakt', (req, res) => {
    PrzeniesNieakt(req, res, db);
});
app.delete('/api/czas/usun', (req, res) => {
    UsunProjekt(req, res, db);
});
app.get('/api/czas/projekty/:id', (req, res) => {
    PobierzProjekt(req, res, db);
});
app.put('/api/czas/edytujProjekt/:id', (req, res) => {
    EdytujProjekt(req, res, db);
});
app.get('/api/czas/pobierzGrupe/:id', (req, res) => {
    PobierzGrupe(req, res, db);
});
app.put('/api/czas/edytujGrupe/:id', (req, res) => {
    EdytujGrupe(req, res, db);
});
/////////////////////////////////////////

// CZAS > URLOPY //
app.get('/api/urlopy', (req, res) => {
    GetUrlopy(req, res, db);
});
app.post('/api/urlopy', (req, res) => {
    DodajUrlop(req, res, db);
});
app.put('/api/urlopy', (req, res) => {
    ZatwierdzUrlop(req, res, db);
});
app.delete('/api/urlopy', (req, res) => {
    UsunUrlop(req, res, db);
});
// pobieranie danych dla drukowania pdf urlopow
app.post('/api/urlopy/pdf', (req, res) => {
    urlopyPdf(req, res, db);
});
app.put('/api/urlopy/:vacationId', (req, res) => {
    EdytujUrlop(req, res, db);
});

/////////////////////////////////////////

// CZAS > TYDZIEN //
app.get('/api/tydzien/:numericWeek', (req, res) => {
    GetTydzien(req, res, db);
});
app.post('/api/tydzien', (req, res) => {
    OtworzTydzienCzas(req, res, db);
});
app.delete('/api/tydzien', (req, res) => {
    ZamknijTydzienCzas(req, res, db);
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
        PobierzPojazdy(req, res, db);
    })
    .post((req, res) => {
        DodajPojazd(req, res, db);
    });

app.delete('/api/pojazdy/:id', (req, res) => {
    UsunPojazd(req, res, db);
});
/////////////////////////////////////////

// CZAS > SPRAWDZ SAMOCHOD //
app.get('/api/samochody', (req, res) => {
    PobierzSamochody(req, res, db);
});
/////////////////////////////////////////

// CZAS > RAPORTY //
app.get('/api/raporty', (req, res) => {
    PobierzRaporty(req, res);
});

app.get('/api/generujRaport', (req, res) => {
    GenerujRaport(req, res);
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
    DostepneGrupy(req, res, db);
});

app.delete('/api/grupy/:id', (req, res) => {
    UsuwanieGrupy(req, res, db);
});

app.get('/api/firmy', (req, res) => {
    PobierzDostepneFirmy(req, res, db);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
}
);