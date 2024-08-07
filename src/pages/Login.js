import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

import "primereact/resources/themes/lara-light-cyan/theme.css";

export default function LoginPage() {

    // listy z których wybierać mozna w dropdownach
    const [avaibleLogins, setAvailableLogins] = useState(['test', 'test2']);
    const [avaibleDbs, setAvailableDbs] = useState(['baza1', 'baza2']);

    // stany przechowywuajce login, haslo, baze danych
    const [login, setLogin] = useState('');
    const [db, setDb] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        console.log(login, db, password);
    }, [login, db, password]);

    return (
        <body className='bg-primary min-h-screen flex items-center justify-center'>
            <div className='bg-white w-1/2 h-[20rem] rounded-lg drop-shadow-2xl'>
                <form className='p-4 space-y-4 h-full'>
                    <div className='card flex flex-col drop-shadow-lg'>
                        <Dropdown value={login} onChange={(e) => setLogin(e.value)} options={avaibleLogins} optionLabel="name"
                            editable placeholder="Login" autoComplete='off' className="w-full md:w-14rem p-4" />
                    </div>
                    <div className='card flex flex-col drop-shadow-lg'>
                        <Dropdown value={db} onChange={(e) => setDb(e.value)} options={avaibleDbs} optionLabel="name"
                            editable placeholder="Baza" autoComplete='off' className="w-full md:w-14rem p-4" />
                    </div>
                    <div className="card flex flex-col drop-shadow-lg">
                        {/* i have no clue why toggleMask={true} rozwala input, do poprawy albo wywalenia */}
                        <Password value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='off'
                            className='w-full' inputClassName='w-full md:w-14rem p-4' feedback={false} placeholder='Hasło' />
                    </div>
                    <div className='card flex justify-center'>
                        <Button label='Zaloguj' className='p-4 w-14rem bg-blue-400' />
                    </div>
                </form>
            </div>
        </body>
    )
}