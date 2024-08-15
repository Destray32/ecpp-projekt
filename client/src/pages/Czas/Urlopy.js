import React, { useState, useEffect } from "react";
import AmberBox from "../../Components/AmberBox";
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import 'react-calendar/dist/Calendar.css';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import Axios from "axios";

export default function UrlopyPage() {
    const [urlopOd, setUrlopOd] = useState(null);
    const [urlopDo, setUrlopDo] = useState(null);
    const [UrlopDla, setUrlopDla] = useState(null);
    const [Status, setStatus] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState(null);
    const [komentarz, setKomentarz] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [dane, setDane] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    const extractId = (idWithPrefix) => idWithPrefix.replace('cb-', '');

    const sampleData2 = [
        { id: 1, name: "Zaznacz wszystko" },
        { id: 2, name: "NCW" },
        { id: 3, name: "NCC" },
        { id: 4, name: "Skanska" },
        { id: 5, name: "Pogab1" },
        { id: 6, name: "Pogab2" },
        { id: 7, name: "Pogab3" },
    ];

    const handleCheckboxChange = (id) => {
        setSelectedItems(prevState =>
            prevState.includes(id)
                ? prevState.filter(item => item !== id)
                : [...prevState, id]
        );
    };
    const handleUpdateStatus = (newStatus) => {
        console.log(selectedItems);
        console.log(newStatus);
        const ids = selectedItems.map(extractId);
        Axios.put("http://localhost:5000/api/urlopy", {
            ids: ids,
            status: newStatus,
        })
        .then(() => {
            fetchUrlopy(); // Refetch data after updating
        })
        .catch((error) => {
            console.error("There was an error updating the status:", error);
        });
    };

    const fetchUrlopy = () => {
        Axios.get("http://localhost:5000/api/urlopy")
            .then((response) => {
                setDane(response.data.urlopy);
            })
            .catch((error) => {
                console.error("There was an error fetching the data:", error);
            });
    };

    useEffect(() => {
        fetchUrlopy();
    }, []);

    const handleDodaj = () => {
        Axios.post("http://localhost:5000/api/urlopy", {
            nazwisko_imie: UrlopDla,
            status: Status,
            urlop_od: urlopOd,
            urlop_do: urlopDo,
            komentarz: komentarz,
        })
        .then(() => {
            fetchUrlopy();
        })
        .catch((error) => {
            console.error("There was an error adding the leave:", error.response.data);
        });
    };

    const handleZatwierdz = () => handleUpdateStatus("Zatwierdzone");
    const handleAnuluj = () => handleUpdateStatus("Anulowane");

    const handleUsun = (itemId) => {
        Axios.delete("http://localhost:5000/api/urlopy", {
            data: { id: itemId },
        })
        .then(() => {
            fetchUrlopy();
        });
    };

    const handleSzukaj = () => {
        console.log("Szukaj");
    };


    useEffect(() => {
        console.log(selectedItems);
    }, [selectedItems]);

    const groupedData = dane.reduce((acc, curr) => {
        const key = `${curr.imie} ${curr.nazwisko}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {});

    const handleGroupToggle = (name) => {
        setExpandedGroups(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    return (
        <div>
            <AmberBox>
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4">
                            <div className="flex flex-col w-3/12 p-4">
                                <p className="text-sm text-gray-600 mb-2">Dodaj urlop dla:</p>
                                <Dropdown
                                    value={UrlopDla}
                                    onChange={(e) => setUrlopDla(e.value)}
                                    options={["Pawłowski Mateusz"]}
                                    editable
                                    placeholder="Pracownik"
                                    autoComplete="off"
                                    className="p-2"
                                    filter
                                    showClear
                                />
                            </div>
                            <div className="flex flex-col w-3/12 p-4">
                                <p className="text-sm text-gray-600 mb-2">Status:</p>
                                <Dropdown
                                    value={Status}
                                    onChange={(e) => setStatus(e.value)}
                                    options={["Do zatwierdzenia", "Zatwierdzone", "Anulowane"]}
                                    editable
                                    placeholder="Status"
                                    autoComplete="off"
                                    className="p-2"
                                    filter
                                    showClear
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-row space-x-4 p-4 ml-4">
                        <div className="flex flex-col w-full md:w-1/6">
                            <p className="text-sm text-gray-600 mb-2">Urlop od:</p>
                            <InputText id="UrlopOd" value={urlopOd} onChange={(e) => setUrlopOd(e.target.value)} type="date" />
                        </div>
                        <div className="flex flex-col w-full md:w-1/6">
                            <p className="text-sm text-gray-600 mb-2">Urlop do:</p>
                            <InputText id="UrlopDo" value={urlopDo} onChange={(e) => setUrlopDo(e.target.value)} type="date" />
                        </div>
                    </div>
                    <div className="flex justify-start w-full p-4 ml-4">
                        <InputText onChange={(e) => setKomentarz(e.target.value)} value={komentarz}
                            placeholder="Komentarz" className="w-1/3 p-2" />
                        <Button label="Dodaj" onClick={handleDodaj}
                            className="p-button-outlined border-2 p-1 ml-2 bg-white" />
                    </div>
                </div>
            </AmberBox>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Urlopy</p>
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start ">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4">
                            <Dropdown value={Status} onChange={(e) => setStatusUpdate(e.value)}
                                options={["Wszystkie", "Do zatwierdzenia", "Zatwierdzone", "Anulowane"]}
                                editable
                                placeholder="Filtrowanie"
                                autoComplete="off"
                                className="w-3/12 p-1"
                                filter
                                showClear
                            />
                            <Button label="Szukaj" onClick={handleSzukaj}
                                className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-32" />
                            <div>
                                <Button label="Zatwierdź" onClick={handleZatwierdz}
                                    className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" />
                                <Button label="Anuluj" onClick={handleAnuluj}
                                    className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap">
                    {sampleData2.map((item, i) => (
                        <div key={item.id} className="flex items-center mr-4 mb-2">
                            <Checkbox
                                inputId={`czasgrupy-${item.id}`}
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleCheckboxChange(item.id)}
                            />
                            <label htmlFor={`czasgrupy-${item.id}`} className="text-white ml-1">{item.name}</label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-full md:w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th></th>
                            <th className="border-r">Imię i nazwisko</th>
                            <th className="border-r">Urlop od</th>
                            <th className="border-r">Urlop do</th>
                            <th className="border-r">Komentarz</th>
                            <th className="border-r">Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {Object.keys(groupedData).map((name) => (
                            <React.Fragment key={name}>
                                <tr>
                                    <td colSpan="7" className="cursor-pointer bg-gray-100 hover:bg-gray-200" onClick={() => handleGroupToggle(name)}>
                                        <div className="flex items-center justify-between">
                                            <span>{name}</span>
                                            <span>{expandedGroups[name] ? '−' : '+'}</span>
                                        </div>
                                    </td>
                                </tr>
                                {expandedGroups[name] && groupedData[name].map((urlopy) => (
                                    <tr key={urlopy.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                        <td className="border-r">
                                            <Checkbox
                                                inputId={`cb-${urlopy.id}`}
                                                checked={selectedItems.includes(`cb-${urlopy.id}`)}
                                                onChange={() => handleCheckboxChange(`cb-${urlopy.id}`)}
                                            />
                                        </td>
                                        <td className="border-r">{urlopy.imie} {urlopy.nazwisko}</td>
                                        <td className="border-r">{urlopy.dataOd}</td>
                                        <td className="border-r">{urlopy.dataDo}</td>
                                        <td className="border-r">{urlopy.komentarz}</td>
                                        <td className="border-r">{urlopy.status}</td>
                                        <td>
                                            <Button 
                                                label="Usuń" 
                                                onClick={() => handleUsun(urlopy.id)} 
                                                className="bg-blue-700 text-white p-1 m-0.5" 
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
