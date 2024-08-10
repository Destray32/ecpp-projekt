import React from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Link } from "react-router-dom";

export default function GrupyProjektowPage() {
    const [selectedItems, setSelectedItems] = React.useState([]);

    const sampleData = [
        {
            id: 1,
            Zleceniodawca: "NCW",
            Cennik: "2021-10-01",
            Stawka: "2021-10-10",
        },
        {
            id: 2,
            Zleceniodawca: "NCW",
            Cennik: "2021-10-01",
            Stawka: "2021-10-10",
        },
        {
            id: 3,
            Zleceniodawca: "NCW",
            Cennik: "2021-10-01",
            Stawka: "2021-10-10",
        }
    ];
    
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
                <p>Grupy projektów</p>
                <div className="ml-auto">
                <Link to="/home/nowa-grupa">
                <Button label="Dodaj nową grupę" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2" />
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
                    <th className="border-r">Zleceniodawca</th>
                    <th className="border-r">Cennik</th>
                    <th className="border-r">Stawka za 1km</th>
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
                        <td className="border-r">{item.Zleceniodawca}</td>
                        <td className="border-r">{item.Cennik}</td>
                        <td className="border-r">{item.Stawka}</td>
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