function OtworzTydzien(req, res) {
    const body = req.body;
    res.json({ message: 'Otworzono tydzień' });
    console.log(body, 'Otworzono tydzień');
}

module.exports = OtworzTydzien;