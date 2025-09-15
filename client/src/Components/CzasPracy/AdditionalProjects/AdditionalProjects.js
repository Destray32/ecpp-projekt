import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dropdown } from "primereact/dropdown";
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import Axios from "axios";
import { format, getWeek } from 'date-fns';
import { notification } from 'antd';

import AdditionalProjectRow from './AdditionalProjectRow';
import { id } from 'date-fns/locale';

/**
 * Komponent AdditionalProjects.
 * 
 * @param {Object} props - Właściwości przekazywane do komponentu.
 * @param {string} props.Firma - Wybrana firma.
 * @param {Function} props.setFirma - Funkcja ustawiająca wybraną firmę.
 * @param {Array} props.firmy - Lista dostępnych firm.
 * @param {string} props.Zleceniodawca - Wybrany zleceniodawca.
 * @param {Function} props.setZleceniodawca - Funkcja ustawiająca wybranego zleceniodawcę.
 * @param {Array} props.zleceniodawcy - Lista dostępnych zleceniodawców.
 * @param {string} props.Projekty - Wybrany projekt.
 * @param {Function} props.setProjekty - Funkcja ustawiająca wybrany projekt.
 * @param {Array} props.dostepneProjekty - Lista dostępnych projektów.
 * @param {Array} props.additionalProjects - Lista dodatkowych projektów.
 * @param {Function} props.setAdditionalProjects - Funkcja ustawiająca dodatkowe projekty.
 * @param {Array} props.daysOfWeek - Lista dni tygodnia.
 * @param {Array} props.samochody - Lista dostępnych samochodów.
 * @param {string} props.loggedUserName - Nazwa zalogowanego użytkownika.
 * @param {Date} props.currentDate - Aktualna data.
 * 
 * @returns {JSX.Element} - Zwraca element JSX.
 */
