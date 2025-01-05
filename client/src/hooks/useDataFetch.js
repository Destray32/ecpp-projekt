
import { useState, useEffect } from 'react';
import { API_URL } from '../config/config.js';
import Axios from 'axios';

export const useDataFetch = () => {
    const [pracownicy, setPracownicy] = useState([]);
    const [samochody, setSamochody] = useState([]);
    const [firmy, setFirmy] = useState([]);
    const [zleceniodawcy, setZleceniodawcy] = useState([]);
    const [dostepneProjekty, setDostepneProjekty] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pracownicyRes, firmyRes, zleceniodawcyRes, projektyRes, samochodyRes] = await Promise.all([
                    Axios.get(`https://api-service-ecpp.onrender.com/api/pracownicy`),
                    Axios.get(`https://api-service-ecpp.onrender.com/api/firmy`),
                    Axios.get(`https://api-service-ecpp.onrender.com/api/grupy`),
                    Axios.get(`https://api-service-ecpp.onrender.com/api/czas/projekty`),
                    Axios.get(`https://api-service-ecpp.onrender.com/api/pojazdy`)
                ]);

                setPracownicy(pracownicyRes.data.map(p => ({ label: `${p.name} ${p.surname}`, value: `${p.name} ${p.surname}` })));
                setFirmy(firmyRes.data.map(f => ({ label: f.Nazwa_firmy, value: f.Nazwa_firmy })));
                setZleceniodawcy(zleceniodawcyRes.data.grupy.map(z => ({ label: z.Zleceniodawca, value: z.Zleceniodawca })));
                setDostepneProjekty(projektyRes.data.projekty.map(p => ({ label: p.NazwaKod_Projektu, value: p.NazwaKod_Projektu })));
                setSamochody(samochodyRes.data.pojazdy.map(p => ({ label: p.numerRejestracyjny, value: p.numerRejestracyjny })));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    return { pracownicy, firmy, zleceniodawcy, dostepneProjekty, samochody };
};
