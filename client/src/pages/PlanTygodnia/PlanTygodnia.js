import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DatePicker } from 'antd';
import { format, startOfWeek, addWeeks, subWeeks, getWeek, addDays, differenceInHours, getDay } from 'date-fns';
import Axios from "axios";

import PracownikData from "../../data/PlanTygodniaData";
import AmberBox from "../../Components/AmberBox";

import "primereact/resources/themes/lara-light-cyan/theme.css";


export default function PlanTygodniaPage() {
    const [availableGroups, setAvailableGroups] = useState([]);
    const [group, setGroup] = useState('');
    const [grupaPrzenies, setGrupaPrzenies] = useState('');
    const [pracownikData, setPracownikData] = useState([]);
    const [selectedRowIds, setSelectedRowIds] = useState([]); // stan do pierwszej kolumny z checkboxami
    const [currentDate, setCurrentDate] = useState(new Date());
    // stany do śledzenia zaznaczonych checkboxów w kolumnach M1-M5
    const [selectedM1, setSelectedM1] = useState([]);
    const [selectedM2, setSelectedM2] = useState([]);
    const [selectedM3, setSelectedM3] = useState([]);
    const [selectedM4, setSelectedM4] = useState([]);
    const [selectedM5, setSelectedM5] = useState([]);

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

    // podglad stanu zaznaczonych checkboxów
    useEffect(() => {
        console.log('Selected rows:', selectedRowIds);
        console.log('Selected M1:', selectedM1);
        console.log('Selected M2:', selectedM2);
        console.log('Selected M3:', selectedM3);
        console.log('Selected M4:', selectedM4);
        console.log('Selected M5:', selectedM5);
    }, [selectedRowIds, selectedM1, selectedM2, selectedM3, selectedM4, selectedM5]);


    const handleDrukujGrupe = () => {
        Axios.get(`http://localhost:5000/api/planTygodnia/drukuj?group=${group.name}`)
            .then(res => {
                console.log(res.data);
            })
            .catch(err => console.error(err));
    }

    const handleDrukuj = () => {
        // logika drukowania na frontendzie
        console.log('Drukuj');
    }

    const handleUsunZaznaczone = () => {
        Axios.delete('http://localhost:5000/api/planTygodnia', {
            data: {
                id: selectedRowIds
            }
        })
            .then(res => {
                console.log(res.data);
            })
            .catch(err => console.error(err));
    }

    const handlePrzeniesZaznaczone = () => {
        console.log(selectedRowIds);
        console.log(grupaPrzenies);
        Axios.put('http://localhost:5000/api/planTygodnia', {
            id: selectedRowIds,
            grupa: grupaPrzenies.name
        })
            .then(res => {
                console.log(res.data);
            })
            .catch(err => console.error(err));
    }


    const handleSkopiuj = () => {
        // na razie podmienia dane na pracowników z poprzedniego tygodnia, ale może trzeba ich tylko dodac?
        Axios.get('http://localhost:5000/api/planTygodnia?previous=true')
            .then(res => {
                console.log(res.data);
                setPracownikData(res.data);
            })
            .catch(err => console.error(err));
    }

    useEffect(() => {
        // pobieranie dostępnych grup z serwera
        Axios.get('http://localhost:5000/api/grupy')
            .then(res => {
                //console.log(res.data);
                setAvailableGroups(res.data);
            })
            .catch(err => console.error(err));

        // pobieranie danych pracowników z serwera
        Axios.get('http://localhost:5000/api/planTygodnia')
            .then(res => {
                //console.log(res.data);
                setPracownikData(res.data);
            })
            .catch(err => console.error(err));
    }, []);



    // funkcja do obsługi zmiany stanu checkboxa w pierwszej kolumnie
    const handleRowCheckboxChange = (rowIndex) => {
        setSelectedRowIds(prevSelectedRows => {
            if (prevSelectedRows.includes(rowIndex)) {
                return prevSelectedRows.filter(id => id !== rowIndex);
            } else {
                return [...prevSelectedRows, rowIndex];
            }
        });
    };

    const handleSelectAll = (columnIndex) => {
        switch (columnIndex) {
            case 4:
                setSelectedM1(prevSelectedM1 =>
                    prevSelectedM1.length === PracownikData.sampleData.length ? [] : PracownikData.sampleData.map((_, i) => i)
                );
                break;
            case 5:
                setSelectedM2(prevSelectedM2 =>
                    prevSelectedM2.length === PracownikData.sampleData.length ? [] : PracownikData.sampleData.map((_, i) => i)
                );
                break;
            case 6:
                setSelectedM3(prevSelectedM3 =>
                    prevSelectedM3.length === PracownikData.sampleData.length ? [] : PracownikData.sampleData.map((_, i) => i)
                );
                break;
            case 7:
                setSelectedM4(prevSelectedM4 =>
                    prevSelectedM4.length === PracownikData.sampleData.length ? [] : PracownikData.sampleData.map((_, i) => i)
                );
                break;
            case 8:
                setSelectedM5(prevSelectedM5 =>
                    prevSelectedM5.length === PracownikData.sampleData.length ? [] : PracownikData.sampleData.map((_, i) => i)
                );
                break;
            default:
                break;
        }
    };

    // funkcja do obsługi zmiany stanu checkboxa w kolumnach M1-M5
    // przepraszam za wielki switch ;_;
    const handleColumnCheckboxChange = (columnIndex, rowIndex) => {
        switch (columnIndex) {
            case 4:
                setSelectedM1(prevSelectedM1 => {
                    if (prevSelectedM1.includes(rowIndex)) {
                        return prevSelectedM1.filter(id => id !== rowIndex);
                    } else {
                        return [...prevSelectedM1, rowIndex];
                    }
                });
                break;
            case 5:
                setSelectedM2(prevSelectedM2 => {
                    if (prevSelectedM2.includes(rowIndex)) {
                        return prevSelectedM2.filter(id => id !== rowIndex);
                    } else {
                        return [...prevSelectedM2, rowIndex];
                    }
                });
                break;
            case 6:
                setSelectedM3(prevSelectedM3 => {
                    if (prevSelectedM3.includes(rowIndex)) {
                        return prevSelectedM3.filter(id => id !== rowIndex);
                    } else {
                        return [...prevSelectedM3, rowIndex];
                    }
                });
                break;
            case 7:
                setSelectedM4(prevSelectedM4 => {
                    if (prevSelectedM4.includes(rowIndex)) {
                        return prevSelectedM4.filter(id => id !== rowIndex);
                    } else {
                        return [...prevSelectedM4, rowIndex];
                    }
                });
                break;
            case 8:
                setSelectedM5(prevSelectedM5 => {
                    if (prevSelectedM5.includes(rowIndex)) {
                        return prevSelectedM5.filter(id => id !== rowIndex);
                    } else {
                        return [...prevSelectedM5, rowIndex];
                    }
                });
                break;
            default:
                break;
        }
    };

    return (
        <main>
            <div className="w-auto h-auto m-2 p-3 bg-amber-100 outline outline-1
            outline-gray-500 flex flex-row items-center space-x-4">
                <div className="w-3/4 h-72 flex flex-col space-y-2 items-start">
                    <div className="h-full">
                        <div className="h-full flex flex-col justify-around">
                            <div className="flex flex-row gap-32 items-center">
                                <div className="flex items-center space-x-2">
                                    <Button label="Poprzedni" icon="pi pi-arrow-left" className="p-button-outlined" onClick={previousWeek} />
                                    <p className="text-lg font-bold">Tydzień {getWeekNumber(currentDate)} : {formatWeek(currentDate)}</p>
                                    <Button label="Następny" icon="pi pi-arrow-right" iconPos="right" className="p-button-outlined" onClick={nextWeek} />
                                </div>
                            </div>
                            <div>
                                <span>Grupa</span>
                                <Dropdown value={group} onChange={(e) => setGroup(e.value)}
                                    options={availableGroups} optionLabel="name"
                                    editable placeholder="" autoComplete='off'
                                    className="ml-4 md:w-14rem p-4" />
                            </div>
                        </div>
                    </div>

                </div>
                <div className="flex gap-24">
                    <Button label="Drukuj grupe" className="bg-white w-[9rem] h-[3rem]"
                        text raised onClick={handleDrukujGrupe} />
                    <Button label="Drukuj" className="bg-white w-[9rem] h-[3rem]"
                        text raised onClick={handleDrukuj} />
                </div>
            </div>


            <div class="grid grid-cols-[3fr,1fr] gap-5">
                <div id="lewa" class="grid grid-cols-auto-fit gap-2.5 p-4">
                    <div className="outline outline-1 outline-gray-500">
                        <table className="w-full">
                            <thead className="bg-blue-700 text-white">
                                <tr>
                                    <th className="border-r"></th>
                                    <th className="border-r">Nazwisko</th>
                                    <th className="border-r">Imię</th>
                                    <th className="border-r">Grupa</th>
                                    <th className="border-r" onClick={() => handleSelectAll(4)}>M1</th>
                                    <th className="border-r" onClick={() => handleSelectAll(5)}>M2</th>
                                    <th className="border-r" onClick={() => handleSelectAll(6)}>M3</th>
                                    <th className="border-r" onClick={() => handleSelectAll(7)}>M4</th>
                                    <th className="border-r" onClick={() => handleSelectAll(8)}>M5</th>
                                    <th className="border-r">Opis</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {pracownikData.map((item, i) => (
                                    <tr key={i} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedRowIds.includes(i)}
                                                onChange={() => handleRowCheckboxChange(i)}
                                            />
                                        </td>
                                        <td className="border-r">{item.surname}</td>
                                        <td className="border-r">{item.name}</td>
                                        <td className="border-r">{item.vacationGroup}</td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM1.includes(i)}
                                                onChange={() => handleColumnCheckboxChange(4, i)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM2.includes(i)}
                                                onChange={() => handleColumnCheckboxChange(5, i)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM3.includes(i)}
                                                onChange={() => handleColumnCheckboxChange(6, i)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM4.includes(i)}
                                                onChange={() => handleColumnCheckboxChange(7, i)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM5.includes(i)}
                                                onChange={() => handleColumnCheckboxChange(8, i)}
                                            />
                                        </td>
                                        <td className="border-r">{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>



                <div id="prawa" class="flex flex-col gap-5 mr-2">
                    <AmberBox>
                        <div className="mx-auto flex flex-col justify-between items-center p-4 ">
                            <p>Przenieś zaznaczone do</p>
                            <Dropdown value={grupaPrzenies} onChange={(e) => setGrupaPrzenies(e.value)}
                                options={availableGroups} optionLabel="name"
                                editable placeholder="" autoComplete='off'
                                className="ml-4 md:w-14rem p-4" />
                            <Button label="Przenieś" className="bg-white w-[9rem] h-[3rem] mt-4"
                                text raised onClick={handlePrzeniesZaznaczone} />
                        </div>
                    </AmberBox>
                    <AmberBox>
                        <div className="mx-auto flex flex-col justify-between items-center p-4 ">
                            <p>Skasuj zaznaczone</p>
                            <Button label="Usuń" className="bg-white w-[9rem] h-[3rem]"
                                text raised onClick={handleUsunZaznaczone} />
                        </div>
                    </AmberBox>
                    <AmberBox>
                        <div className="mx-auto flex flex-col justify-between items-center p-4 ">
                            <p>Skopiuj pracowników z poprzedniego tygodnia</p>
                            <Button label="Skopiuj" className="bg-white w-[9rem] h-[3rem]"
                                text raised onClick={handleSkopiuj} />
                        </div>
                    </AmberBox>
                </div>
            </div>
        </main>
    )
}