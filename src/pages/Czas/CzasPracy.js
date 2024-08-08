import React, { useState } from "react";
import { format, startOfWeek, addWeeks, subWeeks, getWeek, addDays, differenceInHours, getDay} from 'date-fns';
import 'primeicons/primeicons.css';
import { Dropdown } from "primereact/dropdown";
import { Button } from 'primereact/button';
import { pl } from 'date-fns/locale';


export default function CzasPracyPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [Pracownik, setPracownik] = useState(null);
    const [Firma, setFirma] = useState(null);
    const [Zleceniodawca, setZleceniodawca] = useState(null);
    const [Projekty, setProjekty] = useState(null);
    const [hours, setHours] = useState({});

    const formatWeek = (date) => {
        const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'dd.MM.yyyy');
        const end = format(addWeeks(startOfWeek(date, { weekStartsOn: 1 }), 1), 'dd.MM.yyyy');
        return `${start} - ${end}`;
    };

    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

    const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

    const handleTimeChange = (day, type, value) => {
        setHours((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value,
            }
        }));
    };

    const calculateDailyTotal = (day) => {
        const start = hours[day]?.start || "00:00";
        const end = hours[day]?.end || "00:00";
        return differenceInHours(new Date(`${day}T${end}`), new Date(`${day}T${start}`));
    };

    const calculateWeeklyTotal = () => {
        return daysOfWeek.reduce((total, day) => total + (calculateDailyTotal(format(day, 'yyyy-MM-dd')) || 0), 0);
    };

    const getWeekNumber = (date) => {
        return getWeek(date, { weekStartsOn: 1 });
    };

    const previousWeek = () => {
        setCurrentDate(subWeeks(currentDate, 1));
    };

    const nextWeek = () => {
        setCurrentDate(addWeeks(currentDate, 1));
    };

    return (
        <div>
            <div className="w-full md:w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4 justify-between">
                            <div className="flex items-center space-x-2">
                                <Button label="Poprzedni" icon="pi pi-arrow-left" className="p-button-outlined" onClick={previousWeek} />
                                <p className="text-lg font-bold">Tydzień {getWeekNumber(currentDate)} : {formatWeek(currentDate)}</p>
                                <Button label="Następny" icon="pi pi-arrow-right" iconPos="right" className="p-button-outlined" onClick={nextWeek} />
                            </div>
                            <p>Otwarty/Zamknięty</p>
                            <Dropdown value={Pracownik} onChange={(e) => setPracownik(e.value)} options={["Kierownik 1", "Kierownik 2"]} editable placeholder="Pracownik"
                                autoComplete="off"
                                className="w-3/12 p-2" 
                                filter 
                                showClear
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className=" bg-amber-100 outline outline-1 outline-gray-500 space-y-4 m-2 p-3">
            <div className="grid grid-cols-7 gap-4 text-center font-bold">
                {daysOfWeek.map((day, i) => (
                    <div key={i} className="col-span-1">
                        <p>{format(day, 'EEEE', { locale: pl })}</p>
                        <p>{format(day, 'dd.MM.yyyy')}</p>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-4 mt-4 text-center">
                {daysOfWeek.map((day, i) => (
                    <div key={i} className="col-span-1">
                        <input 
                            type="time" 
                            value={hours[format(day, 'yyyy-MM-dd')]?.start || ""}
                            onChange={(e) => handleTimeChange(format(day, 'yyyy-MM-dd'), 'start', e.target.value)}
                            disabled={getDay(day) === 0}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-4 mt-2 text-center">
                {daysOfWeek.map((day, i) => (
                    <div key={i} className="col-span-1">
                        <input 
                            type="time" 
                            value={hours[format(day, 'yyyy-MM-dd')]?.end || ""}
                            onChange={(e) => handleTimeChange(format(day, 'yyyy-MM-dd'), 'end', e.target.value)}
                            disabled={getDay(day) === 0}
                            className="w-full p-2 border border-gray-300 rounded"
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
                                <Dropdown value={Firma} onChange={(e) => setFirma(e.value)} options={["PC Husbyggen"]} editable placeholder="Firma"
                                    autoComplete="off"
                                    className="p-2" 
                                    filter 
                                    showClear
                                />
                            </div>
                            <div className="flex flex-col w-3/12">
                                <p className="text-sm text-gray-600 mb-2">Wybierz zleceniodawcę</p>
                                <Dropdown value={Zleceniodawca} onChange={(e) => setZleceniodawca(e.value)} options={["Kierownik 1", "Kierownik 2"]} editable placeholder="Zleceniodawca"
                                    autoComplete="off"
                                    className="p-2" 
                                    filter 
                                    showClear
                                />
                            </div>
                            <div className="flex flex-col w-3/12">
                                <p className="text-sm text-gray-600 mb-2">Wybierz projekt</p>
                                <Dropdown value={Projekty} onChange={(e) => setProjekty(e.value)} options={["Kierownik 1", "Kierownik 2"]} editable placeholder="Projekty"
                                    autoComplete="off"
                                    className="p-2" 
                                    filter 
                                    showClear
                                />
                            </div>
                            <Button label="Dodaj" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 center translate-y-3" />
                        </div>
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
                                <Button label="Akceptuj" className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" />
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
