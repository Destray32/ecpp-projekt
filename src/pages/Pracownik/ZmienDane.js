import React from 'react';
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { FloatLabel } from 'primereact/floatlabel';

import DaneBox from '../../Components/DaneBox';

export default function ZmienDanePage() {
    return (
        <div>
            <div className='w-full flex flex-row justify-center items-center space-x-1 pr-2'>
                <DaneBox name='Zmiana danych'>
                    <div className='flex flex-col items-center space-y-8'>
                        <FloatLabel>
                            <InputText id="surename" type="text" />
                            <label htmlFor="surename">Nazwisko</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="name" type="text" />
                            <label htmlFor="name">Imię</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="brithday" type="date" />
                            <label htmlFor="brithday">Data urodzenia</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="pesel" type="text" />
                            <label htmlFor="pesel">PESEL</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="street" type="text" />
                            <label htmlFor="street">Ulica / Nr domu</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="zip" type="text" />
                            <label htmlFor="zip">Kod pocztowy</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="city" type="text" />
                            <label htmlFor="city">Miasto</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="country" type="text" />
                            <label htmlFor="country">Kraj</label>
                        </FloatLabel>
                    </div>
                    <div className='flex flex-col items-center space-y-8'>
                        <FloatLabel>
                            <InputText id="phone1" type="text" />
                            <label htmlFor="phone">Telefon w Polsce</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="phone2 " type="text" />
                            <label htmlFor="phone">Telefon w Szwecji</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="Email" type="text" />
                            <label htmlFor="Email">Email</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="relative" type="text" />
                            <label htmlFor="relative1">Osoba kontaktowa</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="relative2" type="text" />
                            <label htmlFor="relative2">Kontakt w razie wypadku</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="NIP" type="text" />
                            <label htmlFor="NIP">NIP</label>
                        </FloatLabel>
                    </div>
                </DaneBox>
                <DaneBox name='Informacje o firmie'>
                    <div className='flex flex-col items-center space-y-8'>
                        <FloatLabel>
                            <InputText id="company" type="text" />
                            <label htmlFor="company">Firma</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="hiredAs" type="text" />
                            <label htmlFor="hiredAs">Zatrudniony jako</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="manager" type="text" />
                            <label htmlFor="manager">Kierownik</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="nr" type="text" />
                            <label htmlFor="nr">Nr</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="paycheck" type="text" />
                            <label htmlFor="paycheck">Wynagrodzenie</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="tillVacation" type="text" />
                            <label htmlFor="tillVacation">Liczba dni do urlopu</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="tax" type="text" />
                            <label htmlFor="tax">Obowiązek podatku</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="Typ" type="text" />
                            <label htmlFor="Typ">Typ</label>
                        </FloatLabel>
                    </div>
                    <div className='flex flex-col items-center space-y-8'>
                        <FloatLabel>
                            <InputText id="startDate" type="date" />
                            <label htmlFor="startDate">Data rozpoczęcia</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="endDate" type="date" />
                            <label htmlFor="endDate">Data zakończenia</label>
                        </FloatLabel>
                        <FloatLabel>
                            <InputText id="paycheckCode" type="text" />
                            <label htmlFor="paycheckCode">Kod wynagrodzenia</label>
                        </FloatLabel>
                        <FloatLabel>
                            <Dropdown id="vehicle" optionLabel="name" optionValue="code" options={["Pojazd 1","Pojazd 2"]} placeholder="Wybierz pojazd" />
                            <label htmlFor="vehicle">Samochody</label>
                        </FloatLabel>
                        <div className='flex flex-col items-center space-y-2'>
                            <label htmlFor="weeklyPlan">Plan tygodnia "V"?</label>
                            <Checkbox inputId="weeklyPlan" checked={false} />
                            <label htmlFor="printVacation">Drukować urlop?</label>
                            <Checkbox inputId="printVacation" checked={false} />
                        </div>
                    </div>
                </DaneBox>
            </div>
        </div>
    )
}