import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, DatePicker, Input, Checkbox, Radio, Select, ConfigProvider, Button } from 'antd';
import plPL from 'antd/lib/locale/pl_PL';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
import axios from 'axios';

import DaneBox from '../../Components/DaneBox';

dayjs.locale('pl');

export default function DodajPracownikaPage() {
    const [form] = Form.useForm();
    const [firma, setFirma] = useState([]);
    const [grupa, setGrupa] = useState([]);
    const [pojazd, setPojazd] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/pracownik/firmy', { withCredentials: true })
            .then(res => {
                setFirma(res.data);
            })
            .catch(err => {
                console.log(err);
            });

        axios.get('http://localhost:5000/api/pracownik/grupy', { withCredentials: true })
            .then(res => {
                setGrupa(res.data);
            })
            .catch(err => {
                console.log(err);
            });

        axios.get('http://localhost:5000/api/pracownik/pojazdy', { withCredentials: true })
            .then(res => {
                setPojazd(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    const handleSubmit = (values) => {
        console.log(values);
        axios.post('http://localhost:5000/api/pracownicy', values, { withCredentials: true })
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
    }

    const formItemLayout = {
        labelCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 10,
          },
        },
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 14,
          },
        },
    };

    return (
        <div>
            <ConfigProvider locale={plPL}>
                <Form {...formItemLayout} form={form} onFinish={handleSubmit}>
                    <div className="w-full flex flex-row justify-center items-center">
                        <DaneBox name="Zmiana danych">
                            <div className="flex flex-col">
                                <Form.Item label="Nazwisko" name="surename" rules={[{ required: true, message: 'Wprowadź nazwisko' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Imię" name="name" rules={[{ required: true, message: 'Wprowadź imię' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Data urodzenia" name="brithday" rules={[{ required: true, message: 'Wprowadź datę urodzenia' }]}>
                                    <DatePicker format="DD.MM.YYYY" />
                                </Form.Item>
                                <Form.Item label="PESEL" name="pesel" rules={[{ required: true, message: 'Wprowadź PESEL' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Ulica / Nr domu" name="street" rules={[{ required: true, message: 'Wprowadź ulicę' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Kod pocztowy" name="zip" rules={[{ required: true, message: 'Wprowadź kod pocztowy' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Miejscowość" name="city" rules={[{ required: true, message: 'Wprowadź miejscowość' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Kraj" name="country" rules={[{ required: true, message: 'Wprowadź kraj' }]}>
                                    <Input />
                                </Form.Item>
                            </div>
                            <div className="flex flex-col">
                                <Form.Item label="Firma" name="company" rules={[{ required: true, message: 'Wybierz firmę' }]}>
                                    <Select>
                                        {firma.map(f => (
                                            <Select.Option key={f.idFirma} value={f.idFirma}>{f.Nazwa_firmy}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item label="Telefon w Polsce" name="phone1" rules={[{ required: true, message: 'Wprowadź telefon' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Telefon w Szwecji" name="phone2">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Wprowadź email' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Krewni" name="relative1">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Kontakt (wypadek)" name="relative2" rules={[{ required: true, message: 'Wprowadź kontakt' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="NIP" name="NIP">
                                    <Input />
                                </Form.Item>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex flex-col">
                                    <Form.Item label="Data zatrudnienia" name="startDate" rules={[{ required: true, message: 'Wprowadź datę zatrudnienia' }]}>
                                        <DatePicker format="DD.MM.YYYY" />
                                    </Form.Item>
                                    <Form.Item label="Data zakończenia" name="endDate">
                                        <DatePicker format="DD.MM.YYYY" />
                                    </Form.Item>
                                    <Form.Item label="Kod wynagrodzenia" name="paycheckCode">
                                        <Input />
                                    </Form.Item>
                                </div>
                                <div className="flex flex-col">
                                    <Form.Item label="Pojazd" name="vehicle">
                                        <Select>
                                            {pojazd.map(p => (
                                                <Select.Option key={p.idPojazdy} value={p.idPojazdy}>{p.Nr_rejestracyjny}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Grupa urlopowa" name="vacationGroup">
                                        <Select>
                                            {grupa.map(g => (
                                            <Select.Option key={g.idGrupa_urlopowa} value={g.idGrupa_urlopowa}>{g.Zleceniodawca}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Plan tygodnia 'V'?" name="weeklyPlan" valuePropName="checked">
                                        <Checkbox />
                                    </Form.Item>
                                    <Form.Item label="Drukować urlop?" name="printVacation" valuePropName="checked">
                                        <Checkbox />
                                    </Form.Item>
                                </div>
                            </div>
                        </DaneBox>
                    </div>
                    <div className="w-full flex flex-row justify-center items-center">
                        <DaneBox name="Informacje o użytkowniku">
                            <div className="h-48 flex flex-col justify-center">
                                <Form.Item label="Nazwa użytkownika" name="login" rules={[{ required: true, message: 'Wprowadź nazwę użytkownika' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Konto aktywne" name="active" valuePropName="checked">
                                    <Checkbox />
                                </Form.Item>
                                <Form.Item label="Rola" name="role" rules={[{ required: true, message: 'Wybierz rolę' }]}>
                                    <Radio.Group>
                                        <Radio value={1}>Admin</Radio>
                                        <Radio value={2}>Kierownik</Radio>
                                        <Radio value={3}>Pracownik</Radio>
                                        <Radio value={4}>Gość</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                <div className="flex flex-row justify-center items-center space-x-4">
                                    <Button type="primary" htmlType="submit">Zapisz</Button>
                                    <Link to="/home/pracownik">
                                        <Button type="primary">Anuluj</Button>
                                    </Link>
                                </div>
                            </div>
                        </DaneBox>
                        <DaneBox name="Hasło">
                            <div className="h-48 flex flex-col justify-center">
                                <Form.Item label="Nowe hasło" name="newPassword" rules={[{ required: true, message: 'Wprowadź nowe hasło' }]}>
                                    <Input.Password />
                                </Form.Item>
                                <Form.Item label="Potwierdź hasło" name="confirmPassword" rules={[{ required: true, message: 'Potwierdź hasło' }]}>
                                    <Input.Password />
                                </Form.Item>
                            </div>
                        </DaneBox>
                    </div>
                </Form>
            </ConfigProvider>
        </div>
    );
}