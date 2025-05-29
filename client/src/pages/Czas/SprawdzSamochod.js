import React, { useState, useEffect } from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { font } from "../../fonts/OpenSans-Regular-normal";

export default function SprawdzSamochodPage() {
    const [allData, setAllData] = useState([]);
    const [tableData, setTableData] = useState([]);

    const [Pojazd, setPojazd] = useState(null);
    const [Pracownik, setPracownik] = useState(null);
    const [Projekt, setProjekt] = useState(null);

    const [pojazdyOptions, setPojazdyOptions] = useState([]);
    const [pracownicyOptions, setPracownicyOptions] = useState([]);
    const [projektyOptions, setProjektyOptions] = useState([]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' lub 'desc'

    const baseUrl = process.env.REACT_APP_BASE_URL;

    const formatDate = (dateStr) => {
    // Jeśli data jest już w formacie YYYY-MM-DD, zwróć ją bez zmian
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
    }
    
    // Jeśli to obiekt Date lub string z timezone, użyj toLocaleDateString
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

    // Pobranie danych raz przy załadowaniu strony
    useEffect(() => {
        axios.get(`${baseUrl}/api/samochody`, { withCredentials: true })
            .then((response) => {
                const data = response.data.map(item => ({
                    ...item,
                    Data: formatDate(item.Data)
                }));
                setAllData(data);
                console.log(data);
            })
            .catch(console.error);
    }, [baseUrl]);

    // Filtrowanie i sortowanie danych na podstawie wybranych opcji
    useEffect(() => {
        const filtered = allData.filter(item => {
            if (Pojazd && item.Pojazd !== Pojazd) return false;
            if (Pracownik && item.Pracownik !== Pracownik) return false;
            if (Projekt && item.Projekt !== Projekt) return false;
            if (startDate && item.Data < startDate) return false;
            if (endDate && item.Data > endDate) return false;
            return true;
        });

        // Aktualizacja dropdownów bazując na przefiltrowanych danych
        const pojazdySet = new Set(filtered.map(item => item.Pojazd));
        const pracownicySet = new Set(filtered.map(item => item.Pracownik));
        const projektySet = new Set(filtered.map(item => item.Projekt));

        setPojazdyOptions(Array.from(pojazdySet).map(p => ({ label: p, value: p })));
        setPracownicyOptions(Array.from(pracownicySet).map(p => ({ label: p, value: p })));
        setProjektyOptions(Array.from(projektySet).map(p => ({ label: p, value: p })));

        // Reset wybranych wartości jeśli nie pasują do filtrów
        if (Pojazd && !pojazdySet.has(Pojazd)) setPojazd(null);
        if (Pracownik && !pracownicySet.has(Pracownik)) setPracownik(null);
        if (Projekt && !projektySet.has(Projekt)) setProjekt(null);

        // Sortowanie według daty
        const sortedData = [...filtered].sort((a, b) => {
            if (sortOrder === 'asc') {
                return new Date(a.Data) - new Date(b.Data);
            } else {
                return new Date(b.Data) - new Date(a.Data);
            }
        });

        setTableData(sortedData);
    }, [allData, Pojazd, Pracownik, Projekt, startDate, endDate, sortOrder]);

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFont("OpenSans-Regular", "normal");

        const columns = [
            { header: "Data", dataKey: "Data" },
            { header: "Imię i nazwisko", dataKey: "Pracownik" },
            { header: "Pojazd", dataKey: "Pojazd" },
            { header: "Projekt", dataKey: "Projekt" },
            { header: "Ilość godzin", dataKey: "GodzinyPrzepracowane" }
        ];

        const rows = tableData.map(item => ({
            Data: item.Data,
            Pracownik: item.Pracownik,
            Pojazd: item.Pojazd,
            Projekt: item.Projekt,
            GodzinyPrzepracowane: item.GodzinyPrzepracowane
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

        doc.text("Lista samochodów", 14, 15);

        const pdfBlob = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);

        window.open(pdfURL, '_blank');
    };

    return (
        <div>
            <AmberBox>
                <div className="flex flex-row items-center justify-center space-x-4 w-full flex-wrap">
                    <p>Wybierz okres</p>
                    <input
                        type="date"
                        className="p-2.5 rounded"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                        type="date"
                        className="p-2.5 rounded"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Dropdown
                        value={Pojazd}
                        options={pojazdyOptions}
                        onChange={(e) => setPojazd(e.value)}
                        showClear
                        placeholder="Wybierz pojazd"
                        style={{ minWidth: 150 }}
                    />
                    <Dropdown
                        value={Pracownik}
                        options={pracownicyOptions}
                        onChange={(e) => setPracownik(e.value)}
                        showClear
                        placeholder="Wybierz pracownika"
                        style={{ minWidth: 180 }}
                    />
                    <Dropdown
                        value={Projekt}
                        options={projektyOptions}
                        onChange={(e) => setProjekt(e.value)}
                        showClear
                        placeholder="Wybierz projekt"
                        style={{ minWidth: 150 }}
                    />
                    <Dropdown
                        value={sortOrder}
                        options={[
                            { label: 'Data malejąco', value: 'desc' },
                            { label: 'Data rosnąco', value: 'asc' }
                        ]}
                        onChange={(e) => setSortOrder(e.value)}
                        placeholder="Sortuj po dacie"
                        style={{ minWidth: 150 }}
                    />
                    <Button
                        onClick={generatePDF}
                        label="Drukuj"
                        className="p-button-outlined border-2 p-2.5 bg-white text-black"
                    />
                </div>
            </AmberBox>

            <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500 overflow-auto ">
                <table className="w-full table-fixed">
                    <thead className="bg-blue-700 text-left text-white sticky top-0">
                        <tr>
                            <th className="border-r px-2 py-1 w-32">Data</th>
                            <th className="border-r px-2 py-1 w-48">Imię i nazwisko</th>
                            <th className="border-r px-2 py-1 w-32">Pojazd</th>
                            <th className="border-r px-2 py-1 w-48">Projekt</th>
                            <th className="border-r px-2 py-1 w-32">Ilość godzin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center p-4">
                                    Brak danych do wyświetlenia
                                </td>
                            </tr>
                        ) : (
                            tableData.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`border-b ${index % 2 === 0 ? 'bg-gray-200' : 'bg-gray-300'}`}
                                >
                                    <td className="border-r text-left pl-2">{item.Data}</td>
                                    <td className="border-r text-left pl-2">{item.Pracownik}</td>
                                    <td className="border-r text-left pl-2">{item.Pojazd}</td>
                                    <td className="border-r text-left pl-2">{item.Projekt}</td>
                                    <td className="border-r text-left pl-2">{item.GodzinyPrzepracowane}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
