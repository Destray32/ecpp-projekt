import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AmberBox from "../../Components/AmberBox";
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import Axios from "axios";

export default function DodajNowyProjektPage() {
    const [availableGroups, setAvailableGroups] = React.useState([]);
    const [availableProjects, setAvailableProjects] = React.useState([]);

    const [form, setForm] = useState({
        firma: 'PC Husbyggen',
        zleceniodawca: '',
        nazwa: '',
        kodProjektu: '',
        ulica: '',
        miejscowosc: '',
        kodPocztowy: '',
        kraj: ''
    });

    const firmyOptions = [
        { name: 'PC Husbyggen', value: 'PC Husbyggen' },
        // add more options if needed
    ];

    const fetchGroups = () => {
        Axios.get("http://localhost:5000/api/grupy", { withCredentials: true })
            .then((response) => {
                const transformedData = response.data.grupy.map(grupy => ({
                    name: grupy.Zleceniodawca,
                    value: grupy.id
                }));
                setAvailableGroups(transformedData);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const fetchProjects = () => {
        Axios.get("http://localhost:5000/api/czas/projekty", { withCredentials: true })
            .then((response) => {
                const transformedDataProjects = response.data.projekty.map(projekty => ({
                    name: projekty.NazwaKod_Projektu,
                    value: projekty.idProjekty
                }));
                setAvailableProjects(transformedDataProjects);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        fetchGroups();
        fetchProjects();
    }, [form]);

    const handleSave = () => {
        console.log('Saving data...');
        Axios.post('http://localhost:5000/api/czas/projekty', {
            firma: form.firma,
            zleceniodawca: form.zleceniodawca,
            nazwa: form.nazwa,
            ulica: form.ulica,
            miejscowosc: form.miejscowosc,
            kodPocztowy: form.kodPocztowy,
            kraj: form.kraj
        },
        { withCredentials: true }
    )
            .then(res => {
                console.log(res.data);
            })
            .catch(err => {
                console.error(err);
            });
    };

    const handleFirma = (e) => {
        setForm(prevState => ({
            ...prevState,
            firma: e.value 
        }));
    };

    const handleZleceniodawca = (e) => {
        setForm({ ...form, zleceniodawca: e.value });
    };

    const handleNazwa = (e) => {
        setForm({ ...form, nazwa: e.target.value });
    };

    const handleUlica = (e) => {
        setForm({ ...form, ulica: e.target.value });
    };

    const handleMiejscowosc = (e) => {
        setForm({ ...form, miejscowosc: e.target.value });
    };

    const handleKodPocztowy = (e) => {
        setForm({ ...form, kodPocztowy: e.target.value });
    };

    const handleKraj = (e) => {
        setForm({ ...form, kraj: e.target.value });
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
                            onChange={(e) => handleFirma(e)} 
                            options={firmyOptions} 
                            optionLabel="name" 
                            placeholder="Firma"
                            className="w-full"
                            value={form.firma}
                            filter
                            showClear
                        />
                        <label htmlFor="firma">Firma</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <Dropdown 
                            onChange={(e) => handleZleceniodawca(e)} 
                            options={availableGroups} 
                            optionLabel="name" 
                            optionValue="value"
                            placeholder="Zleceniodawca"
                            className="w-full"
                            value={form.zleceniodawca}
                            filter 
                            showClear
                        />
                        <label htmlFor="zleceniodawca">Zleceniodawca</label>
                    </FloatLabel>

                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                    <Dropdown 
                            onChange={(e) => handleNazwa(e)} 
                            options={availableProjects} 
                            optionLabel="name" 
                            optionValue="value"
                            className="w-full"
                            value={form.nazwa}
                            editable
                            filter valueTemplate={form.nazwa}
                            showClear
                            filterBy="name" 
                        />
                        <label htmlFor="nazwa">Nazwa/Kod Projektu</label>
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
                        <label htmlFor="kodPocztowy">Kod pocztowy</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText onChange={handleKraj} id="kraj" type="text" className="w-full" />
                        <label htmlFor="kraj">Kraj</label>
                    </FloatLabel>
                    
                    <div className="flex space-x-4 mt-8">
                        <Button label="Zapisz" icon="pi pi-check" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2 mr-2" 
                        onClick={handleSave} />
                        <Link to="/home/projekty">
                            <Button label="Anuluj" icon="pi pi-times" className="p-button-outlined border-2 p-1 bg-white text-black pr-2 pl-2" />
                        </Link>
                    </div>
                </div>
            </AmberBox>
        </div>
    );
}
