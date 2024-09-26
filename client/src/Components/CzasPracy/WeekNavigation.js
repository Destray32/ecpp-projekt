import React from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from "primereact/dropdown";
import { getWeek, subWeeks, addWeeks } from 'date-fns';
import { formatWeek } from '../../utils/dateUtils';

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
 * 
 * @returns {JSX.Element} Element JSX reprezentujący nawigację tygodniową.
 */
const WeekNavigation = ({ currentDate, setCurrentDate, Pracownik, setPracownik, pracownicy, userType, statusTyg }) => {
    const previousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

    return (
        <div className="w-full md:w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
            <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                <div className="w-full h-2/6">
                    <div className="w-full flex flex-row items-center p-4 justify-between">
                        <div className="flex items-center space-x-2">
                            <Button icon="pi pi-arrow-left" className="p-button-outlined" onClick={previousWeek} />
                            <p className="text-lg font-bold">Tydzień {getWeek(currentDate, { weekStartsOn: 1 })} : {formatWeek(currentDate)}</p>
                            <Button icon="pi pi-arrow-right" iconPos="right" className="p-button-outlined" onClick={nextWeek} />
                        </div>
                        <span className={`text-lg font-bold ${statusTyg === "Otwarty" ? "text-green-600" : "text-red-600"}`}>{statusTyg}</span>
                        <Dropdown
                            value={Pracownik}
                            onChange={(e) => setPracownik(e.value)}
                            options={pracownicy}
                            editable
                            placeholder="Pracownik"
                            autoComplete="off"
                            className="w-3/12 p-2"
                            disabled={userType === "Pracownik"}
                            filter
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeekNavigation;