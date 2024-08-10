function EdytujPracownika(req, res) {
    const id = req.params.id;
    const dane = req.body;
    console.log("Edytuje pracownika o id: " + id);
    console.log(dane);
    res.status(200).send();
}

module.exports = EdytujPracownika;