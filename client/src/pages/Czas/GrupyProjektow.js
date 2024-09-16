import React from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Link, useActionData } from "react-router-dom";
import Axios from "axios";
import { useEffect } from "react";

export default function GrupyProjektowPage() {
    const [availableGroups, setAvailableGroups] = React.useState([]);
    
   
    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = () => {
        Axios.get("http://47.76.209.242:5000/api/grupy", { withCredentials: true })
            .then((response) => {
                setAvailableGroups(response.data.grupy);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleDelete = (id) => {
        if (id === undefined || id === null) {
            console.log('Invalid ID:', id);
            console.error('Invalid ID:', id);
            return;
        }
        console.log(id);
        Axios.delete(`http://47.76.209.242:5000/api/grupy/${id}`, { withCredentials: true })
            .then((response) => {
                console.log(response.data);
                fetchGroups(); 
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <div>
        <AmberBox>
            <div className="flex flex-row items-center p-4 w-full">
                <p>Grupy projektów</p>
                <div className="ml-auto">
                    <Link className="mr-2" to="/home/projekty">
                        <Button label="Powrót" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2" />
                    </Link>
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
                    <th className="border-r">Nr</th>
                    <th className="border-r">Zleceniodawca</th>
                    <th className="border-r">Cennik</th>
                    <th className="border-r">Stawka za 1km</th>
                    <th></th>
                </tr>
            </thead>
            <tbody className="text-center">
                {availableGroups.map((group, index) => (
                    <tr key={group.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                        <td className="border-r">{index + 1}</td>
                        <td className="border-r">{group.Zleceniodawca}</td>
                        <td className="border-r">{group.Cennik}</td>
                        <td className="border-r">{group.Stawka}</td>
                        <td>
                            <Link to={`/home/grupa/${group.id}`}>
                                <Button 
                                    label="Edytuj"
                                    className="bg-blue-700 text-white p-1 m-0.5"
                                />
                            </Link>
                            <Button 
                                onClick={() => handleDelete(group.id)}
                                label="Usuń"
                                className="bg-red-500 text-white p-1 m-0.5"
                            />
                        </td>
                    </tr>
                ))}
            </tbody>


        </table>
    </div>
    </div>
    )
}