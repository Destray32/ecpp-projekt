function ListaPracownikow(req, res) {
    res.json([
        { id: 1, name: "Jan", surname: "Kowalski", pesel: "12345678901", vacationGroup: 1, company: "Hejmej Plat",
          phone1: "123456789", phone2: "123456789", email: "test@wp.pl", manager: "Jan Kowalski" },
        { id: 2, name: "Anna", surname: "Nowak", pesel: "12345678901", vacationGroup: 2, company: "Polbygg",
          phone1: "123456789", phone2: "123456789", email: "nictakiego@wp.pl", manager: "Maria Kowalska" },
        { id: 3, name: "Maria", surname: "Kowalska", pesel: "12345678901", vacationGroup: 1, company: "Polbygg",
          phone1: "123456789", phone2: "123456789", email: "cosinnego@wp.pl", manager: "Janusz Kowalski" },
        { id: 4, name: "Janusz", surname: "Kowalski", pesel: "12345678901", vacationGroup: 3, company: "Hejmej Plat",
          phone1: "123456789", phone2: "123456789", email: "test@wp.pl", manager: "Jan Kowalski" },
        { id: 5, name: "Jan", surname: "Kowalski", pesel: "12345678901", vacationGroup: 1, company: "Hejmej Plat",
          phone1: "123456789", phone2: "123456789", email: "test@p.pl", manager: "Jan Kowalski" },
        { id: 6, name: "Ewa", surname: "Nowak", pesel: "12345678902", vacationGroup: 2, company: "Hejmej Plat",
          phone1: "987654321", phone2: "987654321", email: "ewa@wp.pl", manager: "Anna Nowak" },
        { id: 7, name: "Piotr", surname: "Zalewski", pesel: "12345678903", vacationGroup: 1, company: "Polbygg",
          phone1: "456789123", phone2: "456789123", email: "piotr@wp.pl", manager: "Maria Kowalska" },
        { id: 8, name: "Katarzyna", surname: "Wiśniewska", pesel: "12345678904", vacationGroup: 3, company: "Polbygg",
          phone1: "321654987", phone2: "321654987", email: "katarzyna@wp.pl", manager: "Janusz Kowalski" },
        { id: 9, name: "Michał", surname: "Pawlak", pesel: "12345678905", vacationGroup: 2, company: "Hejmej Plat",
          phone1: "741852963", phone2: "741852963", email: "michal@wp.pl", manager: "Jan Kowalski" },
        { id: 10, name: "Agnieszka", surname: "Kaczmarek", pesel: "12345678906", vacationGroup: 1, company: "Polbygg",
          phone1: "852963741", phone2: "852963741", email: "agnieszka@wp.pl", manager: "Anna Nowak" }
    ]);
}

module.exports = ListaPracownikow;
