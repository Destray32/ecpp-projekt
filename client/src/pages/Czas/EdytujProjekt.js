import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Form, Input, Select, Button, AutoComplete } from "antd";
import Axios from "axios";
import AmberBox from "../../Components/AmberBox";
import { 
    requiredField, 
    universalFieldValidation
} from "../../utils/validationRules";

const { Option } = Select;

export default function EdytujProjektPage() {
    const [form] = Form.useForm();
    const [availableGroups, setAvailableGroups] = useState([]);
    const [availableProjects, setAvailableProjects] = useState([]);
    const { id } = useParams();

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
                    form.setFieldsValue({
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
    }, [id, form]);

    const handleSave = (values) => {
        Axios.put(`http://localhost:5000/api/czas/edytujProjekt/${id}`, values, { 
            withCredentials: true 
        })
        .then(res => {
            window.location.href = "/home/projekty";
        })
        .catch(err => {
            console.error("Error updating project:", err.response ? err.response.data : err.message);
        });
    };

    return (
        <div>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Edytuj projekt</p>
            </div>
            <AmberBox>
                <Form
                    form={form}
                    onFinish={handleSave}
                    layout="vertical"
                    className="flex flex-col items-center space-y-8 p-4 w-full"
                >
                    <Form.Item
                        name="firma"
                        label="Firma"
                        className="w-full md:w-6/12 lg:w-4/12"
                        rules={[requiredField("Firma jest wymagana")]}
                    >
                        <Select showSearch allowClear>
                            <Option key={1} value={1}>PC Husbyggen</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="zleceniodawca"
                        label="Zleceniodawca"
                        className="w-full md:w-6/12 lg:w-4/12"
                        rules={[requiredField("Zleceniodawca jest wymagany")]}
                    >
                        <Select showSearch allowClear>
                            {availableGroups.map((group) => (
                                <Option key={group.value} value={group.value}>
                                    {group.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="nazwa"
                        label="Nazwa/Kod Projektu"
                        className="w-full md:w-6/12 lg:w-4/12"
                        rules={[
                            requiredField("Nazwa/Kod Projektu jest wymagany")
                        ]}
                    >
                        <AutoComplete
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
                    </Form.Item>

                    <Form.Item
                        name="ulica"
                        label="Ulica"
                        className="w-full md:w-6/12 lg:w-4/12"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="miejscowosc"
                        label="Miejscowość"
                        className="w-full md:w-6/12 lg:w-4/12"
                        rules={[universalFieldValidation("Miejscowość")]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="kodPocztowy"
                        label="Kod pocztowy"
                        className="w-full md:w-6/12 lg:w-4/12"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="kraj"
                        label="Kraj"
                        className="w-full md:w-6/12 lg:w-4/12"
                        rules={[universalFieldValidation("Kraj")]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <div className="flex space-x-4 mt-8">
                            <Button type="primary" htmlType="submit">Zapisz</Button>
                            <Link to="/home/projekty">
                                <Button>Anuluj</Button>
                            </Link>
                        </div>
                    </Form.Item>
                </Form>
            </AmberBox>
        </div>
    );
}