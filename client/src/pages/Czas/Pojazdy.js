import React, { useEffect } from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Link } from "react-router-dom";
import { Dialog } from 'primereact/dialog';
import axios from "axios";

import checkUserType from "../../utils/accTypeUtils";

export default function PojazdyPage() {
    const [tableData, setTableData] = React.useState([]);
    const [accountType, setAccountType] = React.useState('');
    const [editableRow, setEditableRow] = React.useState(null);
    const [editedData, setEditedData] = React.useState({});
    const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
    const [deleteItemId, setDeleteItemId] = React.useState(null);
    const [error, setError] = React.useState('');

    useEffect(() => {
        checkUserType(setAccountType);
    }, []);

    useEffect(() => {
        axios.get("https://qubis.pl:5000/api/pojazdy", { withCredentials: true })
            .then((response) => {
                setTableData(response.data.pojazdy);
            });
    }, []);

    const showDeleteDialog = (id) => {
        setDeleteItemId(id);
        setDeleteDialogVisible(true);
    };

    const hideDeleteDialog = () => {
        setDeleteDialogVisible(false);
        setDeleteItemId(null);
    };

    const confirmDelete = () => {
        axios.delete(`https://qubis.pl:5000/api/pojazdy/${deleteItemId}`, { withCredentials: true })
            .then(() => {
                setTableData((prevData) => prevData.filter((item) => item.id !== deleteItemId));
                setDeleteDialogVisible(false);
                setDeleteItemId(null);
            });
    };

    const handleEdit = (id) => {
        if (editableRow === id) {
            let isValid = true;
    
            // Check if 'numerRejestracyjny' is empty
            if (!editedData.numerRejestracyjny.trim()) {
                setError((prevErrors) => ({
                    ...prevErrors,
                    numerRejestracyjny: "Numer rejestracyjny jest wymagany."
                }));
                isValid = false;
            } else {
                setError((prevErrors) => ({
                    ...prevErrors,
                    numerRejestracyjny: ""  // Clear the error if valid
                }));
            }
    
            // Check if 'marka' is empty
            if (!editedData.marka.trim()) {
                setError((prevErrors) => ({
                    ...prevErrors,
                    marka: "Marka jest wymagana."
                }));
                isValid = false;
            } else {
                setError((prevErrors) => ({
                    ...prevErrors,
                    marka: ""  // Clear the error if valid
                }));
            }
    
            // If both fields are valid, proceed with the update
            if (isValid) {
                setEditableRow(null);
                axios.put(`https://qubis.pl:5000/api/pojazdy/${id}`, editedData, { withCredentials: true })
                    .then(() => {
                        setTableData(prevData =>
                            prevData.map(item => (item.id === id ? { ...item, ...editedData } : item))
                        );
                    })
                    .catch(error => {
                        console.error("Error updating vehicle:", error);
                    });
            }
        } else {
            const currentItem = tableData.find(item => item.id === id);
            setEditedData({
                numerRejestracyjny: currentItem.numerRejestracyjny || "",
                marka: currentItem.marka || "",
                uwagi: currentItem.uwagi || ""
            });
            setEditableRow(id);
        }
    };
    
    

    const handleChange = (e, field) => {
    const value = e.target.value;
    setEditedData(prev => ({
        ...prev,
        [field]: value
    }));
};


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
                                        <div>
                                            <input
                                                type="text"
                                                value={editedData.hasOwnProperty("numerRejestracyjny") ? editedData.numerRejestracyjny : item.numerRejestracyjny}
                                                onChange={(e) => handleChange(e, 'numerRejestracyjny')}
                                                className="border rounded p-2 w-3/4"
                                            />
                                            {error.numerRejestracyjny && (
                                                <p className="text-red-500 text-sm mt-1">{error.numerRejestracyjny}</p>
                                            )}
                                        </div>
                                    ) : (
                                        item.numerRejestracyjny
                                    )}
                                </td>

                                <td className="border-r">
                                    {editableRow === item.id ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={editedData.hasOwnProperty("marka") ? editedData.marka : item.marka}
                                                onChange={(e) => handleChange(e, 'marka')}
                                                className="border rounded p-2 w-3/4"
                                            />
                                            {error.marka && (
                                                <p className="text-red-500 text-sm mt-1">{error.marka}</p>
                                            )}
                                        </div>
                                    ) : (
                                        item.marka
                                    )}
                                </td>

                                <td className="border-r">
                                    {editableRow === item.id ? (
                                        <input
                                            type="text"
                                            value={editedData.hasOwnProperty("uwagi") ? editedData.uwagi : item.uwagi}
                                            onChange={(e) => handleChange(e, 'uwagi')}
                                            className="border rounded p-2 w-3/4"
                                        />
                                    ) : (
                                        item.uwagi
                                    )}
                                </td>
                                <td>
                                    <Button
                                        onClick={() => showDeleteDialog(item.id)}
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

            <Dialog
                header="Potwierdzenie"
                visible={deleteDialogVisible}
                onHide={hideDeleteDialog}
                footer={
                    <div>
                        <Button label="Anuluj" icon="pi pi-times" onClick={hideDeleteDialog} className="px-1 p-button-outlined p-button-danger w-[6rem] border text-red-600" />
                        <Button label="Usuń" icon="pi pi-check" onClick={confirmDelete} className="px-1 p-button-success w-[6rem] text-green-400 border" />
                    </div>
                }
            >
                <p>Czy na pewno chcesz usunąć ten pojazd?</p>
            </Dialog>
        </div>
    );
}
