import React, { useState, useEffect } from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';



import { font } from "../../fonts/OpenSans-Regular-normal";

export default function SprawdzSamochodPage() {
    const [Pojazd, setPojazd] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [pojazdyOptions, setPojazdyOptions] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    
    const fetchData = () => {
        axios.get('http://localhost:5000/api/samochody')
            .then((response) => {
                const data = response.data;

                const filteredData = data.filter(item => {
                    if (Pojazd && item.pojazd !== Pojazd) return false;
                    if (startDate && item.data < startDate) return false;
                    if (endDate && item.data > endDate) return false;
                    return true;
                });

                setTableData(filteredData);

                if (pojazdyOptions.length === 0) {
                    const pojazdySet = new Set(data.map(item => item.pojazd));
                    const options = Array.from(pojazdySet).map(pojazd => ({
                        label: pojazd,
                        value: pojazd
                    }));
                    setPojazdyOptions(options);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        fetchData();
    }, [Pojazd, startDate, endDate]);

    const generatePDF = () => {
        const doc = new jsPDF();

        doc.setFont("OpenSans-Regular", "normal");
        
        const columns = [
            { header: "Data", dataKey: "data" },
            { header: "Imię i nazwisko", dataKey: "dane" },
            { header: "Pojazd", dataKey: "pojazd" },
            { header: "Projekt", dataKey: "projekt" },
            { header: "Ilość godzin", dataKey: "godziny" }
        ];
        
        const rows = tableData.map(item => ({
            data: item.data,
            dane: item.dane,
            pojazd: item.pojazd,
            projekt: item.projekt,
            godziny: item.godziny
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
        //doc.save("lista-samochodow.pdf");
        const pdfBlob = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);

        window.open(pdfURL, '_blank');
    };

    return (
        <div>
            <AmberBox>
                <div className="flex flex-row items-center justify-center space-x-4 w-full">
                    <p>Wybierz okres</p>
                    <input type="date" className="p-2.5 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input type="date" className="p-2.5 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    <Dropdown value={Pojazd} options={pojazdyOptions} onChange={(e) => setPojazd(e.value)} showClear placeholder="Wybierz pojazd" />
                    <Button onClick={generatePDF} label="Drukuj" className="p-button-outlined border-2 p-2.5 bg-white text-black" />
                </div>
            </AmberBox>
            <div className="w-full md:w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th className="border-r">Data</th>
                            <th className="border-r">Imię i nazwisko</th>
                            <th className="border-r">Pojazd</th>
                            <th className="border-r">Projekt</th>
                            <th className="border-r">Ilość godzin</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {tableData.map((item) => (
                            <tr key={item.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                <td className="border-r">{item.data}</td>
                                <td className="border-r">{item.dane}</td>
                                <td className="border-r">{item.pojazd}</td>
                                <td className="border-r">{item.projekt}</td>
                                <td className="border-r">{item.godziny}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}