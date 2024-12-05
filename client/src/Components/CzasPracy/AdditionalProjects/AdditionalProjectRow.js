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

    // to juz jest nie potrzebne raczej
    const setInputRef = useCallback((element, projectId, dateKey) => {
        if (element && activeInput && activeInput.projectId === projectId && activeInput.date === dateKey) {
            //element.focus();
        }
    }, [activeInput]);

    const [rawInputs, setRawInputs] = useState({});

    const handleTimeInput = (projectId, dateKey, value) => {
        let cleanValue = value.replace(/[^\d:]/g, '');
        setRawInputs(prev => ({
            ...prev,
            [dateKey]: cleanValue
        }));

        // updejtawanie stanu podczas wpisywania
        onInputChange(projectId, dateKey, cleanValue, 'hoursWorked');
    };

    const handleTimeBlur = (projectId, dateKey, value) => {
        let cleanValue = value.replace(/[^\d:]/g, '');

        if (cleanValue.includes(':')) {
            const [hours, minutes] = cleanValue.split(':');
            const h = parseInt(hours, 10);
            const m = parseInt(minutes, 10) || 0;

            if (h >= 0 && h <= 24 && m >= 0 && m < 60) {
                const decimalHours = h + (m / 60);
                onInputChange(projectId, dateKey, decimalHours.toFixed(2), 'hoursWorked');
            }
        } else {
            const num = parseInt(cleanValue, 10);
            if (!isNaN(num) && num >= 0 && num <= 24) {
                onInputChange(projectId, dateKey, num.toString(), 'hoursWorked');
            }
        }

        // clearowanie stanu
        setRawInputs(prev => {
            const newState = { ...prev };
            delete newState[dateKey];
            return newState;
        });
    };

    return (
        <div>
            <div className="flex items-center space-x-2">
                <div className="w-1/3">
                </div>
                {first && (
                    <div className="flex-1 grid grid-cols-8 gap-1">
                        {daysOfWeek.map((day, index) => (
                            <div key={index} className="text-center font-bold">
                                {format(day, 'EEE', { locale: pl })}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
                <div className="w-1/3 mt">
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
                <div className="flex-1 grid grid-cols-7 gap-1">
                    {daysOfWeek.map((day, index) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const niedziela = getDay(day) === 0;
                        const isActive = activeInput && activeInput.projectId === project.id && activeInput.date === dateKey;

                        // inicjalizaca obiekty godzin gdy nie ma ich w projekcie
                        if (!project.hours[dateKey]) {
                            project.hours[dateKey] = {};
                        }

                        if (defaultCar) {
                            project.hours[dateKey].car = defaultCar;
                        }

                        const hasCommentAndCar = project.hours[dateKey]?.comment &&
                            project.hours[dateKey]?.car &&
                            project.hours[dateKey]?.hoursWorked > 0;

                        return (
                            <div key={index} className="text-center"
                                onClick={() => onActivate(project.id, format(day, 'yyyy-MM-dd'))}>
                                <input
                                    type="text"
                                    value={rawInputs[dateKey] || project.hours[dateKey]?.hoursWorked || ""}
                                    onChange={(e) => handleTimeInput(project.id, dateKey, e.target.value)}
                                    onBlur={(e) => handleTimeBlur(project.id, dateKey, e.target.value)}
                                    onKeyPress={(e) => {
                                        if (!/[\d:]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className={`project-input w-full p-1 border ${isActive ? 'bg-blue-400' : 'border-gray-300'} ${hasCommentAndCar ? 'bg-green-200' : ''} rounded`}
                                    placeholder="0"
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
