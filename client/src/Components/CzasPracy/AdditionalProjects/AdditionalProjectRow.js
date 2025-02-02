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
                                    value={project.hours[dateKey]?.hoursWorked || ""}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(',', '.');
                                        onInputChange(project.id, dateKey, value, 'hoursWorked')
                                    }}
                                    onFocus={() => handleInputFocus(project.id, dateKey)}
                                    onKeyPress={(e) => {
                                        if (/[^0-9,.]/.test(e.key)) {
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
