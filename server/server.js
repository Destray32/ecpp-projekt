const express = require('express');
const app = express();
app.use(express.json());
const port = 5000;
const cors = require('cors');

// api importy z folderu api
// Pracownik
const ListaPracownikow = require('./api/Pracownik/Pracownik/pracownik.lista');
const UsunPracownika = require('./api/Pracownik/Pracownik/pracownik.usun');
const MojeDane = require('./api/Pracownik/Pracownik/pracownik.mojedane');
const DodajPracownika = require('./api/Pracownik/Pracownik/pracownik.dodaj');
const PobierzPracownika = require('./api/Pracownik/Pracownik/pracownik.pobierzpracownika');
const EdytujPracownika = require('./api/Pracownik/Pracownik/pracownik.edytujpracownika');
const PobierzLogi = require('./api/Pracownik/pracownik.logowanie');

// Czas > Czas Pracy
const ZapiszCzasPracy = require('./api/Czas/CzasPracy/czas.czaspracy.zapisz');
const PobierzCzasPracy = require('./api/Czas/CzasPracy/czas.czaspracy.pobierz');
const ZamknijTydzien = require('./api/Czas/CzasPracy/czas.czaspracy.zamknij');
const OtworzTydzien = require('./api/Czas/CzasPracy/czas.czaspracy.otworz');

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

// Czas > Pojazdy
const PobierzPojazdy = require('./api/Czas/Pojazdy/pojazdy.pobierz');
const UsunPojazd = require('./api/Czas/Pojazdy/pojazdy.usun');
const DodajPojazd = require('./api/Czas/Pojazdy/pojazdy.dodaj');

app.use(cors());
app.use(express.json());

// PRACOWNIK > PRACOWNIK //
app.route('/api/pracownicy')
    .get((req, res) => {
        ListaPracownikow(req, res);
    })
    .post((req, res) => {
        DodajPracownika(req, res);
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
    PobierzLogi(req, res);
}
);

// CZAS > CZAS PRACY //
app.route('/api/czas')
    .get((req, res) => {
        PobierzCzasPracy(req, res);
    })
    .post((req, res) => {
        ZapiszCzasPracy(req, res);
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

app.route('/api/plan/zaplanuj')
    .get((req, res) => {
        GetPlany(req, res);
    })
    .post((req, res) => {
        DodajZaplanuj(req, res);
    })
    .delete((req, res) => {
        UsunPlan(req, res);
    });


// CZAS > PROJEKTY //
app.get('/api/czas/projekty', (req, res) => {
    GetProjekty(req, res);
});
app.post('/api/czas/projekty', (req, res) => {
    DodajNowyProjekt(req, res);
});
app.post('/api/czas/grupa', (req, res) => {
    DodajNowaGrupe(req, res);
});
app.get('/api/czas/szukaj', (req, res) => {
    SzukajProjekt(req, res);
});
app.put('/api/czas/przeniesAkt', (req, res) => {
    PrzeniesAkt(req, res);
});
app.put('/api/czas/przeniesNieakt', (req, res) => {
    PrzeniesNieakt(req, res);
});
app.delete('/api/czas/usun', (req, res) => {
    UsunProjekt(req, res);
});
/////////////////////////////////////////

// CZAS > POJAZDY //
app.route('/api/pojazdy')
    .get((req, res) => {
        PobierzPojazdy(req, res);
    })
    .post((req, res) => {
        DodajPojazd(req, res);
    });

app.delete('/api/pojazdy/:id', (req, res) => {
    UsunPojazd(req, res);
});
/////////////////////////////////////////

// pobieranie grup z bazy danych
app.get('/api/grupy', (req, res) => {
    DostepneGrupy(req, res);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
}
);