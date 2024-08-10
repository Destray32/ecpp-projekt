import React from "react";
import AmberBox from "../../Components/AmberBox";
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

export default function DodajNowyProjektPage() {
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
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Dodaj nowy projekt</p>
            </div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <Dropdown 
                            value={firma} 
                            onChange={(e) => setFirma(e.value)} 
                            options={firmyOptions} 
                            optionLabel="name" 
                            placeholder="Firma"
                            className="w-full"
                            filter 
                            showClear
                        />
                        <label htmlFor="firma">Firma</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <Dropdown 
                            value={zleceniodawca} 
                            onChange={(e) => setZleceniodawca(e.value)} 
                            options={zleceniodawcaOptions} 
                            optionLabel="name" 
                            placeholder="Zleceniodawca"
                            className="w-full"
                            filter 
                            showClear
                        />
                        <label htmlFor="zleceniodawca">Zleceniodawca</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText id="nazwa" type="text" className="w-full" />
                        <label htmlFor="nazwa">Nazwa</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText id="kod" type="text" className="w-full" />
                        <label htmlFor="kod">Kod projektu</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText id="ulica" type="text" className="w-full" />
                        <label htmlFor="ulica">Ulica</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText id="miejscowosc" type="text" className="w-full" />
                        <label htmlFor="miejscowosc">Miejscowość, Kod</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText id="kraj" type="text" className="w-full" />
                        <label htmlFor="kraj">Kraj</label>
                    </FloatLabel>
                    
                    <div className="flex space-x-4 mt-8">
                        <Button label="Zapisz" icon="pi pi-check" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" onClick={handleSave} />
                        <Button label="Anuluj" icon="pi pi-times" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" onClick={handleCancel} />
                    </div>
                </div>
            </AmberBox>
        </div>
    );
}
