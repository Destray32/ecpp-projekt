const express = require('express');
const app = express();
app.use(express.json());
const port = 5000;
const cors = require('cors');

// api importy z folderu api
const ListaPracownikow = require('./api/Pracownik/pracownik.lista');
const UsunPracownika = require('./api/Pracownik/pracownik.usun');
const MojeDane = require('./api/Pracownik/pracownik.mojedane');
const DodajPracownika = require('./api/Pracownik/pracownik.dodaj');
const PobierzPracownika = require('./api/Pracownik/pracownik.pobierzpracownika');
const EdytujPracownika = require('./api/Pracownik/pracownik.edytujpracownika');

const PlanTygodniaPlan = require('./api/PlanTygodnia/plantygodnia.plan.planTygodnia');
const DostepneGrupy = require('./api/Grupy/grupy.dostepnegrupy');
const DrukujGrupe = require('./api/PlanTygodnia/plantygodnia.plan.drukujGrupe');
const PrzeniesWpisPlan = require('./api/PlanTygodnia/plantygodnia.plan.przenies');
const UsunWpisPlan = require('./api/PlanTygodnia/plantygodnia.plan.usun');
const PracownicyPoprzedniTydz = require('./api/PlanTygodnia/plantygodnia.plan.pracPoprzedni');
const DodajZaplanuj = require('./api/PlanTygodnia/plantygodnia.zaplanuj.dodajPlan');
const GetPlany = require('./api/PlanTygodnia/plantygodnia.zaplanuj.getPlany');
const UsunPlan = require('./api/PlanTygodnia/plantygodnia.zaplanuj.usunPlan');

const GetProjekty = require('./api/Czas/Projekty/czas.projekty.getProjekty');
const UsunProjekt = require('./api/Czas/Projekty/czas.projekty.usunProjekt');
const SzukajProjekt = require('./api/Czas/Projekty/czas.projekty.szukajProjekt');
const PrzeniesAkt = require('./api/Czas/Projekty/czas.projekty.przeniesAkt');
const PrzeniesNieakt = require('./api/Czas/Projekty/czas.projekty.przeniesNieakt');
const DodajNowyProjekt = require('./api/Czas/Projekty/czas.projekty.dodajNowy');
const DodajNowaGrupe = require('./api/Czas/Projekty/czas.projekty.dodajNowaGrupa');

app.use(cors());
app.use(express.json());

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

app.get('/api/plan/drukuj', (req, res) => {
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
//////////////////////

// pobieranie grup z bazy danych
app.get('/api/grupy', (req, res) => {
    DostepneGrupy(req, res);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
}
);