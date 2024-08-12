import React, { useState, useEffect } from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';

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

    return (
        <div>
            <AmberBox>
                <div className="flex flex-row items-center justify-center space-x-4 w-full">
                    <p>Wybierz okres</p>
                    <input type="date" className="p-2.5 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input type="date" className="p-2.5 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    <Dropdown value={Pojazd} options={pojazdyOptions} onChange={(e) => setPojazd(e.value)} showClear placeholder="Wybierz pojazd" />
                    <Button label="Drukuj" className="p-button-outlined border-2 p-2.5 bg-white text-black" />
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