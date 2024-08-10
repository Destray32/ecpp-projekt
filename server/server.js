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
const PobierzLogi = require('./api/Pracownik/pracownik.logowanie');

const PlanTygodniaPlan = require('./api/PlanTygodnia/plantygodnia.plan');
const DostepneGrupy = require('./api/Grupy/grupy.dostepnegrupy');
const PrzeniesWpisPlan = require('./api/PlanTygodnia/plantygodnia.przenies');
const UsunWpisPlan = require('./api/PlanTygodnia/plantygodnia.usun');
const PracownicyPoprzedniTydz = require('./api/PlanTygodnia/plantygodnia.pracPoprzedni');
const DodajZaplanuj = require('./api/PlanTygodnia/plantygodnia.zaplanuj.dodajPlan');
const GetPlany = require('./api/PlanTygodnia/plantygodnia.zaplanuj.getPlany');
const UsunPlan = require('./api/PlanTygodnia/plantygodnia.zaplanuj.usunPlan');
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

app.get('/api/logi', (req, res) => {
    PobierzLogi(req, res);
}
);

app.route('/api/plan')
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


app.get('/api/grupy', (req, res) => {
    DostepneGrupy(req, res);
});

app.get('/api/grupy', (req, res) => {
    DostepneGrupy(req, res);
});



app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
}
);