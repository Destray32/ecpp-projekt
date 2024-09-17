import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { format, startOfWeek, addWeeks, subWeeks, getWeek, set } from 'date-fns';
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

    const from = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const to = format(addWeeks(startOfWeek(currentDate, { weekStartsOn: 1 }), 1), 'yyyy-MM-dd');


    const previousWeek = () => {
        setCurrentDate(subWeeks(currentDate, 1));
    };

    const nextWeek = () => {
        setCurrentDate(addWeeks(currentDate, 1));
    };

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
        //doc.save("drukuj-grupe.pdf");
        const pdfBlob = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);

        window.open(pdfURL, '_blank');
    };

    const getWeekNumber = (date) => {
        return getWeek(date, { weekStartsOn: 1 });
    };
    
    const formatWeek = (date) => {
        const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'dd.MM.yyyy');
        const end = format(addWeeks(startOfWeek(date, { weekStartsOn: 1 }), 1), 'dd.MM.yyyy');
        return `${start} - ${end}`;
    };


    const handleDrukujGrupe = () => {
        Axios.get(`http://localhost:5000/api/planTygodnia/drukuj?group=${group.name}`, { withCredentials: true })
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
        console.log("Usuwane:", selectedRowIds);
        Axios.delete('http://localhost:5000/api/planTygodnia', {
            withCredentials: true,
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
    
    
        Axios.put('http://localhost:5000/api/planTygodnia', payload, { withCredentials: true })
            .then(res => {
                fetchData();
            })
            .catch(err => {
                console.error("Error transferring selected employees:", err);
            });
    };

    const handleSkopiuj = () => {
        Axios.get('http://localhost:5000/api/planTygodnia?previous=true', { withCredentials: true })
            .then(res => {
                let newData = res.data;

                // Update the week number in the newData (assuming there's a 'week' field)
                newData = newData.map(item => {
                    return {
                        ...item,
                        tydzienRoku: getWeekNumber() // Here you change the week to 39 or current week dynamically
                    };
                });

                setPracownikData(prevData => {
                    const combinedData = [
                        ...prevData,
                        ...newData.filter(newItem => !prevData.some(existingItem => existingItem.id === newItem.id))
                    ];
                    return combinedData;
                });
                })
                .catch(err => console.error(err));
    }

    // obsługa zmiany grupy w dropdownie
    const handleChangeGroupFilter = (e) => {
        const selectedGroup = e.value;
        setGroup(selectedGroup);
        
        let url = `http://localhost:5000/api/planTygodnia/zaplanuj?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
        if (selectedGroup) {
            url += `&group=${encodeURIComponent(selectedGroup.name)}`;
        }
        
        Axios.get(url, { withCredentials: true })
            .then(res => {
                setPracownikData(res.data);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const fetchData = () => {
        Axios.get('http://localhost:5000/api/grupy', { withCredentials: true })
            .then(res => {
                setAvailableGroups(res.data.grupy.map(group => ({ name: group.Zleceniodawca, id: group.id })));
            })
            .catch(err => console.error(err));


        Axios.get(`http://localhost:5000/api/planTygodnia/zaplanuj?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { withCredentials: true })
            .then(res => {
                const data = res.data;
                const sortedData = data.sort((a, b) => {
                    if (a.pracownikId && !b.pracownikId) {
                        return -1;
                    } else if (!a.pracownikId && b.pracownikId) {
                        return 1;
                    }
                    return 0; 
                });
                setPracownikData(sortedData);
                
                const m1 = [];
                const m2 = [];
                const m3 = [];
                const m4 = [];
                const m5 = [];
    
                data.forEach((item) => {
                    const roles = item.m_value ? item.m_value.split(',') : [];
                    if (roles.includes('m1')) m1.push(item.id);
                    if (roles.includes('m2')) m2.push(item.id);
                    if (roles.includes('m3')) m3.push(item.id);
                    if (roles.includes('m4')) m4.push(item.id);
                    if (roles.includes('m5')) m5.push(item.id);
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

    const handleRadioChange = (employeeId, selectedM) => {
        const updatedData = pracownikData.map((item) =>
            item.id === employeeId ? { ...item, M1_5: selectedM } : item
        );
        setPracownikData(updatedData);
    
        Axios.put(`http://localhost:5000/api/planTygodnia/${employeeId}`, {
            M1_5: selectedM,
        }, { withCredentials: true })
            .then((res) => {
                fetchData();
            })
            .catch((err) => {
                console.error('Error updating employee:', err);
            });
    };



    return (
        <main>
            <div className="w-auto h-auto m-2 p-3 bg-amber-100 outline outline-1
            outline-gray-500 flex flex-row items-center space-x-4">
                <div className="w-3/4 h-40 flex flex-col space-y-2 items-start">
                    <div className="h-full">
                        <div className="h-full flex flex-col justify-around">
                            <div className="flex flex-row gap-32 items-center">
                            <div className="flex items-center space-x-2">
                                <Button icon="pi pi-arrow-left" className="p-button-outlined" onClick={previousWeek} />
                                <p className="text-lg font-bold">Tydzień {getWeekNumber(currentDate)} : {formatWeek(currentDate)}</p>
                                <Button icon="pi pi-arrow-right" iconPos="right" className="p-button-outlined" onClick={nextWeek} />
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
                                    <th className="border-r w-1/5">Grupa</th>
                                    <th className="border-r">M1</th>
                                    <th className="border-r">M2</th>
                                    <th className="border-r">M3</th>
                                    <th className="border-r">M4</th>
                                    <th className="border-r">M5</th>
                                    <th className="border-r w-1/4">Opis</th>
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
                                        <td className="border-r">{item.nazwisko ? item.nazwisko : item.pojazd || 'No Data'}</td>
                                        <td className="border-r">{item.imie}</td>
                                        <td className="border-r">{item.Zleceniodawca}</td>
                                        <td className="border-r">
                                        <input
                                            type="radio"
                                            checked={item.m_value === 'm1'}
                                            onChange={() => handleRadioChange(item.id, 'm1')}
                                        />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="radio"
                                                checked={item.m_value === 'm2'}
                                                onChange={() => handleRadioChange(item.id, 'm2')}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="radio"
                                                checked={item.m_value === 'm3'}
                                                onChange={() => handleRadioChange(item.id, 'm3')}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="radio"
                                                checked={item.m_value === 'm4'}
                                                onChange={() => handleRadioChange(item.id, 'm4')}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="radio"
                                                checked={item.m_value === 'm5'}
                                                onChange={() => handleRadioChange(item.id, 'm5')}
                                            />
                                        </td>
                                        <td className="border-r">{item.Opis}</td>
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