import React, { useState, useEffect } from "react";
import { format, startOfWeek, addWeeks, subWeeks, getWeek, addDays, differenceInHours, getDay } from 'date-fns';
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Axios from "axios";
import 'primeicons/primeicons.css';

import AmberBox from "../../Components/AmberBox"
import CheckboxInput from "../../Components/CheckboxInput";
import PracownikData from "../../data/ZaplanujTydzienData";

export default function ZaplanujTydzienPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filtrujPracownika, setFiltrujPracownika] = useState(false);
    const [availableGroups, setAvailableGroups] = useState(['grupa1', 'grupa2']);
    const [wybranaGrupa, setWybranaGrupa] = useState('');
    const [opis, setOpis] = useState('');
    const [naziwsko, setNazwisko] = useState('');
    const [plany, setPlany] = useState([]);

    const handleFiltrujPracownika = (value) => {
        setFiltrujPracownika(value);
    }

    const getWeekNumber = (date) => {
        return getWeek(date, { weekStartsOn: 1 });
    };

    const previousWeek = () => {
        setCurrentDate(subWeeks(currentDate, 1));
    };

    const nextWeek = () => {
        setCurrentDate(addWeeks(currentDate, 1));
    };

    // useEffect(() => {
    //     console.log(opis);
    // }, [opis]);

    const formatWeek = (date) => {
        const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'dd.MM.yyyy');
        const end = format(addWeeks(startOfWeek(date, { weekStartsOn: 1 }), 1), 'dd.MM.yyyy');
        return `${start} - ${end}`;
    };

    const handleZaplanuj = () => {
        Axios.post('http://localhost:5000/api/planTygodnia/zaplanuj', {
            dataOd: format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd.MM.yyyy'),
            dataDo: format(addWeeks(startOfWeek(currentDate, { weekStartsOn: 1 }), 1), 'dd.MM.yyyy'),
            nazwisko: naziwsko,
            imie: 'Jan',
            firma: 'firma1',
            grupa: wybranaGrupa.name,
            opis: opis
        }).then((response) => {
            console.log(response.data);
        });
    }
    const handleOpis = (e) => {
        setOpis(e.target.value);
    }
    const handleNazwisko = (e) => {
        setNazwisko(e.target.value);
    }

    const handleUsun = (index) => {
        console.log('Usun', index);
        Axios.delete(`http://localhost:5000/api/planTygodnia/zaplanuj?id=${index}`)
            .then((response) => {
                console.log(response.data);
            });
    }

    useEffect(() => {
        // pobiernie grup
        Axios.get('http://localhost:5000/api/grupy')
            .then((response) => {
                setAvailableGroups(response.data);
            });

        
    }, []);

    useEffect(() => {
        // pobieranie planow w danym tygodniu
        Axios.get(`http://localhost:5000/api/planTygodnia/zaplanuj?from=${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd.MM.yyyy')}&to=${format(addWeeks(startOfWeek(currentDate, { weekStartsOn: 1 }), 1), 'dd.MM.yyyy')}`)
            .then((response) => {
                console.log(response.data);
                setPlany(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [currentDate]); // gdy zmieni sie wybrana data, pobierz nowe dane

    return (
        <div className="p-4 flex flex-col gap-12">
            <AmberBox style={"p-4"}>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center space-x-2">
                        <Button label="Poprzedni" icon="pi pi-arrow-left" className="p-button-outlined" onClick={previousWeek} />
                        <p className="text-lg font-bold">Tydzień {getWeekNumber(currentDate)} : {formatWeek(currentDate)}</p>
                        <Button label="Następny" icon="pi pi-arrow-right" iconPos="right" className="p-button-outlined" onClick={nextWeek} />
                    </div>
                    <div className="flex flex-row justify-between items-center gap-32">
                        <span>Pracownik</span>
                        <CheckboxInput onChangeInput={handleNazwisko}
                            onChangeCheckBox={handleFiltrujPracownika}
                            label={"Nazwisko"} />
                        <div className="flex flex-row items-center gap-8">
                            <span className="">Opis</span>
                            <InputText onChange={handleOpis} placeholder="" className="p-4" />
                        </div>
                        <Button label="Zaplanuj" onClick={handleZaplanuj}
                            className="p-button-raised bg-white p-4" />
                    </div>
                    <div className="flex flex-row items-center gap-8">
                        <span>Grupa</span>
                        <Dropdown value={wybranaGrupa} onChange={(e) => setWybranaGrupa(e.value)}
                            options={availableGroups} optionLabel="name"
                            editable placeholder="" autoComplete='off'
                            className="md:w-14rem p-4" />
                    </div>
                </div>
            </AmberBox>
            <div>
                <div className="outline outline-1 outline-gray-500">
                    <table className="w-full">
                        <thead className="bg-blue-700 text-white">
                            <tr>
                                <th className="border-r">Data od</th>
                                <th className="border-r">Data do</th>
                                <th className="border-r">Nazwisko</th>
                                <th className="border-r">Imię</th>
                                <th className="border-r">Firma</th>
                                <th className="border-r">Grupa</th>
                                <th className="border-r">Opis</th>
                                <th className="border-r"></th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {plany.map((item, i) => (
                                <tr key={i} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                    <td className="border-r">{item.dataOd}</td>
                                    <td className="border-r">{item.dataDo}</td>
                                    <td className="border-r">{item.naziwsko}</td>
                                    <td className="border-r">{item.imie}</td>
                                    <td className="border-r">{item.firma}</td>
                                    <td className="border-r">{item.grupa}</td>
                                    <td className="border-r">{item.opis}</td>
                                    <td className="border-r">
                                        <i className="pi pi-trash" onClick={() => handleUsun(i)}></i>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}