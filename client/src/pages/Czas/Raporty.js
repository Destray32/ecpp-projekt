import React, { useEffect, useState } from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from "primereact/checkbox";
import axios from "axios";

export default function RaportyPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [Projekt, setProjekt] = useState(null);
    const [projektyOptions, setProjektyOptions] = useState([]);
    const [showRaportyFirma, setShowRaportyFirma] = useState(false);
    const [showRaportyPracownik, setShowRaportyPracownik] = useState(false);
    const [interfaceFirma, setInterfaceFirma] = useState(false);
    const [interfacePracownik, setInterfacePracownik] = useState(false);
    const [pracownik, setPracownik] = useState(null);
    const [availablePracownicy, setAvailablePracownicy] = useState([]);
    const [ignorujDaty, setIgnorujDaty] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    

    useEffect(() => {
        axios.get('http://47.76.209.242:5000/api/raporty', { withCredentials: true })
            .then((response) => {
                const projekty = response.data;
                const projektyOptions = projekty.map(projekt => ({ label: projekt.nazwa, value: projekt.id }));
                setProjektyOptions(projektyOptions);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const handleGenerateReport = () => {
        if (!Projekt) {
            alert("Nie wybrano projektu.");
            return;
        }

        const userId = [1];

        const params = {
            user: userId,
            projectId: Projekt,
            startDate,
            endDate,
        };

        axios.get('http://47.76.209.242:5000/api/generujRaport', { params }, { withCredentials: true })
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleGenerateWszystkie = () => {
        // Implementation for generating all reports
    };

    const przejscieDoInterfejsuFirma = () => {
        setInterfaceFirma(true);
        setInterfacePracownik(false);
    };

    const przejscieDoInterfejsuPracownik = () => {
        setInterfaceFirma(false);
        setInterfacePracownik(true);
    };

    const handleRowClick = (rowName) => {
        setSelectedRow(rowName);
        if (rowName === "Sprawozdanie z działalności - szczegółowe" || 
            rowName === "Sprawozdanie z działalności - podsumowanie") {
            przejscieDoInterfejsuFirma();
        } else {
            przejscieDoInterfejsuPracownik();
        }
    };

    const getRowStyle = (rowName) => {
        return selectedRow === rowName ? { fontWeight: 'bold', textDecoration: 'underline' } : {};
    };

    return (
        <div>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Opcje</p>
            </div>
            <AmberBox>
                <div className="flex flex-row items-center justify-center space-x-4 w-full">
                    <p>Wybierz okres raportowania</p>
                    <input type="date" className="p-2.5 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input type="date" className="p-2.5 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                    {interfaceFirma && (
                        <div>
                            <Checkbox inputId="firma" checked={ignorujDaty} onChange={() => setIgnorujDaty(!ignorujDaty)} />
                            <span className="ml-2">Ignoruj daty</span>
                        </div>
                    )}

                    <Dropdown value={Projekt} options={projektyOptions} onChange={(e) => setProjekt(e.value)} showClear placeholder="Wybierz projekt" />
                    
                    {interfacePracownik && (
                        <Dropdown value={pracownik} options={availablePracownicy} onChange={(e) => setPracownik(e.value)} showClear placeholder="Wybierz pracownika" />
                    )}

                    <Button onClick={handleGenerateReport} label="Generuj raport" className="p-button-outlined border-2 p-2.5 bg-white text-black" />
                    
                    {interfaceFirma && (
                        <Button onClick={handleGenerateWszystkie} label="Generuj wszystkie" className="p-button-outlined border-2 p-2.5 bg-white text-black" />
                    )}
                </div>
            </AmberBox>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Raporty</p>
            </div>
            <div className="w-full md:w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <tbody className="text-left cursor-pointer">
                        <tr className="border-b hover:underline even:bg-gray-200 odd:bg-gray-300"
                            onClick={() => setShowRaportyFirma(!showRaportyFirma)}>
                            <th className="border-r">Raporty dla firmy</th>
                        </tr>
                        <tr className={`border-b hover:underline even:bg-gray-200 odd:bg-gray-300 ${showRaportyFirma ? "" : "hidden"}`}>
                            <td onClick={() => handleRowClick("Sprawozdanie z działalności - szczegółowe")}
                                className="border-r" style={getRowStyle("Sprawozdanie z działalności - szczegółowe")}>
                                Sprawozdanie z działalności - szczegółowe
                            </td>
                        </tr>
                        <tr className={`border-b hover:underline even:bg-gray-200 odd:bg-gray-300 ${showRaportyFirma ? "" : "hidden"}`}>
                            <td onClick={() => handleRowClick("Sprawozdanie z działalności - podsumowanie")}
                                className="border-r" style={getRowStyle("Sprawozdanie z działalności - podsumowanie")}>
                                Sprawozdanie z działalności - podsumowanie
                            </td>
                        </tr>
                        <tr className="border-b hover:underline even:bg-gray-200 odd:bg-gray-300"
                            onClick={() => setShowRaportyPracownik(!showRaportyPracownik)}>
                            <th className="border-r">Raporty dla pracownika</th>
                        </tr>
                        <tr className={`border-b hover:underline even:bg-gray-200 odd:bg-gray-300 ${showRaportyPracownik ? "" : "hidden"}`}>
                            <td onClick={() => handleRowClick("Analiza świadczeń pracowniczych")}
                                className="border-r" style={getRowStyle("Analiza świadczeń pracowniczych")}>
                                Analiza świadczeń pracowniczych
                            </td>
                        </tr>
                        <tr className={`border-b hover:underline even:bg-gray-200 odd:bg-gray-300 ${showRaportyPracownik ? "" : "hidden"}`}>
                            <td onClick={() => handleRowClick("Pracownik Analiza czasu - działalność")}
                                className="border-r" style={getRowStyle("Pracownik Analiza czasu - działalność")}>
                                Pracownik Analiza czasu - działalność
                            </td>
                        </tr>
                        <tr className={`border-b hover:underline even:bg-gray-200 odd:bg-gray-300 ${showRaportyPracownik ? "" : "hidden"}`}>
                            <td onClick={() => handleRowClick("Ewidencja czasu pracy")}
                                className="border-r" style={getRowStyle("Ewidencja czasu pracy")}>
                                Ewidencja czasu pracy
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}