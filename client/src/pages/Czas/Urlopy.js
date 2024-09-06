import React, { useState, useEffect } from "react";
import AmberBox from "../../Components/AmberBox";
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import 'react-calendar/dist/Calendar.css';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import Axios from "axios";


export default function UrlopyPage() {
    const [urlopOd, setUrlopOd] = useState('');
    const [urlopDo, setUrlopDo] = useState('');
    const [UrlopDla, setUrlopDla] = useState('');
    const [Status, setStatus] = useState('');
    const [komentarz, setKomentarz] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [dane, setDane] = useState([]);
    const [filteredDane, setFilteredDane] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [pracownicy, setPracownicy] = useState([]);
    const [dostepneGrupy, setDostepneGrupy] = useState([]);
    const [selectedGrupy, setSelectedGrupy] = useState({});
    const [selectedGrupyNazwa, setSelectedGrupyNazwa] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(''); // state do tygodnia ale bez formatowania do pdf
    const [selectedWeekAndYear, setSelectedWeekAndYear] = useState([]); // state do tygodnia i roku dla pdf
    const [filtrValue, setFiltrValue] = useState("Wszystkie");
    const [editingVacationId, setEditingVacationId] = useState(null);
    const [editVacationData, setEditVacationData] = useState({ urlopOd: '', urlopDo: '', status: '' });

    const extractId = (idWithPrefix) => idWithPrefix.replace('cb-', '');

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

    const handleGetPracownicy = () => {
        Axios.get("http://localhost:5000/api/pracownicy", { withCredentials: true })
            .then((response) => {
                setPracownicy(response.data); // skróciłem do response.data, 
                // bo mi nie wypełniało dropdowna
            })
            .catch((error) => {
                console.error("There was an error fetching the data:", error);
            });
    };

    const handleCheckboxChange = (id) => {
        setSelectedItems(prevState =>
            prevState.includes(id)
                ? prevState.filter(item => item !== id)
                : [...prevState, id]
        );
    };
    const handleUpdateStatus = (newStatus) => {

        const ids = selectedItems.map(extractId);
        Axios.put("http://localhost:5000/api/urlopy", {
            ids: ids,
            status: newStatus,
        }, { withCredentials: true }
        )
            .then(() => {
                fetchUrlopy(); // Refetch data after updating
            })
            .catch((error) => {
                console.error("There was an error updating the status:", error);
            });
    };

    const fetchUrlopy = () => {
        Axios.get("http://localhost:5000/api/urlopy", { withCredentials: true })
            .then((response) => {
                setDane(response.data.urlopy);
                setFilteredDane(response.data.urlopy);
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
            })
            .catch((error) => {
                console.error("There was an error adding the leave:", error.response.data);
            });
    };

    const handleZatwierdz = () => handleUpdateStatus("Zatwierdzone");
    const handleAnuluj = () => handleUpdateStatus("Anulowane");

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

    const handleSzukaj = (filter) => {
        if (filter === "Wszystkie" || filter === "") {
            setFilteredDane(dane); // pokaz wszystkie
        } else {
            const filteredData = dane.filter(item => item.status === filter); // pokaz te ktore maja item.status taki sam jak filter
            setFilteredDane(filteredData);
        }
    };

    const convertToISOFormat = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    };
    
    const convertToDisplayFormat = (isoDateString) => {
        const [year, month, day] = isoDateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleEdit = (vacation) => {
        setEditingVacationId(vacation.id);
        setEditVacationData({
            urlopOd: convertToISOFormat(vacation.dataOd),
            urlopDo: convertToISOFormat(vacation.dataDo),
            status: vacation.status,
            komentarz: vacation.komentarz
        });
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

    useEffect(() => {
        console.log(selectedWeekAndYear);
    }, [selectedWeekAndYear]);

    useEffect(() => {
        console.log(selectedGrupyNazwa);
    }, [selectedGrupyNazwa]);

    useEffect(() => {
        handleSzukaj(filtrValue);
    }, [filtrValue]);

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

    const groupedData = filteredDane.reduce((acc, curr) => {
        const key = `${curr.imie} ${curr.nazwisko}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {});
    
    const sortedGroupedData = Object.keys(groupedData).sort((a, b) => {
        const aHasPending = groupedData[a].some(vacation => vacation.status === 'Do zatwierdzenia');
        const bHasPending = groupedData[b].some(vacation => vacation.status === 'Do zatwierdzenia');
        return aHasPending === bHasPending ? 0 : aHasPending ? -1 : 1;
    });
    
    sortedGroupedData.forEach(name => {
        groupedData[name].sort((a, b) => {
            const aPending = a.status === 'Do zatwierdzenia';
            const bPending = b.status === 'Do zatwierdzenia';
            return aPending === bPending ? 0 : aPending ? -1 : 1;
        });
    });

    const handleGroupToggle = (name) => {
        setExpandedGroups(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    return (
        <div>
            <AmberBox>
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4">
                            <div className="flex flex-col w-3/12 p-4">
                                <p className="text-sm text-gray-600 mb-2">Dodaj urlop dla:</p>
                                <Dropdown
                                    value={UrlopDla}
                                    onChange={(e) => setUrlopDla(e.value)}
                                    options={pracownicy.map(pracownik => `${pracownik.surname} ${pracownik.name}`)}
                                    editable
                                    placeholder="Pracownik"
                                    autoComplete="off"
                                    className="p-2"
                                    filter
                                    showClear
                                />
                            </div>
                            <div className="flex flex-col w-3/12 p-4">
                                <p className="text-sm text-gray-600 mb-2">Status:</p>
                                <Dropdown
                                    value={Status}
                                    onChange={(e) => setStatus(e.value)}
                                    options={["Do zatwierdzenia", "Zatwierdzone", "Anulowane"]}
                                    editable
                                    placeholder="Status"
                                    autoComplete="off"
                                    className="p-2"
                                    filter
                                    showClear
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-row space-x-4 p-4 ml-4">
                        <div className="flex flex-col w-full md:w-1/6">
                            <p className="text-sm text-gray-600 mb-2">Urlop od:</p>
                            <InputText id="UrlopOd" value={urlopOd} onChange={(e) => setUrlopOd(e.target.value)} type="date" />
                        </div>
                        <div className="flex flex-col w-full md:w-1/6">
                            <p className="text-sm text-gray-600 mb-2">Urlop do:</p>
                            <InputText id="UrlopDo" value={urlopDo} onChange={(e) => setUrlopDo(e.target.value)} type="date" />
                        </div>
                    </div>
                    <div className="flex justify-start w-full p-4 ml-4">
                        <InputText onChange={(e) => setKomentarz(e.target.value)} value={komentarz}
                            placeholder="Komentarz" className="w-1/3 p-2" />
                        <Button label="Dodaj" onClick={handleDodaj}
                            className="p-button-outlined border-2 p-1 ml-2 bg-white" />
                    </div>
                </div>
            </AmberBox>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Urlopy</p>
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start ">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4">
                            <Dropdown value={filtrValue} onChange={(e) => setFiltrValue(e.value)}
                                options={["Wszystkie", "Do zatwierdzenia", "Zatwierdzone", "Anulowane"]}
                                placeholder="Filtrowanie"
                                autoComplete="off"
                                className="w-4/12"
                                filter
                            />
                            {/* <Button label="Szukaj" onClick={() => handleSzukaj(filtrValue)}
                                className="p-button-outlined border-2 p-1 
                                bg-white text-black pr-2 pl-2 mr-32 ml-2" /> */}
                            <div className="ml-8">
                                <Button label="Zatwierdź" onClick={handleZatwierdz}
                                    className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" />
                                <Button label="Anuluj" onClick={handleAnuluj}
                                    className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
                <table className="w-full">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th></th>
                            <th className="border-r">Imię i nazwisko</th>
                            <th className="border-r">Urlop od</th>
                            <th className="border-r">Urlop do</th>
                            <th className="border-r">Komentarz</th>
                            <th className="border-r">Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {sortedGroupedData.map((name) => (
                            <React.Fragment key={name}>
                                <tr>
                                    <td colSpan="7" className="cursor-pointer bg-gray-100 hover:bg-gray-200" onClick={() => handleGroupToggle(name)}>
                                        <div className="flex items-center justify-between">
                                            <p>{name}</p>
                                            <span>{expandedGroups[name] ? '−' : '+'}</span>
                                        </div>
                                    </td>
                                </tr>
                                {expandedGroups[name] && groupedData[name].map((urlopy) => (
                                    <tr key={urlopy.id} className="border-b even:bg-gray-200 odd:bg-gray-300">
                                        <td className="border-r">
                                            <Checkbox
                                                inputId={`cb-${urlopy.id}`}
                                                checked={selectedItems.includes(`cb-${urlopy.id}`)}
                                                onChange={() => handleCheckboxChange(`cb-${urlopy.id}`)}
                                            />
                                        </td>
                                        <td className="border-r">{urlopy.imie} {urlopy.nazwisko}</td>

                                        {editingVacationId === urlopy.id ? (
                                            <>
                                                <td className="border-r">
                                                    <InputText value={editVacationData.urlopOd}
                                                        type="date"
                                                        onChange={(e) => setEditVacationData({ ...editVacationData, urlopOd: e.target.value })}
                                                    />
                                                </td>
                                                <td className="border-r">
                                                    <InputText value={editVacationData.urlopDo}
                                                        type="date"
                                                        onChange={(e) => setEditVacationData({ ...editVacationData, urlopDo: e.target.value })}
                                                    />
                                                </td>
                                                <td className="border-r">
                                                    <InputText value={editVacationData.komentarz}
                                                        onChange={(e) => setEditVacationData({ ...editVacationData, komentarz: e.target.value })}
                                                    />
                                                </td>
                                                <td className="border-r">
                                                    <Dropdown value={editVacationData.status}
                                                        options={["Do zatwierdzenia", "Zatwierdzone", "Anulowane"]}
                                                        onChange={(e) => setEditVacationData({ ...editVacationData, status: e.value })}
                                                    />
                                                </td>
                                                <td>
                                                    <Button label="Zapisz" onClick={() => handleSave(urlopy.id)} className="bg-blue-700 text-white p-1 m-0.5" />
                                                    <Button label="Anuluj" onClick={() => setEditingVacationId(null)} className="bg-red-500 text-white p-1 m-0.5" />
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="border-r">{urlopy.dataOd}</td>
                                                <td className="border-r">{urlopy.dataDo}</td>
                                                <td className="border-r">{urlopy.komentarz}</td>
                                                <td className={`border-r ${getStatusClass(urlopy.status)}`}>{urlopy.status}</td>
                                                <td>
                                                    <Button label="Edytuj" onClick={() => handleEdit(urlopy)} className="bg-blue-700 text-white p-1 m-0.5" />
                                                    <Button label="Usuń" onClick={() => handleUsun(urlopy.id)} className="bg-red-500 text-white p-1 m-0.5" />
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
            <AmberBox style={"justify-around bg-blue-500 text-white"}>
                <div>
                    {dostepneGrupy.map((grupa) => (
                        <div key={grupa.id}>
                            <Checkbox
                                inputId={`grupa-${grupa.id}`}
                                checked={selectedGrupy[grupa.id]}
                                onChange={() => handleGrupaCheckboxChange(grupa.id, grupa.Zleceniodawca)}
                            />
                            <span className="ml-2">{grupa.Zleceniodawca}</span>
                        </div>
                    ))}
                </div>
                <div className="flex flex-row items-center space-x-4">
                    <InputText
                        className="text-black"
                        type="week"
                        placeholder="Select week"
                        value={selectedWeek}
                        onChange={(e) => handleSelectWeekAndYear(e)}
                    />
                    <Button label="Drukuj" onClick={handlePdfDownloadClick} />
                </div>
            </AmberBox>
        </div>
    );
}