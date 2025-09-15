import React from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Link, useActionData } from "react-router-dom";
import Axios from "axios";
import { useEffect, useState } from "react";
import checkUserType from '../../utils/accTypeUtils';
import { Dialog } from 'primereact/dialog';

export default function GrupyProjektowPage() {
    const [availableGroups, setAvailableGroups] = React.useState([]);
    const [accountType, setAccountType] = useState('');
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleteGroupId, setDeleteGroupId] = useState(null);

    useEffect(() => {
        checkUserType(setAccountType);
    }, []);
   
    useEffect(() => {
        fetchGroups();
    }, []);
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const fetchGroups = () => {
        Axios.get(`${baseUrl}/api/grupy`, { withCredentials: true })
            .then((response) => {
                setAvailableGroups(response.data.grupy);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const confirmDelete = (id) => {
        setDeleteGroupId(id);
        setDeleteDialogVisible(true);
    };

    const handleDelete = () => {
        if (deleteGroupId === null) return;

        Axios.delete(`${baseUrl}/api/grupy/${deleteGroupId}`, { withCredentials: true })
            .then((response) => {
                fetchGroups();
                setDeleteDialogVisible(false);
                setDeleteGroupId(null);
            })
            .catch((error) => {
                console.error(error);
                setDeleteDialogVisible(false);
                setDeleteGroupId(null);
            });
    };

    // Dialog footer buttons with centered alignment
    const deleteDialogFooter = (
        <div className="flex justify-content-center gap-4">
            <Button 
                label="Nie" 
                icon="pi pi-times" 
                onClick={() => setDeleteDialogVisible(false)} 
                className="p-button-danger" 
                style={{ color: 'white', backgroundColor: '#dc3545', border: 'none', padding: '0.5rem 1.5rem' }}
            />
            <Button 
                label="Tak" 
                icon="pi pi-check" 
                onClick={handleDelete} 
                className="p-button-success" 
                style={{ color: 'white', backgroundColor: '#28a745', border: 'none', padding: '0.5rem 1.5rem' }}
            />
        </div>
    );

    return (
        <div>
        <AmberBox>
            <div className="flex flex-row items-center p-4 w-full">
                <p>Grupy projektów</p>
                <div className="ml-auto">
                    <Link className="mr-2" to="/home/projekty">
                        <Button label="Powrót" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2" />
                    </Link>
                    <Link to="/home/nowa-grupa"
                    onClick={(e) => {
                        if (accountType !== 'Administrator') {
                            e.preventDefault();
                        }
                    }}
                    >
                        <Button label="Dodaj nową grupę" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2"
                        disabled={accountType !== 'Administrator'} 
                        />
                    </Link>
                </div>
            </div>
        </AmberBox>
        <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
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
                            <Link to={`/home/grupa/${group.id}`}
                            onClick={(e) => {
                                if (accountType !== 'Administrator') {
                                    e.preventDefault();
                                }
                            }}
                            >
                                <Button 
                                    label="Edytuj"
                                    className="bg-blue-700 text-white p-1 m-0.5"
                                    disabled={accountType !== 'Administrator'}
                                />
                            </Link>
                            <Button 
                                onClick={() => confirmDelete(group.id)} 
                                label="Usuń" 
                                className="bg-red-500 text-white p-1 m-0.5" 
                                disabled={accountType !== 'Administrator'} 
                            />
                        </td>
                    </tr>
                ))}
            </tbody>


        </table>
    </div>
    <Dialog 
        visible={deleteDialogVisible} 
        style={{ width: '400px', textAlign: 'center' }} 
        header={<h3 style={{ margin: 0 }}>Potwierdzenie</h3>} 
        modal 
        footer={deleteDialogFooter} 
        onHide={() => setDeleteDialogVisible(false)}
    >
        <div className="confirmation-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <i className="pi pi-exclamation-triangle" style={{ fontSize: '3rem', color: '#ffc107' }} />
            <span style={{ fontSize: '1.2rem' }}>Czy na pewno chcesz usunąć grupę projektową "{availableGroups.find(group => group.id === deleteGroupId)?.Zleceniodawca}"?</span>
        </div>
    </Dialog>
    </div>
    )
}