
function OtworzTydzienCzas(req, res) {
    const {week} = req.body;
    console.log('OtworzTydzienCzas', week);

    res.status(200).json({message: 'Otworzono tydzien dla ' + week});
}

module.exports = OtworzTydzienCzas;