import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import AmberBox from '../../Components/AmberBox';
import { Checkbox } from 'primereact/checkbox';
import Axios from 'axios';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TydzienPage() {
    const [selectedWeek, setSelectedWeek] = useState('');
    const [numericWeek, setNumericWeek] = useState(1);
    const [weekRange, setWeekRange] = useState({ start: '', end: '' });
    const [selectedItems, setSelectedItems] = useState([]);
    const [data, setData] = useState([]);

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
        doc.save("statusy-tydzien.pdf");
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
        Axios.post('http://localhost:5000/api/tydzien', {
            tydzienRoku: selectedItems.map(item => item.tydzienRoku),
            pracownikId: selectedItems.map(item => item.Pracownik_idPracownik)

        })
            .then(response => console.log(response.data))
            .catch(error => console.error(error));
    };
    const handleZamknij = () => {
        Axios.delete('http://localhost:5000/api/tydzien', {
            data: {
                tydzienRoku: selectedItems.map(item => item.tydzienRoku),
                pracownikId: selectedItems.map(item => item.Pracownik_idPracownik)
            }
        })
            .then(response => console.log(response.data))
            .catch(error => console.error(error));
    };
    const handleDrukuj = () => {
        console.log('Drukuj');
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
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    useEffect(() => {
        Axios.get(`http://localhost:5000/api/tydzien/${numericWeek}`)
            // .then(response => console.log(response.data))
            .then(response => setData(response.data))
            .catch(error => console.error(error));
    }, [numericWeek]);

    useEffect(() => {
        console.log(data);
    }, [data]);

    return (
        <div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">
                    <div className="flex flex-row items-center">
                        <div className="flex flex-row items-center">
                            <p className="mr-2">Wybierz tydzień:</p>
                            <input type="week" onChange={handleWeekChange} />
                            <div className="ml-4">
                                <p>
                                    {weekRange.start && weekRange.end ? ` ${weekRange.start} - ${weekRange.end}` : 'Wybierz tydzień, aby zobaczyć przedział dni'}
                                </p>
                            </div>
                            <Button label="Otwórz tydzień" onClick={handleOtworz}
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 ml-6" />
                            <Button label="Zamknij tydzień" onClick={handleZamknij}
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 ml-6" />
                            <Button label="Drukuj" onClick={handleDrukuj}
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 ml-6" />
                        </div>
                    </div>

                </div>
            </AmberBox>
            <div className="w-full md:w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th></th>
                            <th className="border-r">Imię i nazwisko</th>
                            <th className="border-r">Grupa urlopowa</th>
                            <th className="border-r">Status</th>
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
