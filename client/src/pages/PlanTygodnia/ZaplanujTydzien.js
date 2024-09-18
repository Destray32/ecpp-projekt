import React, { useState, useEffect, useCallback } from "react";
import { format, startOfWeek, addWeeks, subWeeks, getWeek, parseISO } from 'date-fns';
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Axios from "axios";
import 'primeicons/primeicons.css';
import EmployeeDropdown from "../../Components/PlanTygodniaV/EmployeeDropdown";
import AmberBox from "../../Components/AmberBox"
import {notification } from 'antd';

export default function ZaplanujTydzienPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [wybranaGrupa, setWybranaGrupa] = useState('');
    const [zleceniodawcy, setZleceniodawcy] = useState([]);
    const [opis, setOpis] = useState('');
    const [plany, setPlany] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [scheduledEmployees, setScheduledEmployees] = useState([]);


    const getWeekNumber = (date) => {
        return getWeek(date, { weekStartsOn: 1 });
    };

    const previousWeek = () => {
        setCurrentDate(subWeeks(currentDate, 1));
    };

    const nextWeek = () => {
        setCurrentDate(addWeeks(currentDate, 1));
    };

    const formatWeek = (date) => {
        const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'dd.MM.yyyy');
        const end = format(addWeeks(startOfWeek(date, { weekStartsOn: 1 }), 1), 'dd.MM.yyyy');
        return `${start} - ${end}`;
    };

    const fetchPlany = useCallback(() => {
        const from = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const to = format(addWeeks(startOfWeek(currentDate, { weekStartsOn: 1 }), 1), 'yyyy-MM-dd');

        Axios.get(`http://localhost:5000/api/planTygodnia/zaplanuj?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
            { withCredentials: true })
            .then((response) => {
                const sortedData = response.data.sort((a, b) => {
                    if (a.pracownikId && !b.pracownikId) {
                        return -1;
                    } else if (!a.pracownikId && b.pracownikId) {
                        return 1;
                    }
                    return 0; 
                });
            
                setPlany(sortedData);

                const employees = [];
                const vehicles = [];
            
                sortedData.forEach(plan => {
                    if (plan.pracownikId) {
                        employees.push({ id: plan.pracownikId });
                    } else if (plan.pojazdId) {
                        vehicles.push({ idPojazdy: plan.pojazdId });
                    }
                });
            
                const formattedEmployees = Array.from(new Set(employees.map(e => e.id))).map(id => ({ id }));
                const formattedVehicles = Array.from(new Set(vehicles.map(v => v.idPojazdy))).map(idPojazdy => ({ idPojazdy }));
            
                setScheduledEmployees({ employees: formattedEmployees, vehicles: formattedVehicles });
            
                
            })
            .catch((error) => {
                console.log(error);
            });
    }, [currentDate]);

    const handleZaplanuj = () => {
        if (selectedEmployees.length === 0 || !wybranaGrupa || !opis) {
            notification.error({
                message: 'Puste pola',
                description: 'Wypełnij wszystkie pola',
                placement: 'topRight',
            });
            return;
        }

        Axios.post('http://localhost:5000/api/planTygodnia/zaplanuj', {
            dataOd: format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
            dataDo: format(addWeeks(startOfWeek(currentDate, { weekStartsOn: 1 }), 1), 'yyyy-MM-dd'),
            pracownicy: selectedEmployees,
            grupa: wybranaGrupa,
            opis: opis
        }, { withCredentials: true})
        .then((response) => {
            fetchPlany();
            setSelectedEmployees([]);
            notification.success({
                message: 'Sukces',
                description: 'Pracownik został dodany',
                placement: 'topRight',
            });
        });
    }

    const handleOpis = (e) => {
        setOpis(e.target.value);
    }

    const handleUsun = (planId) => {
        Axios.delete(`http://localhost:5000/api/planTygodnia/zaplanuj?id=${planId}`, { withCredentials: true })
            .then((response) => {
                fetchPlany();
            })
            .catch((error) => {
                console.error('Error deleting plan:', error);
            });
    }

    const handleEmployeeSelect = (employees) => {
        setSelectedEmployees(employees);
    };

    useEffect(() => {
        Axios.get('http://localhost:5000/api/grupy', { withCredentials: true })
            .then((response) => {
                const groups = response.data.grupy;
                const filteredGroups = groups.filter(group => group.Plan_tygodniaV === 1);
                setZleceniodawcy(filteredGroups.map((zleceniodawca) => ({
                    label: zleceniodawca.Zleceniodawca,
                    value: zleceniodawca.id
                })));
            })
            .catch((error) => {
                console.error("Error fetching groups:", error);
            });
    }, []);

    useEffect(() => {
        fetchPlany();
    }, [fetchPlany]);

    const formatDate = (dateString) => {
        const date = parseISO(dateString);
        return format(date, 'yyyy-MM-dd');
    };

    return (
        <div className="p-2 flex flex-col">
            <AmberBox>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center space-x-2">
                        <Button icon="pi pi-arrow-left" className="p-button-outlined" onClick={previousWeek} />
                        <p className="text-lg font-bold">Tydzień {getWeekNumber(currentDate)} : {formatWeek(currentDate)}</p>
                        <Button icon="pi pi-arrow-right" iconPos="right" className="p-button-outlined" onClick={nextWeek} />
                    </div>
                    <div className="flex flex-row justify-between items-center gap-8">
                        <span>Pracownik</span>
                        <EmployeeDropdown 
                            onEmployeeSelect={handleEmployeeSelect} 
                            scheduledEmployees={scheduledEmployees}
                        />
                        <div className="flex flex-row items-center gap-8">
                            <span className="">Opis</span>
                            <InputText onChange={(handleOpis)} placeholder="" className="p-3" />
                        </div>
                        <Button label="Zaplanuj" onClick={handleZaplanuj}
                            className="p-button-raised bg-white p-2" />
                    </div>
                    <div className="flex flex-row items-center gap-8">
                        <span>Grupa</span>
                        <Dropdown
                            value={wybranaGrupa}
                            onChange={(e) => setWybranaGrupa(e.value)}
                            options={zleceniodawcy}
                            optionLabel="label"
                            editable
                            placeholder=""
                            autoComplete="off"
                            className="md:w-14rem p-3"
                        />
                    </div>
                </div>
            </AmberBox>
            <div className="p-2">
                <div className="outline outline-1 outline-gray-500">
                    <table className="w-full fixed-table">
                        <thead className="bg-blue-700 text-white">
                            <tr>
                                <th className="border-r w-1/8">Data od</th>
                                <th className="border-r w-1/8">Data do</th>
                                <th className="border-r w-1/10">Nazwisko</th>
                                <th className="border-r w-1/8">Imię</th>
                                <th className="border-r w-1/6">Grupa</th>
                                <th className="border-r w-1/4">Opis</th>
                                <th className="border-r w-1/10"></th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {plany.map((item) => (
                                <tr key={item.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                    <td className="border-r">{formatDate(item.data_od)}</td>
                                    <td className="border-r">{formatDate(item.data_do)}</td>
                                    <td className="border-r">{item.nazwisko ? item.nazwisko : item.pojazd || 'No Data'}</td>
                                    <td className="border-r">{item.imie}</td>
                                    <td className="border-r">{item.Zleceniodawca}</td>
                                    <td className="border-r">{item.Opis}</td>
                                    <td className="border-r">
                                        <i className="pi pi-trash" onClick={() => handleUsun(item.id)}></i>
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