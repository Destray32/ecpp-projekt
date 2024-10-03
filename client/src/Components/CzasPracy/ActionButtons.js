import React from 'react';
import { Button } from 'primereact/button';
import { Modal } from 'antd';

/**
 * PrzyciskAkcji
 * @param {Object} props - Właściwości komponentu
 * @param {Function} props.handleSave - Funkcja obsługująca zapis
 * @param {Function} props.handleCloseWeek - Funkcja obsługująca zamknięcie tygodnia
 * @param {Function} props.handleOpenWeek - Funkcja obsługująca otwarcie tygodnia
 * @param {Function} props.handlePrintReport - Funkcja obsługująca drukowanie raportu
 */
const PrzyciskAkcji = ({ handleSave, handleCloseWeek, handleOpenWeek, handlePrintReport, statusTyg, userType }) => {
    const handleOpenModal = () => {
        Modal.confirm({
            title: 'Czy na pewno chcesz zamknąć tydzień?',
            content: 'Upewnij się, że zapisałeś wszystkie zmiany, ponieważ po zamknięciu tygodnia nie będzie możliwości edycji.',
            onOk: handleCloseWeek,
            okText: 'Tak',
            cancelText: 'Nie',
        });
    };

    return (
        <div className="w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
            <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                <div className="w-full h-2/6">
                    <div className="w-full flex flex-row items-center p-4 justify-between">
                        <div className="w-full flex flex-row items-center space-x-2 justify-between">
                            <Button 
                                label="Zapisz"
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow"
                                onClick={handleSave}
                                disabled={statusTyg === 'Zamkniety'}
                            />
                            <Button 
                                label="Zamknij tydzień" 
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" 
                                onClick={handleOpenModal}
                                disabled={statusTyg === 'Zamkniety'}
                            />
                            <Button 
                                label="Otwórz tydzień" 
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" 
                                onClick={handleOpenWeek}
                                disabled={userType !== 'Administrator'}
                            />
                            <Button 
                                label="Drukuj raport" 
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" 
                                onClick={handlePrintReport}
                                disabled={userType !== 'Administrator'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrzyciskAkcji;