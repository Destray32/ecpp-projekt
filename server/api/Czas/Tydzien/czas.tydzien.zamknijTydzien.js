
function ZamknijTydzienCzas(req, res) {
    const {id} = req.body;
    console.log('ZamknijTydzienCzas id:', id);

    res.status(200).json({message: 'Zamknieto tydzien dla id ' + id});
}

module.exports = ZamknijTydzienCzas;