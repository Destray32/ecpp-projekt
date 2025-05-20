import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import AmberBox from "../../Components/AmberBox";

export default function LogowaniePage() {
    const [logData, setLogData] = useState([]);
    const [filteredLogData, setFilteredLogData] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [name, setName] = useState(null);
    const [surname, setSurname] = useState(null);
    const [nameOptions, setNameOptions] = useState([]);
    const [surnameOptions, setSurnameOptions] = useState([]);
    const baseUrl = process.env.REACT_APP_BASE_URL;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    };

    const fetchData = () => {
        axios.get(`${baseUrl}/api/logi`, { withCredentials: true })
            .then((response) => {
                const data = response.data;
                setLogData(data);
                console.log(data);

                // Filter data based on selected criteria
                const filteredData = data.filter(item => {
                    const itemDate = formatDate(item.date);
                    if (name && item.name !== name) return false;
                    if (surname && item.surname !== surname) return false;
                    if (startDate && itemDate < startDate) return false;
                    if (endDate && itemDate > endDate) return false;
                    return true;
                });

                // Format and sort the filtered data
                const formattedData = filteredData
                    .map(item => ({
                        ...item,
                        date: new Intl.DateTimeFormat('pl-PL', {
                            year: 'numeric', month: '2-digit', day: '2-digit',
                            hour: '2-digit', minute: '2-digit'
                        }).format(new Date(item.date))
                    }))
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                setFilteredLogData(formattedData);

                // Generate options for name dropdown if not already populated
                if (nameOptions.length === 0) {
                    const namesSet = new Set(data.map(item => item.name));
                    const options = Array.from(namesSet).map(name => ({
                        label: name,
                        value: name
                    }));
                    setNameOptions(options);
                }

                // Generate options for surname dropdown if not already populated
                if (surnameOptions.length === 0) {
                    const surnamesSet = new Set(data.map(item => item.surname));
                    const options = Array.from(surnamesSet).map(surname => ({
                        label: surname,
                        value: surname
                    }));
                    setSurnameOptions(options);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        fetchData();
    }, [name, surname, startDate, endDate]);

    const resetFilters = () => {
        setName(null);
        setSurname(null);
        setStartDate('');
        setEndDate('');
    };

    return (
        <main>
            <div className="p-2">
                <AmberBox>
                    <div className="flex flex-row items-center justify-center space-x-4 w-full">
                        <p>Wybierz okres</p>
                        <input type="date" className="p-2.5 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input type="date" className="p-2.5 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <Dropdown value={name} options={nameOptions} onChange={(e) => setName(e.value)} showClear placeholder="Wybierz imię" />
                        <Dropdown value={surname} options={surnameOptions} onChange={(e) => setSurname(e.value)} showClear placeholder="Wybierz nazwisko" />
                        <Button onClick={resetFilters} label="Reset" className="p-button-outlined border-2 p-2.5 bg-white text-black" />
                    </div>
                </AmberBox>
                <div className="outline outline-1 outline-gray-500">
                    <table className="w-full">
                        <thead className="bg-blue-700 text-white">
                            <tr>
                                <th className="border-r">Imię</th>
                                <th className="border-r">Naziwsko</th>
                                <th className="border-r">Data</th>
                                <th className="border-r">Szczegoły</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {filteredLogData.map((item, i) => (
                                <tr key={i} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                    <td className="border-r">{item.name}</td>
                                    <td className="border-r">{item.surname}</td>
                                    <td className="border-r">{item.date}</td>
                                    <td className="border-r">{item.komentarz}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}