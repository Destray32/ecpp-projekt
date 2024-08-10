function UsunPracownika(req, res) {
    const id = req.params.id;
    console.log("Usuwam pracownika o id: " + id);
    res.status(200).send();
}

module.exports = UsunPracownika;