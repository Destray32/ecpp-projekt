function MojeDane(req, res) {
    res.json({
        surename: "Kowalski",
        name: "Jan",
        brithday: "01.01.1990",
        pesel: "12345678901",
        street: "Kwiatowa 1",
        zip: "00-000",
        city: "Warszawa",
        country: "Polska",
        phone1: "123456789",
        phone2: "123456789",
        email: "test@wp.pl",
        relative1: "Maria Kowalska",
        relative2: "Jan Kowalski",
        NIP: "1234567890",
        startDate: "01.01.2010",
        endDate: "",
        paycheckCode: "123 456 789",
        vehicle: 1,
        weeklyPlan: true,
        printVacation: true,
        login: "jkowalski",
        active: true,
        role: 1,
        newPassword: "",
        confirmPassword: "",
    });
}

module.exports = MojeDane;