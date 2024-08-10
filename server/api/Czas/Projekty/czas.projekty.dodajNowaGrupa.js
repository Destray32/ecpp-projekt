
function DodajGrupe(req, res) {
    const {zleceniodawca, cennik, stawka, czyPlanTygV} = req.body;

    if (!zleceniodawca || !cennik || !stawka) {
        res.status(400).json({ message: 'Brak wymaganych danych' });
        return;
    } else {
        res.status(200).json({ message: 'Grupa dodana pomyslnie' });
    }
}

module.exports = DodajGrupe;