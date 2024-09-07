import React, { useState, useRef } from 'react';
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { format, getDay, getWeek } from 'date-fns';
import { pl } from 'date-fns/locale';
import Axios from "axios";

import { calculateProjectTotal } from '../../utils/dateUtils';

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
    daysOfWeek, samochody, loggedUserName, currentDate
}) => {
    const [activeInput, setActiveInput] = useState(null);
    const commentRef = useRef('');
    const parkingRef = useRef('');
    const kmRef = useRef('');
    const otherRef = useRef('');
    const dietRef = useRef('');
    const toolsRef = useRef('');
    const materialsRef = useRef('');

    const handleBlur = (inputType, ref) => {
        if (activeInput) {
            handleAdditionalProjectInputChange(activeInput.projectId, activeInput.date, ref.current, inputType);
        }
    };

    const handleChange = (e, ref) => {
        ref.current = e.target.value;
    };

    const addWeek = async () => {
        const weekData = getWeek(currentDate, { weekStartsOn: 1 });
        const year = currentDate.getFullYear();

        try {
            const response = await Axios.post("http://localhost:5000/api/czas/projekt",
                {
                    pracownikName: loggedUserName,
                    projektyName: Projekty,
                    weekData: weekData,
                    year: year,
                },
                { withCredentials: true }
            );

            const newProject = {
                id: Date.now(),
                firma: Firma || "",
                zleceniodawca: Zleceniodawca || "",
                projekt: Projekty || "",
                hours: {}
            };

            if (response.data && response.data.hours) {
                daysOfWeek.forEach(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const apiData = response.data.hours[dateKey];
                    if (apiData) {
                        newProject.hours[dateKey] = {
                            hoursWorked: apiData.hoursWorked || 0,
                            car: apiData.car || "",
                            comment: apiData.comment || "",
                            parking: apiData.parking || "",
                            km: apiData.km || "",
                            other: apiData.other || "",
                            diet: apiData.diet || "",
                            tools: apiData.tools || "",
                            materials: apiData.materials || ""
                        };
                    } else {
                        newProject.hours[dateKey] = { hoursWorked: 0, car: "" };
                    }
                });
            } else {
                daysOfWeek.forEach(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    newProject.hours[dateKey] = { hoursWorked: 0, car: "" };
                });
            }

            setAdditionalProjects(prevProjects => [...prevProjects, newProject]);
        } catch (error) {
            console.error("Error fetching project hours", error);
        }
    };

    const handleAdditionalProjectInputChange = (projectId, date, value, field) => {
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
        setAdditionalProjects(prevProjects =>
            prevProjects.filter(project => project.id !== projectId)
        );
    };

    const handleInputFocus = (projectId, date) => {
        setActiveInput({ projectId, date });
        const project = additionalProjects.find(p => p.id === projectId);
        commentRef.current = project.hours[date]?.comment || "";
        parkingRef.current = project.hours[date]?.parking || "";
        kmRef.current = project.hours[date]?.km || "";
        otherRef.current = project.hours[date]?.other || "";
        dietRef.current = project.hours[date]?.diet || "";
        toolsRef.current = project.hours[date]?.tools || "";
        materialsRef.current = project.hours[date]?.materials || "";
    };

    const AdditionalProjectRow = ({ project, onInputChange, first, onDelete }) => {
        const projectTotal = calculateProjectTotal(project, daysOfWeek);
        const activeCar = activeInput ? project.hours[activeInput.date]?.car : "";

        return (
            <div className="mt-4">
                <div className="flex items-center space-x-2">
                    <div className="w-1/3 flex flex-row justify-between">
                        <span>Projekt: {project.projekt || "Projekt"}</span>
                    </div>
                    {first && (
                        <div className="flex-1 grid grid-cols-7 gap-1">
                            {daysOfWeek.map((day, index) => (
                                <div key={index} className="text-center font-bold">
                                    {format(day, 'EEE', { locale: pl })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                    <div className="w-1/3">
                        <button
                            onClick={() => onDelete(project.id)}
                            className="text-red-500 font-bold border-collapse border border-red-500 p-1 rounded"
                        >
                            Delete
                        </button>
                    </div>
                    <div className="flex-1 grid grid-cols-7 gap-1">
                        {daysOfWeek.map((day, index) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const niedziela = getDay(day) === 0;
                            const isActive = activeInput && activeInput.projectId === project.id && activeInput.date === dateKey;
                            return (
                                <div key={index} className="text-center">
                                    <input
                                        type="number"
                                        value={project.hours[dateKey]?.hoursWorked || ""}
                                        onChange={(e) => onInputChange(project.id, dateKey, e.target.value, 'hoursWorked')}
                                        onFocus={() => handleInputFocus(project.id, dateKey)}
                                        className={`w-full p-1 border ${isActive ? 'border-blue-500' : 'border-gray-300'} rounded`}
                                        placeholder="0"
                                        disabled={niedziela}
                                        min="0"
                                        max="24"
                                    />
                                    {isActive && project.hours[dateKey]?.car && (
                                        <div className="mt-1 text-xs">
                                            Pojazd: {project.hours[dateKey].car}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <span>Total: {projectTotal} godz.</span>
                </div>
                {activeInput && activeInput.projectId === project.id && (
                    <div className='border border-gray-500 p-4 text-nowrap'>
                        <div className='flex justify-between items-center gap-4 space-y-2'>
                            <span>Komentarz:</span>
                            <InputTextarea
                                defaultValue={commentRef.current}
                                onChange={(e) => handleChange(e, commentRef)}
                                onBlur={() => handleBlur('comment', commentRef)}
                                className="w-full"
                                rows={3}
                            />
                        </div>
                        <div className='flex justify-between items-center gap-4 space-y-2'>
                            <span>Samochód:</span>
                            <Dropdown
                                value={activeCar}
                                options={samochody}
                                onChange={(e) => activeInput && onInputChange(project.id, activeInput.date, e.value, 'car')}
                                placeholder="Wybierz pojazd"
                                className="mt-1 w-full"
                                disabled={!activeInput || activeInput.projectId !== project.id}
                                hidden={!activeInput || activeInput.projectId !== project.id}
                            />
                        </div>
                        <div className='flex justify-between items-center gap-4 space-y-2'>
                            <span>Parking:</span>
                            <InputText
                                defaultValue={parkingRef.current} 
                                onChange={(e) => handleChange(e, parkingRef)}
                                onBlur={() => handleBlur('parking', parkingRef)}
                                className="w-full"
                                disabled={!activeInput || activeInput.projectId !== project.id}
                                hidden={!activeInput || activeInput.projectId !== project.id}
                                />
                        </div>
                        <div className='flex justify-between items-center gap-4 space-y-2'>
                            <span>Ex. kilometry:</span>
                            <InputText
                                defaultValue={kmRef.current}
                                onChange={(e) => handleChange(e, kmRef)}
                                onBlur={() => handleBlur('km', kmRef)}
                                className="w-full"
                                disabled={!activeInput || activeInput.projectId !== project.id}
                                hidden={!activeInput || activeInput.projectId !== project.id}
                                />
                        </div>
                        <div className='flex justify-between items-center gap-4 space-y-2'>
                            <span>Inne koszty:</span>
                            <InputText
                                defaultValue={otherRef.current}
                                onChange={(e) => handleChange(e, otherRef)}
                                onBlur={() => handleBlur('other', otherRef)}
                                className="w-full"
                                disabled={!activeInput || activeInput.projectId !== project.id}
                                hidden={!activeInput || activeInput.projectId !== project.id}
                                />
                        </div>
                        <div className='flex justify-between items-center gap-4 space-y-2'>
                            <span>Diety:</span>
                            <InputText
                                defaultValue={dietRef.current}
                                onChange={(e) => handleChange(e, dietRef)}
                                onBlur={() => handleBlur('diet', dietRef)}
                                className="w-full"
                                disabled={!activeInput || activeInput.projectId !== project.id}
                                hidden={!activeInput || activeInput.projectId !== project.id}
                                />
                        </div>
                        <div className='flex justify-between items-center gap-4 space-y-2'>
                            <span>Wypożyczanie narzędzi:</span>
                            <InputText
                                defaultValue={toolsRef.current}
                                onChange={(e) => handleChange(e, toolsRef)}
                                onBlur={() => handleBlur('tools', toolsRef)}
                                className="w-full"
                                disabled={!activeInput || activeInput.projectId !== project.id}
                                hidden={!activeInput || activeInput.projectId !== project.id}
                                />
                        </div>
                        <div className='flex justify-between items-center gap-4 space-y-2'>
                            <span className=''>Zużyte materiały:</span>
                            <InputText
                                defaultValue={materialsRef.current}
                                onChange={(e) => handleChange(e, materialsRef)}
                                onBlur={() => handleBlur('materials', materialsRef)}
                                className="w-full"
                                disabled={!activeInput || activeInput.projectId !== project.id}
                                hidden={!activeInput || activeInput.projectId !== project.id}
                                />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full md:w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
            <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                <div className="w-full h-2/6">
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
                                showClear
                            />
                        </div>
                        <div className="flex flex-col w-3/12">
                            <p className="text-sm text-gray-600 mb-2">Wybierz zleceniodawcę</p>
                            <Dropdown
                                value={Zleceniodawca}
                                onChange={(e) => setZleceniodawca(e.value)}
                                options={zleceniodawcy}
                                editable
                                placeholder="Zleceniodawca"
                                autoComplete="off"
                                className="p-2"
                                filter
                                showClear
                            />
                        </div>
                        <div className="flex flex-col w-3/12">
                            <p className="text-sm text-gray-600 mb-2">Wybierz projekt</p>
                            <Dropdown
                                value={Projekty}
                                onChange={(e) => setProjekty(e.value)}
                                options={dostepneProjekty}
                                editable
                                placeholder="Projekty"
                                autoComplete="off"
                                className="p-2"
                                filter
                                showClear
                            />
                        </div>
                        <div className="mt-8">
                            <Button
                                onClick={addWeek}
                                label="Dodaj"
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 mb-4"
                            />
                        </div>
                    </div>
                    {additionalProjects.map((project, index) => (
                        <AdditionalProjectRow
                            key={project.id}
                            project={project}
                            onInputChange={handleAdditionalProjectInputChange}
                            onDelete={handleDeleteProject}
                            first={index === 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdditionalProjects;