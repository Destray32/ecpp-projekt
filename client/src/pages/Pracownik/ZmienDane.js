import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';
import { RadioButton } from 'primereact/radiobutton';

import DaneBox from '../../Components/DaneBox';

export default function ZmienDanePage() {
    const [formData, setFormData] = useState({
        surename: '',
        name: '',
        brithday: '',
        pesel: '',
        street: '',
        zip: '',
        city: '',
        country: '',
        phone1: '',
        phone2: '',
        email: '',
        relative1: '',
        relative2: '',
        NIP: '',
        company: '',
        hiredAs: '',
        manager: '',
        nr: '',
        paycheck: '',
        tillVacation: '',
        tax: '',
        Typ: '',
        startDate: '',
        endDate: '',
        paycheckCode: '',
        vehicle: '',
        weeklyPlan: false,
        printVacation: false,
        login: '',
        active: false,
        role: 'admin',
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [id]: type === 'checkbox' ? checked : value,
        }));

        setPasswordData((prevPasswordData) => ({
            ...prevPasswordData,
            [id]: value,
        }));
    };

    const validateForm = () => {
        const requiredFields = [
            'surename', 'name', 'brithday', 'street',
            'zip', 'city', 'country', 'phone1',
            'phone2', 'email', 'relative1', 'relative2',
            'company', 'manager', 'startDate', 'login',
        ];

        for (const field of requiredFields) {
            if (formData[field] === '') {
                return false;
            }
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log(formData);
            alert('Dane zostały zapisane');
        } else {
            console.log(formData);
            alert('Wypełnij wszystkie wymagane pola');
        }
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (passwordData.newPassword === passwordData.confirmPassword) {
            alert('Hasło zostało zmienione');
        }
        else {
            alert('Hasła nie są takie same');
        }

        console.log(passwordData);
    }

    return (
        <div>
            <form className='pb-2'>
                <div className='w-full flex flex-row justify-center items-center'>
                    <DaneBox name='Zmiana danych'>
                        <div className='flex flex-col items-center space-y-8'>
                            <FloatLabel>
                                <InputText invalid={formData.surename === ''} id="surename" type="text" onChange={handleChange} />
                                <label htmlFor="surename">Nazwisko</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText invalid={formData.name === ''} id="name" type="text" onChange={handleChange} />
                                <label htmlFor="name">Imię</label>
                            </FloatLabel>
                            <div className='flex flex-col items-center space-y-2'>
                                <label htmlFor="brithday">Data urodzenia</label>
                                <InputText style={{width: '14rem'}} invalid={formData.brithday === ''} id="brithday" type="date" onChange={handleChange} />
                            </div>
                            <FloatLabel>
                                <InputText id="pesel" type="text" onChange={handleChange} />
                                <label htmlFor="pesel">PESEL</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText invalid={formData.street === ''} id="street" type="text" onChange={handleChange} />
                                <label htmlFor="street">Ulica / Nr domu</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText invalid={formData.zip === ''} id="zip" type="text" onChange={handleChange} />
                                <label htmlFor="zip">Kod pocztowy</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText invalid={formData.city === ''} id="city" type="text" onChange={handleChange} />
                                <label htmlFor="city">Miasto</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText invalid={formData.country === ''} id="country" type="text" onChange={handleChange} />
                                <label htmlFor="country">Kraj</label>
                            </FloatLabel>
                        </div>
                        <div className='flex flex-col items-center space-y-8'>
                            <FloatLabel>
                                <InputText invalid={formData.phone1 === ''} id="phone1" type="text" onChange={handleChange} />
                                <label htmlFor="phone">Telefon w Polsce</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText invalid={formData.phone2 === ''} id="phone2" type="text" onChange={handleChange} />
                                <label htmlFor="phone">Telefon w Szwecji</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText invalid={formData.email === ''} id="email" type="text" onChange={handleChange} />
                                <label htmlFor="Email">Email</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText invalid={formData.relative1 === ''} id="relative1" type="text" onChange={handleChange} />
                                <label htmlFor="relative1">Osoba kontaktowa</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText invalid={formData.relative2 === ''} id="relative2" type="text" onChange={handleChange} />
                                <label htmlFor="relative2">Kontakt w razie wypadku</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="NIP" type="text" onChange={handleChange} />
                                <label htmlFor="NIP">NIP</label>
                            </FloatLabel>
                        </div>
                        <div className='flex flex-col items-center space-y-8'>
                            <div className='flex flex-col items-center space-y-2'>
                                <label htmlFor="startDate">Data rozpoczęcia</label>
                                <InputText style={{width: '14rem'}} invalid={formData.startDate === ''} id="startDate" type="date" onChange={handleChange} />
                            </div>
                            <div className='flex flex-col items-center space-y-2'>
                                <label htmlFor="endDate">Data zakończenia</label>
                                <InputText style={{width: '14rem'}} id="endDate" type="date" onChange={handleChange} />
                            </div>
                            <FloatLabel>
                                <InputText id="paycheckCode" type="text" onChange={handleChange} />
                                <label htmlFor="paycheckCode">Kod wynagrodzenia</label>
                            </FloatLabel>
                            <FloatLabel>
                                <Dropdown id="vehicle" optionLabel="name" optionValue="code" options={["Pojazd 1","Pojazd 2"]} placeholder="Wybierz pojazd" onChange={handleChange} />
                                <label htmlFor="vehicle">Samochody</label>
                            </FloatLabel>
                            <div className='flex flex-col items-center space-y-2'>
                                <label htmlFor="weeklyPlan">Plan tygodnia "V"?</label>
                                <Checkbox id="weeklyPlan" onChange={handleChange} checked={formData.weeklyPlan} />
                                <label htmlFor="printVacation">Drukować urlop?</label>
                                <Checkbox id="printVacation" onChange={handleChange} checked={formData.printVacation} />
                            </div>
                        </div>
                    </DaneBox>
                </div>
                <div className='w-full flex flex-row justify-center items-center'>
                    <DaneBox name='Informacje o użytkowniku'>
                        <div className='flex flex-col items-center space-y-8'>
                            <FloatLabel>
                                <InputText id="login" type="text" invalid={formData.login === ''} onChange={handleChange} />
                                <label htmlFor="login">Nazwa użytkownika</label>
                            </FloatLabel>
                            <div className='flex flex-row items-center space-x-2'>
                                <Checkbox id="active" onChange={handleChange} checked={formData.active} />
                                <label htmlFor="active">Konto aktywne</label>
                            </div>
                            <div className='flex flex-row items-center space-x-2'>
                                <RadioButton id="role" name="role" value="admin" onChange={handleChange} checked={formData.role === 'admin'} />
                                <label htmlFor="role">Szef</label>
                                <RadioButton id="role" name="role" value="manager" onChange={handleChange} checked={formData.role === 'manager'} />
                                <label htmlFor="role">Majester</label>
                                <RadioButton id="role" name="role" value="worker" onChange={handleChange} checked={formData.role === 'worker'} />
                                <label htmlFor="role">Pracownik</label>
                                <RadioButton id="role" name="role" value="user" onChange={handleChange} checked={formData.role === 'user'} />
                                <label htmlFor="role">Gość</label>
                            </div>
                        </div>
                    </DaneBox>
                    <DaneBox name='Zmiana hasła'>
                        <div className='flex flex-col items-center space-y-8'>
                            <FloatLabel>
                                <InputText id="oldPassword" type="password" onChange={handleChange} />
                                <label htmlFor="oldPassword">Stare hasło</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="newPassword" type="password" onChange={handleChange} />
                                <label htmlFor="newPassword">Nowe hasło</label>
                            </FloatLabel>
                            <FloatLabel>
                                <InputText id="confirmPassword" type="password" onChange={handleChange} />
                                <label htmlFor="confirmPassword">Potwierdź hasło</label>
                            </FloatLabel>
                        </div>
                        <Button label="Zmień hasło" onClick={handleChangePassword} className="bg-white outline outline-1 outline-gray-500 p-2" />
                    </DaneBox>
                </div>
                <div className='w-full flex flex-row justify-center items-center space-x-4'>
                    <Link to="/home/pracownik">
                        <Button label="Anuluj" className="bg-white outline outline-1 outline-gray-500 p-2" />
                    </Link>
                    <Button label="Zapisz" onClick={handleSubmit} className="bg-white outline outline-1 outline-gray-500 p-2" />
                </div>
            </form>
        </div>
    )
}