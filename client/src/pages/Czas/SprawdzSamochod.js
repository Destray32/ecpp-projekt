import React from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';

export default function SprawdzSamochodPage() {
    const [Pojazd, setPojazd] = React.useState(null);
    const [ignoreDates, setIgnoreDates] = React.useState(false);
    const [selectedItems, setSelectedItems] = React.useState([]);

    const sampleData = [
        {
            id: 1,
            data: "2021-10-01",
            dane: "Marek Zając",
            projekt: "NCW",
            godziny: "8"
        },
        {
            id: 2,
            data: "2021-10-01",
            dane: "Marek Zając",
            projekt: "NCW",
            godziny: "8"
        },
        {
            id: 3,
            data: "2021-10-01",
            dane: "Marek Zając",
            projekt: "NCW",
            godziny: "8"
        }
    ];

    const handleCheckboxChange = (id) => {
        setSelectedItems(prevState =>
            prevState.includes(id)
                ? prevState.filter(item => item !== id)
                : [...prevState, id]
        );
    };

    const pojazdyOptions = [
        { label: 'BJO075 Volkswagen VW Czarny / 3os.', value: 'BJO075 Volkswagen VW Czarny / 3os.' },
        // Add other vehicle options here
    ];

    return (
        <div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">
                    <p>Wybierz okres</p>
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
                    <div className="mt-4 w-full flex flex-col items-center">
                        <p className="mb-2">Samochody</p>
                        <Dropdown 
                            value={Pojazd} 
                            options={pojazdyOptions} 
                            onChange={(e) => setPojazd(e.value)} 
                            placeholder="Pojazdy"
                            className="w-2/4 p-2" 
                        />
                    </div>
                    <div className="flex space-x-4 mt-8">
                        <Button className="p-button-outlined border-2 p-3 bg-white text-black pr-4 pl-4">
                            Sprawdź samochód
                        </Button>
                        <Button className="p-button-outlined border-2 p-3 bg-white text-black pr-4 pl-4">
                            Drukuj
                        </Button>
                    </div>
                </div>
            </AmberBox>
            <div className="w-full md:w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th className="border-r">Data</th>
                            <th className="border-r">Imię i nazwisko</th>
                            <th className="border-r">Projekt</th>
                            <th className="border-r">Ilość godzin</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {sampleData.map((item) => (
                            <tr key={item.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                <td className="border-r">{item.data}</td>
                                <td className="border-r">{item.dane}</td>
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
