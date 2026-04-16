import React from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from "primereact/dropdown";
import { getWeek, subWeeks, addWeeks } from 'date-fns';
import { formatWeek } from '../../utils/dateUtils';
import { hasSpecialAccess } from '../../utils/accTypeUtils';
import CalendarIsoInput from '../CalendarIsoInput';

/**
 * Komponent nawigacji tygodniowej.
 * 
 * @component
 * @param {Object} props - Właściwości przekazywane do komponentu.
 * @param {Date} props.currentDate - Aktualnie wybrana data.
 * @param {Function} props.setCurrentDate - Funkcja ustawiająca aktualną datę.
 * @param {Object} props.Pracownik - Aktualnie wybrany pracownik.
 * @param {Function} props.setPracownik - Funkcja ustawiająca aktualnie wybranego pracownika.
 * @param {Array} props.pracownicy - Lista dostępnych pracowników.
 * @param {string} props.userType - Typ użytkownika (np. "Pracownik").
 * @param {string} props.statusTyg - Status tygodnia (np. "Otwarty").
 * @param {boolean} props.isOnline - Status połączenia z internetem.
 * @param {Date|null} props.lastSaved - Czas ostatniego lokalnego zapisu.
 * @param {string} props.saveStatus - Status zapisu (idle, saving, saved, error)
 * @param {boolean} props.hasUnsavedChanges - Czy są niezapisane zmiany
 * @param {string} props.imie - Imię zalogowanego użytkownika
 * @param {string} props.nazwisko - Nazwisko zalogowanego użytkownika
 * 
 * @returns {JSX.Element} Element JSX reprezentujący nawigację tygodniową.
 */
const WeekNavigation = ({ 
    currentDate, 
    setCurrentDate, 
    Pracownik, 
    setPracownik, 
    pracownicy, 
    userType, 
    statusTyg,
    isOnline,
    lastSaved,
    saveStatus,
    hasUnsavedChanges,
    imie,
    nazwisko
}) => {
    const previousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleDateChange = (value) => setCurrentDate(new Date(value));

    return (
        <div className="w-auto h-full m-2 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
            <div className="w-full h-2/5 flex flex-col items-start">
                <div className="w-full h-2/6">
                    <div className="w-full flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Button icon="pi pi-arrow-left" className="p-button-outlined" onClick={previousWeek} />
                            <div className="flex flex-col items-center">
                                <p>{formatWeek(currentDate)}</p>
                                <p className="text-lg font-bold">Tydzień {getWeek(currentDate, { weekStartsOn: 1 })}</p>
                                <CalendarIsoInput
                                    value={currentDate.toISOString().split('T')[0]}
                                    onChange={handleDateChange}
                                    placeholder="Wybierz date"
                                    className="mt-2 w-40"
                                    inputClassName="w-full rounded border border-gray-300 p-1 text-center text-sm"
                                />
                            </div>
                            <Button icon="pi pi-arrow-right" iconPos="right" className="p-button-outlined" onClick={nextWeek} />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-lg font-bold ${statusTyg === "Otwarty" ? "text-green-600" : "text-red-600"}`}>
                                {statusTyg}
                            </span>
                            {hasUnsavedChanges && (
                                <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded border">
                                    Niezapisane zmiany
                                </span>
                            )}
                            <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                            {lastSaved && (
                                <span className="text-xs text-gray-600">
                                    Ostatnio zapisano: {lastSaved.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                        <div className='w-3/12 p-2'>
                            <Dropdown
                                value={Pracownik}
                                onChange={(e) => setPracownik(e.value)}
                                options={pracownicy}
                                placeholder="Pracownik"
                                autoComplete="off"
                                className="w-3/4 float-right"
                                disabled={(userType === "Pracownik" || userType === "Kierownik") && !hasSpecialAccess(imie, nazwisko, 'tydzien')}
                                filter
                                resetFilterOnHide
                                filterInputAutoFocus
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeekNavigation;