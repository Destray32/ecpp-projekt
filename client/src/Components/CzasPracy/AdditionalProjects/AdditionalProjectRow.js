import React, { useCallback } from 'react';
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
    onActivate
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
        <div className="mt-4">
            <div className="flex items-center space-x-2">
                <div className="w-1/3 flex flex-row justify-between translate-y-10">
                    <div className=''>
                        <span className=''>
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
            <div className="flex items-center space-x-2 mt-2">
                <div className="w-1/3">

                </div>
                <div className="flex-1 grid grid-cols-7 gap-1">
                    {daysOfWeek.map((day, index) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const niedziela = getDay(day) === 0;
                        const isActive = activeInput && activeInput.projectId === project.id && activeInput.date === dateKey;
                        const hasCommentAndCar = project.hours[dateKey]?.comment && project.hours[dateKey]?.car && project.hours[dateKey]?.hoursWorked > 0;
                        return (
                            <div key={index} className="text-center" 
                            onClick={() => onActivate(project.id, format(day, 'yyyy-MM-dd'))}>
                                <input
                                    type="number"
                                    value={project.hours[dateKey]?.hoursWorked || ""}
                                    onChange={(e) => onInputChange(project.id, dateKey, e.target.value, 'hoursWorked')}
                                    onFocus={() => handleInputFocus(project.id, dateKey)}
                                    onKeyPress={(e) => {
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className={`project-input w-full p-1 border ${isActive ? 'border-blue-500' : 'border-gray-300'} ${hasCommentAndCar ? 'bg-green-200' : ''} rounded`}
                                    placeholder="0"
                                    disabled={niedziela || statusTyg === "Zamkniety"}
                                    min="0"
                                    max="24"
                                    ref={(el) => setInputRef(el, project.id, dateKey)}
                                />
                            </div>
                        );
                    })}
                </div>
                <span>Razem: {projectTotal} godz.</span>
            </div>
            <div className='h-[2px] w-full bg-szary mt-2'></div>
        </div>
    );
});

export default AdditionalProjectRow;
