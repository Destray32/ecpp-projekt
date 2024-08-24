import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { format, startOfWeek, addWeeks, subWeeks, getWeek } from 'date-fns';
import Axios from "axios";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import AmberBox from "../../Components/AmberBox";

import "primereact/resources/themes/lara-light-cyan/theme.css";

export default function PlanTygodniaPage() {
    const [availableGroups, setAvailableGroups] = useState([]);
    const [group, setGroup] = useState(null);
    const [grupaPrzenies, setGrupaPrzenies] = useState(null);
    const [pracownikData, setPracownikData] = useState([]);
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedM1, setSelectedM1] = useState([]);
    const [selectedM2, setSelectedM2] = useState([]);
    const [selectedM3, setSelectedM3] = useState([]);
    const [selectedM4, setSelectedM4] = useState([]);
    const [selectedM5, setSelectedM5] = useState([]);

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFont("OpenSans-Regular", "normal");

        const columns = [
            { header: "Nazwisko", dataKey: "data" },
            { header: "Imię", dataKey: "dane" },
            { header: "Grupa", dataKey: "pojazd" },
            { header: "M1", dataKey: "m1" },
            { header: "M2", dataKey: "m2" },
            { header: "M3", dataKey: "m3" },
            { header: "M4", dataKey: "m4" },
            { header: "M5", dataKey: "m5" },
            { header: "Opis", dataKey: "opis" }
        ];

        const rows = pracownikData.map(item => ({
            data: item.surname,
            dane: item.name,
            pojazd: item.vacationGroup,
            m1: item.M1,
            m2: item.M2,
            m3: item.M3,
            m4: item.M4,
            m5: item.M5,
            opis: item.description
        }));

        doc.autoTable({
            head: [columns.map(col => col.header)],
            body: rows.map(row => columns.map(col => row[col.dataKey])),
            startY: 20,
            theme: 'striped',
            styles: {
                font: "OpenSans-Regular",
                halign: 'center'
            },
            headStyles: {
                font: "OpenSans-Regular",
                fontStyle: "bold"
            }
        });

        doc.text("Grupa", 14, 10);
        doc.save("drukuj-grupe.pdf");
    };

    const getWeekNumber = (date) => {
        return getWeek(date, { weekStartsOn: 1 });
    };
    
    const formatWeek = (date) => {
        const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'dd.MM.yyyy');
        const end = format(addWeeks(startOfWeek(date, { weekStartsOn: 1 }), 1), 'dd.MM.yyyy');
        return `${start} - ${end}`;
    };

    // podglad stanu zaznaczonych checkboxów
    // useEffect(() => {
    //     console.log('Selected rows:', selectedRowIds);
    //     console.log('Selected M1:', selectedM1);
    //     console.log('Selected M2:', selectedM2);
    //     console.log('Selected M3:', selectedM3);
    //     console.log('Selected M4:', selectedM4);
    //     console.log('Selected M5:', selectedM5);
    // }, [selectedRowIds, selectedM1, selectedM2, selectedM3, selectedM4, selectedM5]);

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
        generatePDF();
    }

    const handleUsunZaznaczone = () => {
        Axios.delete('http://localhost:5000/api/planTygodnia', {
            data: {
                id: selectedRowIds
            }
        })
            .then(res => {
                fetchData();
            })
            .catch(err => console.error(err));
    }
    

    // obsługa przyciusku przeniesienia zaznaczonych pracowników do innej grupy
    const handlePrzeniesZaznaczone = () => {
        if (!grupaPrzenies) {
            console.error("Nie wybrano grupy do przeniesienia.");
            return;
        }
    
        const payload = {
            ids: selectedRowIds,
            groupId: grupaPrzenies
        };
    
        console.log("Przenoszone:", payload);
    
        Axios.put('http://localhost:5000/api/planTygodnia', payload)
            .then(res => {
                fetchData();
            })
            .catch(err => {
                console.error("Error transferring selected employees:", err);
            });
    };

    const handleSkopiuj = () => {
        Axios.get('http://localhost:5000/api/planTygodnia?previous=true')
            .then(res => {
                const newData = res.data;
                setPracownikData(prevData => {
                    const combinedData = [
                        ...prevData,
                        ...newData.filter(newItem => !prevData.some(existingItem => existingItem.id === newItem.id))
                    ];
                    return combinedData;
                });
    
                const newSelectedM1 = [];
                const newSelectedM2 = [];
                const newSelectedM3 = [];
                const newSelectedM4 = [];
                const newSelectedM5 = [];
    
                newData.forEach(item => {
                    const roles = item.M1_5 ? item.M1_5.split(',') : [];
                    if (roles.includes('M1')) newSelectedM1.push(item.id);
                    if (roles.includes('M2')) newSelectedM2.push(item.id);
                    if (roles.includes('M3')) newSelectedM3.push(item.id);
                    if (roles.includes('M4')) newSelectedM4.push(item.id);
                    if (roles.includes('M5')) newSelectedM5.push(item.id);
                });
    
                setSelectedM1(prevSelectedM1 => [...new Set([...prevSelectedM1, ...newSelectedM1])]);
                setSelectedM2(prevSelectedM2 => [...new Set([...prevSelectedM2, ...newSelectedM2])]);
                setSelectedM3(prevSelectedM3 => [...new Set([...prevSelectedM3, ...newSelectedM3])]);
                setSelectedM4(prevSelectedM4 => [...new Set([...prevSelectedM4, ...newSelectedM4])]);
                setSelectedM5(prevSelectedM5 => [...new Set([...prevSelectedM5, ...newSelectedM5])]);
            })
            .catch(err => console.error(err));
    }

    // obsługa zmiany grupy w dropdownie
    const handleChangeGroupFilter = (e) => {
        if (e.value) {
            setGroup(e.value);
            Axios.get(`http://localhost:5000/api/planTygodnia?group=${e.value.name}`)
                .then(res => {
                    setPracownikData(res.data);
                })
                .catch(err => console.error(err));
        } else {
            setGroup(null);
            Axios.get('http://localhost:5000/api/planTygodnia')
                .then(res => {
                    setPracownikData(res.data);
                })
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        Axios.get('http://localhost:5000/api/grupy')
            .then(res => {
                setAvailableGroups(res.data.grupy.map(group => ({ name: group.Zleceniodawca, id: group.id })));
            })
            .catch(err => console.error(err));
    
        Axios.get('http://localhost:5000/api/planTygodnia')
            .then(res => {
                const data = res.data;
                setPracownikData(data);
                console.log(data);
    
                const m1 = [];
                const m2 = [];
                const m3 = [];
                const m4 = [];
                const m5 = [];
    
                data.forEach((item) => {
                    const roles = item.M1_5 ? item.M1_5.split(',') : [];
                    if (roles.includes('M1')) m1.push(item.id);
                    if (roles.includes('M2')) m2.push(item.id);
                    if (roles.includes('M3')) m3.push(item.id);
                    if (roles.includes('M4')) m4.push(item.id);
                    if (roles.includes('M5')) m5.push(item.id);
                });
    
                setSelectedM1(m1);
                setSelectedM2(m2);
                setSelectedM3(m3);
                setSelectedM4(m4);
                setSelectedM5(m5);
            })
            .catch(err => console.error(err));
    };

    // funkcja do obsługi zmiany stanu checkboxa w pierwszej kolumnie
    const handleRowCheckboxChange = (employeeId) => {
        setSelectedRowIds(prevSelectedRows => {
            if (prevSelectedRows.includes(employeeId)) {
                return prevSelectedRows.filter(id => id !== employeeId);
            } else {
                return [...prevSelectedRows, employeeId];
            }
        });
    };

    const handleSelectAll = (columnIndex) => {
        switch (columnIndex) {
            case 4:
                setSelectedM1(prevSelectedM1 =>
                    prevSelectedM1.length === pracownikData.length ? [] : pracownikData.map((_, i) => i)
                );
                break;
            case 5:
                setSelectedM2(prevSelectedM2 =>
                    prevSelectedM2.length === pracownikData.length ? [] : pracownikData.map((_, i) => i)
                );
                break;
            case 6:
                setSelectedM3(prevSelectedM3 =>
                    prevSelectedM3.length === pracownikData.length ? [] : pracownikData.map((_, i) => i)
                );
                break;
            case 7:
                setSelectedM4(prevSelectedM4 =>
                    prevSelectedM4.length === pracownikData.length ? [] : pracownikData.map((_, i) => i)
                );
                break;
            case 8:
                setSelectedM5(prevSelectedM5 =>
                    prevSelectedM5.length === pracownikData.length ? [] : pracownikData.map((_, i) => i)
                );
                break;
            default:
                break;
        }
    };

    // funkcja do obsługi zmiany stanu checkboxa w kolumnach M1-M5
    // przepraszam za wielki switch ;_;
    const handleColumnCheckboxChange = (columnIndex, employeeId) => {
        switch (columnIndex) {
            case 4:
                setSelectedM1(prevSelectedM1 => {
                    if (prevSelectedM1.includes(employeeId)) {
                        return prevSelectedM1.filter(id => id !== employeeId);
                    } else {
                        return [...prevSelectedM1, employeeId];
                    }
                });
                break;
            case 5:
                setSelectedM2(prevSelectedM2 => {
                    if (prevSelectedM2.includes(employeeId)) {
                        return prevSelectedM2.filter(id => id !== employeeId);
                    } else {
                        return [...prevSelectedM2, employeeId];
                    }
                });
                break;
            case 6:
                setSelectedM3(prevSelectedM3 => {
                    if (prevSelectedM3.includes(employeeId)) {
                        return prevSelectedM3.filter(id => id !== employeeId);
                    } else {
                        return [...prevSelectedM3, employeeId];
                    }
                });
                break;
            case 7:
                setSelectedM4(prevSelectedM4 => {
                    if (prevSelectedM4.includes(employeeId)) {
                        return prevSelectedM4.filter(id => id !== employeeId);
                    } else {
                        return [...prevSelectedM4, employeeId];
                    }
                });
                break;
            case 8:
                setSelectedM5(prevSelectedM5 => {
                    if (prevSelectedM5.includes(employeeId)) {
                        return prevSelectedM5.filter(id => id !== employeeId);
                    } else {
                        return [...prevSelectedM5, employeeId];
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
                                    <p className="text-lg font-bold">Tydzień {getWeekNumber(currentDate)} : {formatWeek(currentDate)}</p>
                                </div>
                            </div>
                            <div>
                                <span>Grupa</span>
                                <Dropdown value={group} onChange={handleChangeGroupFilter}
                                    options={availableGroups} optionLabel="name"
                                    editable placeholder="Wybierz grupę" autoComplete='off'
                                    showClear className="ml-4 md:w-14rem p-4" />
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
            <div className="grid grid-cols-[3fr,1fr] gap-5">
                <div id="lewa" className="grid grid-cols-auto-fit gap-2.5 p-4">
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
                                {pracownikData.map((item) => (
                                    <tr key={item.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedRowIds.includes(item.id)}
                                                onChange={() => handleRowCheckboxChange(item.id)}
                                            />
                                        </td>
                                        <td className="border-r">{item.surname}</td>
                                        <td className="border-r">{item.name}</td>
                                        <td className="border-r">{item.vacationGroup}</td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM1.includes(item.id)}
                                                onChange={() => handleColumnCheckboxChange(4, item.id)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM2.includes(item.id)}
                                                onChange={() => handleColumnCheckboxChange(5, item.id)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM3.includes(item.id)}
                                                onChange={() => handleColumnCheckboxChange(6, item.id)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM4.includes(item.id)}
                                                onChange={() => handleColumnCheckboxChange(7, item.id)}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="checkbox"
                                                checked={selectedM5.includes(item.id)}
                                                onChange={() => handleColumnCheckboxChange(8, item.id)}
                                            />
                                        </td>
                                        <td className="border-r">{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="prawa" className="flex flex-col gap-5 mr-2">
                    <AmberBox>
                        <div className="mx-auto flex flex-col justify-between items-center p-4 ">
                            <p>Przenieś zaznaczone do</p>
                            <Dropdown
                                value={grupaPrzenies}
                                onChange={(e) => setGrupaPrzenies(e.value)}
                                options={availableGroups}
                                optionLabel="name"
                                optionValue="id"
                                editable
                                placeholder=""
                                autoComplete='off'
                                className="ml-4 md:w-14rem p-4"
                            />
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