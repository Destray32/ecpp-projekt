const express = require('express');
const app = express();
app.use(express.json());
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

app.delete('/api/employees/:id', (req, res) => {
    res.json({ status: "ok" });
}
);

app.get('/api/myData', (req, res) => {
    res.json({
        surename: "Kowalski",
        name: "Jan",
        brithday: "01.01.1990",
        pesel: "12345678901",
        street: "Kwiatowa 1",
        zip: "00-000",
        city: "Warszawa",
        country: "Polska",
        phone1: "123456789",
        phone2: "123456789",
        email: "test@wp.pl",
        relative1: "Maria Kowalska",
        relative2: "Jan Kowalski",
        NIP: "1234567890",
        startDate: "01.01.2010",
        endDate: "",
        paycheckCode: "123 456 789",
        vehicle: 1,
        weeklyPlan: true,
        printVacation: true,
        login: "jkowalski",
        active: true,
        role: 1,
        newPassword: "",
        confirmPassword: "",
    });
}
);

app.post('/api/addEmployee', (req, res) => {
    console.log(req.body);
    res.json({ status: "ok" });
}
);

app.get('/api/editEmployee/:id', (req, res) => {
    res.json({
        surename: "Kowalski",
        name: "Jan",
        brithday: "01.01.1990",
        pesel: "12345678901",
        street: "Kwiatowa 1",
        zip: "00-000",
        city: "Warszawa",
        country: "Polska",
        phone1: "123456789",
        phone2: "123456789",
        email: "test@wp.pl",
        relative1: "Maria Kowalska",
        relative2: "Jan Kowalski",
        NIP: "1234567890",
        startDate: "01.01.2010",
        endDate: "",
        paycheckCode: "123 456 789",
        vehicle: 1,
        weeklyPlan: true,
        printVacation: true,
        login: "jkowalski",
        active: true,
        role: 1,
        newPassword: "",
        confirmPassword: "",
    });
}
);

app.put('/api/editEmployee/:id', (req, res) => {
    console.log(req.body);
    res.json({ status: "ok" });
}
);

app.delete('/api/employees/:id', (req, res) => {
    res.json({ status: "ok" });
}
);

app.get('/api/myData', (req, res) => {
    res.json({
        surename: "Kowalski",
        name: "Jan",
        brithday: "01.01.1990",
        pesel: "12345678901",
        street: "Kwiatowa 1",
        zip: "00-000",
        city: "Warszawa",
        country: "Polska",
        phone1: "123456789",
        phone2: "123456789",
        email: "test@wp.pl",
        relative1: "Maria Kowalska",
        relative2: "Jan Kowalski",
        NIP: "1234567890",
        startDate: "01.01.2010",
        endDate: "",
        paycheckCode: "123 456 789",
        vehicle: 1,
        weeklyPlan: true,
        printVacation: true,
        login: "jkowalski",
        active: true,
        role: 1,
        newPassword: "",
        confirmPassword: "",
    });
}
);

app.post('/api/addEmployee', (req, res) => {
    console.log(req.body);
    res.json({ status: "ok" });
}
);

app.get('/api/editEmployee/:id', (req, res) => {
    res.json({
        surename: "Kowalski",
        name: "Jan",
        brithday: "01.01.1990",
        pesel: "12345678901",
        street: "Kwiatowa 1",
        zip: "00-000",
        city: "Warszawa",
        country: "Polska",
        phone1: "123456789",
        phone2: "123456789",
        email: "test@wp.pl",
        relative1: "Maria Kowalska",
        relative2: "Jan Kowalski",
        NIP: "1234567890",
        startDate: "01.01.2010",
        endDate: "",
        paycheckCode: "123 456 789",
        vehicle: 1,
        weeklyPlan: true,
        printVacation: true,
        login: "jkowalski",
        active: true,
        role: 1,
        newPassword: "",
        confirmPassword: "",
    });
}
);

app.put('/api/editEmployee/:id', (req, res) => {
    console.log(req.body);
    res.json({ status: "ok" });
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