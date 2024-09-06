import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AmberBox from "../../Components/AmberBox";
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import Axios from "axios";

export default function DodajNowyProjektPage() {
    const [availableGroups, setAvailableGroups] = useState([]);
    const [availableProjects, setAvailableProjects] = useState([]);

    const [form, setForm] = useState({
        firma: 'PC Husbyggen',
        zleceniodawca: '',
        nazwa: '',
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
    }, []);

    const handleSave = () => {
        console.log('Form:', form);
        Axios.post('http://localhost:5000/api/czas/projekty', form, { withCredentials: true })
            .then(res => {
                window.location.href = '/home/projekty';
            })
            .catch(err => {
                console.error(err);
            });
    };

    const handleChange = (e, field) => {
        const value = e.value !== undefined ? e.value : e.target.value;
        setForm(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const handleGroupChange = (e) => {
        const selectedGroup = availableGroups.find(group => group.value === e.value);
        setForm(prevState => ({
            ...prevState,
            zleceniodawca: selectedGroup ? selectedGroup.name : ''
        }));
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
                            onChange={(e) => handleChange(e, 'firma')} 
                            options={firmyOptions} 
                            optionLabel="name" 
                            optionValue="value"
                            className="w-full"
                            value={form.firma}
                            editable
                            filter 
                            showClear
                        />
                        <label htmlFor="firma">Firma</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <Dropdown 
                            onChange={handleGroupChange} 
                            options={availableGroups}
                            optionLabel="name" 
                            optionValue="value"
                            className="w-full"
                            value={availableGroups.find(group => group.name === form.zleceniodawca)?.value || ''}
                            editable
                            filter 
                            showClear
                        />
                        <label htmlFor="zleceniodawca">Zleceniodawca</label>
                    </FloatLabel>

                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <Dropdown 
                            onChange={(e) => handleChange(e, 'nazwa')} 
                            options={availableProjects} 
                            optionLabel="name" 
                            optionValue="value"
                            className="w-full"
                            value={form.nazwa}
                            editable
                            filter 
                            showClear
                        />
                        <label htmlFor="nazwa">Nazwa/Kod Projektu</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText onChange={(e) => handleChange(e, 'ulica')} id="ulica" type="text" className="w-full" value={form.ulica} />
                        <label htmlFor="ulica">Ulica</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText onChange={(e) => handleChange(e, 'miejscowosc')} id="miejscowosc" type="text" className="w-full" value={form.miejscowosc} />
                        <label htmlFor="miejscowosc">Miejscowość</label>
                    </FloatLabel>

                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText onChange={(e) => handleChange(e, 'kodPocztowy')} id="kodPocztowy" type="text" className="w-full" value={form.kodPocztowy} />
                        <label htmlFor="kodPocztowy">Kod pocztowy</label>
                    </FloatLabel>
                    
                    <FloatLabel className="w-full md:w-6/12 lg:w-4/12">
                        <InputText onChange={(e) => handleChange(e, 'kraj')} id="kraj" type="text" className="w-full" value={form.kraj} />
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
