function generujRaport(req, res) {
    const { user, projectId, startDate, endDate } = req.query;
    const userId = user[0];
    const params = {
        user: userId,
        projectId,
        startDate,
        endDate,
    };

    console.log(params);
    res.json(params);
}

module.exports = generujRaport;