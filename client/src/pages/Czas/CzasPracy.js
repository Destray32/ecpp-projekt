import React, { useState, useEffect } from "react";
import { format, startOfWeek, addWeeks, subWeeks, getWeek, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Dropdown } from "primereact/dropdown";
import { Button } from 'primereact/button';
import Axios from "axios";

const generateWeek = (startDate = new Date()) => {
    const week = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        week.push(date);
    }
    return week;
};

const formatWeek = (date) => {
    const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'dd.MM.yyyy');
    const end = format(addWeeks(startOfWeek(date, { weekStartsOn: 1 }), 1), 'dd.MM.yyyy');
    return `${start} - ${end}`;
};

export default function CzasPracyPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [Pracownik, setPracownik] = useState(null);
    const [Firma, setFirma] = useState(null);
    const [Zleceniodawca, setZleceniodawca] = useState(null);
    const [Projekty, setProjekty] = useState(null);
    const [hours, setHours] = useState({});
    const [projectHours, setProjectHours] = useState({});
    const [additionalProjects, setAdditionalProjects] = useState([]);
    const [daysOfWeek, setDaysOfWeek] = useState(generateWeek(startOfWeek(new Date(), { weekStartsOn: 1 })));
    const [samochody, setSamochody] = useState([]);
    const [samochodyValue, setSamochodyValue] = useState(null);

    const [projectTotals, setProjectTotals] = useState({}); // eksperymantlny state do 
    // przetrzymywania sumy godzin dla projektów 
    // {projectId: totalHours}


    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const daysOfWeekProjects = generateWeek(startOfCurrentWeek);

    const fetchPojazdy = () => {
        Axios.get("http://localhost:5000/api/pojazdy")
            .then((response) => {
                setSamochody(response.data.pojazdy.map(pojazd => ({ label: pojazd.numerRejestracyjny, value: pojazd.numerRejestracyjny })));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    useEffect(() => {
        console.log(hours);
    }, [hours]);

    useEffect(() => {
        fetchPojazdy();
    }, []);

    useEffect(() => {
        setDaysOfWeek(generateWeek(startOfCurrentWeek));
    }, [currentDate]);

    const handleTimeInputChange = (day, type, value) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value,
            }
        }));
    };

    const handleSave = () => { // wysyłanie danych (godzin u góry strony) do serwera na przycisku "zapisz"
        try {
            const response = Axios.post("http://localhost:5000/api/czas", {
                pracownikId: Pracownik,
                projektyId: Projekty,
                weekData: getWeek(currentDate, { weekStartsOn: 1 }),
                year: currentDate.getFullYear(),
                days: daysOfWeek.map(day => ({
                    dayOfWeek: format(day, 'EEEE', { locale: pl }),
                    start: hours[format(day, 'yyyy-MM-dd')]?.start || "00:00",
                    end: hours[format(day, 'yyyy-MM-dd')]?.end || "00:00",
                }))
            });
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };

    const handleTimeInputChangeProjects = (day, type, value) => {
        setProjectHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value,
            }
        }));
    };

    const handleInputChange = (id, type, value, date) => {
        setAdditionalProjects(prevProjects =>
            prevProjects.map(p => {
                if (p.id === id) {
                    if (type === 'both') {
                        const [start, end] = value.split('-');
                        return {
                            ...p,
                            hours: {
                                ...p.hours,
                                [date]: { start, end }
                            }
                        };
                    } else {
                        return {
                            ...p,
                            hours: {
                                ...p.hours,
                                [date]: {
                                    ...p.hours[date],
                                    [type]: value
                                }
                            }
                        };
                    }
                }
                return p;
            })
        );
    };

    const handleTimeBlur = (day, type, value) => {
        let cleanValue = value.replace(/\D/g, '');
        let hours = '00';
        let minutes = '00';

        if (cleanValue.length <= 2) {
            hours = cleanValue.padStart(2, '0');
        } else if (cleanValue.length <= 4) {
            hours = cleanValue.slice(0, 2).padStart(2, '0');
            minutes = cleanValue.slice(2).padEnd(2, '0');
        }

        const formattedValue = `${hours}:${minutes}`;

        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: formattedValue,
            }
        }));
    };

    const handleTimeBlurProjects = (day, type, value) => {
        let cleanValue = value.replace(/\D/g, '');
        let hours = '00';
        let minutes = '00';

        if (cleanValue.length <= 2) {
            hours = cleanValue.padStart(2, '0');
        } else if (cleanValue.length <= 4) {
            hours = cleanValue.slice(0, 2).padStart(2, '0');
            minutes = cleanValue.slice(2).padEnd(2, '0');
        }

        const formattedValue = `${hours}:${minutes}`;

        setProjectHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: formattedValue,
            }
        }));
    };

    const calculateProjectTotal = (project) => {
        return daysOfWeek.reduce((total, day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const hours = parseFloat(project.hours[dateKey]?.hours) || 0;
            return total + hours;
        }, 0);
    };

    const calculateDailyTotal = (day) => {
        const start = hours[day]?.start || "00:00";
        const end = hours[day]?.end || "00:00";
        const startDate = new Date(`2000-01-01T${start}`);
        const endDate = new Date(`2000-01-01T${end}`);
        if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
        return (endDate - startDate) / (1000 * 60 * 60);
    };

    const calculateWeeklyTotal = () => {
        return daysOfWeek.reduce((total, day) => total + (calculateDailyTotal(format(day, 'yyyy-MM-dd')) || 0), 0);
    };

    const getWeekNumber = (date) => getWeek(date, { weekStartsOn: 1 });

    const previousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

    const addWeek = () => {
        const newProject = {
            id: Date.now(),
            firma: Firma || "",
            zleceniodawca: Zleceniodawca || "",
            projekt: Projekty || "",
            hours: daysOfWeek.reduce((acc, day) => {
                acc[format(day, 'yyyy-MM-dd')] = { start: "", end: "" };
                return acc;
            }, {})

        };

        setAdditionalProjects(prevProjects => [...prevProjects, newProject]);
    };

    const handleAdditionalProjectInputChange = (projectId, date, type, value) => {
        setAdditionalProjects(prevProjects =>
            prevProjects.map(p => {
                if (p.id === projectId) {
                    const updatedProject = {
                        ...p,
                        hours: {
                            ...p.hours,
                            [date]: {
                                ...p.hours[date],
                                [type]: value
                            }
                        }
                    };

                    // Calculate the total hours for this project and update the state
                    const totalHours = calculateProjectTotal(updatedProject);
                    setProjectTotals(prevTotals => ({
                        ...prevTotals,
                        [projectId]: totalHours,
                    }));

                    return updatedProject;
                }
                return p;
            })
        );
    };

    useEffect(() => {
        console.log(projectTotals);
    }, [projectTotals]);

    // handle do usuwania projektów
    const handleDeleteProject = (projectId) => {
        setAdditionalProjects(prevProjects =>
            prevProjects.filter(project => project.id !== projectId)
        );

        setProjectTotals(prevTotals => { // usuwanie sumy godzin ze stanu
            const newTotals = { ...prevTotals };
            delete newTotals[projectId];
            return newTotals;
        });
    };

    const AdditionalProjectRow = ({ project, onInputChange, first, onDelete }) => {
        const projectTotal = calculateProjectTotal(project);

        return (
            <div className="mt-4">
                <div className="flex items-center space-x-2">
                    <div className="w-1/3 flex flex-row justify-between">
                        Projekt: {project.projekt || "Projekt"}
                        <span className="font-bold">Total: {projectTotal.toFixed(2)} godz.</span>
                    </div>


                    {/* tylko pierwszy projekt zmapuje dni tygodnia */}
                    {first && (
                        <div className="flex-1 grid grid-cols-7 gap-1">
                            {daysOfWeekProjects.map((day, index) => (
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
                            className="text-red-500 font-bold"
                        >
                            Delete
                        </button>
                    </div>
                    <div className="flex-1 grid grid-cols-7 gap-1">
                        {daysOfWeekProjects.map((day, index) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const isLastInput = index === daysOfWeekProjects.length - 1;
                            return (
                                <div key={index} className="text-center">
                                    <input
                                        type="number"
                                        value={project.hours[dateKey]?.hours || ""}
                                        onChange={(e) => onInputChange(project.id, dateKey, 'hours', e.target.value)}
                                        className={`w-[50%] h-full p-1 border border-gray-300 rounded ${isLastInput ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                        placeholder="Hours"
                                        min="0"
                                        max="24"
                                        disabled={isLastInput}
                                    />
                                </div>
                            );
                        })}
                    </div>

                </div>
                <div className="flex gap-4 items-center">
                    <span>Samochody</span>
                    <Dropdown
                        value={samochodyValue}
                        onChange={(e) => setSamochodyValue(e.value)}
                        options={samochody}
                        editable
                        placeholder="Samochody"
                        autoComplete="off"
                        className="p-2"
                        filter
                        showClear
                    />
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="w-full md:w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4 justify-between">
                            <div className="flex items-center space-x-2">
                                <Button icon="pi pi-arrow-left" className="p-button-outlined" onClick={previousWeek} />
                                <p className="text-lg font-bold">Tydzień {getWeekNumber(currentDate)} : {formatWeek(currentDate)}</p>
                                <Button icon="pi pi-arrow-right" iconPos="right" className="p-button-outlined" onClick={nextWeek} />
                            </div>
                            <Dropdown
                                value={Pracownik}
                                onChange={(e) => setPracownik(e.value)}
                                options={["Kierownik 1", "Kierownik 2"]}
                                editable
                                placeholder="Pracownik"
                                autoComplete="off"
                                className="w-3/12 p-2"
                                filter
                                showClear
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-amber-100 outline outline-1 outline-gray-500 space-y-4 m-2 p-3">
                <div className="grid grid-cols-7 gap-4 text-center font-bold">
                    {daysOfWeek.map((day, i) => (
                        <div key={i} className="col-span-1">
                            <p>{format(day, 'EEEE', { locale: pl })} {format(day, 'dd.MM')}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-4 mt-4 text-center">
                    {daysOfWeek.map((day, i) => (
                        <div key={i} className="col-span-1">
                            <input
                                type="text"
                                value={hours[format(day, 'yyyy-MM-dd')]?.start || ""}
                                onChange={(e) => handleTimeInputChange(format(day, 'yyyy-MM-dd'), 'start', e.target.value)}
                                onBlur={(e) => handleTimeBlur(format(day, 'yyyy-MM-dd'), 'start', e.target.value)}
                                disabled={getDay(day) === 0}
                                className="w-1/2 p-2 border border-gray-300 rounded"
                                placeholder="HH:MM"
                                maxLength="5"
                            />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-4 mt-2 text-center">
                    {daysOfWeek.map((day, i) => (
                        <div key={i} className="col-span-1">
                            <input
                                type="text"
                                value={hours[format(day, 'yyyy-MM-dd')]?.end || ""}
                                onChange={(e) => handleTimeInputChange(format(day, 'yyyy-MM-dd'), 'end', e.target.value)}
                                onBlur={(e) => handleTimeBlur(format(day, 'yyyy-MM-dd'), 'end', e.target.value)}
                                disabled={getDay(day) === 0}
                                className="w-1/2 p-2 border border-gray-300 rounded"
                                placeholder="HH:MM"
                                maxLength="5"
                            />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-4 mt-4 text-center font-bold">
                    {daysOfWeek.map((day, i) => (
                        <div key={i} className="col-span-1">
                            <p>{calculateDailyTotal(format(day, 'yyyy-MM-dd')) || 0} godz.</p>
                        </div>
                    ))}
                </div>

                <div className="text-right mt-6 font-bold">
                    <p>Razem: {calculateWeeklyTotal()} godz.</p>
                </div>
            </div>
            <div className="w-full md:w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4 justify-between">
                            <div className="flex flex-col w-3/12">
                                <p className="text-sm text-gray-600 mb-2">Wybierz firmę</p>
                                <Dropdown
                                    value={Firma}
                                    onChange={(e) => setFirma(e.value)}
                                    options={["PC Husbyggen"]}
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
                                    options={["Kierownik 1", "Kierownik 2"]}
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
                                    options={["Kierownik 1", "Kierownik 2"]}
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
                                onDelete={handleDeleteProject} // do usuwania projektów
                                first={index === 0} // do mapowania dni tygodnia (tylko pierwszy projekt zmapuje)
                            />
                        ))}


                    </div>
                </div>
            </div>
            <div className="w-full md:w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4 justify-between">
                            <div className="w-full flex flex-row items-center space-x-2 justify-between">
                                <Button label="Zapisz"
                                    className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow"
                                    onClick={handleSave}
                                />
                                <Button label="Zamknij tydzień" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" />
                                <Button label="Otwórz tydzień" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" />
                                <Button label="Planowanie urlopu" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" />
                                <Button label="Drukuj raport" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
