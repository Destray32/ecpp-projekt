function ZamknijTydzień(req, res) {
    const body = req.body;
    res.json({ message: 'Zamknięto tydzień' });
    console.log(body, 'Zamknięto tydzień');
}

module.exports = ZamknijTydzień;