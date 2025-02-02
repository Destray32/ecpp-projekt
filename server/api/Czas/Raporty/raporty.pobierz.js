function PobierzRaporty(req, res) {
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
