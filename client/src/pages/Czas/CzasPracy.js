import React, { useState, useEffect } from "react";
import { format, startOfWeek, addWeeks, subWeeks, getWeek, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Dropdown } from "primereact/dropdown";
import { Button } from 'primereact/button';

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

    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const daysOfWeekProjects = generateWeek(startOfCurrentWeek);

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
            const start = project.hours[dateKey]?.start || "00:00";
            const end = project.hours[dateKey]?.end || "00:00";
            const startDate = new Date(`2000-01-01T${start}`);
            const endDate = new Date(`2000-01-01T${end}`);
            if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
            return total + (endDate - startDate) / (1000 * 60 * 60);
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
                return p;
            })
        );
    };

    const AdditionalProjectRow = ({ project }) => {
        const projectTotal = calculateProjectTotal(project);

        return (
            <div className="mt-4">
                <div className="flex items-center space-x-2">
                    <div className="w-1/3">Projekt: {project.projekt || "Projekt"}</div>
                    <div className="flex-1 grid grid-cols-7 gap-1">
                        {daysOfWeekProjects.map((day, index) => (
                            <div key={index} className="text-center font-bold">
                                {format(day, 'EEE', { locale: pl })}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                    <div className="w-1/3"></div>
                    <div className="flex-1 grid grid-cols-7 gap-1">
                        {daysOfWeekProjects.map((day, index) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            return (
                                <div key={index} className="text-center">
                                    <input
                                        type="text"
                                        value={projectHours[format(day, 'yyyy-MM-dd')]?.start || ""}
                                        onChange={(e) => handleTimeInputChangeProjects(format(day, 'yyyy-MM-dd'), 'start', e.target.value)}
                                        onBlur={(e) => handleTimeBlurProjects(format(day, 'yyyy-MM-dd'), 'start', e.target.value)}
                                        disabled={getDay(day) === 0}
                                        className="w-full p-2 border border-gray-300 rounded"
                                        placeholder="HH:MM"
                                        maxLength="5"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="w-1/3">
                    <p className="font-bold">Total: {projectTotal.toFixed(2)} godz.</p>
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
                        {additionalProjects.map(project => (
                            <AdditionalProjectRow
                                key={project.id}
                                project={project}
                                onInputChange={handleAdditionalProjectInputChange}
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
                                <Button label="Zapisz" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" />
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
