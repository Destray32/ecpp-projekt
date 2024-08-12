function PobierzOgloszenia(req, res) {
    const ogloszenia = [
        {
            do: 'grupy',
            grupa: ['grupa1', 'grupa2'],
            tytul: 'Ogłoszenie 1',
            tresc: 'Treść ogłoszenia 1',
        },
        {
            do: 'osoby',
            osoby: ['osoba1', 'osoba2'],
            tytul: 'Ogłoszenie 2',
            tresc: 'Treść ogłoszenia 2',
        },
    ];

    res.send(ogloszenia);
}

module.exports = PobierzOgloszenia;