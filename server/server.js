const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');

// api importy z folderu api
const PlanTygodniaPlan = require('./api/PlanTygodnia/plantygodnia.plan');
const DostepneGrupy = require('./api/Grupy/grupy.dostepnegrupy');
app.use(cors());


app.get('/api/employees', (req, res) => {
    res.json([
        { id: 1, name: 'John Doe', email: 'test@wp.pl' },
        { id: 2, name: 'Jane Doe', email: 'test2@p.pl' }
    ]);
}
);

app.get('/api/plan', (req, res) => {
    PlanTygodniaPlan(req, res);
});

app.get('/api/grupy', (req, res) => {
    DostepneGrupy(req, res);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
}
);