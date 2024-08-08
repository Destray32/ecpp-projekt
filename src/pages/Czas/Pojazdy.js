import React from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Link } from "react-router-dom";
import { Checkbox } from 'primereact/checkbox';

const sampleData = [
    {
        id: 1,
        Nrrejestracyjny: "BJO042",
        Marka: "Volvo",
        Uwagi: "Brak",
    },
    {
        id: 2,
        Nrrejestracyjny: "BJO042",
        Marka: "Volvo",
        Uwagi: "Brak",
    },
    {
        id: 3,
        Nrrejestracyjny: "BJO042",
        Marka: "Volvo",
        Uwagi: "Brak",
    }
];

export default function PojazdyPage() {
    const [selectedItems, setSelectedItems] = React.useState([]);
    const handleCheckboxChange = (id) => {
        setSelectedItems(prevState =>
            prevState.includes(id)
                ? prevState.filter(item => item !== id)
                : [...prevState, id]
        );
    };
    return (
        <div>
        <AmberBox>
            <div className="flex flex-row items-center p-4 w-full">
                <p>Pojazdy</p>
                <div className="ml-auto">
                <Link to="/home/nowy-pojazd">
                <Button label="Dodaj nowy pojazd" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2" />
                </Link>
                </div>
            </div>
        </AmberBox>
        <div className="w-full md:w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
        <table className="w-full">
            <thead className="bg-blue-700 text-white">
                <tr>
                    <th></th>
                    <th className="border-r">Nr</th>
                    <th className="border-r">Nr rejestracyjny</th>
                    <th className="border-r">Marka</th>
                    <th className="border-r">Uwagi</th>
                    <th></th>
                </tr>
            </thead>
            <tbody className="text-center">
                {sampleData.map((item) => (
                    <tr key={item.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                        <td className="border-r">
                            <Checkbox 
                                inputId={`cb-${item.id}`}
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleCheckboxChange(item.id)}
                            />
                        </td>
                        <td className="border-r">{item.id}</td>
                        <td className="border-r">{item.Nrrejestracyjny}</td>
                        <td className="border-r">{item.Marka}</td>
                        <td className="border-r">{item.Uwagi}</td>
                        <td>
                            <Button label="Usuń" className="bg-blue-700 text-white p-1 m-0.5" />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
        </div>
    )
}