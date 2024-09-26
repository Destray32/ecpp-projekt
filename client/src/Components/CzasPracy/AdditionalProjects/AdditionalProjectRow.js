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
    statusTyg
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
                <div className="w-1/3 flex flex-row justify-between">
                    <span>Projekt: {project.projekt || "Projekt"}</span>
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
                    <button
                        onClick={() => onDelete(project.id)}
                        className="text-red-500 font-bold border-collapse border border-red-500 p-1 rounded"
                        disabled={statusTyg === "Zamkniety"}
                    >
                        Usuń
                    </button>
                </div>
                <div className="flex-1 grid grid-cols-7 gap-1">
                    {daysOfWeek.map((day, index) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const niedziela = getDay(day) === 0;
                        const isActive = activeInput && activeInput.projectId === project.id && activeInput.date === dateKey;
                        const hasCommentAndCar = project.hours[dateKey]?.comment && project.hours[dateKey]?.car && project.hours[dateKey]?.hoursWorked > 0;
                        return (
                            <div key={index} className="text-center">
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
                                    className={`w-full p-1 border ${isActive ? 'border-blue-500' : 'border-gray-300'} ${hasCommentAndCar ? 'bg-green-200' : ''} rounded`}
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
            {/* Only render additional fields if the project is active */}
            {activeInput && activeInput.projectId === project.id && (
                <div className='border border-gray-500 p-4 mt-2'>
                    <div className='grid grid-cols-[auto_1fr] gap-4 items-center'>
                        <span className="text-right">Komentarz:</span>
                        <InputTextarea
                            value={project.hours[activeInput.date]?.comment || ""}
                            onChange={(e) => onInputChange(project.id, activeInput.date, e.target.value, 'comment')}
                            className="w-full"
                            rows={3}
                            disabled={statusTyg === "Zamkniety"}
                        />

                        <span className="text-right">Samochód:</span>
                        <Dropdown
                            value={activeCar}
                            options={samochody}
                            onChange={(e) => onInputChange(project.id, activeInput.date, e.value, 'car')}
                            placeholder="Wybierz pojazd"
                            className="w-full"
                            showClear
                            disabled={statusTyg === "Zamkniety"}
                        />

                        <span className="text-right">Parking:</span>
                        <InputText
                            value={project.hours[activeInput.date]?.parking || ""}
                            onChange={(e) => onInputChange(project.id, activeInput.date, e.target.value, 'parking')}
                            className="w-full"
                            disabled={statusTyg === "Zamkniety"}
                        />

                        <span className="text-right">Kilometry:</span>
                        <InputText
                            value={project.hours[activeInput.date]?.km || ""}
                            onChange={(e) => onInputChange(project.id, activeInput.date, e.target.value, 'km')}
                            className="w-full"
                            disabled={statusTyg === "Zamkniety"}
                        />

                        <span className="text-right">Diety:</span>
                        <InputText
                            value={project.hours[activeInput.date]?.diet || ""}
                            onChange={(e) => onInputChange(project.id, activeInput.date, e.target.value, 'diet')}
                            className="w-full"
                            disabled={statusTyg === "Zamkniety"}
                        />

                        <span className="text-right">Wypożyczanie narzędzi:</span>
                        <InputText
                            value={project.hours[activeInput.date]?.tools || ""}
                            onChange={(e) => onInputChange(project.id, activeInput.date, e.target.value, 'tools')}
                            className="w-full"
                            disabled={statusTyg === "Zamkniety"}
                        />
                    </div>
                </div>
            )}
        </div>
    );
});

export default AdditionalProjectRow;
