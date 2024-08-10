import React from "react";
import AmberBox from "../../Components/AmberBox";
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';

export default function NowyPojazdPage() {

    const handleSave = () => {
        console.log('Saving data...');
    };

    const handleCancel = () => {
        console.log('Action canceled.');
    };

    return (
        <div>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Dodaj nowy pojazd</p>
            </div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText id="nrrej" type="text" className="w-full" />
                        <label htmlFor="nrrej">Numer rejestracyjny</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText id="marka" type="text" className="w-full" />
                        <label htmlFor="marka">Marka</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText id="uwagi" type="text" className="w-full" />
                        <label htmlFor="uwagi">Uwagi</label>
                    </FloatLabel>
                    
                    <div className="flex space-x-4 mt-8">
                        <Button label="Dodaj" icon="pi pi-check" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" onClick={handleSave} />
                        <Button label="Anuluj" icon="pi pi-times" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" onClick={handleCancel} />
                    </div>
                </div>
            </AmberBox>
        </div>
    );
}
