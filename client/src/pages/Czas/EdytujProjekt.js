import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AmberBox from "../../Components/AmberBox";
import { Input, Select, Button, AutoComplete } from "antd";
import Axios from "axios";

const { Option } = Select;

export default function EdytujProjektPage() {
    const [availableGroups, setAvailableGroups] = useState([]);
    const [availableProjects, setAvailableProjects] = useState([]);
    const { id } = useParams();

    const [form, setForm] = useState({
        firma: '1',
        zleceniodawca: '',
        nazwa: '',
        kodProjektu: '',
        ulica: '',
        miejscowosc: '',
        kodPocztowy: '',
        kraj: ''
    });

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

    const fetchProjectData = (projectId) => {
        Axios.get(`http://localhost:5000/api/czas/projekty/${projectId}`, { withCredentials: true })
            .then((response) => {
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const project = response.data[0];
                    setForm({
                        firma: project.Firma_idFirma || '1',
                        zleceniodawca: project.Grupa_urlopowa_idGrupa_urlopowa || '',
                        nazwa: project.NazwaKod_Projektu || '',
                        kodProjektu: project.NazwaKod_Projektu || '',
                        ulica: project.Ulica || '',
                        miejscowosc: project.Miejscowosc || '',
                        kodPocztowy: project.Kod_pocztowy || '',
                        kraj: project.Kraj || ''
                    });
                    console.log(project);
                }
            })
            .catch((error) => {
                console.error('Error fetching project:', error);
            });
    };

    useEffect(() => {
        fetchGroups();
        fetchProjects();
        fetchProjectData(id);
    }, [id]);

    const handleSave = () => {
        Axios.put(`http://localhost:5000/api/czas/edytujProjekt/${id}`, form, { 
            withCredentials: true 
        })
        .then(res => {
            window.location.href = "/home/projekty";
        })
        .catch(err => {
            console.error("Error updating project:", err.response ? err.response.data : err.message);
        });
    };

    const handleChange = (value, field) => {
        setForm(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    return (
        <div>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Edytuj projekt</p>
            </div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">

                    <div className="w-6/12 lg:w-4/12">
                        <label htmlFor="firma">Firma</label>
                        <Select
                            onChange={(value) => handleChange(value, 'firma')}
                            className="w-full"
                            value={form.firma}
                            showSearch
                            allowClear
                        >
                            <Option key={1} value={1}>
                                PC Husbyggen
                            </Option>
                        </Select>
                    </div>

                    <div className="w-6/12 lg:w-4/12">
                        <label htmlFor="zleceniodawca">Zleceniodawca</label>
                        <Select
                            onChange={(value) => handleChange(value, 'zleceniodawca')}
                            className="w-full"
                            value={form.zleceniodawca}
                            showSearch
                            allowClear
                        >
                            {availableGroups.map((group) => (
                                <Option key={group.value} value={group.value}>
                                    {group.name}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="w-6/12 lg:w-4/12">
                        <label htmlFor="nazwa">Nazwa/Kod Projektu</label>
                        <AutoComplete
                            onChange={(value) => handleChange(value, 'nazwa')}
                            className="w-full"
                            value={form.nazwa}
                            options={availableProjects.map(project => ({
                                value: project.value,
                                label: project.name
                            }))}
                            placeholder="Wybierz projekt"
                            filterOption={(inputValue, option) =>
                                option.label.toLowerCase().includes(inputValue.toLowerCase())
                            }
                            allowClear
                        />
                    </div>

                    <div className="w-6/12 lg:w-4/12">
                        <label htmlFor="ulica">Ulica</label>
                        <Input onChange={(e) => handleChange(e.target.value, 'ulica')} value={form.ulica} />
                    </div>

                    <div className="w-6/12 lg:w-4/12">
                        <label htmlFor="miejscowosc">Miejscowość</label>
                        <Input onChange={(e) => handleChange(e.target.value, 'miejscowosc')} value={form.miejscowosc} />
                    </div>

                    <div className="w-6/12 lg:w-4/12">
                        <label htmlFor="kodPocztowy">Kod pocztowy</label>
                        <Input onChange={(e) => handleChange(e.target.value, 'kodPocztowy')} value={form.kodPocztowy} />
                    </div>

                    <div className="w-6/12 lg:w-4/12">
                        <label htmlFor="kraj">Kraj</label>
                        <Input onChange={(e) => handleChange(e.target.value, 'kraj')} value={form.kraj} />
                    </div>

                    <div className="flex space-x-4 mt-8">
                        <Button type="primary" onClick={handleSave}>Zapisz</Button>
                        <Link to="/home/projekty">
                            <Button>Anuluj</Button>
                        </Link>
                    </div>
                </div>
            </AmberBox>
        </div>
    );
}