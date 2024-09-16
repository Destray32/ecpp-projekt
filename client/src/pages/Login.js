import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import "primereact/resources/themes/lara-light-cyan/theme.css";

export default function LoginPage() {
    const navigate = useNavigate();

    // listy z których wybierać mozna w dropdownach
    const [availableCompanies, setAvailableCompanies] = useState(['test', 'test2']);
    const [availableLogins, setAvailableLogins] = useState(['login1', 'login2']);

    // stany przechowywuajce firme, login i hasło
    const [firma, setFirma] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        fetchCompanies();
        fetchLogins();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await axios.get('http://47.76.209.242:5000/api/companies');
            setAvailableCompanies(response.data);
        }
        catch (error) {
            console.error(error);
        }
    }

    const fetchLogins = async () => {
        try {
            const response = await axios.get('http://47.76.209.242:5000/api/logins');
            setAvailableLogins(response.data);
        }
        catch (error) {
            console.error(error);
        }
    }

    const loginHandler = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://47.76.209.242:5000/api/logowanie', { firma, login, password }, { withCredentials: true });
            
            console.log(response.data.message);

            navigate('/home');
        } catch (error) {
            console.error(error);
        }
    };

    const testLoginHandler = async () => {
        try {
            const testFirma = 'PC Husbyggen';
            const login = 'twachala';
            const testPassword = 'tomek1';
            const response = await axios.post('http://47.76.209.242:5000/api/logowanie', { firma: testFirma, login, password: testPassword }, { withCredentials: true });

            navigate('/home');
        } catch (error) {
            console.error(error);
        }
    };

    // useEffect(() => {
    //     console.log(firma, login, password);
    // }, [firma, login, password]);

    return (
        <main className='bg-primary min-h-screen flex items-center justify-center'>
            <div className='bg-white w-1/2 h-[20rem] rounded-lg drop-shadow-2xl'>
                <form className='p-4 space-y-6 h-full' onSubmit={loginHandler}>
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
                        <button type='button' onClick={testLoginHandler} className='bg-secondary bg-blue-400 text-white p-2 rounded-md w-1/2 ml-4'>Skip</button>
                    </div>
                </form>
                
            </div>
        </main>
    )
}