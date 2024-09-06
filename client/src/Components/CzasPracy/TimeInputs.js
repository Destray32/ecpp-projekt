import React from 'react';
import { format, getDay } from 'date-fns';
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
const TimeInputs = ({ daysOfWeek, hours, setHours }) => {
    const handleTimeInputChange = (day, type, value) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value,
            }
        }));
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

    return (
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

            <div className="text-right mt-6 font-bold">
                <p>Razem: {calculateWeeklyTotal(hours, daysOfWeek)} godz.</p>
            </div>
        </div>
    );
};

export default TimeInputs;