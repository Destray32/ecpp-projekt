import React, { useState, useEffect } from "react";
import { format, startOfWeek, addDays, addWeeks, getWeek } from 'date-fns';
import 'primeicons/primeicons.css';
import { Dropdown } from "primereact/dropdown";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Space, Select, TimePicker } from "antd";
import axios from "axios";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export default function CzasPracyPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [pracownicy, setPracownicy] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedPracownik, setSelectedPracownik] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        axios.get("http://localhost:5000/api/czas")
            .then((response) => {
                const sampleData = response.data;
                console.log('Fetched data:', sampleData);
    
                const formattedData = sampleData.map(item => ({
                    ...item,
                    godziny_0: item.godziny_0.map(time => dayjs(time, 'HH:mm')),
                    godziny_1: item.godziny_1.map(time => dayjs(time, 'HH:mm'))
                }));
    
                const uniquePracownicy = [...new Set(sampleData.map(item => item.pracownik))];
                setPracownicy(uniquePracownicy);
                setFilteredData(formattedData);
    
                if (uniquePracownicy.length > 0 && !selectedPracownik) {
                    setSelectedPracownik(uniquePracownicy[0]);
                }
            })
            .catch(error => console.error(error));
    }, [selectedPracownik, form]);

    useEffect(() => {
        if (selectedPracownik !== null) {
            const filtered = filteredData.filter(item => item.pracownik === selectedPracownik);
            form.setFieldsValue({ totalHours: filtered });
        } else {
            form.setFieldsValue({ totalHours: filteredData });
        }
    }, [selectedPracownik, filteredData, form]);

    const formatWeek = (date) => {
        const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'dd.MM.yyyy');
        const end = format(addWeeks(startOfWeek(date, { weekStartsOn: 1 }), 1), 'dd.MM.yyyy');
        return `${start} - ${end}`;
    };

    const getWeekNumber = (date) => {
        return getWeek(date, { weekStartsOn: 1 });
    };

    const getDatesForWeek = (date) => {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'dd.MM.yyyy'));
    };

    const onFinish = (values) => {
        const formattedValues = {
            ...values,
            totalHours: values.totalHours.map(item => ({
                ...item,
                godziny_0: item.godziny_0.map(time => time.format('HH:mm')),
                godziny_1: item.godziny_1.map(time => time.format('HH:mm'))
            }))
        };

        axios.post("http://localhost:5000/api/czas", formattedValues);
        console.log('Submitted values:', formattedValues);
    };

    const closeWeek = () => {
        axios.post("http://localhost:5000/api/czas/zamknij", { pracownik: selectedPracownik, tydzien: getWeekNumber(currentDate) });
    };

    const openWeek = () => {
        axios.post("http://localhost:5000/api/czas/otworz", { pracownik: selectedPracownik, tydzien: getWeekNumber(currentDate) });
    };

    const daysOfWeek = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
    const weekDates = getDatesForWeek(currentDate);

    return (
        <div>
            <div className="w-full md:w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4 justify-between">
                            <div className="flex items-center space-x-2">
                                <p className="text-lg font-bold">Tydzień {getWeekNumber(currentDate)} : {formatWeek(currentDate)}</p>
                            </div>
                            <p>Otwarty/Zamknięty</p>
                            <Dropdown 
                                value={selectedPracownik} 
                                onChange={(e) => setSelectedPracownik(e.value)} 
                                options={pracownicy.map(pracownik => ({ label: pracownik, value: pracownik }))} 
                                editable 
                                placeholder="Pracownik"
                                autoComplete="off"
                                className="w-3/12 p-2" 
                                filter 
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-amber-100 outline outline-1 outline-gray-500 space-y-4 m-2 p-3">
                <Form form={form} name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
                    <Form.List name="totalHours">
                        {(fields, { add, remove }) => (
                            <div>
                                {fields.map(({ key, name, fieldKey, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'firma']}
                                            fieldKey={[fieldKey, 'firma']}
                                            rules={[{ required: true, message: 'Brakuje firmy' }]}
                                            label="Firma"
                                            labelCol={{ span: 24 }}
                                            wrapperCol={{ span: 24 }}
                                        >
                                            <Select placeholder="Firma">
                                                <Select.Option value="firma1">Firma 1</Select.Option>
                                                <Select.Option value="firma2">Firma 2</Select.Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'zleceniodawca']}
                                            fieldKey={[fieldKey, 'zleceniodawca']}
                                            rules={[{ required: true, message: 'Brakuje zleceniodawcy' }]}
                                            label="Zleceniodawca"
                                            labelCol={{ span: 24 }}
                                            wrapperCol={{ span: 24 }}
                                        >
                                            <Select placeholder="Zleceniodawca">
                                                <Select.Option value="zleceniodawca1">Zleceniodawca 1</Select.Option>
                                                <Select.Option value="zleceniodawca2">Zleceniodawca 2</Select.Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'projekty']}
                                            fieldKey={[fieldKey, 'projekty']}
                                            rules={[{ required: true, message: 'Brakuje projektu' }]}
                                            label="Projekt"
                                            labelCol={{ span: 24 }}
                                            wrapperCol={{ span: 24 }}
                                        >
                                            <Select placeholder="Projekt">
                                                <Select.Option value="projekt1">Projekt 1</Select.Option>
                                                <Select.Option value="projekt2">Projekt 2</Select.Option>
                                            </Select>
                                        </Form.Item>
                                        {daysOfWeek.map((day, index) => (
                                            <Form.Item
                                                {...restField}
                                                name={[name, `godziny_${index}`]}
                                                fieldKey={[fieldKey, `godziny_${index}`]}
                                                label={`${day} (${weekDates[index]})`}
                                                labelCol={{ span: 24 }}
                                                wrapperCol={{ span: 24 }}
                                                key={day}
                                            >
                                                <TimePicker.RangePicker 
                                                    format="HH:mm" 
                                                    placeholder={["Start", "Koniec"]}
                                                    value={form.getFieldValue([name, `godziny_${index}`])?.map(time => dayjs(time, 'HH:mm'))}
                                                />
                                            </Form.Item>
                                        ))}
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        icon={<PlusOutlined />}
                                    >
                                        Dodaj pole
                                    </Button>
                                </Form.Item>
                            </div>
                        )}
                    </Form.List>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Zapisz
                        </Button>
                    </Form.Item>
                </Form>
            </div>
            <div className="w-full md:w-auto h-full m-2 p-3 bg-amber-100 outline outline-1 outline-gray-500 flex flex-col space-y-4">
                <div className="w-full h-2/5 flex flex-col space-y-2 items-start">
                    <div className="w-full h-2/6">
                        <div className="w-full flex flex-row items-center p-4 justify-between">
                            <div className="w-full flex flex-row items-center space-x-2 justify-evenly">
                                <Button onClick={closeWeek} type="primary">Zamknij tydzień</Button>
                                <Button onClick={openWeek} type="primary">Otwórz tydzień</Button>
                                <Button type="primary">Planowanie urlopu</Button>
                                <Button type="primary">Drukuj raport</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
