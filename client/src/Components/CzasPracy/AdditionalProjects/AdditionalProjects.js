import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dropdown } from "primereact/dropdown";
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import Axios from "axios";
import { format, getWeek } from 'date-fns';
import { notification } from 'antd';

import AdditionalProjectRow from './AdditionalProjectRow';

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
    statusTyg, blockStatus, nazwaGrupyPracownika
}) => {
    const [activeInput, setActiveInput] = useState(null);
    const [filteredZleceniodawcy, setFilteredZleceniodawcy] = useState([]);
    const [filteredProjekty, setFilteredProjekty] = useState([]);
    const [activeProject, setActiveProject] = useState(null);
    const [activeDate, setActiveDate] = useState(null);
    const [additionalProjectsTotalTime, setAdditionalProjectsTotalTime] = useState(0.0);

    const additionalFieldsRef = useRef(null);

    useEffect(() => {
        if (firmy && firmy.length > 0) {
            Axios.get('http://localhost:5000/api/mojedane', { withCredentials: true })
                .then(res => {
                    if (res.data && res.data.company) {
                        const userFirmaId = res.data.company;
                        const defaultFirma = firmy.find(f => f.value === userFirmaId);
    
                        if (defaultFirma) {
                            setFirma(defaultFirma.value);
                        }
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [firmy]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isDropdownPanel = event.target.closest('.p-dropdown-panel');
            const isDropdownTrigger = event.target.closest('.p-dropdown-trigger');
            const isDropdownItem = event.target.closest('.p-dropdown-item');
            
    
            if (additionalFieldsRef.current && 
                !additionalFieldsRef.current.contains(event.target) &&
                !event.target.closest('.project-input') &&
                !event.target.closest('.p-inputtextarea') && 
                !event.target.closest('.p-dropdown') && 
                !event.target.closest('.p-inputtext') &&
                !isDropdownPanel &&
                !isDropdownTrigger &&
                !isDropdownItem
            ) {
                setActiveProject(null);
                setActiveDate(null);
            }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let total = 0.0;
        additionalProjects.forEach(project => {
            Object.values(project.hours).forEach(hour => {
                total += parseFloat(hour.hoursWorked);
            });
        });
        setAdditionalProjectsTotalTime(total);
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
            const filteredProjekty = dostepneProjekty.filter(projekt =>
                projekt.Grupa_urlopowa_idGrupa_urlopowa === Zleceniodawca
            );

            setFilteredProjekty(filteredProjekty);
            setProjekty(null);
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

            const response = await Axios.post("http://localhost:5000/api/czas/projekt", {
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
                    car: apiData.car || "",
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

    const handleDeleteProject = (projectId) => {
        // na podstawie id projektu ustawionego poprzez uuid4 wchodzimy do tego projektu i
        // wyciągamy wszystkie id nadesłane z bazy dla każdego dzien_projekty i usuwamy
        additionalProjects.forEach(project => {
            if (project.id === projectId) {
                console.log(project);
                Object.values(project.hours).forEach(async hour => {
                    try {
                        await Axios.delete(`http://localhost:5000/api/czas/projekt/${hour.id}`, { withCredentials: true });
                    } catch (error) {
                        console.error("Error deleting project", error);
                    }
                });
            }
        });

        setAdditionalProjects(prevProjects =>
            prevProjects.filter(project => project.id !== projectId)
        );
    };

    const handleInputFocus = (projectId, date) => {
        if (!activeInput || activeInput.projectId !== projectId || activeInput.date !== date) {
            setActiveInput({ projectId, date });
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
                        <div className="flex flex-col">
                            <p className='font-bold'>Suma: {additionalProjectsTotalTime}:00</p>
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
                        />
                    ))}
                    {/* Render additional fields if a project is active */}
                    {activeProject && activeDate && (
                        <div ref={additionalFieldsRef}
                        className='border border-gray-500 p-1 mt-1'>
                            <div className='grid grid-cols-[auto_1fr] gap-2 items-center'>
                                <span className="text-right">Komentarz:</span>
                                <InputTextarea
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.comment || ""}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.target.value, 'comment')}
                                    className="w-full"
                                    rows={3}
                                    disabled={statusTyg === "Zamkniety"}
                                />
    
                                <span className="text-right">Samochód:</span>
                                <Dropdown
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.car || ""}
                                    options={samochody}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.value, 'car')}
                                    placeholder="Wybierz pojazd"
                                    className="w-full"
                                    showClear
                                    disabled={statusTyg === "Zamkniety"}
                                />
    
                                <span className="text-right">Parking:</span>
                                <InputText
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.parking || ""}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.target.value, 'parking')}
                                    className="w-full"
                                    disabled={statusTyg === "Zamkniety"}
                                />
    
                                <span className="text-right">Kilometry:</span>
                                <InputText
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.km || ""}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.target.value, 'km')}
                                    className="w-full"
                                    disabled={statusTyg === "Zamkniety"}
                                />
    
                                <span className="text-right">Diety:</span>
                                <InputText
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.diet || ""}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.target.value, 'diet')}
                                    className="w-full"
                                    disabled={statusTyg === "Zamkniety"}
                                />
    
                                <span className="text-right">Wypożyczanie narzędzi:</span>
                                <InputText
                                    value={additionalProjects.find(p => p.id === activeProject)?.hours[activeDate]?.tools || ""}
                                    onChange={(e) => handleInputChange(activeProject, activeDate, e.target.value, 'tools')}
                                    className="w-full"
                                    disabled={statusTyg === "Zamkniety"}
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
