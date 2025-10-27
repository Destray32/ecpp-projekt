function PobierzRaporty(req, res) {
    // Sprawdź czy użytkownik ma odpowiednie uprawnienia
    if (!req.user.role === 'Administrator' && !hasSpecialAccess(req.user, 'raporty')) {
        return res.status(403).json({ error: 'Brak uprawnień do przeglądania raportów' });
    }

    const projekty = [
        {
            id: 1,
            nazwa: "NCW"
        },
        {
            id: 2,
            nazwa: "NCW2"
        },
        {
            id: 3,
            nazwa: "NCW3"
        }
    ];

    res.json(projekty);
}

module.exports = PobierzRaporty;
