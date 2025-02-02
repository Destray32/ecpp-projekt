function DodajZaplanuj(req, res, db) {
    const { dataOd, dataDo, pracownicy, grupa, opis } = req.body;

    if (!dataOd || !dataDo || !pracownicy || !grupa) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    
    const vehicles = [];
    const employees = [];
    
    pracownicy.forEach(item => {
        if (item.startsWith('vehicle-')) {
            vehicles.push(item.replace('vehicle-', ''));
        } else if (item.startsWith('employee-')) {
            employees.push(item.replace('employee-', ''));
        }
    });

    function getWeekOfYear(date) {
        const startDate = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + 1) / 7);
    }
    
    const startDate = new Date(dataOd);
    const weekOfYear = getWeekOfYear(startDate);
    const year = startDate.getFullYear();
    
    const formattedDataOd = startDate.toISOString().split('T')[0];
    const formattedDataDo = new Date(dataDo).toISOString().split('T')[0];

    const m_value = 'M1';
    
    const employeeValues = employees.map(employee => [
        formattedDataOd,
        formattedDataDo,
        weekOfYear,
        year,
        employee,           
        grupa,
        opis,
        null,
        m_value                
    ]);
    
    const vehicleValues = vehicles.map(vehicle => [
        formattedDataOd,
        formattedDataDo,
        weekOfYear,
        year,
        null,               
        grupa,
        opis,
        vehicle,
        m_value           
    ]);
    
    const sql = `
        INSERT INTO Plan_Tygodnia_V (data_od, data_do, tydzienRoku, Rok, Pracownik_idPracownik, Grupa_urlopowa_idGrupa_urlopowa, opis, Pojazdy_idPojazdy, m_value)
        VALUES ?
    `;
    
    const allValues = [...employeeValues, ...vehicleValues];
    
    db.query(sql, [allValues], (err, result) => {
        if (err) {
            console.error('Database insertion error:', err);
            return res.status(500).json({ status: 'error', message: 'Database insertion error' });
        }
        res.status(200).json({ status: 'success', message: 'Data inserted successfully' });
    });
    
}

module.exports = DodajZaplanuj;