import React, { useState, useEffect, useRef} from "react";
import AmberBox from "../../Components/AmberBox";
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import 'react-calendar/dist/Calendar.css';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import Axios from "axios";
import ZatwierdzWindow from '../../Components/Urlopy/ZatwierdzWindow';
import { notification } from 'antd';
import checkUserType from '../../utils/accTypeUtils';

export default function UrlopyPage() {
    const [urlopOd, setUrlopOd] = useState('');
    const [urlopDo, setUrlopDo] = useState('');
    const [UrlopDla, setUrlopDla] = useState('');
    const [Status, setStatus] = useState('Do zatwierdzenia');
    const [komentarz, setKomentarz] = useState('');
    const [filteredDane, setFilteredDane] = useState({ ApprovedUrlopy: {}, Pozostale: {} });
    const [pracownicy, setPracownicy] = useState([]);
    const [dostepneGrupy, setDostepneGrupy] = useState([]);
    const [selectedGrupy, setSelectedGrupy] = useState({});
    const [selectedGrupyNazwa, setSelectedGrupyNazwa] = useState([]);
    const [allGroupsSelected, setAllGroupsSelected] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState(''); // state do tygodnia ale bez formatowania do pdf
    const [selectedWeekAndYear, setSelectedWeekAndYear] = useState([]); // state do tygodnia i roku dla pdf
    const [editingVacationId, setEditingVacationId] = useState(null);
    const [editVacationData, setEditVacationData] = useState({ urlopOd: '', urlopDo: '', status: '' });
    const [zatwierdzWindowVisible, setZatwierdzWindowVisible] = useState(false);
    const [selectedForZatwierdzenie, setSelectedForZatwierdzenie] = useState([]);
    const [accountType, setAccountType] = useState('');
    const [imie, setImie] = useState('');
    const [nazwisko, setNazwisko] = useState('');
    let urlopyData = [];

    // RenderTable component 
    const [remainingGroupSelections, setRemainingGroupSelections] = useState({});
    const [remainingExpandedGroups, setRemainingExpandedGroups] = useState({});
    const [remainingSelectedItems, setRemainingSelectedItems] = useState([]);
    const [approvedGroupSelections, setApprovedGroupSelections] = useState({});
    const [approvedExpandedGroups, setApprovedExpandedGroups] = useState({});
    const [approvedSelectedItems, setApprovedSelectedItems] = useState([]);


    

    const extractId = (idWithPrefix) => idWithPrefix.replace('cb-', '');

    const RenderTable = ({ data, title, groupSelections, setGroupSelections, expandedGroups, setExpandedGroups, selectedItems, setSelectedItems }) => {
        const inputRef = useRef(null);
    
        useEffect(() => {
            if (editingVacationId && inputRef.current) {
                inputRef.current.focus();
            }
        }, [editingVacationId]);
    
        const handleEdit = (vacation) => {
            setEditingVacationId(vacation.id);
            setEditVacationData({
                urlopOd: convertToISOFormat(vacation.dataOd),
                urlopDo: convertToISOFormat(vacation.dataDo),
                status: vacation.status,
                komentarz: vacation.komentarz
            });
        };
    
        return (
            <>
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead className="bg-blue-700 text-white sticky top-0 z-10">
                            <tr>
                                <th className="border-r px-2 py-1 w-12"></th>
                                <th className="border-r px-2 py-1 w-32">Imię i nazwisko</th>
                                <th className="border-r px-2 py-1 w-24">Od</th>
                                <th className="border-r px-2 py-1 w-24">Do</th>
                                <th className="border-r px-2 py-1 w-64">Komentarz</th>
                                <th className="border-r px-2 py-1 w-24">Status</th>
                                <th className="w-32"></th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {Object.keys(data).map((name) => (
                                <React.Fragment key={name}>
                                    <tr>
                                        <td colSpan="7" className="cursor-pointer bg-gray-100 hover:bg-gray-200">
                                            <div className="flex items-center"  onClick={() => handleGroupToggle(name, setExpandedGroups, expandedGroups)}>
                                                <Checkbox
                                                    inputId={`cb-${name}`}
                                                    checked={groupSelections[name] || false}
                                                    className="ml-2 bg-gray-500"
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleGroupCheckboxChange(name, setGroupSelections, groupSelections, setSelectedItems, data[name]);
                                                    }}
                                                />
                                                <p className="ml-2">{name}</p>
                                                <span className="ml-auto" onClick={() => handleGroupToggle(name, setExpandedGroups, expandedGroups)}>{expandedGroups[name] ? '−' : '+'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedGroups[name] && data[name].map((urlopy) => (
                                        <tr key={urlopy.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                            <td className="border-r px-2 py-1">
                                                <Checkbox
                                                    inputId={`cb-${urlopy.id}`}
                                                    checked={selectedItems.includes(`cb-${urlopy.id}`)}
                                                    onChange={() => handleCheckboxChange(`cb-${urlopy.id}`, setSelectedItems, selectedItems)}
                                                />
                                            </td>
                                            <td className="border-r px-2 py-1">{urlopy.imie} {urlopy.nazwisko}</td>
                                            {editingVacationId === urlopy.id ? (
                                                <>
                                                    <td className="border-r px-2 py-1">
                                                        <InputText value={editVacationData.urlopOd} type="date" onChange={(e) => setEditVacationData({ ...editVacationData, urlopOd: e.target.value })} />
                                                    </td>
                                                    <td className="border-r px-2 py-1">
                                                        <InputText value={editVacationData.urlopDo} type="date" onChange={(e) => setEditVacationData({ ...editVacationData, urlopDo: e.target.value })} />
                                                    </td>
                                                    <td className="border-r px-2 py-1">
                                                        <InputText
                                                            ref={inputRef}
                                                            value={editVacationData.komentarz}
                                                            onChange={(e) => setEditVacationData({ ...editVacationData, komentarz: e.target.value })}
                                                        />
                                                    </td>
                                                    <td className="border-r px-2 py-1">
                                                        <Dropdown value={editVacationData.status} options={["Do zatwierdzenia", "Zatwierdzone", "Anulowane"]} onChange={(e) => setEditVacationData({ ...editVacationData, status: e.value })} />
                                                    </td>
                                                    <td className="px-2 py-1">
                                                        <Button label="Zapisz" onClick={() => handleSave(urlopy.id)} className="bg-blue-700 text-white p-1 m-0.5 text-xs" />
                                                        <Button label="Anuluj" onClick={() => setEditingVacationId(null)} className="bg-red-500 text-white p-1 m-0.5 text-xs" />
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="border-r px-2 py-1">{urlopy.dataOd}</td>
                                                    <td className="border-r px-2 py-1">{urlopy.dataDo}</td>
                                                    <td className="border-r px-2 py-1">{urlopy.komentarz}</td>
                                                    <td className={`border-r px-2 py-1 ${getStatusClass(urlopy.status)}`}>{urlopy.status}</td>
                                                    <td className="px-2 py-1">
                                                        <Button label="Edytuj" onClick={() => handleEdit(urlopy)} disabled={accountType !== 'Administrator'} className="bg-blue-700 text-white p-1 m-0.5 text-sm" />
                                                        <Button label="Usuń" onClick={() => handleUsun(urlopy.id)} disabled={accountType !== 'Administrator'} className="bg-red-500 text-white p-1 m-0.5 text-sm" />
                                                        <Button label="Zatwierdź" onClick={() => handleZatwierdz(urlopy.id, false)} disabled={accountType !== 'Administrator'} className="bg-green-500 text-white p-1 m-0.5 text-sm" />
                                                        <Button label="Anuluj" onClick={() => handleAnuluj(urlopy.id, false)} disabled={accountType !== 'Administrator'} className="bg-red-500 text-white p-1 m-0.5 text-sm" />
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    const ApprovedTable = () => {
        return (
            <RenderTable
                data={filteredDane.ApprovedUrlopy}
                title='Zatwierdzone urlopy'
                groupSelections={approvedGroupSelections}
                setGroupSelections={setApprovedGroupSelections}
                expandedGroups={approvedExpandedGroups}
                setExpandedGroups={setApprovedExpandedGroups}
                selectedItems={approvedSelectedItems}
                setSelectedItems={setApprovedSelectedItems}
            />
        );
    };
    
    const RemainingTable = () => {
        return (
            <RenderTable
                data={filteredDane.Pozostale}
                title='Pozostałe urlopy'
                groupSelections={remainingGroupSelections}
                setGroupSelections={setRemainingGroupSelections}
                expandedGroups={remainingExpandedGroups}
                setExpandedGroups={setRemainingExpandedGroups}
                selectedItems={remainingSelectedItems}
                setSelectedItems={setRemainingSelectedItems}
            />
        );
    };
    

    const handlePdfDownloadClick = () => {

        Axios.post(
            "http://localhost:5000/api/urlopy/pdf",
            { Zleceniodawca: selectedGrupyNazwa },
            { withCredentials: true }
        )
            .then((response) => {
                // console.log("PDF response", response.data);
                const databaseData = response.data;
                const transformedData = [];

                databaseData.forEach(entry => {
                    // Create a unique identifier for the person (you could use name and surname, or any unique key)
                    const personKey = `${entry.Imie} ${entry.Nazwisko}`;

                    // sprawdzenie czy osoba jest już w tablicy transformedData
                    let person = transformedData.find(p => p.name === personKey);

                    if (!person) {
                        // jestli nie ma to dodajemy do tablicy
                        person = {
                            id: entry.FK_idPracownik, // zakładamy że id pracownika jest unikalne
                            name: personKey,
                            vacations: []
                        };
                        transformedData.push(person);
                    }

                    // dodajemy urlop do danej osoby
                    person.vacations.push({
                        from: entry.Urlop_od,
                        to: entry.Urlop_do,
                        status: entry.Status
                    });
                });

                localStorage.setItem('vacationData', JSON.stringify(transformedData));

                // Otwarcie nowego okna z pdf-em
                setTimeout(() => {
                    window.open(`http://localhost:3000/test`, '_blank');
                }, 1500);

            })
            .catch((error) => {
                console.error("There was an error fetching the data:", error);
                notification.error({
                    message: 'Błąd pobierania danych',
                    description: 'Wystąpił błąd podczas pobierania danych do generowania PDF',
                    placement: 'topRight'
                });
            });
    };

    const handleGroupCheckboxChange = (groupName, setGroupSelections, groupSelections, setSelectedItems, data) => {
        const isChecked = !groupSelections[groupName];
        
        setGroupSelections(prevSelections => ({
            ...prevSelections,
            [groupName]: isChecked,
        }));
        
        const itemIds = data.map(item => `cb-${item.id}`);
        
        setSelectedItems(prevSelectedItems => 
            isChecked 
                ? [...new Set([...prevSelectedItems, ...itemIds])]
                : prevSelectedItems.filter(item => !itemIds.includes(item)) 
        );
    };
    
    const handleCheckboxChange = (checkboxId, setSelectedItems, selectedItems) => {
        setSelectedItems(prevSelectedItems => 
            prevSelectedItems.includes(checkboxId) 
                ? prevSelectedItems.filter(item => item !== checkboxId)
                : [...prevSelectedItems, checkboxId]
        );
    };
    
    const handleGroupToggle = (groupName, setExpandedGroups, expandedGroups) => {
        setExpandedGroups(prevExpandedGroups => ({
            ...prevExpandedGroups,
            [groupName]: !prevExpandedGroups[groupName],
        }));
    };

    const handleMasterCheckboxChange = () => {
        const newState = !allGroupsSelected;
        setAllGroupsSelected(newState);
    
        const updatedSelections = dostepneGrupy.reduce((acc, grupa) => {
            acc[grupa.id] = newState;
            return acc;
        }, {});
    
        setSelectedGrupy(updatedSelections);
    
        setSelectedGrupyNazwa(newState ? dostepneGrupy.map(grupa => grupa.Zleceniodawca) : []);
    };

    const handleGetPracownicy = () => {
        Axios.get("http://localhost:5000/api/pracownicy", { withCredentials: true })
            .then((response) => {
                setPracownicy(response.data); // skróciłem do response.data, 
                // bo mi nie wypełniało dropdowna
                console.log(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the data:", error);
            });
    };

    const handleZatwierdzConfirm = () => {
        const ids = selectedForZatwierdzenie.map(item => item.id);
        Axios.put("http://localhost:5000/api/urlopy", {
            ids: ids,
            status: "Zatwierdzone",
        }, { withCredentials: true })
            .then(() => {
                fetchUrlopy();
                setApprovedSelectedItems([]);
                setZatwierdzWindowVisible(false);
                setApprovedGroupSelections({});
                setApprovedSelectedItems([]);
                
            })
            .catch((error) => {
                console.error("There was an error updating the status:", error);
            });
    };
    
    const handleZatwierdz = (id, showDialog = true) => handleUpdateStatus(id, "Zatwierdzone", showDialog);
    const handleAnuluj = (id, showDialog = true) => handleUpdateStatus(id, "Anulowane", showDialog);

    useEffect(() => {
        checkUserType(setAccountType);
        getImie();
    }, []);

    const getImie = async () => {
        try {
            const response = await Axios.get('http://localhost:5000/api/imie', { withCredentials: true });
            const { name, surename } = response.data;
            setImie(`${name}`);
            setNazwisko(`${surename}`);
        } catch (error) {
            console.error(error);
        }
    }
    
    const handleUpdateStatus = (id = null, newStatus, showDialog = true) => {
        let selectedItems = [];
        const flattenArray = (obj) => Object.values(obj).flat();
    
        if (id) {
            const allUrlopy = [
                ...flattenArray(filteredDane.ApprovedUrlopy),
                ...flattenArray(filteredDane.Pozostale)
            ];
            
            const item = allUrlopy.find(item => item.id === id);
            if (item) {
                selectedItems.push({
                    id: item.id,
                    imie: item.imie,
                    nazwisko: item.nazwisko,
                    dataOd: item.dataOd,
                    dataDo: item.dataDo
                });
            }
        } else {
            const allSelectedIds = [...approvedSelectedItems, ...remainingSelectedItems].map(extractId);
            const allUrlopy = [
                ...flattenArray(filteredDane.ApprovedUrlopy),
                ...flattenArray(filteredDane.Pozostale)
            ];
            
            selectedItems = allUrlopy
                .filter(item => allSelectedIds.includes(item.id.toString()))
                .map(item => ({
                    id: item.id,
                    imie: item.imie,
                    nazwisko: item.nazwisko,
                    dataOd: item.dataOd,
                    dataDo: item.dataDo
                }));
        }
    
        if (selectedItems.length === 0) {
            console.log("No items selected for status update");
            return;
        }
    
        setSelectedForZatwierdzenie(selectedItems);
        
        if (showDialog) {
            setZatwierdzWindowVisible(true);
        } else {
            const idsArray = Array.isArray(id) ? id : [id];

            Axios.put("http://localhost:5000/api/urlopy", {
                ids: idsArray,
                status: newStatus,
            }, { withCredentials: true })
                .then(() => {
                    fetchUrlopy();
                    setApprovedSelectedItems([]);
                })
                .catch((error) => {
                    console.error("There was an error updating the status:", error);
                });
        }
    };

    const fetchUrlopy = () => {
        Axios.get("http://localhost:5000/api/urlopy", { withCredentials: true })
            .then((response) => {
                if(accountType === 'Administrator') {
                urlopyData = response.data.urlopy;
                }
                else {
                urlopyData = response.data.urlopy.filter(item => item.imie === imie && item.nazwisko === nazwisko);
                }

    
                const filterBySelectedGroups = (data) => {
                    if (selectedGrupyNazwa.length === 0) return data;
                    return data.filter(item => selectedGrupyNazwa.includes(item.zleceniodawca));
                };
                
                const filteredUrlopyData = filterBySelectedGroups(urlopyData);
    
                const approvedUrlopy = urlopyData.filter(item => item.status === "Do zatwierdzenia");
                const remainingUrlopy = filteredUrlopyData.filter(item => item.status !== "Do zatwierdzenia");
    
                const groupByName = (data) => data.reduce((acc, curr) => {
                    const key = `${curr.imie} ${curr.nazwisko}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(curr);
                    return acc;
                }, {});
    
                const groupedApproved = groupByName(approvedUrlopy);
                const groupedRemaining = groupByName(remainingUrlopy);
    
                const sortGroupedData = (groupedData) => {
                    const sortedData = Object.keys(groupedData).sort();
                    return sortedData.reduce((acc, name) => {
                        acc[name] = groupedData[name];
                        return acc;
                    }, {});
                };
    
                const sortedApprovedData = sortGroupedData(groupedApproved);
                const sortedRemainingData = sortGroupedData(groupedRemaining);
    
                const sortEntriesInGroups = (groupedData) => {
                    Object.keys(groupedData).forEach(name => {
                        groupedData[name].sort((a, b) => a.dataOd.localeCompare(b.dataOd));
                    });
                    return groupedData;
                };
    
                const sortedApprovedEntries = sortEntriesInGroups(sortedApprovedData);
                const sortedRemainingEntries = sortEntriesInGroups(sortedRemainingData);

                setFilteredDane({ ApprovedUrlopy: sortedApprovedEntries, Pozostale: sortedRemainingEntries });
            })
            .catch((error) => {
                console.error("There was an error fetching the data:", error);
            });
    };
    


    const fetchGrupy = () => {
        Axios.get("http://localhost:5000/api/grupy", { withCredentials: true })
            .then((response) => {
                setDostepneGrupy(response.data.grupy);
            })
            .catch((error) => {
                console.error("There was an error fetching the data:", error);
            });
    };

    useEffect(() => {

        fetchUrlopy();
        fetchGrupy();
        handleGetPracownicy();

    }, []);

    useEffect(() => {
        if (imie && nazwisko) {
            fetchUrlopy();
        }
    }, [imie, nazwisko, accountType]);

    const handleDodaj = () => {
        Axios.post("http://localhost:5000/api/urlopy", {
            nazwisko_imie: UrlopDla,
            status: Status,
            urlop_od: urlopOd,
            urlop_do: urlopDo,
            komentarz: komentarz,
        }, { withCredentials: true }
        )
            .then(() => {
                fetchUrlopy();
                notification.success({
                    message: 'Dodano urlop',
                    description: `Dodano urlop dla ${UrlopDla}`,
                    placement: 'topRight'
                });
            })
            .catch((error) => {
                console.error("There was an error adding the leave:", error.response.data);
                notification.error({
                    message: 'Błąd dodawania urlopu',
                    description: error.response.data,
                    placement: 'topRight'
                });
            });
    };

    const handleUsun = (itemId) => {
        Axios.delete("http://localhost:5000/api/urlopy", {
            withCredentials: true,
            data: { id: itemId }
        })
            .then(() => {
                fetchUrlopy();
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

     // do zaznaczania grup w tym co generuje spis urlopów
     const handleGrupaCheckboxChange = (id, zleceniodawca) => {
            setSelectedGrupy(prevState => {
            const newSelectedGrupy = {
                ...prevState,
                [id]: !prevState[id]
            };

            // Update selectedGrupyNazwa based on checkbox state
            setSelectedGrupyNazwa(prevSelected => {
                if (newSelectedGrupy[id]) {
                    // Checkbox is checked, add Zleceniodawca to the list
                    return [...prevSelected, zleceniodawca];
                } else {
                    // Checkbox is unchecked, remove Zleceniodawca from the list
                    return prevSelected.filter(item => item !== zleceniodawca);
                }
            });

            return newSelectedGrupy;
        });
    };


    const convertToISOFormat = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    };
    
    const convertToDisplayFormat = (isoDateString) => {
        const [year, month, day] = isoDateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleSave = (vacationId) => {
        Axios.put(`http://localhost:5000/api/urlopy/${vacationId}`, {
            urlopOd: convertToDisplayFormat(editVacationData.urlopOd),
            urlopDo: convertToDisplayFormat(editVacationData.urlopDo),
            status: editVacationData.status,
            komentarz: editVacationData.komentarz
        }, { withCredentials: true })
            .then(() => {
                setEditingVacationId(null);
                fetchUrlopy();
            })
            .catch((error) => {
                console.error("There was an error updating the vacation:", error);
            });
    };

    // ustawia do formatu [week, year] wybrany tydzień i rok z inputu
    const handleSelectWeekAndYear = (e) => {
        setSelectedWeek(e.target.value);
        const year = e.target.value.substring(0, 4);
        const week = e.target.value.substring(6, 8);
        setSelectedWeekAndYear([week, year]);

        localStorage.setItem('selectedWeekAndYear', JSON.stringify([week, year]));
    }

    const handleSearch = () => {
    fetchUrlopy(selectedGrupyNazwa);
};

    const getStatusClass = (status) => {
        switch (status) {
            case 'Anulowane':
                return 'text-red-500';
            case 'Zatwierdzone':
                return 'text-green-500';
            case 'Do zatwierdzenia':
                return 'text-yellow-500';
            default:
                return '';
        }
    };

    return (
        <div>
            <AmberBox>
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4">
                            <div className="flex flex-col w-4/12 p-4">
                                <p className="text-sm text-gray-600 mb-2">Dodaj urlop dla:</p>
                                <Dropdown
                                    value={UrlopDla}
                                    onChange={(e) => setUrlopDla(e.value)}
                                    options={pracownicy
                                        .filter(pracownik => pracownik.name === imie && pracownik.surname === nazwisko)
                                        .map(pracownik => `${pracownik.surname} ${pracownik.name}`)}
                                    placeholder="Pracownik"
                                    autoComplete="off"
                                    className="p-1"
                                    filter
                                    filterInputAutoFocus
                                    showFilterClear
                                    showClear
                                />
                            </div>
                            <div className="flex flex-col w-4/12 p-4">
                                <p className="text-sm text-gray-600 mb-2">Status:</p>
                                <Dropdown
                                    value={Status}
                                    onChange={(e) => setStatus(e.value)}
                                    options={["Do zatwierdzenia", "Zatwierdzone", "Anulowane"]}
                                    placeholder="Status"
                                    autoComplete="off"
                                    className="p-1"
                                    filter
                                    filterInputAutoFocus
                                    showFilterClear
                                    showClear
                                    disabled={accountType !== 'Administrator'}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-row space-x-4 p-4 ml-4">
                        <div className="flex flex-col w-2/12">
                            <p className="text-sm text-gray-600 mb-2">Urlop od:</p>
                            <InputText id="UrlopOd" value={urlopOd} onChange={(e) => setUrlopOd(e.target.value)} type="date" />
                        </div>
                        <div className="flex flex-col w-2/12 ">
                            <p className="text-sm text-gray-600 mb-2">Urlop do:</p>
                            <InputText id="UrlopDo" value={urlopDo} onChange={(e) => setUrlopDo(e.target.value)}type="date" />
                        </div>
                    </div>
                    <div className="flex justify-start w-full p-4 ml-4">
                    <div className="flex flex-col w-full md:w-3/6">
                    <p className={`text-sm mb-2 ${komentarz.length >= 45 ? 'text-red-600' : 'text-gray-600'}`}>
                        Komentarz: {komentarz.length}/45
                        {komentarz.length >= 45 && ' Maksymalna ilość znaków'}
                    </p>
                        <div className="flex items-center"> 
                            <InputText
                                onChange={(e) => setKomentarz(e.target.value)}
                                value={komentarz}
                                placeholder="Komentarz"
                                className="flex-grow p-2" 
                                maxLength={45}
                            />
                            <Button
                                label="Dodaj"
                                onClick={handleDodaj}
                                className="p-button-outlined border-2 p-1 ml-2 bg-white flex-shrink-0"
                            />
                        </div>
                    </div>
                    
                </div>
                </div>
                
            </AmberBox>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p className="font-bold whitespace-nowrap">Urlopy do zatwierdzenia</p>
                <Button 
                    label="Zatwierdź" 
                    onClick={() => handleUpdateStatus(null, "Zatwierdzone")} 
                    className="bg-green-500 text-white p-1 m-0.5 text-sm w-24" 
                    disabled={accountType !== 'Administrator'}
                />
                <ZatwierdzWindow 
                    visible={zatwierdzWindowVisible}
                    onHide={() => setZatwierdzWindowVisible(false)}
                    selectedItems={selectedForZatwierdzenie}
                    onConfirm={handleZatwierdzConfirm}
                />
            <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                <div className="w-full h-2/6">
                </div>
            </div>
            </div>

            <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <ApprovedTable/>
                </table>
            </div>
            <AmberBox style={"justify-around bg-blue-500 text-white"}>
            <div>
                <div className="flex items-center">
                    <Checkbox
                        inputId="master-checkbox"
                        checked={allGroupsSelected}
                        onChange={handleMasterCheckboxChange}
                        disabled={accountType !== 'Administrator'}
                    />
                    <span className="ml-2 font-bold">Zaznacz wszystkie</span>
                </div>
                {dostepneGrupy.map((grupa) => (
                    <div key={grupa.id}>
                        <Checkbox
                            disabled={accountType !== 'Administrator'}
                            inputId={`grupa-${grupa.id}`}
                            checked={selectedGrupy[grupa.id] || false}
                            onChange={() => handleGrupaCheckboxChange(grupa.id, grupa.Zleceniodawca)}
                        />
                        <span className="ml-2">{grupa.Zleceniodawca}</span>
                    </div>
                ))}
            </div>
                <Button label="Szukaj" onClick={handleSearch} disabled={accountType !== 'Administrator'} />
                <div className="flex flex-row items-center space-x-4">
                    <InputText
                        className="text-black"
                        type="week"
                        placeholder="Select week"
                        value={selectedWeek}
                        onChange={(e) => handleSelectWeekAndYear(e)}
                        disabled={accountType !== 'Administrator'}
                    />
                    <Button label="Drukuj" onClick={handlePdfDownloadClick} disabled={accountType !== 'Administrator'} />
                </div>
            </AmberBox>
            <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <RemainingTable />
                </table>
            </div>
        </div>
    );
}