import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AmberBox from "../../Components/AmberBox";
import { Input, Select, Button, AutoComplete, Form } from "antd";
import Axios from "axios";

import { universalFieldValidation, requiredField } from "../../utils/validationRules";

const { Option } = Select;

export default function DodajNowyProjektPage() {
    const [availableGroups, setAvailableGroups] = useState([]);
    const [availableProjects, setAvailableProjects] = useState([]);

    const [form] = Form.useForm();

    const fetchGroups = () => {
        Axios.get("http://localhost:5000/api/grupy", { withCredentials: true })
            .then((response) => {
                const transformedData = response.data.grupy.map((grupy) => ({
                    name: grupy.Zleceniodawca,
                    value: grupy.id,
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
                const transformedDataProjects = response.data.projekty.map((projekty) => ({
                    name: projekty.NazwaKod_Projektu,
                    value: projekty.idProjekty,
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

    const handleSave = (values) => {
        Axios.post('http://localhost:5000/api/czas/projekty', values, { withCredentials: true })
            .then((res) => {
                window.location.href = '/home/projekty';
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <div>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Dodaj nowy projekt</p>
            </div>
            <AmberBox>
                <div className="flex flex-col items-center space-y-8 p-4 w-full">
                    <Form
                        form={form}
                        onFinish={handleSave}
                        initialValues={{ firma: '1' }}
                        labelCol={{ span: 16 }}
                        wrapperCol={{ span: 32 }}
                        layout="vertical"
                        className="w-full max-w-[600px] items-center justify-center"
                    >
                        <Form.Item
                            name="firma"
                            label="Firma"
                            rules={[requiredField("Firma is required")]}
                        >
                            <Select>
                                <Option key="1" value="1">PC Husbyggen</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="zleceniodawca"
                            label="Zleceniodawca"
                            rules={[requiredField("Zleceniodawca is required")]}
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
                            rules={[requiredField("Nazwa is required")]}
                        >
                            <AutoComplete
                                options={availableProjects.map((project) => ({
                                    value: project.value,
                                    label: project.name,
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
                            rules={[universalFieldValidation("ulica")]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="miejscowosc"
                            label="Miejscowość"
                            rules={[universalFieldValidation("miejscowosc")]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="kodPocztowy"
                            label="Kod pocztowy"
                            rules={[requiredField("Kod pocztowy is required")]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="kraj"
                            label="Kraj"
                            rules={[universalFieldValidation("kraj")]}
                        >
                            <Input />
                        </Form.Item>

                        <div className="flex space-x-4 mt-8 justify-center">
                            <Button type="primary" htmlType="submit">Zapisz</Button>
                            <Link to="/home/projekty">
                                <Button>Anuluj</Button>
                            </Link>
                        </div>
                    </Form>
                </div>
            </AmberBox>
        </div>
    );
}