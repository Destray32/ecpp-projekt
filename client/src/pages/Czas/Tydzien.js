import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import AmberBox from '../../Components/AmberBox';
import { Checkbox } from 'primereact/checkbox';
import Axios from 'axios';
import { getWeek } from 'date-fns';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import checkUserType, { hasSpecialAccess } from "../../utils/accTypeUtils";

export default function TydzienPage() {
    const [selectedWeek, setSelectedWeek] = useState('');
    const [numericWeek, setNumericWeek] = useState(1);
    const [weekRange, setWeekRange] = useState({ start: '', end: '' });
    const [selectedItems, setSelectedItems] = useState([]);
    const [data, setData] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [accountType, setAccountType] = useState('');
    const [imie, setImie] = useState('');
    const [nazwisko, setNazwisko] = useState('');
    const baseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        checkUserType(setAccountType);
        const getImie = async () => {
            try {
                const response = await Axios.get(`${baseUrl}/api/imie`, { withCredentials: true });
                const { name, surename } = response.data;
                setImie(name);
                setNazwisko(surename);
            } catch (error) {
                console.error(error);
            }
        };
        getImie();
    }, []);

    // Function to get the current week in the format "YYYY-Www" using date-fns for consistency
    const getCurrentWeek = () => {
        const now = new Date();
        const weekNumber = getWeek(now, { weekStartsOn: 1 }); // ISO week starts on Monday
        const year = now.getFullYear();
        return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
    };

    // Set the current week as the default week on load
    useEffect(() => {
        const currentWeek = getCurrentWeek();
        setSelectedWeek(currentWeek);
        setNumericWeek(parseInt(currentWeek.substring(6)));

        const startDate = getStartDateOfWeek(currentWeek);
        const endDate = getEndDateOfWeek(startDate);
        setWeekRange({
            start: formatDate(startDate),
            end: formatDate(endDate)
        });
	setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded || !selectedWeek) return;

        const currentYear = selectedWeek.substring(0, 4);
        const currentWeek = parseInt(selectedWeek.substring(6));

        Axios.get(`${baseUrl}/api/tydzien/${currentYear}/${currentWeek}`, { withCredentials: true })
            .then(response => {
                const filteredData = response.data.filter(item => item.idPracownik != 3);
                setData(filteredData);
            })
            .catch(error => console.error(error));
    }, [selectedWeek, refresh]);



    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFont("OpenSans-Regular", "normal");

        const columns = [
            { header: "Imie", dataKey: "imie" },
            { header: "Nazwisko", dataKey: "naziwsko" },
            { header: "Grupa urlopowa", dataKey: "grupa" },
            { header: "Status", dataKey: "status" }
        ];

        const rows = data.map(item => ({
            imie: item.Imie,
            naziwsko: item.Nazwisko,
            grupa: item.Zleceniodawca,
            status: item.Status_tygodnia,
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

        doc.text(`Tydzien: ${numericWeek}, ${weekRange.start} - ${weekRange.end}`, 14, 15);
        const pdfBlob = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);

        window.open(pdfURL, '_blank');
    };

    const handleCheckboxChange = (tydzienRoku, Pracownik_idPracownik) => {
        const selectedPair = { tydzienRoku, Pracownik_idPracownik };
        setSelectedItems(prevSelectedItems => {
            if (prevSelectedItems.some(item => item.tydzienRoku === tydzienRoku && item.Pracownik_idPracownik === Pracownik_idPracownik)) {
                return prevSelectedItems.filter(item => !(item.tydzienRoku === tydzienRoku && item.Pracownik_idPracownik === Pracownik_idPracownik));
            } else {
                return [...prevSelectedItems, selectedPair];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems([]);
        } else {
            setSelectedItems(data.map(item => ({ tydzienRoku: item.tydzienRoku, Pracownik_idPracownik: item.Pracownik_idPracownik })));
        }
        setSelectAll(!selectAll);
    };

    const handleWeekChange = (event) => {
        const weekValue = event.target.value;
        setSelectedWeek(weekValue);
        setNumericWeek(parseInt(weekValue.substring(6)));

        if (weekValue) {
            const startDate = getStartDateOfWeek(weekValue);
            const endDate = getEndDateOfWeek(startDate);
            setWeekRange({
                start: formatDate(startDate),
                end: formatDate(endDate)
            });
        } else {
            setWeekRange({ start: '', end: '' });
        }
    };

    const handleOtworz = () => {
        if (selectedItems.length === 0) {
            console.error('No items selected');
            return;
        }

        // Tylko Administrator może otwierać dowolne tygodnie
        const isAdmin = accountType === 'Administrator';
        
        if (!isAdmin) {
            const currentWeek = getCurrentWeek(); // Format: "2025-W43"
            console.log('Current week:', currentWeek);
            console.log('Selected week:', selectedWeek);
            console.log('Selected tydzienRoku:', selectedItems[0].tydzienRoku);
            
            // Wyciągnij numer tygodnia z obu wartości
            const currentWeekNumber = parseInt(currentWeek.substring(6)); // "2025-W43" -> 43
            const selectedWeekNumber = parseInt(selectedWeek.substring(6)); // "2025-W43" -> 43
            const currentYear = parseInt(currentWeek.substring(0, 4));
            const selectedYear = parseInt(selectedWeek.substring(0, 4));
            
            console.log('Comparing:', { currentWeekNumber, selectedWeekNumber, currentYear, selectedYear });
            
            if (currentYear !== selectedYear || currentWeekNumber !== selectedWeekNumber) {
                alert(`Można otwierać tylko bieżący tydzień (${currentWeekNumber}). Wybrany tydzień: ${selectedWeekNumber}. Tylko Administrator może otwierać dowolne tygodnie.`);
                return;
            }
        }

        Axios.post(`${baseUrl}/api/tydzien`, {
            tydzienRoku: selectedItems[0].tydzienRoku,
            pracownikId: selectedItems.map(item => item.Pracownik_idPracownik)
        }, { withCredentials: true })
            .then(response => {
                setRefresh(!refresh);
                setSelectedItems([]);
                setSelectAll(false);
            })
            .catch(error => {
                console.error(error);
                if (error.response && error.response.data && error.response.data.message) {
                    alert(error.response.data.message);
                }
            });
    };

    const handleZamknij = () => {
        if (selectedItems.length === 0) {
            console.error('No items selected');
            return;
        }

        Axios.delete(`${baseUrl}/api/tydzien`, {
            withCredentials: true,
            data: {
                tydzienRoku: selectedItems[0].tydzienRoku,
                pracownikId: selectedItems.map(item => item.Pracownik_idPracownik)
            }
        })
            .then(response => {
                setRefresh(!refresh);
                setSelectedItems([]);
                setSelectAll(false);
            })
            .catch(error => console.error(error));
    };

    const handleDrukuj = () => {
        generatePDF();
    };

    const getStartDateOfWeek = (weekValue) => {
        const year = parseInt(weekValue.substring(0, 4));
        const week = parseInt(weekValue.substring(6));

        const firstDayOfYear = new Date(year, 0, 1);
        const daysOffset = ((week - 1) * 7) - firstDayOfYear.getDay() + 1;
        return new Date(year, 0, 1 + daysOffset);
    };

    const getEndDateOfWeek = (startDate) => {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        return endDate;
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    };

    const handlePreviousWeek = () => {
        const current = new Date(getStartDateOfWeek(selectedWeek));
        current.setDate(current.getDate() - 7);
        updateWeek(current);
    };

    const handleNextWeek = () => {
        const current = new Date(getStartDateOfWeek(selectedWeek));
        current.setDate(current.getDate() + 7);
        updateWeek(current);
    };

    const updateWeek = (date) => {
    const year = date.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);

    const newWeekString = `${year}-W${week.toString().padStart(2, '0')}`;

    // Zaktualizuj stany tylko jeśli coś faktycznie się zmienia
    setSelectedWeek(prev => {
        if (prev !== newWeekString) return newWeekString;
        return prev;
    });

    setNumericWeek(prev => {
        if (prev !== week) return week;
        return prev;
    });

    const startDate = getStartDateOfWeek(newWeekString);
    const endDate = getEndDateOfWeek(startDate);
    setWeekRange({
        start: formatDate(startDate),
        end: formatDate(endDate)
    });
    setRefresh(prev => !prev);
};

    return (
        <div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">
                    <div className="flex flex-row items-center justify-evenly w-full space-x-2">
                        <p className="">Wybierz tydzień:</p>
                        <Button icon="pi pi-arrow-left" onClick={handlePreviousWeek} className="p-button-text" />
                        <input type="week" value={selectedWeek} onChange={handleWeekChange} />
                        <Button icon="pi pi-arrow-right" onClick={handleNextWeek} className="p-button-text" />
                        <div>
                            <p>
                                {weekRange.start && weekRange.end ? ` ${weekRange.start} - ${weekRange.end}` : 'Wybierz tydzień, aby zobaczyć przedział dni'}
                            </p>
                        </div>
                        <Button 
                            label="Otwórz tydzień" 
                            onClick={handleOtworz}
                            disabled={
                                (accountType !== 'Administrator' && !hasSpecialAccess(imie, nazwisko, 'tydzien')) ||
                                (accountType !== 'Administrator' && selectedWeek !== getCurrentWeek())
                            }
                            className="p-button-outlined border-2 p-1 bg-white" 
                            tooltip={accountType !== 'Administrator' && selectedWeek !== getCurrentWeek() ? "Tylko Administrator może otwierać tygodnie wstecz" : ""}
                            tooltipOptions={{ position: 'top' }}
                        />
                        <Button 
                            label="Zamknij tydzień" 
                            onClick={handleZamknij}
                            disabled={accountType !== 'Administrator' && !hasSpecialAccess(imie, nazwisko, 'tydzien')}
                            className="p-button-outlined border-2 p-1 bg-white" 
                        />
                        <Button 
                            label="Drukuj" 
                            onClick={handleDrukuj}
                            className="p-button-outlined border-2 p-1 bg-white" 
                        />
                    </div>
                </div>
            </AmberBox>
            <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th className='border-r'>
                                <Checkbox
                                    inputId="cb-select-all"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="border-r">Imię i nazwisko</th>
                            <th className="border-r">Grupa urlopowa</th>
                            <th className="border-r w-28">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {data.map((item) => (
                            <tr key={`${item.tydzienRoku}-${item.Pracownik_idPracownik}`} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                <td className="border-r">
                                    <Checkbox
                                        inputId={`cb-${item.tydzienRoku}-${item.Pracownik_idPracownik}`}
                                        checked={selectedItems.some(selectedItem => selectedItem.tydzienRoku === item.tydzienRoku && selectedItem.Pracownik_idPracownik === item.Pracownik_idPracownik)}
                                        onChange={() => handleCheckboxChange(item.tydzienRoku, item.Pracownik_idPracownik)}
                                    />
                                </td>
                                <td className="border-r">{item.Imie + " " + item.Nazwisko}</td>
                                <td className="border-r">{item.Zleceniodawca}</td>
                                <td className={`border-r ${item.Status_tygodnia === 'Otwarty' ? 'text-green-600' : 'text-red-600'} `}>{item.Status_tygodnia}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
