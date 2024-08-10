const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');

app.use(cors());

app.get('/api/employees', (req, res) => {
    res.json([
        { id: 1, name: 'John Doe', email: 'test@wp.pl' },
        { id: 2, name: 'Jane Doe', email: 'test2@p.pl' }
    ]);
}
);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    }
);