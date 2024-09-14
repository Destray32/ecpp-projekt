import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AmberBox from "../../Components/AmberBox";
import { Input, Select, Button, AutoComplete } from "antd";
import Axios from "axios";

const { Option } = Select;

export default function DodajNowyProjektPage() {
    const [availableGroups, setAvailableGroups] = useState([]);
    const [availableProjects, setAvailableProjects] = useState([]);

    const [form, setForm] = useState({
        firma: '1',
        zleceniodawca: '',
        nazwa: '',
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

    const handleChange = (value, field) => {
        setForm(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const handleGroupChange = (value) => {
        setForm(prevState => ({
            ...prevState,
            zleceniodawca: value
        }));
    };

    return (
        <div>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Dodaj nowy projekt</p>
            </div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">

                    <div className="w-full md:w-6/12 lg:w-4/12">
                        <label htmlFor="firma">Firma</label>
                        <Select
                            onChange={(value) => handleChange(value, 'firma')}
                            className="w-full"
                            value={form.firma}
                            showSearch
                        >
                            <Option key="1" value="1">
                                PC Husbyggen
                            </Option>
                        </Select>
                    </div>

                    <div className="w-full md:w-6/12 lg:w-4/12">
                        <label htmlFor="zleceniodawca">Zleceniodawca</label>
                        <Select
                            onChange={handleGroupChange}
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

                    <div className="w-full md:w-6/12 lg:w-4/12">
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

                    <div className="w-full md:w-6/12 lg:w-4/12">
                        <label htmlFor="ulica">Ulica</label>
                        <Input onChange={(e) => handleChange(e.target.value, 'ulica')} value={form.ulica} />
                    </div>

                    <div className="w-full md:w-6/12 lg:w-4/12">
                        <label htmlFor="miejscowosc">Miejscowość</label>
                        <Input onChange={(e) => handleChange(e.target.value, 'miejscowosc')} value={form.miejscowosc} />
                    </div>

                    <div className="w-full md:w-6/12 lg:w-4/12">
                        <label htmlFor="kodPocztowy">Kod pocztowy</label>
                        <Input onChange={(e) => handleChange(e.target.value, 'kodPocztowy')} value={form.kodPocztowy} />
                    </div>

                    <div className="w-full md:w-6/12 lg:w-4/12">
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