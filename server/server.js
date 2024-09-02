const express = require('express');
const app = express();
app.use(express.json());
const port = 5000;
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
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

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

app.use(express.json({ type: 'application/json; charset=utf-8' }));
app.use(express.urlencoded({ extended: true, parameterLimit: 10000, charset: 'utf-8' }));

// api importy z folderu api
// Logowanie
const Logowanie = require('./api/logowanie');
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
const ZamknijTydzien = require('./api/Czas/CzasPracy/czas.czaspracy.zamknij');
const OtworzTydzien = require('./api/Czas/CzasPracy/czas.czaspracy.otworz');
const GetCzasProjekt = require('./api/Czas/CzasPracy/czas.czaspracy.getCzasProjekt');

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

// Czas > Projekty
const GetProjekty = require('./api/Czas/Projekty/czas.projekty.getProjekty');
const UsunProjekt = require('./api/Czas/Projekty/czas.projekty.usunProjekt');
const SzukajProjekt = require('./api/Czas/Projekty/czas.projekty.szukajProjekt');
const PrzeniesAkt = require('./api/Czas/Projekty/czas.projekty.przeniesAkt');
const PrzeniesNieakt = require('./api/Czas/Projekty/czas.projekty.przeniesNieakt');
const DodajNowyProjekt = require('./api/Czas/Projekty/czas.projekty.dodajNowy');
const DodajNowaGrupe = require('./api/Czas/Projekty/czas.projekty.dodajNowaGrupa');

// Czas > Urlopy
const GetUrlopy = require('./api/Czas/Urlopy/czas.urlopy.getUrlopy');
const DodajUrlop = require('./api/Czas/Urlopy/czas.urlopy.dodajUrlop');
const ZatwierdzUrlop = require('./api/Czas/Urlopy/czas.urlopy.zatwierdzUrlop');
const UsunUrlop = require('./api/Czas/Urlopy/czas.urlopy.usunUrlop');
const urlopyPdf = require('./api/Czas/Urlopy/czas.urlopy.urlopyPdf');

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

const PobierzDostepneFirmy = require('./api/pobierzDostepneFirmy');

// Logowanie
app.post('/api/logowanie', (req, res) => {
    Logowanie(req, res);
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
}
);
/////////////////////////////////////////

app.get('/api/logi', (req, res) => {
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
    .get((req, res) => {
        GetCzasProjekt(req, res, db);
    });

app.route('/api/czas/zamknij')
    .post((req, res) => {
        ZamknijTydzien(req, res);
    });

app.route('/api/czas/otworz')
    .post((req, res) => {
        OtworzTydzien(req, res);
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
app.get('/api/urlopy/pdf', (req, res) => {
    urlopyPdf(req, res, db);
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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
}
);