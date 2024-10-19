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
    statusTyg
}) => {
    const [activeInput, setActiveInput] = useState(null);
    const [filteredZleceniodawcy, setFilteredZleceniodawcy] = useState([]);
    const [filteredProjekty, setFilteredProjekty] = useState([]);
    const [activeProject, setActiveProject] = useState(null);
    const [activeDate, setActiveDate] = useState(null);


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
        <div className="w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
            <div className="w-full flex flex-col space-y-2 items-start">
                <div className="w-full">
                    <div className="w-full flex flex-row items-center p-4 justify-between">
                        <div className="flex flex-col w-3/12">
                            <p className="text-sm text-gray-600 mb-2">Wybierz firmę</p>
                            <Dropdown
                                value={Firma}
                                onChange={(e) => setFirma(e.value)}
                                options={firmy}
                                editable
                                placeholder="Firma"
                                autoComplete="off"
                                className="p-2"
                                filter
                                disabled={statusTyg === "Zamkniety"}
                            />
                        </div>
                        <div className="flex flex-col w-3/12">
                            <p className="text-sm text-gray-600 mb-2">Wybierz zleceniodawcę</p>
                            <Dropdown
                                value={Zleceniodawca}
                                onChange={(e) => setZleceniodawca(e.value)}
                                options={filteredZleceniodawcy}
                                editable
                                placeholder="Zleceniodawca"
                                autoComplete="off"
                                className="p-2"
                                filter
                                showClear
                                disabled={statusTyg === "Zamkniety"}
                            />
                        </div>
                        <div className="flex flex-col w-3/12">
                            <p className="text-sm text-gray-600 mb-2">Wybierz projekt</p>
                            <Dropdown
                                value={Projekty}
                                onChange={(e) => setProjekty(e.value)}
                                options={filteredProjekty}
                                editable
                                placeholder="Projekty"
                                autoComplete="off"
                                className="p-2"
                                filter
                                showClear
                                disabled={statusTyg === "Zamkniety"}
                            />
                        </div>
                        <div className="mt-8">
                            <Button
                                onClick={addWeek}
                                label="Dodaj"
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mb-4"
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
                        />
                    ))}
                    {/* Render additional fields if a project is active */}
                    {activeProject && activeDate && (
                        <div className='border border-gray-500 p-4 mt-2'>
                            <div className='grid grid-cols-[auto_1fr] gap-4 items-center'>
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
    );    
};

export default AdditionalProjects;
