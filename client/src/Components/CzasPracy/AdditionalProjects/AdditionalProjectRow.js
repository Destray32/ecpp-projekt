import React, { useCallback, useState } from 'react';
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { format, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { calculateProjectTotal } from '../../../utils/dateUtils';

const AdditionalProjectRow = React.memo(({
    project,
    onInputChange,
    onDelete,
    first,
    daysOfWeek,
    activeInput,
    handleInputFocus,
    samochody,
    statusTyg,
    onActivate,
    defaultCar
}) => {
    const projectTotal = calculateProjectTotal(project, daysOfWeek);
    const activeCar = activeInput ? project.hours[activeInput.date]?.car : "";

    // Format hours similar to TimeInputs component
    const formatHoursValue = (value) => {
        // Handle empty input
        if (!value || value.trim() === '') return '';
        
        let cleanValue = value.trim();
        let hoursNum = 0;
        
        // Handle different input formats: 4, 4.5, 4,5
        if (cleanValue.includes(',') || cleanValue.includes('.')) {
            // Handle comma or dot as decimal separator
            const separator = cleanValue.includes(',') ? ',' : '.';
            const parts = cleanValue.split(separator);
            const hoursPart = parseFloat(parts[0] || '0');
            let decimalPart = parseFloat('0.' + (parts[1] || '0'));
            
            // Round to quarter hours (0, 0.25, 0.5, 0.75)
            if (decimalPart < 0.125) {
                decimalPart = 0;
            } else if (decimalPart < 0.375) {
                decimalPart = 0.25;
            } else if (decimalPart < 0.625) {
                decimalPart = 0.5;
            } else if (decimalPart < 0.875) {
                decimalPart = 0.75;
            } else {
                decimalPart = 0;
                hoursNum = hoursPart + 1;
            }
            
            if (hoursNum === 0) {
                hoursNum = hoursPart + decimalPart;
            }
        } else {
            // Just a number
            hoursNum = parseFloat(cleanValue);
        }
        
        // Validate hours - prevent unreasonable values
        if (isNaN(hoursNum) || hoursNum < 0) {
            hoursNum = 0;
        } else if (hoursNum > 24) {
            // Limit to maximum reasonable daily hours (24 hours)
            hoursNum = 24;
        }
        
        // Convert to string with at most 2 decimal places
        return hoursNum % 1 === 0 ? hoursNum.toString() : hoursNum.toFixed(2);
    };
    
    const handleInputBlur = (projectId, dateKey, value) => {
        const formattedValue = formatHoursValue(value);
        onInputChange(projectId, dateKey, formattedValue, 'hoursWorked');
    };

    // to juz jest nie potrzebne raczej
    const setInputRef = useCallback((element, projectId, dateKey) => {
        if (element && activeInput && activeInput.projectId === projectId && activeInput.date === dateKey) {
            //element.focus();
        }
    }, [activeInput]);


    return (
        <div>
            <div className="flex items-center space-x-2">
                <div className="w-[40rem]">
                </div>
                {first && (
                    <div className="flex-1 grid grid-cols-[repeat(7,_minmax(0,_5rem))] text-center relative -left-4 md:-left-0 lg:left-0">
                        {daysOfWeek.map((day, index) => (
                            <div key={index} className="col-span-1 font-bold">
                                {format(day, 'EEE', { locale: pl })}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
                <div className="w-[40rem] mt">
                    <div>
                        <span>
                            <button
                                onClick={() => onDelete(project.id)}
                                className="text-red-500 font-bold border-collapse 
                                border border-red-500 p-1 rounded"
                                disabled={statusTyg === "Zamkniety"}
                            >
                                Usuń
                            </button>
                        </span>
                        <span className='ml-2'>Projekt: {project.projekt || "Projekt"}</span>
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-[repeat(7,_minmax(0,_5rem))] text-center relative -left-4 md:-left-0 lg:left-0">
                    {daysOfWeek.map((day, index) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const niedziela = getDay(day) === 0;
                        const isActive = activeInput && activeInput.projectId === project.id && activeInput.date === dateKey;

                        // inicjalizaca obiekty godzin gdy nie ma ich w projekcie
                        if (!project.hours[dateKey]) {
                            project.hours[dateKey] = {};
                        }

                        // Only set default car if there isn't one already selected
                        if (defaultCar && !project.hours[dateKey].car) {
                            project.hours[dateKey].car = defaultCar;
                        }

                        const hasCommentAndCar = project.hours[dateKey]?.comment &&
                            project.hours[dateKey]?.car &&
                            project.hours[dateKey]?.hoursWorked > 0;

                        return (
                            <div key={index} className="col-span-1 cursor-pointer"
                                onClick={() => onActivate(project.id, format(day, 'yyyy-MM-dd'))}>
                                <input
                                    type="text"
                                    value={project.hours[dateKey]?.hoursWorked || ""}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(',', '.');

                                        // Only allow digits, comma, and period with length restriction
                                        if (/^\d{0,2}([.,]\d{0,2})?$/.test(value) || value === '') {
                                            onInputChange(project.id, dateKey, value, 'hoursWorked');
                                        }
                                    }}
                                    onBlur={(e) => handleInputBlur(project.id, dateKey, e.target.value)}
                                    onFocus={() => handleInputFocus(project.id, dateKey)}
                                    className={`w-16 p-1 border text-center border-gray-300 rounded ${isActive ? 'bg-blue-400' : ''} ${hasCommentAndCar ? 'bg-green-200' : ''}`}
                                    placeholder="00:00"
                                    disabled={niedziela || statusTyg === "Zamkniety"}
                                    maxLength="5"
                                />
                            </div>
                        );
})}
                </div>
                <span>Razem: {projectTotal} godz.</span>
            </div>
            <div className='h-[2px] w-full bg-szary mt-1'></div>
        </div>
    );
});

export default AdditionalProjectRow;
