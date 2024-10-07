import React, { useEffect } from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Link } from "react-router-dom";
import axios from "axios";

import checkUserType from "../../utils/accTypeUtils";

export default function PojazdyPage() {
    const [tableData, setTableData] = React.useState([]);
    const [typKonta, setTypKonta] = React.useState('');
    const [isAdmin, setIsAdmin] = React.useState(false);

    useEffect(() => {
        checkUserType(setTypKonta);
    }, []);

    useEffect(() => {
        if (typKonta === 'Administrator') {
            setIsAdmin(true);
        }
    }, [typKonta]);

    useEffect(() => {
        axios.get("http://47.76.209.242:5000/api/pojazdy", { withCredentials: true })
            .then((response) => {
                setTableData(response.data.pojazdy);
            });
    }, []);

    const handleDelete = (id) => {
        axios.delete(`http://47.76.209.242:5000/api/pojazdy/${id}`, { withCredentials: true })
            .then((response) => {
                setTableData((prevData) => prevData.filter((item) => item.id !== id));
            });
    }

    return (
        <div>
            <AmberBox>
                <div className="flex flex-row items-center p-4 w-full">
                    <p>Pojazdy</p>
                    <div className="ml-auto">
                    {isAdmin && (
                        <Link to="/home/nowy-pojazd">
                            <Button
                                label="Dodaj nowy pojazd"
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2" />
                        </Link>
                    )}
                    </div>
                </div>
            </AmberBox>
            <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th className="border-r">Nr</th>
                            <th className="border-r">Nr rejestracyjny</th>
                            <th className="border-r">Marka</th>
                            <th className="border-r">Uwagi</th>
                            <th>Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {tableData && tableData.map((item, index) => (
                            <tr key={item.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                <td className="border-r">{index + 1}</td>
                                <td className="border-r">{item.numerRejestracyjny}</td>
                                <td className="border-r">{item.marka}</td>
                                <td className="border-r">{(item.uwagi === "" ? "Brak" : item.uwagi)}</td>
                                <td>
                                    <Button onClick={() => handleDelete(item.id)} icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text p-button-outlined" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}