import React from "react";
import AmberBox from "../../Components/AmberBox";
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';

export default function TydzienPage() {
    const [firma, setFirma] = React.useState(null);
    const [zleceniodawca, setZleceniodawca] = React.useState(null);

    const firmyOptions = [
        { name: 'PC Husbyggen', value: 'PC Husbyggen' },
       
    ];

    const zleceniodawcaOptions = [
        { name: 'Client A', value: 'Client A' },
        { name: 'Client B', value: 'Client B' },
        
    ];

    const handleSave = () => {
        console.log('Saving data...');
    };

    const handleCancel = () => {
        console.log('Action canceled.');
    };

    return (
        <div>
            <div className="w-auto h-auto bg-blue-600 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Dodaj nową grupę</p>
            </div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText id="zleceniodawca" type="text" className="w-full" />
                        <label htmlFor="zleceniodawca">Zleceniodawca</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText id="cennik" type="text" className="w-full" />
                        <label htmlFor="cennik">Cennik</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText id="stawka" type="text" className="w-full" />
                        <label htmlFor="stawka">Stawka/km</label>
                    </FloatLabel>

                    <label htmlFor="stawka">Plan tygodnia "V"?
                    <Checkbox inputId="PlanTygV" className="mr-2 ml-2" checked={false} />
                    </label>
                    
                    <div className="flex space-x-4 mt-8">
                        <Button label="Zapisz" icon="pi pi-check" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" onClick={handleSave} />
                        <Button label="Anuluj" icon="pi pi-times" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" onClick={handleCancel} />
                    </div>
                </div>
            </AmberBox>
        </div>
    );
}
