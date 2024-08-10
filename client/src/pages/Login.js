import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

import "primereact/resources/themes/lara-light-cyan/theme.css";

export default function LoginPage() {

    // listy z których wybierać mozna w dropdownach
    const [availableCompanies, setAvailableCompanies] = useState(['test', 'test2']);
    const [availableLogins, setAvailableLogins] = useState(['login1', 'login2']);

    // stany przechowywuajce firme, login i hasło
    const [firma, setFirma] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    // useEffect(() => {
    //     console.log(firma, login, password);
    // }, [firma, login, password]);

    return (
        <main className='bg-primary min-h-screen flex items-center justify-center'>
            <div className='bg-white w-1/2 h-[20rem] rounded-lg drop-shadow-2xl'>
                <form className='p-4 space-y-6 h-full'>
                    <div className='card flex flex-col drop-shadow-lg'>
                        <Dropdown value={firma} onChange={(e) => setFirma(e.value)} options={availableCompanies} optionLabel="name"
                            editable placeholder="Firma" autoComplete='off' className="w-full md:w-14rem p-4" />
                    </div>
                    <div className='card flex flex-col drop-shadow-lg'>
                        <Dropdown value={login} onChange={(e) => setLogin(e.value)} options={availableLogins} optionLabel="name"
                            editable placeholder="Login" autoComplete='off' className="w-full md:w-14rem p-4" />
                    </div>
                    <div className='card flex flex-col drop-shadow-lg w-full'>
                        <Password value={password} onChange={(e) => setPassword(e.target.value)} feedback={false} toggleMask placeholder="Hasło"
                             inputClassName='w-full md:w-14rem h-[3rem] p-2'
                             pt={{ iconField: { root: { className: 'w-full md:w-14rem ' } } }}
                             />
                    </div>
                    <div className='flex justify-center'>
                        <button className='bg-primary text-white p-2 rounded-md w-1/2'>Zaloguj</button>
                    </div>
                </form>
                
            </div>
        </main>
    )
}