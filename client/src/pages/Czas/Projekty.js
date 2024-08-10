import React from "react";
import AmberBox from "../../Components/AmberBox";
import { Dropdown } from 'primereact/dropdown';
import { useState, useEffect } from "react";
import { Button } from 'primereact/button';
import { Link } from "react-router-dom";
import { Checkbox } from 'primereact/checkbox';
import Axios from "axios";

export default function ProjektyPage() {
    const [Filtr, setFiltr] = useState(null);
    const [selectedItems, setSelectedItems] = React.useState([]);
    const [selectedItemsNr, setSelectedItemsNr] = React.useState([]);
    const [availableGroups, setAvailableGroups] = useState([]);
    const [data, setData] = useState([]);

    const handleCheckboxChange = (id) => {
        setSelectedItems(prevState =>
            prevState.includes(id)
                ? prevState.filter(item => item !== id)
                : [...prevState, id]
        );
    };

    useEffect(() => {
        console.log(selectedItems);
    }, [selectedItems]);

    const handleDelete = (id) => {
        Axios.delete(`http://localhost:5000/api/czas/usun?id=${id}`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleSzukaj = () => {
        Axios.get(`http://localhost:5000/api/czas/szukaj?group=${Filtr}`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handlePrzeniesAktyw = () => {
        Axios.put("http://localhost:5000/api/czas/przeniesAkt", {
            ids: selectedItems.map((id) => id)
        })
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handlePrzeniesNieaktyw = () => {
        Axios.put("http://localhost:5000/api/czas/przeniesNieakt", {
            ids: selectedItems.map((id) => id)
        })
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleGrupyProjektow = () => {

    };

    const handleNowyProjekt = () => {

    };

    useEffect(() => {
        // pobieranie danych o projektach z serwera
        Axios.get("http://localhost:5000/api/czas/projekty")
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

        // pobieranie dostępnych grup z serwera
        Axios.get("http://localhost:5000/api/grupy")
            .then((response) => {
                const groupNames = response.data.map(group => group.name);
                setAvailableGroups(groupNames);
                }) 
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <div>
            <AmberBox>
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4">
                            <p className="mr-6">Filtr</p>
                            <Dropdown value={Filtr} onChange={(e) => setFiltr(e.value)} options={availableGroups} editable placeholder="Filtrowanie"
                                autoComplete="off"
                                className="w-3/12 p-2"
                                filter
                                showClear
                            />
                            <Button onClick={handleSzukaj} label="Szukaj" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-32" />
                            <div>
                                <Button onClick={handlePrzeniesAktyw} label="Przenieś do aktywnych" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2" />
                                <Button onClick={handlePrzeniesNieaktyw} label="Przenieś do nieaktywnych" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2" />
                            </div>
                            <Link to="/home/grupy-projektow">
                                <Button onClick={handleGrupyProjektow} label="Grupy projektów" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2" />
                            </Link>
                            <Link to="/home/nowy-projekt">
                                <Button onClick={handleNowyProjekt} label="Dodaj nowy" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2" />
                            </Link>

                        </div>
                    </div>
                </div>
            </AmberBox>
            <div className="w-full md:w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th></th>
                            <th className="border-r">Nr</th>
                            <th className="border-r">Nazwa projektu</th>
                            <th className="border-r">Kod projektu</th>
                            <th className="border-r">Status projektu</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {data.map((item) => (
                            <tr key={item.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                <td className="border-r">
                                    <Checkbox
                                        inputId={`cb-${item.id}`}
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => handleCheckboxChange(item.id)}
                                    />
                                </td>
                                <td className="border-r">{item.id}</td>
                                <td className="border-r">{item.Nazwa}</td>
                                <td className="border-r">{item.kodprojektu}</td>
                                <td className="border-r">{item.statusprojektu}</td>
                                <td>
                                    <Button
                                        onClick={() => handleDelete(item.id)}
                                        label="Usuń"
                                        className="bg-blue-700 text-white p-1 m-0.5" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}