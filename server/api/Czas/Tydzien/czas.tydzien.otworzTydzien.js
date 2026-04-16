function OtworzTydzienCzas(req, res, db) {
    // Sprawdź czy użytkownik ma odpowiednie uprawnienia
    if (!['Administrator', 'Biuro'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Brak uprawnień do otwierania tygodnia' });
    }

    const { tydzienRoku, pracownikId } = req.body; 

    // Tylko Administrator może otwierać dowolne tygodnie
    // Biuro i specjalne uprawnienia - tylko bieżący tydzień
    const isAdmin = req.user.role === 'Administrator';
    
    if (!isAdmin) {
        // Oblicz bieżący tydzień zgodnie z ISO 8601 (tydzień zaczyna się w poniedziałek)
        const now = new Date();
        
        // Funkcja do obliczania tygodnia ISO 8601
        function getISOWeek(date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            // Czwartek w bieżącym tygodniu decyduje o roku
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            const yearStart = new Date(d.getFullYear(), 0, 1);
            const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
            return weekNo;
        }
        
        const currentWeekNumber = getISOWeek(now);

        // tydzienRoku z frontendu to tylko numer tygodnia (np. 43)
        // Porównaj jako liczby
        const requestedWeek = parseInt(tydzienRoku);
        
        console.log('Week check:', { currentWeekNumber, requestedWeek, userRole: req.user.role });
        
        if (requestedWeek !== currentWeekNumber) {
            return res.status(400).json({ 
                error: 'Można otwierać tylko bieżący tydzień',
                message: `Otwieranie tygodnia jest możliwe tylko dla bieżącego tygodnia (tydzień ${currentWeekNumber}). Próbujesz otworzyć tydzień ${requestedWeek}. Tylko Administrator może otwierać dowolne tygodnie.`
            });
        }
    }

    const sql = "UPDATE tydzien SET Status_tygodnia = 'Otwarty' WHERE tydzienRoku = ? AND Pracownik_idPracownik IN (?)";
    
    db.query(sql, [tydzienRoku, pracownikId], (err, result) => {
        if (err) {
            console.log(err);
            res.status(400).send('Błąd otwierania tygodnia');
        } else {
            res.status(200).send('Otwarto tydzień');
        }
    });
}

module.exports = OtworzTydzienCzas;
