import React, { useState, useEffect } from 'react';
import { format, getDay, set } from 'date-fns';
import { pl } from 'date-fns/locale';
import { calculateDailyTotal, calculateWeeklyTotal } from '../../utils/dateUtils';

/**
 * Komponent TimeInputs.
 * 
 * @component
 * @param {Object} props - Właściwości przekazywane do komponentu.
 * @param {Array<Date>} props.daysOfWeek - Tablica dni tygodnia.
 * @param {Object} props.hours - Obiekt przechowujący godziny pracy dla poszczególnych dni.
 * @param {Function} props.setHours - Funkcja ustawiająca godziny pracy.
 * 
 * @returns {JSX.Element} Element JSX reprezentujący komponent TimeInputs.
 * 
 * @example
 * const daysOfWeek = [new Date(), new Date(), new Date(), new Date(), new Date(), new Date(), new Date()];
 * const hours = {
 *   '2023-01-01': { start: '08:00', end: '16:00' },
 *   '2023-01-02': { start: '09:00', end: '17:00' },
 * };
 * const setHours = (newHours) => console.log(newHours);
 * 
 * <TimeInputs daysOfWeek={daysOfWeek} hours={hours} setHours={setHours} />
 */
const TimeInputs = ({ daysOfWeek, hours, setHours,
    statusTyg, setPrzekroczone, isOver10h, setIsOver10h,
    blockStatus, nazwaGrupyPracownika, pracownicyWGrupie, czyZapisano }) => {
    const [globalStart, setGlobalStart] = useState('');
    const [globalBreak, setGlobalBreak] = useState('');
    const [globalEnd, setGlobalEnd] = useState('');


    useEffect(() => {
        daysOfWeek.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayHours = hours[dayKey];
            const dailyTotal = calculateDailyTotal(dayHours);
            if (dailyTotal > 10) {
                setIsOver10h(prev => ({
                    ...prev,
                    [getDay(day)]: true
                }));
            } else {
                setIsOver10h(prev => ({
                    ...prev,
                    [getDay(day)]: false
                }));
            }
        });
    }, [hours]);

    useEffect(() => {
        for (let i = 0; i < 6; i++) {
            if (isOver10h[i]) {
                setPrzekroczone(true);
                return;
            }
        }
        setPrzekroczone(false);
    }, [isOver10h]);

    // resetuje globalne godziny pracy po zmianie dni tygodnia
    useEffect(() => {
        setGlobalStart('');
        setGlobalBreak('');
        setGlobalEnd('');
    }, [daysOfWeek]);

    //#region Handle
    const handleTimeInputChange = (day, type, value) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value,
            }
        }));
    };

    const formatTimeValue = (value) => {
        let czyPrzecinek = value.includes(',');
        let cleanValue = value;
    
        if (czyPrzecinek) {
            // ("7,3" -> "7:30" itp)
            const parts = value.split(',');
            const hoursPart = parts[0] || '0';
            const decimalPart = parts[1] || '0';
            
            // konwersja minut po rzecinku do pelnego formatu
            if (decimalPart.length <= 1) {
                cleanValue = `${hoursPart}:${decimalPart}0`;
            } else {
                cleanValue = `${hoursPart}:${decimalPart}`;
            }
        }
    
        let [hours, minutes] = cleanValue.split(':').map(part => part || '00');
    
        if (!cleanValue.includes(':')) {
            if (cleanValue.length <= 2) {
                hours = cleanValue.padStart(2, '0');
                minutes = '00';
            } else if (cleanValue.length === 3) {
                hours = cleanValue.slice(0, 1).padStart(2, '0');
                minutes = cleanValue.slice(1, 3);
            } else if (cleanValue.length >= 4) {
                hours = cleanValue.slice(0, 2).padStart(2, '0');
                minutes = cleanValue.slice(2, 4);
            }
        }
    
        let parsedHours = parseInt(hours, 10);
        let parsedMinutes = parseInt(minutes, 10);
    
        if (isNaN(parsedHours) || parsedHours > 23) {
            parsedHours = 23;
        } else if (parsedHours < 0) {
            parsedHours = 0;
        }
    
        if (isNaN(parsedMinutes)) {
            parsedMinutes = 0;
        } else if (parsedMinutes >= 0 && parsedMinutes < 15) {
            parsedMinutes = 0;
        } else if (parsedMinutes >= 15 && parsedMinutes < 45) {
            parsedMinutes = 30;
        } else if (parsedMinutes >= 45 && parsedMinutes < 60) {
            parsedMinutes = 0;
            parsedHours += 1;
            if (parsedHours > 23) {
                parsedHours = 23;
            }
        } else {
            parsedMinutes = 0;
        }
    
        hours = parsedHours.toString().padStart(2, '0');
        minutes = parsedMinutes.toString().padStart(2, '0');
    
        return `${hours}:${minutes}`;
    };



    const handleTimeBlur = (day, type, value) => {
        const formattedValue = formatTimeValue(value);
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: formattedValue,
            }
        }));
    };

    const handleGlobalTimeBlur = (value, setValue, type) => {
        const formattedValue = formatTimeValue(value);
        setValue(formattedValue);

        daysOfWeek.forEach(day => {
            if (getDay(day) === 0) return;
            handleTimeInputChange(format(day, 'yyyy-MM-dd'), type, formattedValue);
        });
    };

    const handleGlobalStartChange = (value) => {
        setGlobalStart(value);
        daysOfWeek.forEach(day => {
            if (getDay(day) === 0) return;
            handleTimeInputChange(format(day, 'yyyy-MM-dd'), 'start', value);
        });
    };

    const handleGlobalBreakChange = (value) => {
        setGlobalBreak(value);
        daysOfWeek.forEach(day => {
            if (getDay(day) === 0) return;
            handleTimeInputChange(format(day, 'yyyy-MM-dd'), 'break', value);
        });
    };

    const handleGlobalEndChange = (value) => {
        setGlobalEnd(value);
        daysOfWeek.forEach(day => {
            if (getDay(day) === 0) return;
            handleTimeInputChange(format(day, 'yyyy-MM-dd'), 'end', value);
        });
    };
    //#endregion

    return (
        <div className="bg-amber-100 outline outline-1 outline-gray-500 m-2 p-1">
            <div className="flex flex-row space-x-8">
                <div className="flex flex-col w-[40rem]">
                    <div id="nazwaGrupy" className="flex gap-2 text-lg">
                        <p className="font-bold">Grupa:</p>
                        <span>{nazwaGrupyPracownika}</span>
                    </div>
                    <div className="flex flex-row gap-2 flex-wrap mt-2">
                        <span>{pracownicyWGrupie.map((pracownik) => pracownik.label).join(', ')}</span>
                    </div>
                </div>
                <div className="flex flex-col w-full pl-20">
                    <div className="grid grid-cols-[repeat(8,_minmax(0,_5rem))] text-center">
                        <div className="col-span-1 font-bold flex flex-col justify-end pb-2">
                        <span>Dzień:</span>
                        </div>
                        {daysOfWeek.map((day, i) => (
                        <div key={i} className="col-span-1 font-bold flex flex-col justify-end">
                            <p>{format(day, 'EEE', { locale: pl })}</p>
                            <p>{format(day, 'dd.MM')}</p>
                        </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-[repeat(8,_minmax(0,_5rem))] mt-1 text-center">
                        <div className="col-span-1 flex items-center justify-end">
                        <span className="mr-2">Rozpoczęcie:</span>
                        <input
                            type="text"
                            value={globalStart}
                            onChange={(e) => handleGlobalStartChange(e.target.value)}
                            onBlur={(e) => handleGlobalTimeBlur(e.target.value, setGlobalStart, 'start')}
                            className="w-16 p-1 border text-center border-gray-300 rounded mx-2"
                            placeholder="00:00"
                            maxLength="5"
                            disabled={statusTyg === 'Zamkniety' || blockStatus}
                        />
                        </div>
                        {daysOfWeek.map((day, i) => (
                        <div key={i} className="col-span-1">
                            <input
                            type="text"
                            value={hours[format(day, 'yyyy-MM-dd')]?.start || ''}
                            onChange={(e) => handleTimeInputChange(format(day, 'yyyy-MM-dd'), 'start', e.target.value)}
                            onBlur={(e) => handleTimeBlur(format(day, 'yyyy-MM-dd'), 'start', e.target.value)}
                            disabled={getDay(day) === 0 || statusTyg === 'Zamkniety' || blockStatus}
                            className={`w-16 p-1 border text-center border-gray-300 rounded ${
                                isOver10h[getDay(day)] ? 'bg-orange-300' : ''
                            }`}
                            placeholder="00:00"
                            maxLength="5"
                            />
                        </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-[repeat(8,_minmax(0,_5rem))] mt-1 text-center">
                        <div className="col-span-1 flex items-center justify-end">
                        <span className="mr-2">Przerwa:</span>
                        <input
                            type="text"
                            value={globalBreak}
                            onChange={(e) => handleGlobalBreakChange(e.target.value)}
                            onBlur={(e) => handleGlobalTimeBlur(e.target.value, setGlobalBreak, 'break')}
                            className="w-16 p-1 border text-center border-gray-300 rounded mx-2"
                            placeholder="00:00"
                            maxLength="5"
                            disabled={statusTyg === 'Zamkniety' || blockStatus}
                        />
                        </div>
                        {daysOfWeek.map((day, i) => (
                        <div key={i} className="col-span-1">
                            <input
                            type="text"
                            value={hours[format(day, 'yyyy-MM-dd')]?.break || ''}
                            onChange={(e) => handleTimeInputChange(format(day, 'yyyy-MM-dd'), 'break', e.target.value)}
                            onBlur={(e) => handleTimeBlur(format(day, 'yyyy-MM-dd'), 'break', e.target.value)}
                            disabled={getDay(day) === 0 || statusTyg === 'Zamkniety' || blockStatus}
                            className={`w-16 p-1 border text-center border-gray-300 rounded ${
                                isOver10h[getDay(day)] ? 'bg-orange-300' : ''
                            }`}
                            placeholder="00:00"
                            maxLength="5"
                            />
                        </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-[repeat(8,_minmax(0,_5rem))] mt-1 text-center">
                        <div className="col-span-1 flex items-center justify-end">
                        <span className="mr-2">Zakończenie:</span>
                        <input
                            type="text"
                            value={globalEnd}
                            onChange={(e) => handleGlobalEndChange(e.target.value)}
                            onBlur={(e) => handleGlobalTimeBlur(e.target.value, setGlobalEnd, 'end')}
                            className="w-16 p-1 border text-center border-gray-300 rounded mx-2"
                            placeholder="00:00"
                            maxLength="5"
                            disabled={statusTyg === 'Zamkniety' || blockStatus}
                        />
                    </div>
                    {daysOfWeek.map((day, i) => (
                    <div key={i} className="col-span-1">
                        <input
                        type="text"
                        value={hours[format(day, 'yyyy-MM-dd')]?.end || ''}
                        onChange={(e) => handleTimeInputChange(format(day, 'yyyy-MM-dd'), 'end', e.target.value)}
                        onBlur={(e) => handleTimeBlur(format(day, 'yyyy-MM-dd'), 'end', e.target.value)}
                        disabled={getDay(day) === 0 || statusTyg === 'Zamkniety' || blockStatus}
                        className={`w-16 p-1 border text-center border-gray-300 rounded ${
                            isOver10h[getDay(day)] ? 'bg-orange-300' : ''
                        }`}
                        placeholder="00:00"
                        maxLength="5"
                        />
                    </div>
                    ))}
                </div>
                <div className="grid grid-cols-[repeat(8,_minmax(0,_5rem))] mt-1 text-center font-bold">
                    <div className="col-span-1">Razem:</div>
                    {daysOfWeek.map((day, i) => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayHours = hours[dayKey];
                    return (
                        <div key={i} className="col-span-1">
                        <p>{calculateDailyTotal(dayHours) || 0} godz.</p>
                        </div>
                    );
                    })}
                    </div>
                </div>
                <div className="flex flex-col justify-between w-[14rem]">
                <div
                        className={`text-right font-bold self-end ${calculateWeeklyTotal(hours, daysOfWeek) > 60 &&
                                (czyZapisano || statusTyg === 'Zamkniety')
                                ? 'text-red-500'
                                : 'text-black'
                            }`}
                    >
                        <p>Razem: {calculateWeeklyTotal(hours, daysOfWeek)} godz.</p>
                        {calculateWeeklyTotal(hours, daysOfWeek) > 60 &&
                            (czyZapisano || statusTyg === 'Zamkniety') ? (
                            <p className="text-xs">
                                <strong>Pilne:</strong> skontaktuj się z Olafem lub Pawłem
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeInputs;