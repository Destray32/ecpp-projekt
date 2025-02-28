import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { format, startOfWeek, addWeeks, subWeeks, getWeek, set, addDays } from 'date-fns';
import Axios from "axios";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { notification } from 'antd';
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";

import PDF_Drukujgrupe from "../../Components/PlanTygodniaV/PDF_Drukujgrupe";

import AmberBox from "../../Components/AmberBox";
import checkUserType from "../../utils/accTypeUtils";

import "primereact/resources/themes/lara-light-cyan/theme.css";

export default function PlanTygodniaPage() {
    const [availableGroups, setAvailableGroups] = useState([]);
    const [group, setGroup] = useState(null);
    const [grupaPrzenies, setGrupaPrzenies] = useState(null);
    const [pracownikData, setPracownikData] = useState([]);
    const [selectedRowIds, setSelectedRowIds] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [accountType, setAccountType] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [error, setError] = useState(false);
    const [isDialogVisible, setIsDialogVisible] = useState(false);


    useEffect(() => {
        checkUserType(setAccountType);
    }, []);

    const from = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const to = format(addDays(addWeeks(startOfWeek(currentDate, { weekStartsOn: 1 }), 1), -1), 'yyyy-MM-dd');


    const previousWeek = () => {
        setCurrentDate(subWeeks(currentDate, 1));
    };

    const nextWeek = () => {
        setCurrentDate(addWeeks(currentDate, 1));
    };

    const getWeekNumber = (date) => {
        return getWeek(date, { weekStartsOn: 1 });
    };
    
    const formatWeek = (date) => {
        const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'dd.MM.yyyy');
        const end = format(addDays(addWeeks(startOfWeek(date, { weekStartsOn: 1 }), 1), -1), 'dd.MM.yyyy');
        return `${start} - ${end}`;
    };


    const handleDrukujGrupe = () => {
        setDialogVisible(true); 
    };

    const handlePrintSelectedGroups = () => {
        const url = `http://localhost:5000/api/planTygodnia/zaplanuj?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
        Axios.get(url, { withCredentials: true })
            .then(res => {
                const Data = res.data;
                const selectedGroupsData = Data.filter(item => selectedGroups.some(g => g.id === item.grupaId));
                const sortedData = selectedGroupsData.sort((a, b) => {
                    if (a.pracownikId && !b.pracownikId) {
                        return -1;
                    } else if (!a.pracownikId && b.pracownikId) {
                        return 1;
                    }
                    return 0;
                });
                PDF_Drukujgrupe(sortedData, from, to);
                setDialogVisible(false); 
            })
            .catch(err => {
                console.error(err);
            });
    };

    const handleGroupSelection = (group, checked) => {
        const newSelectedGroups = checked
            ? [...selectedGroups, group]
            : selectedGroups.filter(g => g.id !== group.id);
        setSelectedGroups(newSelectedGroups);
    };



    const handleDrukuj = () => {
        if(!pracownikData.length) {
            notification.error({
                message: 'Błąd',
                description: 'Brak danych',
                placement: 'topRight',
            });
            return;
        }
        console.log(pracownikData); 
        PDF_Drukujgrupe(pracownikData, from, to);
    }

    const handleUsunZaznaczone = async () => {
        try {
            setPracownikData((prevData) => prevData.filter(item => !selectedRowIds.includes(item.id)));
    
            await Axios.delete('http://localhost:5000/api/planTygodnia', {
                withCredentials: true,
                data: { id: selectedRowIds }
            });
            fetchData();
            setSelectedRowIds([]);

        } catch (err) {
            console.error(err);
        }
    };
    
    
    
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
                setSelectedRowIds([]);
            })
            .catch(err => {
                console.error("Error transferring selected employees:", err);
            });
    };

    const handleSkopiuj = async () => {
        try {
            const previousWeekStart = format(subWeeks(startOfWeek(currentDate, { weekStartsOn: 1 }), 1), 'yyyy-MM-dd');
            const previousWeekEnd = format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), -1), 'yyyy-MM-dd');
    
            const [currentWeekResponse, previousWeekResponse] = await Promise.all([
                Axios.get(`http://localhost:5000/api/planTygodnia/zaplanuj?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { withCredentials: true }),
                Axios.get(`http://localhost:5000/api/planTygodnia/zaplanuj?from=${encodeURIComponent(previousWeekStart)}&to=${encodeURIComponent(previousWeekEnd)}`, { withCredentials: true })
            ]);
    
            const currentWeekData = currentWeekResponse.data;
            const previousWeekData = previousWeekResponse.data;
    
            const currentIds = new Set(currentWeekData.map(item => `${item.pracownikId || ''}-${item.pojazdId || ''}`));
    

            const newEntries = previousWeekData.filter(item => {
                const itemId = `${item.pracownikId || ''}-${item.pojazdId || ''}`;
                return !currentIds.has(itemId);
            });

            const entriesToAdd = newEntries.map(item => ({
                ...item,
                tydzienRoku: getWeekNumber(currentDate),
                data_od: format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                data_do: format(addDays(addWeeks(startOfWeek(currentDate, { weekStartsOn: 1 }), 1), -1), 'yyyy-MM-dd'),
            }));
    
            if (entriesToAdd.length > 0) {
                await Axios.post('http://localhost:5000/api/planTygodniaPrev', entriesToAdd, { withCredentials: true }); 
                fetchData();
                notification.success({
                    message: 'Sukces',
                    description: `Dodano ${entriesToAdd.length} nowych wpisów z poprzedniego tygodnia`,
                    placement: 'topRight',
                });
            } else {
                notification.info({
                    message: 'Informacja',
                    description: 'Brak nowych wpisów do dodania z poprzedniego tygodnia',
                    placement: 'topRight',
                });
            }
        } catch (err) {
            notification.error({
                message: 'Błąd',
                description: 'Wystąpił problem podczas kopiowania danych z poprzedniego tygodnia',
                placement: 'topRight',
            });
            console.error(err);
        }
    };
    
    const handleChangeGroupFilter = (e) => {
        const selectedGroup = e.value;

        if (!selectedGroup) {
            setGroup(null);  
            fetchData(null);    
        } else {
            setGroup(selectedGroup);
            fetchData(selectedGroup);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const fetchData = (selectedGroup = group) => {

        Axios.get('http://localhost:5000/api/grupy', { withCredentials: true })
            .then(res => {
                const groups = res.data.grupy;
                const filteredGroups = groups.filter(group => group.Plan_tygodniaV === 1);
                setAvailableGroups(filteredGroups.map(group => ({ name: group.Zleceniodawca, id: group.id })));
            })
            .catch(err => console.error(err));
    
 
        const url = `http://localhost:5000/api/planTygodnia/zaplanuj?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}${selectedGroup ? `&group=${encodeURIComponent(selectedGroup.name)}` : ''}`;
        
        Axios.get(url, { withCredentials: true })
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
            })
            .catch(err => console.error(err));
    };

    const confirmDeletion = () => {
        handleUsunZaznaczone();
        setIsDialogVisible(false);
    };

    const handleWheelScroll = (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const currentIndex = availableGroups.findIndex((g) => g.name === group?.name);
        if (currentIndex !== -1) {
            let nextIndex;
            if (e.deltaY < 0) {
                // Scroll up
                nextIndex = currentIndex === 0 ? availableGroups.length - 1 : currentIndex - 1;
            } else {
                // Scroll down
                nextIndex = (currentIndex + 1) % availableGroups.length;
            }
            const nextGroup = availableGroups[nextIndex];
            setGroup(nextGroup);  // Update the selected group
            fetchData(nextGroup);  // Fetch data for the new group
        }
    };

    const handlePrint = () => {
        if (selectedGroups.length === 0) {
            setError(true);
        } else {
            setError(false);
            handlePrintSelectedGroups();
        }
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
                            <div className="dropdown-container overflow-hidden" onWheel={handleWheelScroll} >
                            <span>Grupa</span>
                                <Dropdown 
                                    value={group} 
                                    onChange={handleChangeGroupFilter}
                                    options={availableGroups} 
                                    optionLabel="name"
                                    placeholder="Wybierz grupę" 
                                    autoComplete='off'
                                    showClear 
                                    className="ml-4 w-64 p-1"
                                    filter
                                    resetFilterOnHide
                                    filterInputAutoFocus
                                />
                            </div>

                        </div>
                    </div>
                </div>
                <div className="flex gap-16">
                    <Button label="Drukuj grupe" className="bg-white w-[9rem] h-[3rem]"
                        text raised onClick={handleDrukujGrupe} />
                    <Dialog header="Wybierz Grupy do Drukowania" visible={dialogVisible} style={{ width: '30vw' }}
                        onHide={() => setDialogVisible(false)}>
                        <div className="p-grid">
                            {availableGroups.map((group) => (
                                <div key={group.id} className="p-col-12 mb-1">
                                    <Checkbox
                                        inputId={group.id}
                                        value={group.name}
                                        onChange={(e) => handleGroupSelection(group, e.checked)}
                                        checked={selectedGroups.some(g => g.id === group.id)}
                                        className="border border-gray-500 mb-1"
                                    />
                                    <label htmlFor={group.id} className="p-checkbox-label">{group.name}</label>
                                </div>
                            ))}
                        </div>
                        {error && (
                            <div className="p-grid p-col-12 text-red-500 text-sm mt-2 mb-3">
                                Musisz wybrać co najmniej jedną grupę!
                            </div>
                        )}
                        <div className="p-grid">
                            <Button label="Drukuj Wybrane" className="bg-white w-[9rem] h-[3rem]" text raised onClick={handlePrintSelectedGroups  && handlePrint} />
                        </div>
                    </Dialog>
                    <Button label="Drukuj" className="bg-white w-[9rem] h-[3rem]"
                        text raised onClick={handleDrukuj} />
                </div>
            </div>
            <div className="grid grid-cols-[5fr,1fr]">
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
                                            checked={item.m_value === 'M1'}
                                            onChange={() => handleRadioChange(item.id, 'M1')}
                                        />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="radio"
                                                checked={item.m_value === 'M2'}
                                                onChange={() => handleRadioChange(item.id, 'M2')}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="radio"
                                                checked={item.m_value === 'M3'}
                                                onChange={() => handleRadioChange(item.id, 'M3')}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="radio"
                                                checked={item.m_value === 'M4'}
                                                onChange={() => handleRadioChange(item.id, 'M4')}
                                            />
                                        </td>
                                        <td className="border-r">
                                            <input
                                                type="radio"
                                                checked={item.m_value === 'M5'}
                                                onChange={() => handleRadioChange(item.id, 'M5')}
                                            />
                                        </td>
                                        <td className="border-r">{item.Opis}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="prawa" className="flex flex-col mr-2">
                    <AmberBox>
                        <div className="mx-auto flex flex-col justify-between items-center p-4 ">
                            <p className="text-center mb-2">Przenieś zaznaczone do</p>
                            <Dropdown
                                value={grupaPrzenies}
                                onChange={(e) => setGrupaPrzenies(e.value)}
                                options={availableGroups}
                                optionLabel="name"
                                optionValue="id"
                                placeholder=""
                                autoComplete='off'
                                filter
                                resetFilterOnHide
                                disabled={accountType !== 'Administrator'}
                                filterInputAutoFocus
                                className=" md:w-14rem p-1 w-full"
                            />
                            <Button label="Przenieś" className="bg-white w-[9rem] h-[3rem] mt-4"
                                text raised onClick={handlePrzeniesZaznaczone}
                                disabled={accountType !== 'Administrator'} />
                        </div>
                    </AmberBox>
                    <AmberBox>
                        <div className="mx-auto flex flex-col justify-between items-center p-4">
                            <p className="text-center mb-2">Skasuj zaznaczone</p>
                            <Button
                                label="Usuń"
                                className="bg-white w-[9rem] h-[3rem]"
                                text
                                raised
                                onClick={() => setIsDialogVisible(true)}
                                disabled={accountType !== 'Administrator'}
                            />
                        </div>
                        <Dialog
                            header="Potwierdzenie Usunięcia"
                            visible={isDialogVisible}
                            style={{ width: '25vw' }}
                            onHide={() => setIsDialogVisible(false)}
                        >
                            <p className="text-center">Czy na pewno chcesz usunąć zaznaczone elementy?</p>
                            <div className="flex justify-center gap-4 mt-4">
                                <Button
                                    label="Nie"
                                    className="p-button-outlined p-button-danger w-[6rem] border text-red-600"
                                    onClick={() => setIsDialogVisible(false)}
                                />
                                <Button
                                    label="Tak"
                                    className="p-button-success w-[6rem] text-green-400 border"
                                    onClick={confirmDeletion}
                                />
                            </div>
                        </Dialog>
                    </AmberBox>
                    <AmberBox>
                        <div className="mx-auto flex flex-col justify-between items-center p-4 ">
                            <p className="text-center mb-2">Skopiuj pracowników z poprzedniego tygodnia</p>
                            <Button label="Skopiuj" className="bg-white w-[9rem] h-[3rem]"
                                text raised onClick={handleSkopiuj}
                                disabled={accountType !== 'Administrator'} />
                        </div>
                    </AmberBox>
                </div>
            </div>
        </main>
    )
}