const AdditionalProjects = ({
    Firma, setFirma, firmy,
    Zleceniodawca, setZleceniodawca, zleceniodawcy,
    Projekty, setProjekty, dostepneProjekty,
    additionalProjects, setAdditionalProjects,
    daysOfWeek, samochody, loggedUserName, currentDate,
    statusTyg, blockStatus, activeProject, setActiveProject, activeDate, setActiveDate
}) => {
    const [activeInput, setActiveInput] = useState(null);
    const [filteredZleceniodawcy, setFilteredZleceniodawcy] = useState([]);
    const [filteredProjekty, setFilteredProjekty] = useState([]);
    const [additionalProjectsTotalTime, setAdditionalProjectsTotalTime] = useState(0.0);
    const [defaultSamochod, setDefaultSamochod] = useState("");
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const additionalFieldsRef = useRef(null);

    useEffect(() => {
        //console.log("samochody", samochody);
    }, [samochody]);

    useEffect(() => {
        if (firmy && firmy.length > 0) {
            Axios.get(`${baseUrl}/api/mojedane`, { withCredentials: true })
                .then(res => {
                    //console.log(res.data);
                    //console.log(zleceniodawcy);
                    //console.log(samochody);
                    if (res.data && res.data.company) {
                        const userFirmaId = res.data.company;
                        const defaultFirma = firmy.find(f => f.value === userFirmaId);

                        const userIdSamochodu = res.data.vehicle;
                        const defaultSamochod = samochody.find(s => s.id === userIdSamochodu);
    
                        if (defaultFirma) {
                            setFirma(defaultFirma.value);
                        }
                        if (defaultSamochod) {
                            setDefaultSamochod(defaultSamochod.value);
                            
                        }

                    }
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [firmy]);

//     useEffect(() => {
//     const handleClickOutside = (event) => {
//         // detekcja scrollbaru
//         const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
//         const isVerticalScrollbarClick = event.clientX >= window.innerWidth - scrollbarWidth;
        
//         const isDropdownPanel = event.target.closest('.p-dropdown-panel');
//         const isDropdownTrigger = event.target.closest('.p-dropdown-trigger');
//         const isDropdownItem = event.target.closest('.p-dropdown-item');
        
//         if (
//             additionalFieldsRef.current && 
//             !additionalFieldsRef.current.contains(event.target) &&
//             !event.target.closest('.project-input') &&
//             !event.target.closest('.p-inputtextarea') && 
//             !event.target.closest('.p-dropdown') && 
//             !event.target.closest('.p-inputtext') &&
//             !isDropdownPanel &&
//             !isDropdownTrigger &&
//             !isDropdownItem &&
//             !isVerticalScrollbarClick 
//         ) {
//             setActiveProject(null);
//             setActiveDate(null);
//         }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
// }, []);

    useEffect(() => {
    let totalHours = 0;
    let totalMinutes = 0;

    additionalProjects.forEach(project => {
        Object.values(project.hours).forEach(hour => {
            if (hour.hoursWorked) {
                const parts = hour.hoursWorked.toString().split('.');
                const h = parseInt(parts[0], 10) || 0;
                const m = parseInt(parts[1], 10) || 0; // traktujemy jako minuty, nie dziesiętne

                totalHours += h;
                totalMinutes += m;
            }
        });
    });

    // Konwersja minut > 60 do godzin
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    setAdditionalProjectsTotalTime(
        `${totalHours}.${totalMinutes.toString().padStart(2, '0')}`
    );
}, [additionalProjects]);



    useEffect(() => {
        if (Firma) {
            const filteredZleceniodawcy = zleceniodawcy.filter(zleceniodawca =>
                zleceniodawca.Firma_idFirma === Firma.value
            );

            
            setFilteredZleceniodawcy(filteredZleceniodawcy);
        } else {
            setFilteredZleceniodawcy([]);
        }
    }, [Firma, zleceniodawcy]);


useEffect(() => {
    if (Zleceniodawca) {
        Axios.get(`${baseUrl}/api/generujRaport`, { withCredentials: true })
            .then(res => {
                const raportData = res.data?.raport;
                if (Array.isArray(raportData)) {
                    const twoWeeksAgo = new Date();
                    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 15);

                    const filteredData = raportData.filter(record => {
                        const [day, month, year] = record.Data.split('.').map(Number);
                        const recordDate = new Date(year, month - 1, day); 
                        return record.Pracownik === loggedUserName && recordDate >= twoWeeksAgo;
                    });

                    const projektyZleceniodawcy = [
                        ...new Map(
                            filteredData.map(record => [
                                record.Projekt,
                                { Projekt: record.Projekt, idGrupa_urlopowa: record.idGrupa_urlopowa }
                            ])
                        ).values()
                    ];

                    const ostatnioUzywane = dostepneProjekty.filter(projekt =>
                        projektyZleceniodawcy.some(
                            p => 
                                p.Projekt === projekt.value &&
                                p.idGrupa_urlopowa === Zleceniodawca // Match only the selected Zleceniodawca
                        )
                    ).map(projekt => ({
                        ...projekt,
                        label: `Ostatnio używane: ${projekt.label}`,
                        className: 'text-blue-500 font-bold'
                    }));

                    const pozostałeProjekty = dostepneProjekty
                        .filter(projekt =>
                            projekt.Grupa_urlopowa_idGrupa_urlopowa === Zleceniodawca && // Match only the selected Zleceniodawca
                            !projektyZleceniodawcy.some(p => p.Projekt === projekt.value)
                        )
                        .sort((a, b) => {
                            if (!a.data_dodania) return 1;  // traktujemy null jako najstarsze
                            if (!b.data_dodania) return -1;

                            const dateA = new Date(a.data_dodania.split(',')[0].split('.').reverse().join('-'));
                            const dateB = new Date(b.data_dodania.split(',')[0].split('.').reverse().join('-'));

                            return dateB - dateA; // malejąco: najnowsze na górze
                        });

                    setFilteredProjekty([...ostatnioUzywane, ...pozostałeProjekty]);
                } else {
                    console.error("Unexpected response format:", res.data);
                }

                setProjekty(null);
            })
            .catch(err => {
                console.error("Błąd pobierania danych z /api/czas/projekty/dane:", err);
            });
    } else {
        setFilteredProjekty([]);
        setProjekty(null);
    }
}, [Firma, Zleceniodawca, dostepneProjekty]);


    const addWeek = async () => {
        const weekData = getWeek(currentDate, { weekStartsOn: 1 });
        const year = currentDate.getFullYear();

        if (!Projekty || !Firma || !Zleceniodawca) {
            notification.error({
                message: "Błąd",
                description: "Wybierz projekt, firmę, i zleceniodawcę",
            });
            return;
        }

        try {
            // przeszukujemy dodatkowe projekty i sprawdzamy czy projekt już istnieje
            const existingProject = additionalProjects.find(project => project.projekt === Projekty);
            if (existingProject) { // warunek sprawdzający czy projekt już istnieje
                notification.error({
                    message: "Błąd",
                    description: "Projekt już istnieje",
                });
                return;
            }

            const response = await Axios.post(`${baseUrl}/api/czas/projekt`, {
                pracownikName: loggedUserName,
                projektyName: Projekty,
                weekData: weekData,
                year: year,
            }, { withCredentials: true });

            const newProject = {
                id: Date.now(),
                firma: Firma || "",
                zleceniodawca: Zleceniodawca || "",
                projekt: Projekty || "",
                hours: {}
            };

            daysOfWeek.forEach(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const apiData = response.data?.hours?.[dateKey];
                newProject.hours[dateKey] = apiData ? {
                    hoursWorked: apiData.hoursWorked || 0,
                    car: apiData.car || (apiData.hoursWorked > 0 ? defaultSamochod : ""),
                    comment: apiData.comment || "",
                    parking: apiData.parking || "",
                    km: apiData.km || "",
                    other: apiData.other || "",
                    diet: apiData.diet || "",
                    tools: apiData.tools || "",
                    materials: apiData.materials || ""
                } : { hoursWorked: 0, car: "" };
            });

            setAdditionalProjects(prevProjects => [...prevProjects, newProject]);
        } catch (error) {
            console.error("Error fetching project hours", error);
        }
    };


    const handleProjectActivation = (projectId, date) => {
        setActiveProject(projectId);
        setActiveDate(date);
    };

    const handleInputChange = (projectId, date, value, field) => {
        setAdditionalProjects(prevProjects =>
            prevProjects.map(project => {
                if (project.id === projectId) {
                    return {
                        ...project,
                        hours: {
                            ...project.hours,
                            [date]: {
                                ...project.hours[date],
                                [field]: value,
                            }
                        }
                    };
                }
                return project;
            })
        );
    };

    const handleDeleteProject = async (projectId) => {
        console.log("Deleting project:", additionalProjects);

        const projectToDelete = additionalProjects.find(project => project.id === projectId);
        if (!projectToDelete) return;

        // Sprawdź czy projekt ma jakiekolwiek wypełnione dane
        const hasData = Object.values(projectToDelete.hours).some(hour =>
            hour.hoursWorked > 0 ||
            hour.comment ||
            hour.parking ||
            hour.km ||
            hour.diet ||
            hour.tools
        );

        // Jeśli projekt ma dane, sprawdź ID z bazy
        if (hasData) {
            let databaseIds = [];

            // Najpierw sprawdź czy już mamy ID
            Object.values(projectToDelete.hours).forEach(hour => {
                if (hour.id && hour.id !== 'undefined' && !isNaN(hour.id)) {
                    databaseIds.push(hour.id);
                }
            });

            // Jeśli nie ma ID ale są dane, pobierz aktualne dane z bazy
            if (databaseIds.length === 0) {
                try {
                    console.log("No IDs found, refreshing project data...");
                    await refreshProjectData(projectId);

                    // Poczekaj moment na aktualizację stanu, następnie pobierz zaktualizowane dane
                    setTimeout(() => {
                        const updatedProject = additionalProjects.find(project => project.id === projectId);
                        console.log("Project after refresh:", updatedProject);

                        if (updatedProject) {
                            Object.values(updatedProject.hours).forEach(hour => {
                                if (hour.id && hour.id !== 'undefined' && !isNaN(hour.id)) {
                                    databaseIds.push(hour.id);
                                }
                            });
                        }

                        console.log("Found IDs after refresh:", databaseIds);

                        // Kontynuuj proces usuwania
                        continueDelete(databaseIds);
                    }, 200);
                    return; // Wyjdź z funkcji, continueDelete dokończy usuwanie
                } catch (error) {
                    console.error("Error refreshing project data before delete", error);
                    // Jeśli nie udało się pobrać danych, kontynuuj z lokalnym usunięciem
                }
            }

            continueDelete(databaseIds);
        } else {
            // Jeśli nie ma danych, usuń tylko lokalnie
            removeFromLocal();
        }

        // Funkcja pomocnicza do kontynuowania usuwania
        async function continueDelete(ids) {
            // Usuń z bazy danych jeśli są ID
            if (ids.length > 0) {
                try {
                    console.log("Deleting from database, IDs:", ids);
                    for (const id of ids) {
                        await Axios.delete(`${baseUrl}/api/czas/projekt/${id}`, { withCredentials: true });
                        console.log(`Deleted record with ID: ${id}`);
                    }
                } catch (error) {
                    console.error("Error deleting project from database", error);
                    notification.error({
                        message: "Błąd",
                        description: "Nie udało się usunąć projektu z bazy danych",
                    });
                    return; // Nie usuwaj z frontendu jeśli nie udało się usunąć z bazy
                }
            }

            removeFromLocal();
        }

        // Funkcja pomocnicza do usuwania z lokalnego stanu
        function removeFromLocal() {
            // Usuń projekt z lokalnego stanu
            setAdditionalProjects(prevProjects =>
                prevProjects.filter(project => project.id !== projectId)
            );

            notification.success({
                message: "Sukces",
                description: "Projekt został usunięty",
            });

            console.log("Project deleted successfully");
        }
    };

    const handleInputFocus = (projectId, date) => {
        if (!activeInput || activeInput.projectId !== projectId || activeInput.date !== date) {
            setActiveInput({ projectId, date });
        }
    };

    const dailySums = daysOfWeek.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        let sum = 0;
        additionalProjects.forEach(project => {
            const hoursWorked = project.hours[dateKey]?.hoursWorked;
            sum += hoursWorked ? parseFloat(hoursWorked) : 0;
        });
        return sum % 1 === 0 ? sum.toString() : sum.toFixed(2);
    });

    const refreshProjectData = async (projectId) => {
        try {
            const project = additionalProjects.find(p => p.id === projectId);
            if (!project) return;

            const weekData = getWeek(currentDate, { weekStartsOn: 1 });
            const year = currentDate.getFullYear();

            const response = await Axios.get(`${baseUrl}/api/czas/projekty/dodane`, {
                params: {
                    pracownikName: loggedUserName,
                    weekData: weekData,
                    year: year
                },
                withCredentials: true
            });

            console.log("Refreshed data from server:", response.data);

            // Sprawdź czy odpowiedź zawiera projekty dla tego użytkownika
            if (response.data.projects) {
                // Znajdź projekt o tej samej nazwie w odpowiedzi z serwera
                const serverProject = response.data.projects.find(p => p.projekt === project.projekt);
                console.log("projekt na serwerze:", serverProject);

                if (serverProject && serverProject.hours) {
                    // Mapowanie nazw dni z API na daty w formacie ISO
                    const dayMapping = {
                        'Poniedziałek': daysOfWeek[0], // Monday
                        'Wtorek': daysOfWeek[1],       // Tuesday
                        'Środa': daysOfWeek[2],        // Wednesday
                        'Czwartek': daysOfWeek[3],     // Thursday
                        'Piątek': daysOfWeek[4],       // Friday
                        'Sobota': daysOfWeek[5],       // Saturday
                        'Niedziela': daysOfWeek[6]     // Sunday
                    };

                    // Zaktualizuj projekt z prawdziwymi ID z bazy danych
                    setAdditionalProjects(prevProjects =>
                        prevProjects.map(p => {
                            if (p.id === projectId) {
                                const updatedProject = { ...p };

                                // Przejdź przez mapowanie i zaktualizuj ID
                                Object.entries(dayMapping).forEach(([polishDay, dateObject]) => {
                                    const dateKey = format(dateObject, 'yyyy-MM-dd');
                                    const serverHour = serverProject.hours[polishDay];

                                    if (updatedProject.hours[dateKey] && serverHour && serverHour.id) {
                                        updatedProject.hours[dateKey] = {
                                            ...updatedProject.hours[dateKey],
                                            id: serverHour.id // Dodaj prawdziwe ID z bazy danych
                                        };
                                        console.log(`Updated ${dateKey} with ID: ${serverHour.id}`);
                                    }
                                });

                                console.log("Updated project with IDs:", updatedProject);
                                return updatedProject;
                            }
                            return p;
                        })
                    );

                    // Zwróć zaktualizowany projekt dla handleDeleteProject
                    return new Promise(resolve => {
                        setTimeout(() => {
                            const finalProject = additionalProjects.find(p => p.id === projectId);
                            resolve(finalProject);
                        }, 100); // Krótkie opóźnienie aby setAdditionalProjects się wykonał
                    });
                }
            }

        } catch (error) {
            console.error("Error refreshing project data", error);
            throw error; // Przekaż błąd dalej aby handleDeleteProject mógł go obsłużyć
        }
    };


    return (
        blockStatus === false ? (
        <div className="w-auto h-full m-2 p-1 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col">
            <div className="w-full flex flex-col items-start">
                <div className="w-full">
                    <div className="w-full flex flex-row items-center p-1 justify-between">
                        <div className="flex flex-col w-3/12">
                            <Dropdown
                                value={Firma}
                                onChange={(e) => setFirma(e.value)}
                                options={firmy}
                                placeholder="Firma"
                                autoComplete="off"
                                filter
                                resetFilterOnHide
                                disabled={statusTyg === "Zamkniety"}
                                filterInputAutoFocus
                            />
                        </div>
                        <div className="flex flex-col w-3/12">
                            <Dropdown
                                value={Zleceniodawca}
                                onChange={(e) => setZleceniodawca(e.value)}
                                options={filteredZleceniodawcy}
                                placeholder="Zleceniodawca"
                                autoComplete="off"
                                filter
                                resetFilterOnHide
                                filterInputAutoFocus
                                showClear
                                disabled={statusTyg === "Zamkniety"}
                            />
                        </div>
                        <div className="flex flex-col w-3/12">
                            <Dropdown
                                value={Projekty}
                                onChange={(e) => setProjekty(e.value)}
                                options={filteredProjekty}
                                placeholder="Projekty"
                                autoComplete="off"
                                filter
                                resetFilterOnHide
                                filterInputAutoFocus
                                showClear
                                disabled={statusTyg === "Zamkniety"}
                                scrollHeight='400px'
                            />
                        </div>
                        <div className="flex flex-col">
                            <Button
                                onClick={addWeek}
                                label="Dodaj"
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2"
                                disabled={statusTyg === "Zamkniety"}
                            />
                        </div>
                    </div>
                    {additionalProjects.map((project, index) => (
                        <AdditionalProjectRow
                            key={project.id}
                            project={project}
                            onInputChange={handleInputChange}
                            onDelete={handleDeleteProject}
                            first={index === 0}
                            daysOfWeek={daysOfWeek}
                            activeInput={activeInput}
                            setActiveInput={setActiveInput}
                            handleInputFocus={handleInputFocus}
                            samochody={samochody}
                            statusTyg={statusTyg}
                            onActivate={handleProjectActivation}
                            defaultCar={defaultSamochod}
                            zleceniodawcy={zleceniodawcy}
                        />
                    ))}
                    <div className="flex items-center mt-1">
                        <div className="w-[40rem]">
                            <span className='ml-2 font-bold'>Suma godzin:</span>
                        </div>
                        <div className="flex-1 grid grid-cols-[repeat(7,_minmax(0,_5rem))] text-center">
                            {daysOfWeek.map((day, index) => (
                                <div key={index}>
                                    <input
                                        type="text"
                                        value={dailySums[index]}
                                        className="w-16 p-1 border text-center border-gray-300 rounded bg-gray-200 font-bold"
                                        disabled
                                        readOnly
                                    />
                                </div>
                            ))}
                        </div>
                        <span className="pl-2 font-bold">Razem: {additionalProjectsTotalTime} godz.</span>
                    </div>
                    {/* Render additional fields if a project is active */}
                    {activeProject && activeDate && (
                        <div ref={additionalFieldsRef}
                        className='border border-gray-500 p-1 mt-1'>
                            <div className='grid grid-cols-[auto_1fr] gap-2 items-center'>
                                <span className="text-right">Komentarz:</span>
                                <InputTextarea
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.comment || ""}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.target.value, 'comment')}
                                    className={`w-full ${statusTyg === "Zamkniety" ? 'bg-gray-100 text-gray-800' : ''}`}
                                    rows={3}
                                    disabled={statusTyg === "Zamkniety"}
                                    readOnly={statusTyg === "Zamkniety"}
                                />
    
                                <span className="text-right">Samochód:</span>
                                <Dropdown
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.car || defaultSamochod}
                                    options={samochody}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.value, 'car')}
                                    placeholder="Wybierz pojazd"
                                    className={`w-full ${statusTyg === "Zamkniety" ? 'p-disabled' : ''}`}
                                    showClear
                                    disabled={statusTyg === "Zamkniety"}
                                    defaultValue={defaultSamochod.value}
                                />
    
                                <span className="text-right">Parking:</span>
                                <InputText
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.parking || ""}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.target.value, 'parking')}
                                    className={`w-full ${statusTyg === "Zamkniety" ? 'bg-gray-100 text-gray-800' : ''}`}
                                    disabled={statusTyg === "Zamkniety"}
                                    readOnly={statusTyg === "Zamkniety"}
                                />
    
                                <span className="text-right">Kilometry:</span>
                                <InputText
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.km || ""}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.target.value, 'km')}
                                    className={`w-full ${statusTyg === "Zamkniety" ? 'bg-gray-100 text-gray-800' : ''}`}
                                    disabled={statusTyg === "Zamkniety"}
                                    readOnly={statusTyg === "Zamkniety"}
                                />
    
                                <span className="text-right">Diety:</span>
                                <InputText
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.diet || ""}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.target.value, 'diet')}
                                    className={`w-full ${statusTyg === "Zamkniety" ? 'bg-gray-100 text-gray-800' : ''}`}
                                    disabled={statusTyg === "Zamkniety"}
                                    readOnly={statusTyg === "Zamkniety"}
                                />
    
                                <span className="text-right">Wypożyczanie narzędzi:</span>
                                <InputText
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.tools || ""}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.target.value, 'tools')}
                                    className={`w-full ${statusTyg === "Zamkniety" ? 'bg-gray-100 text-gray-800' : ''}`}
                                    disabled={statusTyg === "Zamkniety"}
                                    readOnly={statusTyg === "Zamkniety"}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        ) : null
    );    
};

export default AdditionalProjects;
