import React from "react";
import AmberBox from "../../Components/AmberBox";
import { Dropdown } from 'primereact/dropdown';
import { useState, useEffect } from "react";
import { Button } from 'primereact/button';
import { Link } from "react-router-dom";
import { Checkbox } from 'primereact/checkbox';
import Axios from "axios";

import checkUserType from "../../utils/accTypeUtils";

export default function ProjektyPage() {
    const [filtr, setFiltr] = useState('Wszystkie');
    const [selectedItems, setSelectedItems] = useState([]);
    const [data, setData] = useState([]);
    const [accountType, setAccountType] = useState('');

    useEffect(() => {
        checkUserType(setAccountType);
    }, []);


    const handleCheckboxChange = (id) => {
        setSelectedItems(prevState =>
            prevState.includes(id)
                ? prevState.filter(item => item !== id)
                : [...prevState, id]
        );
    };

    useEffect(() => {
        if (filtr) {
            handleSzukaj();
        } else {
            fetchProjects();
        }
    }, [filtr]);

    const handleDelete = (id) => {
        Axios.delete(`http://localhost:5000/api/czas/usun?id=${id}`, { withCredentials: true })
            .then((response) => {
                fetchProjects();
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleSzukaj = () => {
        Axios.get(`http://localhost:5000/api/czas/szukaj?group=${filtr}`, { withCredentials: true })
            .then((response) => {
                console.log('Response data:', response.data);
                if (response.data && Array.isArray(response.data.projekty)) {
                    setData(response.data.projekty);
                } else {
                    console.error('Unexpected response structure:', response.data);
                    setData([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching projects:', error);
                setData([]);
            });
    };

    const handlePrzeniesAktyw = () => {
        Axios.put("http://localhost:5000/api/czas/przeniesAkt",
            { ids: selectedItems.map((id) => id) },
            { withCredentials: true }
        )
            .then((response) => {
                fetchProjects();
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handlePrzeniesNieaktyw = () => {
        Axios.put("http://localhost:5000/api/czas/przeniesNieakt",
            { ids: selectedItems.map((id) => id) },
            { withCredentials: true }
        )
            .then((response) => {
                fetchProjects();
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const fetchProjects = () => {
        Axios.get("http://localhost:5000/api/czas/projekty", { withCredentials: true })
            .then((response) => {
                if (response.data && Array.isArray(response.data.projekty)) {
                    setData(response.data.projekty);
                } else {
                    console.error('Unexpected response structure:', response.data);
                    setData([]);
                }
            })
            .catch((error) => {
                console.error(error);
                setData([]);
            });
    };

    return (
        <div>
            <AmberBox>
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4">
                            <p className="mr-6">Filtr</p>
                            <Dropdown value={filtr} onChange={(e) => setFiltr(e.value)} options={["Aktywny", "Zamkniety", "Wszystkie"]} placeholder="Filtrowanie"
                                autoComplete="off"
                                className="w-3/12 mr-10"
                                filter
                                resetFilterOnHide
                                filterInputAutoFocus
                            />
                            <div className="flex flex-row items-center">
                                <Button onClick={handlePrzeniesAktyw} label="Przenieś do aktywnych" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2" />
                                <Button onClick={handlePrzeniesNieaktyw} label="Przenieś do nieaktywnych" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2" />
                            </div>
                            <Link to="/home/grupy-projektow">
                                <Button label="Grupy projektów" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2" />
                            </Link>
                                <Link to="/home/nowy-projekt"
                                onClick={(e) => {
                                    if (accountType !== 'Administrator' && accountType !== 'Biuro') {
                                        e.preventDefault();
                                    }
                                }}
                        
                                >
                                    <Button label="Dodaj nowy projekt"
                                        className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2"
                                        disabled={accountType === 'Pracownik'}
                                        />
                                </Link>
                        </div>
                    </div>
                </div>
            </AmberBox>
            <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th className="border-r"></th>
                            <th className="border-r">Nr</th>
                            <th className="border-r">Nazwa/Kod Projektu</th>
                            <th className="border-r">Status projektu</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {data.map((projekty, index) => {
                            const statusClass = projekty.Status === 'Aktywny'
                                ? 'text-green-500'
                                : 'text-red-500';
                            return (
                                <tr key={projekty.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                    <td className="border-r">
                                        <Checkbox
                                            inputId={`cb-${projekty.id}`}
                                            checked={selectedItems.includes(projekty.id)}
                                            onChange={() => handleCheckboxChange(projekty.id)}
                                        />
                                    </td>
                                    <td className="border-r">{index + 1}</td>
                                    <td className="border-r">{projekty.NazwaKod_Projektu}</td>
                                    <td className={`border-r ${statusClass}`}>{projekty.Status}</td>
                                    <td>
                                        <Link to={`/home/projekt/${projekty.id}`}>
                                            <Button
                                                label="Edytuj"
                                                className="bg-blue-700 text-white p-1 m-0.5"
                                            />
                                        </Link>
                                        <Button
                                            onClick={() => handleDelete(projekty.id)}
                                            label="Usuń"
                                            className="bg-red-500 text-white p-1 m-0.5" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}