import React, {useEffect, useState} from "react";
import AmberBox from "../../Components/AmberBox";
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import Axios from "axios";

export default function DodajNowyProjektPage() {
    const [firma, setFirma] = React.useState(null);
    const [zleceniodawca, setZleceniodawca] = React.useState(null);
    const [form, setForm] = React.useState({
        nazwa: '',
        kodProjektu: '',
        ulica: '',
        miejscowosc: '',
        kodPocztowy: '',
        kraj: ''
    });

    const firmyOptions = [
        { name: 'PC Husbyggen', value: 'PC Husbyggen' },
       
    ];

    const zleceniodawcaOptions = [
        { name: 'Client A', value: 'Client A' },
        { name: 'Client B', value: 'Client B' },
        
    ];

    useEffect(() => {
        console.log(form);
    }, [form]);

    const handleSave = () => {
        console.log('Saving data...');
        Axios.post('http://localhost:5000/api/czas/projekty', {
            firma: firma,
            zleceniodawca: zleceniodawca,
            nazwa: form.nazwa,
            kodProjektu: form.kod,
            ulica: form.ulica,
            miejscowosc: form.miejscowosc,
            kodPocztowy: form.kodPocztowy,
            kraj: form.kraj
        })
            .then(res => {
                console.log(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    };

    const handleCancel = () => {
        console.log('Action canceled.');
    };
    const handleNazwa = (e) => {
        setForm({ ...form, nazwa: e.target.value });
    };
    const handleKod = (e) => {
        setForm({ ...form, kod: e.target.value });
    }
    const handleUlica = (e) => {
        setForm({ ...form, ulica: e.target.value });
    }
    const handleMiejscowosc = (e) => {
        setForm({ ...form, miejscowosc: e.target.value });
    }
    const handleKodPocztowy = (e) => {
        setForm({ ...form, kodPocztowy: e.target.value });
    }
    const handleKraj = (e) => {
        setForm({ ...form, kraj: e.target.value });
    }


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
                        <InputText onChange={handleNazwa} id="nazwa" type="text" className="w-full" />
                        <label htmlFor="nazwa">Nazwa</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText onChange={handleKod} id="kod" type="text" className="w-full" />
                        <label htmlFor="kod">Kod projektu</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText onChange={handleUlica} id="ulica" type="text" className="w-full" />
                        <label htmlFor="ulica">Ulica</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText onChange={handleMiejscowosc} id="miejscowosc" type="text" className="w-full" />
                        <label htmlFor="miejscowosc">Miejscowość</label>
                    </FloatLabel>

                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText onChange={handleKodPocztowy} id="kodPocztowy" type="text" className="w-full" />
                        <label htmlFor="miejscowosc">Kod pocztowy</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText onChange={handleKraj} id="kraj" type="text" className="w-full" />
                        <label htmlFor="kraj">Kraj</label>
                    </FloatLabel>
                    
                    <div className="flex space-x-4 mt-8">
                        <Button label="Zapisz" icon="pi pi-check" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" 
                        onClick={handleSave} />
                        <Button label="Anuluj" icon="pi pi-times" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" 
                        onClick={handleCancel} />
                    </div>
                </div>
            </AmberBox>
        </div>
    );
}
