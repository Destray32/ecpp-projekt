import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, DatePicker, Input, Checkbox, Radio, Select, ConfigProvider, Button, notification } from 'antd';
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
        axios.get('http://47.76.209.242:5000/api/pracownik/firmy', { withCredentials: true })
            .then(res => {
                setFirma(res.data);
            })
            .catch(err => {
                console.log(err);
            });

        axios.get('http://47.76.209.242:5000/api/pracownik/grupy', { withCredentials: true })
            .then(res => {
                setGrupa(res.data);
            })
            .catch(err => {
                console.log(err);
            });

        axios.get('http://47.76.209.242:5000/api/pracownik/pojazdy', { withCredentials: true })
            .then(res => {
                setPojazd(res.data);
            })
            .catch(err => {
                console.log(err);
            });

        form.setFieldsValue({
            active: true,
            role: 3,
            company: firma[0]?.idFirma,
        });
    }, []);

    const handleSubmit = (values) => {
        console.log(values);
        axios.post('http://47.76.209.242:5000/api/pracownicy', values, { withCredentials: true })
            .then(res => {
                console.log(res);
                notification.success({ message: 'Dodano pracownika' });
            })
            .catch(err => {
                console.log(err);
            });
    }

    const onValuesChange = (changedValues, allValues) => {
        const { surename, name } = allValues;

        if (surename && name) {
            const password = surename + name[0] + '123';
            form.setFieldsValue({
                newPassword: password,
                confirmPassword: password,
            });
        }
    };

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
                <Form {...formItemLayout} form={form} onFinish={handleSubmit} onValuesChange={onValuesChange}>
                    <div className="w-full flex flex-row justify-center items-center">
                        <DaneBox name="Zmiana danych">
                            <div className="flex flex-col">
                                <Form.Item label="Nazwisko" name="surename" rules={[{ required: true, message: 'Wprowadź nazwisko' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Imię" name="name" rules={[{ required: true, message: 'Wprowadź imię' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Data urodzenia" name="brithday" >
                                    <DatePicker format="DD.MM.YYYY" />
                                </Form.Item>
                                <Form.Item label="PESEL" name="pesel" >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Ulica / Nr domu" name="street" >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Kod pocztowy"
                                    name="zip"
                                >
                                    <Input
                                        maxLength={6}
                                        placeholder="00-000"
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, '');
                                            if (value.length > 2) {
                                                value = value.slice(0, 2) + '-' + value.slice(2, 5);
                                            }
                                            form.setFieldsValue({ zip: value });
                                        }}
                                    />
                                </Form.Item>
                                <Form.Item label="Miejscowość" name="city" >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Kraj" name="country" >
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
                                <Form.Item label="Telefon w Polsce" name="phone1" >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Telefon w Szwecji" name="phone2">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Email" name="email" >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Krewni" name="relative1">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Kontakt (wypadek)" name="relative2" >
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
                                    <Form.Item label="Pojazd" name="vehicle" rules={[{ required: true, message: 'Wybierz pojazd' }]}>
                                        <Select>
                                            {pojazd.map(p => (
                                                <Select.Option key={p.idPojazdy} value={p.idPojazdy}>{p.Nr_rejestracyjny}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="Grupa urlopowa" name="vacationGroup" rules={[{ required: true, message: 'Wybierz grupę urlopową' }]} >
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
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Potwierdź hasło" name="confirmPassword" rules={[{ required: true, message: 'Potwierdź hasło' }]}>
                                    <Input />
                                </Form.Item>
                            </div>
                        </DaneBox>
                    </div>
                </Form>
            </ConfigProvider>
        </div>
    );
}