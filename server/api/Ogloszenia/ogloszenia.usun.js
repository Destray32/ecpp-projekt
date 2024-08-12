function UsunOgloszenie (req, res) {
    console.log(`Usunieto ogloszenie o id: ${req.params.id}`);
    res.send('Usunieto ogloszenie');
}

module.exports = UsunOgloszenie;
