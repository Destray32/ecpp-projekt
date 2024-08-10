const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');

// api importy z folderu api
const PlanTygodniaPlan = require('./api/PlanTygodnia/plantygodnia.plan');
const DostepneGrupy = require('./api/Grupy/grupy.dostepnegrupy');
const PrzeniesWpisPlan = require('./api/PlanTygodnia/plantygodnia.przenies');
const UsunWpisPlan = require('./api/PlanTygodnia/plantygodnia.usun');
const PracownicyPoprzedniTydz = require('./api/PlanTygodnia/plantygodnia.pracPoprzedni');
app.use(cors());
app.use(express.json());


app.get('/api/employees', (req, res) => {
    res.json([
        { id: 1, name: "Jan", surname: "Kowalski",  pesel: "12345678901", vacationGroup: 1,company: "Hejmej Plat",
            phone1: "123456789",  phone2: "123456789", email: "test@wp.pl", manager: "Jan Kowalski" },
        { id: 2, name: "Anna", surname: "Nowak", pesel: "12345678901", vacationGroup: 2, company: "Polbygg",
            phone1: "123456789",  phone2: "123456789", email: "nictakiego@wp.pl", manager: "Maria Kowalska" },
        { id: 3, name: "Maria", surname: "Kowalska", pesel: "12345678901", vacationGroup: 1, company: "Polbygg",
            phone1: "123456789",  phone2: "123456789", email: "cosinnego@wp.pl", manager: "Janusz Kowalski" },
        { id: 4, name: "Janusz", surname: "Kowalski", pesel: "12345678901", vacationGroup: 3, company: "Hejmej Plat",
            phone1: "123456789",  phone2: "123456789", email: "test@wp.pl", manager: "Jan Kowalski" },
        { id: 5, name: "Jan", surname: "Kowalski", pesel: "12345678901", vacationGroup: 1, company: "Hejmej Plat",
            phone1: "123456789",  phone2: "123456789", email: "test@p.pl", manager: "Jan Kowalski" },
    ]);
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

app.get('/api/grupy', (req, res) => {
    DostepneGrupy(req, res);
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
}
);