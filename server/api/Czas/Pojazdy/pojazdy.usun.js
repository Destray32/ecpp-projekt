function UsunPojazd(req, res) {
    const { id } = req.params;
    console.log(id);
    res.json({ message: "Usunieto pojazd" });
}

module.exports = UsunPojazd;