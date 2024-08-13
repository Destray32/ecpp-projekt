import React from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';

export default function RaportyPage() {
    const [Projekt, setProjekt] = React.useState(null);
    const [ignoreDates, setIgnoreDates] = React.useState(false);
    const [showRaportyFirma, setShowRaportyFirma] = React.useState(false);
    const [showRaportyPracownik, setShowRaportyPracownik] = React.useState(false);

    const projektyOptions = [
        { label: 'A O Tobiasson-22043', value: 'A O Tobiasson-22043' },
        // Add other project options here
    ];

    return (
        <div>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Opcje</p>
            </div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">
                    <p>Wybierz okres raportowania</p>
                    <div className="flex flex-row space-x-4">
                        <input type="date" className="p-1" disabled={ignoreDates} />
                        <input type="date" className="p-1" disabled={ignoreDates} />
                    </div>
                    <div className="flex flex-row items-center mt-4">
                        <Checkbox
                            inputId="ignoreDates"
                            checked={ignoreDates}
                            onChange={(e) => setIgnoreDates(e.checked)}
                            className="mr-2 ml-2"
                        />
                        <label htmlFor="ignoreDates">Ignoruj Daty</label>
                    </div>
                    <div className="mt-4 w-full flex justify-center">
                        <div className="w-2/4">
                            <p>Projekty</p>
                            <Dropdown 
                                value={Projekt} 
                                options={projektyOptions} 
                                onChange={(e) => setProjekt(e.value)} 
                                placeholder="Wybierz projekt"
                                className="w-full p-2" 
                            />
                        </div>
                    </div>
                    <div className="flex space-x-4 mt-8">
                        <Button className="p-button-outlined border-2 p-3 bg-white text-black pr-4 pl-4">
                            Generuj raport
                        </Button>
                        <Button className="p-button-outlined border-2 p-3 bg-white text-black pr-4 pl-4">
                            Anuluj
                        </Button>
                    </div>
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
