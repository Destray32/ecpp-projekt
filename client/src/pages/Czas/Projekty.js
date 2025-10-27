import React from "react";
import AmberBox from "../../Components/AmberBox";
import { Dropdown } from 'primereact/dropdown';
import { useState, useEffect } from "react";
import { Button } from 'primereact/button';
import { Link } from "react-router-dom";
import { Checkbox } from 'primereact/checkbox';
import Axios from "axios";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import checkUserType, { hasSpecialAccess } from "../../utils/accTypeUtils";

export default function ProjektyPage() {
    const [filtr, setFiltr] = useState('Wszystkie');
    const [selectedItems, setSelectedItems] = useState([]);
    const [data, setData] = useState([]);
    const [accountType, setAccountType] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [searchZleceniodawca, setSearchZleceniodawca] = useState('');
    const [zleceniodawcyOptions, setZleceniodawcyOptions] = useState([]);
    const [imie, setImie] = useState('');
    const [nazwisko, setNazwisko] = useState('');
    const baseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const getImie = async () => {
            try {
                const response = await Axios.get(`${baseUrl}/api/imie`, { withCredentials: true });
                const { name, surename } = response.data;
                setImie(name);
                setNazwisko(surename);
            } catch (error) {
                console.error(error);
            }
        };
        getImie();
    }, []);
    useEffect(() => {
        checkUserType(setAccountType);
    }, []);


    const handleCheckboxChange = (id) => {
        setSelectedItems(prevState =>
            prevState.includes(id)
                ? prevState.filter(item => item !== id)
                : [...prevState, id]
        );
    };

    const handleSelectAllChange = () => {
        setSelectAll(!selectAll);
        setSelectedItems(!selectAll ? data.map(projekty => projekty.id) : []);
    };

    useEffect(() => {
    if (filtr === 'Wszystkie') {
        fetchProjects();
    } else {
        handleSzukaj();
    }
}, [filtr]);


    useEffect(() => {
        fetchZleceniodawcyOptions();
    }, []);

    const fetchZleceniodawcyOptions = () => {
        Axios.get(`${baseUrl}/api/grupy`, { withCredentials: true })
            .then((response) => {
                if (response.data && Array.isArray(response.data.grupy)) {
                    const zleceniodawcy = response.data.grupy
                        .filter(item => item.Zleceniodawca && item.id !== 'separator') // Exclude separators and invalid entries
                        .map(item => ({ label: item.Zleceniodawca, value: item.Zleceniodawca }));
                    setZleceniodawcyOptions(zleceniodawcy);
                } else {
                    console.error('Unexpected response structure:', response.data);
                    setZleceniodawcyOptions([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching Zleceniodawcy options:', error);
                setZleceniodawcyOptions([]);
            });
    };

    const handleDelete = (id) => {
        confirmDialog({
            message: 'Czy na pewno chcesz usunąć ten projekt?',
            header: 'Potwierdzenie usunięcia',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Tak',
            rejectLabel: 'Nie',
            acceptClassName: 'p-button-danger p-mr-3', // Added margin-right for spacing
            rejectClassName: 'p-button-secondary p-mr-3',
            accept: () => {
                Axios.delete(`${baseUrl}/api/czas/usun?id=${id}`, { withCredentials: true })
                    .then((response) => {
                        fetchProjects();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            reject: () => {
                console.log('Usunięcie anulowane');
            }
        });
    };

    const handleSzukaj = () => {
        Axios.get(`${baseUrl}/api/czas/szukaj?group=${filtr}`, { withCredentials: true })
            .then((response) => {
                if (response.data && Array.isArray(response.data.projekty)) {
                    const sortedProjects = [...response.data.projekty].sort((a, b) =>
                        a.Zleceniodawca.localeCompare(b.Zleceniodawca)
                    );
                    setData(sortedProjects);
                } else {
                    console.error('Unexpected response structure:', response.data);
                    setData([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching projects:', error);
                setData([]);
            });
    };

    const handleSearchZleceniodawca = () => {
        Axios.get(`${baseUrl}/api/czas/szukajZleceniodawca?name=${searchZleceniodawca}`, { withCredentials: true })
            .then((response) => {
                if (response.data && Array.isArray(response.data.projekty)) {
                    setData(response.data.projekty);
                } else {
                    console.error('Unexpected response structure:', response.data);
                    setData([]);
                }
            })
            .catch((error) => {
                console.error('Error searching projects:', error);
                setData([]);
            });
    };

    const handlePrzeniesAktyw = () => {
        Axios.put(`${baseUrl}/api/czas/przeniesAkt`,
            { ids: selectedItems.map((id) => id) },
            { withCredentials: true }
        )
            .then((response) => {
                // Reload projects based on the current filter and search criteria
                if (searchZleceniodawca) {
                    Axios.get(`${baseUrl}/api/czas/szukajZleceniodawca?name=${searchZleceniodawca}`, { withCredentials: true })
                        .then((response) => {
                            if (response.data && Array.isArray(response.data.projekty)) {
                                setData(response.data.projekty);
                            } else {
                                console.error('Unexpected response structure:', response.data);
                                setData([]);
                            }
                        })
                        .catch((error) => {
                            console.error('Error searching projects:', error);
                            setData([]);
                        });
                } else {
                    fetchProjects();
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handlePrzeniesNieaktyw = () => {
        Axios.put(`${baseUrl}/api/czas/przeniesNieakt`,
            { ids: selectedItems.map((id) => id) },
            { withCredentials: true }
        )
            .then((response) => {
                // Reload projects based on the current filter and search criteria
                if (searchZleceniodawca) {
                    Axios.get(`${baseUrl}/api/czas/szukajZleceniodawca?name=${searchZleceniodawca}`, { withCredentials: true })
                        .then((response) => {
                            if (response.data && Array.isArray(response.data.projekty)) {
                                setData(response.data.projekty);
                            } else {
                                console.error('Unexpected response structure:', response.data);
                                setData([]);
                            }
                        })
                        .catch((error) => {
                            console.error('Error searching projects:', error);
                            setData([]);
                        });
                } else {
                    fetchProjects();
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const fetchProjects = () => {
        Axios.get(`${baseUrl}/api/czas/szukaj`, { withCredentials: true })
            .then((response) => {
                if (response.data && Array.isArray(response.data.projekty)) {
                    const sortedProjects = [...response.data.projekty].sort((a, b) =>
                        a.Zleceniodawca.localeCompare(b.Zleceniodawca)
                    );
                    setData(sortedProjects);
                } else {
                    console.error('Unexpected response structure:', response.data);
                    setData([]);
                }
            })
            .catch((error) => {
                console.error(error);
                setData([]);
            });
    };

    const fetchUnusedProjects = () => {
        const timestamp = new Date().getTime();
        Axios.get(`${baseUrl}/api/czas/projekty/nieuzywane?_t=${timestamp}`, { 
            withCredentials: true,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
            .then((response) => {
                // console.log('fetch:', new Date().toLocaleTimeString());
                if (response.data && Array.isArray(response.data.nieuzywaneProjekty)) {
                    const unusedData = response.data.nieuzywaneProjekty.reduce((acc, item) => {
                        acc[item.id] = item.DaysUnused === null ? 'Nigdy' : Math.floor(item.DaysUnused / 7);
                        return acc;
                    }, {});

                    setData(prevData =>
                        prevData.map(projekt => ({
                            ...projekt,
                            WeeksUnused: unusedData[projekt.id] !== undefined ? unusedData[projekt.id] : '—'
                        }))
                    );
                } else {
                    console.error('Unexpected response structure:', response.data);
                    setData(prevData =>
                        prevData.map(projekt => ({
                            ...projekt,
                            WeeksUnused: '—'
                        }))
                    );
                }
            })
            .catch((error) => {
                console.error('Error fetching unused projects:', error);
            });
    };


useEffect(() => {
    const loadData = async () => {
        await fetchProjects();
        setTimeout(() => {
            fetchUnusedProjects();
        }, 500); // Daj czas na załadowanie podstawowych danych
    };
    
    loadData();
}, []);

useEffect(() => {
    if (searchZleceniodawca) {
        Axios.get(`${baseUrl}/api/czas/szukajZleceniodawca?name=${searchZleceniodawca}`, { withCredentials: true })
            .then((response) => {
                if (response.data && Array.isArray(response.data.projekty)) {
                    setData(response.data.projekty);
                } else {
                    console.error('Unexpected response structure:', response.data);
                    setData([]);
                }
            })
            .catch((error) => {
                console.error('Error searching projects:', error);
                setData([]);
            });
    } else {
        fetchProjects();
    }
}, [searchZleceniodawca]);


    return (
        <div>
            <AmberBox>
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4">
                            <p className="mr-6">Filtr</p>
                            <Dropdown value={filtr} onChange={(e) => setFiltr(e.value)} options={["Aktywny", "Nieaktywny", "Wszystkie"]} placeholder="Filtrowanie"
                                autoComplete="off"
                                className="w-2/12 mr-6" // Adjusted width to make it smaller
                                filter
                                resetFilterOnHide
                                filterInputAutoFocus
                            />
                            <Dropdown
                                value={searchZleceniodawca}
                                onChange={(e) => setSearchZleceniodawca(e.value)}
                                options={zleceniodawcyOptions}
                                placeholder="Szukaj według Zleceniodawcy"
                                className="w-2/12 mr-6" // Adjusted width to make it smaller
                                filter
                                resetFilterOnHide
                                filterInputAutoFocus
                            />
                            <div className="flex flex-row items-center">
                                <Button 
                                    onClick={handlePrzeniesAktyw} 
                                    label="Przenieś do aktywnych" 
                                    className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2"
                                    disabled={accountType !== 'Administrator'}
                                />
                                <Button 
                                    onClick={handlePrzeniesNieaktyw} 
                                    label="Przenieś do nieaktywnych" 
                                    className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2"
                                    disabled={accountType !== 'Administrator'}
                                />
                            </div>
                            <Link to="/home/grupy-projektow"
                                onClick={(e) => {
                                    if (accountType !== 'Administrator') {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <Button 
                                    label="Grupy projektów" 
                                    className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2"
                                    disabled={accountType !== 'Administrator'}
                                />
                            </Link>
                            <Link to="/home/nowy-projekt"
                                onClick={(e) => {
                                    if (accountType !== 'Administrator' && accountType !== 'Biuro' && accountType !== 'Kierownik' && !hasSpecialAccess(imie, nazwisko, 'projekty')) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <Button 
                                    label="Dodaj nowy projekt"
                                    className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mr-2"
                                    disabled={accountType !== 'Administrator' && accountType !== 'Biuro' && accountType !== 'Kierownik' && !hasSpecialAccess(imie, nazwisko, 'projekty')}
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </AmberBox>
            <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-black ">
                <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th className="border-r border-black text-center"> {/* Center align "Select All" checkbox */}
                                <Checkbox
                                    inputId="select-all"
                                    checked={selectAll}
                                    onChange={handleSelectAllChange}
                                />
                            </th>
                            <th className="border-r border-black">Nr</th>
                            <th className="border-r text-left pl-4 border-black">Zleceniodawca - Nazwa/Kod Projektu</th>
                            <th className="border-r border-black">Status projektu</th>
                            <th className="border-r border-black">Wpisane przez</th>
                            <th className="border-r border-black">Nieużywane od (tygodnie)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {data.map((projekty, index) => {
                            const statusClass = projekty.Status === 'Aktywny'
                                ? 'text-green-500'
                                : 'text-red-500';
                            return (
                                <tr key={projekty.id} className="border-b border-black even:bg-gray-200 odd:bg-gray-300">
                                    <td className="border-r border-black text-center"> {/* Center align individual checkboxes */}
                                        <Checkbox
                                            inputId={`cb-${projekty.id}`}
                                            checked={selectedItems.includes(projekty.id)}
                                            onChange={() => handleCheckboxChange(projekty.id)}
                                        />
                                    </td>
                                    <td className="border-r border-black">{index + 1}</td>
                                    <td className="border-r border-black text-left pl-4">
                                        <span className="text-blue-800 font-bold">{projekty.Zleceniodawca}</span> – {projekty.NazwaKod_Projektu}
                                    </td>
                                    <td className={`border-r border-black ${statusClass}`}>{projekty.Status}</td>
                                    <td className="border-r border-black">{projekty.DodanePrzez}</td>
                                    <td className="border-r border-black">{projekty.WeeksUnused}</td>
                                    <td>
                                        <Link 
                                            to={`/home/projekt/${projekty.id}`}
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
                                            onClick={() => handleDelete(projekty.id)}
                                            label="Usuń"
                                            className="bg-red-500 text-white p-1 m-0.5"
                                            disabled={accountType !== 'Administrator'}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <ConfirmDialog />
        </div>
    )
}