import React from 'react';
import { Dropdown } from "primereact/dropdown";
import { Button } from 'primereact/button';
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
                            car: apiData.car || ""
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

    const handleAdditionalProjectInputChange = (projectId, date, value) => {
        setAdditionalProjects(prevProjects =>
            prevProjects.map(project => {
                if (project.id === projectId) {
                    return {
                        ...project,
                        hours: {
                            ...project.hours,
                            [date]: {
                                ...project.hours[date],
                                hoursWorked: value,
                            }
                        }
                    };
                }
                return project;
            })
        );
    };

    const handleCarSelection = (projectId, date, car) => {
        setAdditionalProjects(prevProjects =>
            prevProjects.map(project => {
                if (project.id === projectId) {
                    return {
                        ...project,
                        hours: {
                            ...project.hours,
                            [date]: {
                                ...project.hours[date],
                                car: car,
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

    const AdditionalProjectRow = ({ project, onInputChange, onCarChange, first, onDelete }) => {
        const projectTotal = calculateProjectTotal(project, daysOfWeek);
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
                            return (
                                <div key={index} className="text-center">
                                    <input
                                        type="number"
                                        value={project.hours[dateKey]?.hoursWorked || ""}
                                        onChange={(e) => onInputChange(project.id, dateKey, e.target.value)}
                                        className="w-[40%] p-1 border border-gray-300 rounded"
                                        placeholder="0"
                                        disabled={niedziela}
                                        min="0"
                                        max="24"
                                    />
                                    <Dropdown
                                        value={project.hours[dateKey]?.car || null}
                                        options={samochody}
                                        onChange={(e) => onCarChange(project.id, dateKey, e.value)}
                                        placeholder="Wybierz pojazd"
                                        className="mt-1"
                                        disabled={niedziela}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <span>Total: {projectTotal} godz.</span>
                </div>
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
                            onCarChange={handleCarSelection}
                            first={index === 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdditionalProjects;