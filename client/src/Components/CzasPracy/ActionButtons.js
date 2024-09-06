import React from 'react';
import { Button } from 'primereact/button';

const ActionButtons = ({ handleSave, handleCloseWeek, handleOpenWeek, handlePrintReport }) => {
    return (
        <div className="w-full md:w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
            <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                <div className="w-full h-2/6">
                    <div className="w-full flex flex-row items-center p-4 justify-between">
                        <div className="w-full flex flex-row items-center space-x-2 justify-between">
                            <Button 
                                label="Zapisz"
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow"
                                onClick={handleSave}
                            />
                            <Button 
                                label="Zamknij tydzień" 
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" 
                                onClick={handleCloseWeek}
                            />
                            <Button 
                                label="Otwórz tydzień" 
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" 
                                onClick={handleOpenWeek}
                            />
                            <Button 
                                label="Drukuj raport" 
                                className="p-button-outlined border-2 p-1 bg-white pr-2 pl-2 flex-grow" 
                                onClick={handlePrintReport}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionButtons;