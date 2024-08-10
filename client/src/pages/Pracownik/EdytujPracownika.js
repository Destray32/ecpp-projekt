import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Form, DatePicker, Input, Checkbox, Radio, Select, ConfigProvider, Button } from 'antd';
import plPL from 'antd/lib/locale/pl_PL';
import axios from 'axios';
import dayjs from 'dayjs';

import DaneBox from '../../Components/DaneBox';

export default function EdytujPracownikaPage() {
    const [form] = Form.useForm();
    const { id } = useParams();

    useEffect(() => {
        axios.get(`http://localhost:5000/api/editEmployee/${id}`)
            .then(res => {
                console.log(res.data);
                form.setFieldsValue({
                    surename: res.data.surename,
                    name: res.data.name,
                    brithday: dayjs(res.data.brithday, 'DD.MM.YYYY'),
                    pesel: res.data.pesel,
                    street: res.data.street,
                    zip: res.data.zip,
                    city: res.data.city,
                    country: res.data.country,
                    phone1: res.data.phone1,
                    phone2: res.data.phone2,
                    email: res.data.email,
                    relative1: res.data.relative1,
                    relative2: res.data.relative2,
                    NIP: res.data.NIP,
                    startDate: dayjs(res.data.startDate, 'DD.MM.YYYY'),
                    endDate: res.data.endDate ? dayjs(res.data.endDate, 'DD.MM.YYYY') : null,
                    paycheckCode: res.data.paycheckCode,
                    vehicle: res.data.vehicle,
                    weeklyPlan: res.data.weeklyPlan,
                    printVacation: res.data.printVacation,
                    login: res.data.login,
                    active: res.data.active,
                    role: res.data.role,
                    newPassword: res.data.newPassword,
                    confirmPassword: res.data.confirmPassword,
                });
            })
            .catch(err => {
                console.log(err);
            });
    }, [id]);

    const handleSubmit = (values) => {
        axios.put(`http://localhost:5000/api/editEmployee/${id}`, values)
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
                                    <DatePicker />
                                </Form.Item>
                                <Form.Item label="PESEL" name="pesel">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Ulica / Nr domu" name="street" rules={[{ required: true, message: 'Wprowadź ulicę' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Kod pocztowy" name="zip" rules={[{ required: true, message: 'Wprowadź kod pocztowy' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Miasto" name="city" rules={[{ required: true, message: 'Wprowadź miasto' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Kraj" name="country" rules={[{ required: true, message: 'Wprowadź kraj' }]}>
                                    <Input />
                                </Form.Item>
                            </div>
                            <div className="flex flex-col">
                                <Form.Item label="Telefon w Polsce" name="phone1" rules={[{ required: true, message: 'Wprowadź telefon' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Telefon w Szwecji" name="phone2" rules={[{ required: true, message: 'Wprowadź telefon' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Email" name="email">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Osoba kontaktowa" name="relative1" rules={[{ required: true, message: 'Wprowadź osobę kontaktową' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Kontakt (wypadek)" name="relative2">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="NIP" name="NIP">
                                    <Input />
                                </Form.Item>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex flex-col">
                                    <Form.Item label="Data zatrudnienia" name="startDate" rules={[{ required: true, message: 'Wprowadź datę zatrudnienia' }]}>
                                        <DatePicker />
                                    </Form.Item>
                                    <Form.Item label="Data zakończenia" name="endDate">
                                        <DatePicker />
                                    </Form.Item>
                                    <Form.Item label="Kod wynagrodzenia" name="paycheckCode">
                                        <Input />
                                    </Form.Item>
                                </div>
                                <div className="flex flex-col">
                                    <Form.Item label="Pojazd" name="vehicle">
                                        <Select>
                                            <Select.Option value="1">Samochód</Select.Option>
                                            <Select.Option value="2">Motocykl</Select.Option>
                                            <Select.Option value="3">Rower</Select.Option>
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
                                <Form.Item label="Nowe hasło" name="newPassword">
                                    <Input.Password />
                                </Form.Item>
                                <Form.Item label="Potwierdź hasło" name="confirmPassword">
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