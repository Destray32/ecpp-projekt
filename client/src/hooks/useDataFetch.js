
import { useState, useEffect } from 'react';
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
                    Axios.get("http://47.76.209.242:5000/api/pracownicy"),
                    Axios.get("http://47.76.209.242:5000/api/firmy"),
                    Axios.get("http://47.76.209.242:5000/api/grupy"),
                    Axios.get("http://47.76.209.242:5000/api/czas/projekty"),
                    Axios.get("http://47.76.209.242:5000/api/pojazdy")
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
