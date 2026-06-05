import React from 'react';
import { Button } from 'primereact/button';
import { Modal } from 'antd';
import { hasSpecialAccess } from '../../utils/accTypeUtils';
import { getWeek } from 'date-fns';

/**
 * PrzyciskAkcji
 * @param {Object} props - Właściwości komponentu
 * @param {Function} props.handleSave - Funkcja obsługująca zapis
 * @param {Function} props.handleCloseWeek - Funkcja obsługująca zamknięcie tygodnia
 * @param {Function} props.handleOpenWeek - Funkcja obsługująca otwarcie tygodnia
 * @param {Function} props.handlePrintReport - Funkcja obsługująca drukowanie raportu
 * @param {Function} props.handleGoToRozliczenia - Funkcja obsługująca przejście do rozliczeń
 * @param {string} props.statusTyg - Status tygodnia
 * @param {string} props.userType - Typ użytkownika
 * @param {boolean} props.blockStatus - Status blokady użytkownika - jeśli przekracza 60h w tygodniu czesto
 * @param {boolean} props.isOnline - Status połączenia z internetem
 * @param {string} props.saveStatus - Status zapisu (idle, saving, saved, error)
 * @param {string} props.imie - Imię użytkownika
 * @param {string} props.nazwisko - Nazwisko użytkownika
 * @param {Date} props.currentDate - Aktualnie wybrany tydzień
 */
const PrzyciskAkcji = ({ 
    handleSave, 
    handleCloseWeek, 
    handleOpenWeek, 
    handlePrintReport, 
    handleGoToRozliczenia,
    statusTyg, 
    userType, 
    blockStatus,
    isOnline,
    saveStatus,
    imie,
    nazwisko,
    currentDate
}) => {
    const handleOpenModal = () => {
        Modal.confirm({
            title: 'Czy na pewno chcesz zamknąć tydzień?',
            content: 'Upewnij się, że zapisałeś wszystkie zmiany, ponieważ po zamknięciu tygodnia nie będzie możliwości edycji.',
            onOk: oswiadczenie,
            okText: 'Tak',
            cancelText: 'Nie',
        });
    };

    const oswiadczenie = () => {
        Modal.confirm({
            title: 'Oświadczenie o prawidłowości wprowadzonych danych',
            content: 'Oświadczam, że wprowadzone przeze mnie dane są zgodne z rzeczywistością i nie zawierają błędów. Ponoszę odpowiedzialność za wprowadzone dane.',
            onOk: handleCloseWeek,
            okText: 'Zamknij tydzień',
            cancelText: 'Anuluj',
        });
    };

    // Sprawdź czy wybrany tydzień to bieżący tydzień (tylko Administrator może otwierać dowolne tygodnie)
    const isCurrentWeek = () => {
        if (!currentDate) return true; // domyślnie pozwól jeśli brak daty
        
        // Tylko Administrator może otwierać dowolne tygodnie
        const isAdmin = userType === 'Administrator';
        if (isAdmin) return true;
        
        // Wszyscy inni (Biuro, specjalne uprawnienia) - tylko bieżący tydzień
        const today = new Date();
        const currentWeekNumber = getWeek(today, { weekStartsOn: 1 });
        const selectedWeekNumber = getWeek(currentDate, { weekStartsOn: 1 });
        const currentYear = today.getFullYear();
        const selectedYear = currentDate.getFullYear();
        return currentYear === selectedYear && currentWeekNumber === selectedWeekNumber;
    };

    return (
        blockStatus === false ?
        <div className="w-auto h-full m-2 p-1 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col">
            <div className="w-full h-2/5 flex flex-col items-start">
                <div className="w-full h-2/6">
                    <div className="w-full flex flex-row items-center justify-between">
                        <div className="w-full flex flex-row items-center space-x-2 justify-between">
                            <Button 
                                label="Zapisz"
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow"
                                onClick={handleSave}
                                disabled={statusTyg === 'Zamkniety' || !isOnline || saveStatus === 'saving'}
                            />
                            <Button 
                                label="Zamknij tydzień" 
                                className={`p-button-outlined border-2 p-1 ${statusTyg === 'Zamkniety' ? 'bg-red-300' : 'bg-white'} pr-2 pl-2 flex-grow`} 
                                onClick={handleOpenModal}
                                disabled={statusTyg === 'Zamkniety' || !isOnline}
                            />
                            <Button 
                                label="Otwórz tydzień" 
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" 
                                onClick={handleOpenWeek}
                                disabled={
                                    (userType !== 'Biuro' && userType !== 'Administrator' && !hasSpecialAccess(imie, nazwisko, 'tydzien')) || 
                                    !isOnline ||
                                    !isCurrentWeek()
                                }
                                tooltip={!isCurrentWeek() ? "Tylko Administrator może otwierać tygodnie wstecz" : ""}
                                tooltipOptions={{ position: 'top' }}
                            />
                            <Button 
                                label="Drukuj raport" 
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" 
                                onClick={handlePrintReport}
                                disabled={userType !== 'Biuro' && userType !== 'Administrator'}
                            />
                            <Button 
                                label="Rozliczenia" 
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" 
                                onClick={handleGoToRozliczenia}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        : null
    );
};

export default PrzyciskAkcji;