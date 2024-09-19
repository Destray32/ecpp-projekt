import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, DatePicker, Input, Checkbox, Radio, Select, ConfigProvider, Button } from 'antd';
import plPL from 'antd/lib/locale/pl_PL';
import axios from 'axios';

import DaneBox from '../../Components/DaneBox';
import {
    requiredField,
    validatePassword,
    validateConfirmPasssword,
    polishPhoneValidation,
    swedishPhoneValidation,
    validatePESEL,
    validateNIP,
    validateEmail,
    universalFieldValidation
} from '../../utils/validationRules';

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
                                <Form.Item
                                    label="Nazwisko"
                                    name="surname"
                                    rules={[requiredField('Wprowadź nazwisko'), universalFieldValidation('surname')]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Imię"
                                    name="name"
                                    rules={[requiredField('Wprowadź imię'), universalFieldValidation('name')]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Data urodzenia"
                                    name="birthday"
                                    rules={[requiredField('Wprowadź datę urodzenia')]}
                                >
                                    <DatePicker />
                                </Form.Item>
                                <Form.Item
                                    label="PESEL"
                                    name="pesel"
                                    rules={[validatePESEL]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Ulica / Nr domu"
                                    name="street"
                                    rules={[requiredField('Wprowadź ulicę')]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Kod pocztowy"
                                    name="zip"
                                    rules={[requiredField('Wprowadź kod pocztowy')]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Miasto"
                                    name="city"
                                    rules={[requiredField('Wprowadź miasto'), universalFieldValidation('city')]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Kraj"
                                    name="country"
                                    rules={[requiredField('Wprowadź kraj')]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>
                            <div className="flex flex-col">
                                <Form.Item
                                    label="Firma"
                                    name="company"
                                    rules={[requiredField('Wybierz firmę')]}
                                >
                                    <Select>
                                        {firma.map(f => (
                                            <Select.Option key={f.idFirma} value={f.idFirma}>{f.Nazwa_firmy}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label="Telefon w Polsce"
                                    name="phone1"
                                    rules={[requiredField('Wprowadź telefon'), polishPhoneValidation]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Telefon w Szwecji"
                                    name="phone2"
                                    rules={[swedishPhoneValidation]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[validateEmail, requiredField('Wprowadź email')]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Osoba kontaktowa"
                                    name="relative1"
                                    rules={[requiredField('Wprowadź osobę kontaktową'), universalFieldValidation('relative')]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Kontakt (wypadek)" name="relative2" rules={[universalFieldValidation("relative")]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="NIP"
                                    name="NIP"
                                    rules={[validateNIP]}
                                >
                                    <Input />
                                </Form.Item>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex flex-col">
                                    <Form.Item
                                        label="Data zatrudnienia"
                                        name="startDate"
                                        rules={[requiredField('Wprowadź datę zatrudnienia')]}
                                    >
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
                                            {pojazd.map(p => (
                                                <Select.Option key={p.idPojazdy} value={p.idPojazdy}>{p.Nr_rejestracyjny}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        label="Grupa urlopowa"
                                        name="vacationGroup"
                                        rules={[requiredField('Wybierz grupę urlopową')]}
                                    >
                                        <Select>
                                            {grupa.map(g => (
                                                <Select.Option key={g.idGrupa_urlopowa} value={g.idGrupa_urlopowa}>{g.Grupa_urlopowacol}</Select.Option>
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
                                <Form.Item
                                    label="Nazwa użytkownika"
                                    name="login"
                                    rules={[requiredField('Wprowadź nazwę użytkownika')]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Konto aktywne" name="active" valuePropName="checked">
                                    <Checkbox />
                                </Form.Item>
                                <Form.Item
                                    label="Rola"
                                    name="role"
                                    rules={[requiredField('Wybierz rolę')]}
                                >
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
                                <Form.Item
                                    label="Nowe hasło"
                                    name="newPassword"
                                    rules={[requiredField('Wprowadź nowe hasło'), validatePassword]}
                                >
                                    <Input.Password />
                                </Form.Item>
                                <Form.Item
                                    label="Potwierdź hasło"
                                    name="confirmPassword"
                                    dependencies={['newPassword']}
                                    rules={[requiredField('Potwierdź hasło'), validateConfirmPasssword(form.getFieldValue)]}
                                >
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
