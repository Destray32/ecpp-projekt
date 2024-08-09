import React, { useState, useEffect } from "react";
import AmberBox from "../../Components/AmberBox";
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import 'react-calendar/dist/Calendar.css';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import userEvent from "@testing-library/user-event";

export default function UrlopyPage() {
    const [urlopOd, setUrlopOd] = useState(null);
    const [urlopDo, setUrlopDo] = useState(null);
    const [UrlopDla, setUrlopDla] = useState(null);
    const [Status, setStatus] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    const sampleData2 = [
        { id: 1, name: "Zaznacz wszystko" },
        { id: 2, name: "NCW" },
        { id: 3, name: "NCC" },
        { id: 4, name: "Skanska" },
        { id: 5, name: "Pogab1" },
        { id: 6, name: "Pogab2" },
        { id: 7, name: "Pogab3" },
    ];
    const sampleData = [
        {
            id: 1,
            name: "Jan Kowalski",
            urlopOd: "2021-10-01",
            urlopDo: "2021-10-10",
            komentarz: "Testowy urlop",
            status: "Do zatwierdzenia"
        },
        {
            id: 2,
            name: "Anna Nowak",
            urlopOd: "2021-10-15",
            urlopDo: "2021-10-20",
            komentarz: "Urlop na urlopie",
            status: "Zatwierdzone"
        },
        {
            id: 3,
            name: "Marek Zając",
            urlopOd: "2021-11-01",
            urlopDo: "2021-11-07",
            komentarz: "Chorobowe",
            status: "Anulowane"
        }
    ];

    const handleCheckboxChange = (id) => {
        setSelectedItems(prevState =>
            prevState.includes(id)
                ? prevState.filter(item => item !== id)
                : [...prevState, id]
        );
    };

    // sprawdza stan zaznaczonych checkboxow i ich id
    useEffect(() => { // sprawdz komentarze ponizej
        console.log(selectedItems);
    }, [selectedItems]);

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
                        <InputText placeholder="Komentarz" className="w-1/3 p-2" />
                        <Button label="Dodaj" className="p-button-outlined border-2 p-1 ml-2 bg-white" />
                    </div>
                </div>
            </AmberBox>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Urlopy</p>
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start ">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4">
                            <Dropdown value={Status} onChange={(e) => setStatus(e.value)} options={["Wszystkie", "Do zatwierdzenia", "Zatwierdzone", "Anulowane"]} editable 
                                placeholder="Filtrowanie"
                                autoComplete="off"
                                className="w-3/12 p-2" 
                                filter 
                                showClear
                            />
                            <Button label="Szukaj" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-32" />
                            <div>
                                <Button label="Zatwierdź" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" />
                                <Button label="Anuluj" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" />
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
                        {sampleData.map((item) => (
                            <tr key={item.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                <td className="border-r">
                                    <Checkbox
                                        inputId={`cb-${item.id}`} // możesz to robić w ten sposób, poprzedzając item.id czym więcej.
                                                                // unikniesz kolizji z innymi id które masz w "selectedItems".
                                                                // zobacz se konsole i useEffect żeby sprawdzić co sie pojawia po zaznaczaniu
                                        checked={selectedItems.includes(`cb-${item.id}`)}
                                        onChange={() => handleCheckboxChange(`cb-${item.id}`)}
                                    />
                                </td>
                                <td className="border-r">{item.name}</td>
                                <td className="border-r">{item.urlopOd}</td>
                                <td className="border-r">{item.urlopDo}</td>
                                <td className="border-r">{item.komentarz}</td>
                                <td className="border-r">{item.status}</td>
                                <td>
                                    <Button label="Usuń" className="bg-blue-700 text-white p-1 m-0.5" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
