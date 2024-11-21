import React, { useEffect } from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Link } from "react-router-dom";
import axios from "axios";

import checkUserType from "../../utils/accTypeUtils";

export default function PojazdyPage() {
    const [tableData, setTableData] = React.useState([]);
    const [accountType, setAccountType] = React.useState('');
    const [editableRow, setEditableRow] = React.useState(null);
    const [editedData, setEditedData] = React.useState({});


    useEffect(() => {
        checkUserType(setAccountType);
    }, []);


    useEffect(() => {
        axios.get("http://localhost:5000/api/pojazdy", { withCredentials: true })
            .then((response) => {
                setTableData(response.data.pojazdy);
            });
    }, []);

    const handleDelete = (id) => {
        axios.delete(`http://localhost:5000/api/pojazdy/${id}`, { withCredentials: true })
            .then((response) => {
                setTableData((prevData) => prevData.filter((item) => item.id !== id));
            });
    }

    const handleEdit = (id) => {
        if (editableRow === id) {
            // Ensure that editedData contains valid data before sending it
            if (!editedData.numerRejestracyjny || !editedData.marka) {
                alert("Numer rejestracyjny i Marka są wymagane.");
                return; // Prevent sending incomplete data
            }
    
            setEditableRow(null); 
            console.log(editedData);
            
            axios.put(`http://localhost:5000/api/pojazdy/${id}`, editedData, { withCredentials: true })
                .then((response) => {
                    setTableData((prevData) =>
                        prevData.map(item => (item.id === id ? { ...item, ...editedData } : item))
                    );
                })
                .catch(error => {
                    console.error("Error updating vehicle:", error);
                });
        } else {
            // Populate editedData with current item values
            const currentItem = tableData.find(item => item.id === id);
            setEditedData({
                numerRejestracyjny: currentItem.numerRejestracyjny,
                marka: currentItem.marka,
                uwagi: currentItem.uwagi || "" // Default to empty string if uwagi is null
            });
            setEditableRow(id);
        }
    }
    
    
    

    const handleChange = (e, field) => {
        const value = e.target.value;
        setEditedData(prev => ({ ...prev, [field]: value }));
    }

    return (
        <div>
            <AmberBox>
                <div className="flex flex-row items-center p-4 w-full">
                    <p>Pojazdy</p>
                    <div className="ml-auto">
                            <Link to="/home/nowy-pojazd" onClick={(e) => {
                                    if (accountType !== 'Administrator') {
                                        e.preventDefault();
                                    }
                                }}>
                                <Button
                                    label="Dodaj nowy pojazd"
                                    className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2"
                                    disabled={accountType !== 'Administrator'}
                                    />
                            </Link>
                    </div>
                </div>
            </AmberBox>
            <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full table-fixed">
                    <thead className="bg-blue-700 text-white">
                    <tr>
                        <th className="border-r w-1/12">Nr</th>
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
                        <td className="border-r">
                            {editableRow === item.id ? (
                            <input
                                type="text"
                                value={editedData.numerRejestracyjny || item.numerRejestracyjny}
                                onChange={(e) => handleChange(e, 'numerRejestracyjny')}
                                className="border rounded p-2 w-3/4"
                            />
                            ) : (
                            item.numerRejestracyjny
                            )}
                        </td>
                        <td className="border-r">
                            {editableRow === item.id ? (
                            <input
                                type="text"
                                value={editedData.marka || item.marka}
                                onChange={(e) => handleChange(e, 'marka')}
                                className="border rounded p-2 w-3/4"
                            />
                            ) : (
                            item.marka
                            )}
                        </td>
                        <td className="border-r">
                            {editableRow === item.id ? (
                            <input
                                type="text"
                                value={editedData.uwagi || item.uwagi}
                                onChange={(e) => handleChange(e, 'uwagi')}
                                className="border rounded p-2 w-3/4"
                            />
                            ) : (
                            (item.uwagi === "" ? "Brak" : item.uwagi)
                            )}
                        </td>
                        <td>
                            <Button
                            onClick={() => handleDelete(item.id)}
                            icon="pi pi-trash"
                            className="text-red-600 p-button-rounded p-button-danger p-button-text p-button-outlined"
                            disabled={accountType !== 'Administrator'}
                            />
                            <Button
                            onClick={() => handleEdit(item.id)}
                            icon={editableRow === item.id ? "pi pi-check" : "pi pi-pencil"}
                            className="p-button-rounded p-button-primary p-button-text p-button-outlined"
                            disabled={accountType !== 'Administrator'}
                            />
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
        </div>
    );
}
