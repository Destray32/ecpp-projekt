import React, { useEffect } from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import axios from "axios";

export default function RaportyPage() {
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [Projekt, setProjekt] = React.useState(null);
    const [projektyOptions, setProjektyOptions] = React.useState([]);
    const [showRaportyFirma, setShowRaportyFirma] = React.useState(false);
    const [showRaportyPracownik, setShowRaportyPracownik] = React.useState(false);

    useEffect(() => {
        axios.get('http://localhost:5000/api/raporty')
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

        axios.get('http://localhost:5000/api/generujRaport', { params })
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.log(error);
        });
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
                    <Dropdown value={Projekt} options={projektyOptions} onChange={(e) => setProjekt(e.value)} showClear placeholder="Wybierz projekt" />
                    <Button onClick={handleGenerateReport} label="Generuj raport" className="p-button-outlined border-2 p-2.5 bg-white text-black" />
                </div>
            </AmberBox>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Raporty</p>
            </div>
            <div className="w-full md:w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <tbody className="text-left">
                        <tr className="border-b even:bg-gray-200 odd:bg-gray-300" 
                        onClick={() => setShowRaportyFirma(!showRaportyFirma)}>
                            <th className="border-r">Raporty dla firmy</th>
                        </tr>
                        <tr className={`border-b even:bg-gray-200 odd:bg-gray-300 ${showRaportyFirma ? "" : "hidden"}`}>
                            <td className="border-r">Sprawozdanie z działalności - szczegółowe</td>
                        </tr>
                        <tr className={`border-b even:bg-gray-200 odd:bg-gray-300 ${showRaportyFirma ? "" : "hidden"}`}>
                            <td className="border-r">Sprawozdanie z działalności - podsumowanie</td>
                        </tr>
                        <tr className="border-b even:bg-gray-200 odd:bg-gray-300" 
                        onClick={() => setShowRaportyPracownik(!showRaportyPracownik)}>
                            <th className="border-r">Raporty dla pracownika</th>
                        </tr>
                        <tr className={`border-b even:bg-gray-200 odd:bg-gray-300 ${showRaportyPracownik ? "" : "hidden"}`}>
                            <td className="border-r">Analiza świadczeń pracowniczych</td>
                        </tr>
                        <tr className={`border-b even:bg-gray-200 odd:bg-gray-300 ${showRaportyPracownik ? "" : "hidden"}`}>
                            <td className="border-r">Pracownik Analiza czasu - działalność</td>
                        </tr>
                        <tr className={`border-b even:bg-gray-200 odd:bg-gray-300 ${showRaportyPracownik ? "" : "hidden"}`}>
                            <td className="border-r">Ewidencja czasu pracy</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
