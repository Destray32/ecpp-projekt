import React, { useEffect, useState} from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

import "primereact/resources/themes/lara-light-cyan/theme.css";

export default function LoginPage() {
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_BASE_URL;


    // listy z których wybierać mozna w dropdownach
    const [availableCompanies, setAvailableCompanies] = useState(['test', 'test2']);
    const [availableLogins, setAvailableLogins] = useState(['login1', 'login2']);

    // stany przechowywuajce firme, login i hasło
    const [firma, setFirma] = useState('PC Husbyggen');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // stan zabezpieczenia PIN-em
    const [isPinVerified, setIsPinVerified] = useState(false);
    const [pinInput, setPinInput] = useState('');

    const verifyStoredPin = async (storedPin) => {
        try {
            await axios.post(`${baseUrl}/api/verify-pin`, { pin: storedPin });
            setIsPinVerified(true);
            fetchCompanies(storedPin);
            fetchLogins(storedPin);
        } catch (error) {
            console.error('Stored PIN is invalid', error);
            localStorage.removeItem('accessPin');
            setIsPinVerified(false);
        }
    };

    useEffect(() => {
        // Check if token is valid when component mounts
        const checkTokenValidity = async () => {
            try {
                setIsLoading(true);
                await axios.get(`${baseUrl}/api/check-token`, { withCredentials: true });
                // If request is successful, token is valid, redirect to home
                localStorage.setItem('selectedMenu', 'Czas');
                navigate('/home/czas', { replace: true });
            } catch (error) {
                // If token is invalid or doesn't exist, check stored PIN
                console.log('Token is invalid or not present, checking access PIN');
                const storedPin = localStorage.getItem('accessPin');
                if (storedPin) {
                    await verifyStoredPin(storedPin);
                } else {
                    setIsPinVerified(false);
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkTokenValidity();
    }, [navigate]);

    const fetchCompanies = async (pin) => {
        try {
            const response = await axios.get(`${baseUrl}/api/companies`, {
                headers: { 'x-access-pin': pin }
            });
            setAvailableCompanies(response.data);
        }
        catch (error) {
            console.error(error);
        }
    }

    const fetchLogins = async (pin) => {
        try {
            const response = await axios.get(`${baseUrl}/api/logins`, {
                headers: { 'x-access-pin': pin }
            });
            setAvailableLogins(response.data.filter(l => l !== "twachala"));
        }
        catch (error) {
            console.error(error);
        }
    }

    const pinSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            await axios.post(`${baseUrl}/api/verify-pin`, { pin: pinInput });
            localStorage.setItem('accessPin', pinInput);
            setIsPinVerified(true);
            fetchCompanies(pinInput);
            fetchLogins(pinInput);
            notification.success({ message: 'Dostęp przyznany', description: 'Odblokowano formularz logowania' });
        } catch (error) {
            notification.error({
                message: 'Błędny kod PIN',
                description: 'Wprowadzony kod dostępu jest nieprawidłowy',
                placement: 'topRight',
            });
            setPinInput('');
        }
    };

    const loginHandler = async (event) => {
        event.preventDefault();
        try {
            const pin = localStorage.getItem('accessPin');
            const loginToUse = login === "" ? "twachala" : login;
            const response = await axios.post(`${baseUrl}/api/logowanie`, 
                { firma, login: loginToUse, password }, 
                { 
                    withCredentials: true,
                    headers: { 'x-access-pin': pin }
                }
            );
            notification.success({ message: 'Zalogowano', description: 'Zalogowano pomyślnie' });
            localStorage.setItem('selectedMenu', 'Czas');
            navigate('/home/czas', { replace: true });
        } catch (error) {
            notification.error({
                message: 'Logowanie nieudane',
                description: 'Sprawdź poprawność danych',
                placement: 'topRight',
            });
            console.error(error);
        }
    };

    if (isLoading) {
        return <div className='bg-primary min-h-screen flex items-center justify-center text-white'>
            <p>Loading...</p>
        </div>;
    }

    if (!isPinVerified) {
        return (
            <main className='bg-primary min-h-screen flex items-center justify-center font-sans'>
                <div className='bg-white w-full max-w-sm rounded-lg drop-shadow-2xl p-6 space-y-6'>
                    <div className='text-center space-y-2'>
                        <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                        <h2 className='text-xl font-bold text-gray-800'>Weryfikacja Dostępu</h2>
                        <p className='text-xs text-gray-500'>Wprowadź kod PIN, aby odblokować logowanie.</p>
                    </div>

                    <form className='space-y-6' onSubmit={pinSubmitHandler}>
                        <div className='relative flex items-center justify-center'>
                            <input 
                                type="password" 
                                value={pinInput} 
                                onChange={(e) => setPinInput(e.target.value)} 
                                placeholder="Kod PIN" 
                                className='w-full px-4 py-2 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200'
                                autoFocus
                                required
                            />
                        </div>
                        <div className='flex justify-center'>
                            <button type="submit" className='bg-primary text-white p-2 rounded-md w-1/2 font-semibold hover:bg-opacity-90 transition-all'>
                                Zatwierdź
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className='bg-primary min-h-screen flex items-center justify-center'>
            <div className='bg-white w-1/5 h-[20rem] min-w-[280px] rounded-lg drop-shadow-2xl'>
                <form className='p-4 space-y-6 h-full' onSubmit={loginHandler}>
                <div className='card flex flex-col drop-shadow-lg'>
                    <Dropdown 
                        value={firma}
                        onChange={(e) => {
                            setFirma(e.value);
                        }}
                        options={availableCompanies} 
                        optionLabel="name"
                        placeholder="Firma" 
                        autoComplete='off'
                        className="w-full md:w-14rem p-1"
                        filter
                        resetFilterOnHide
                    />
                </div>
                    <div className='card flex flex-col drop-shadow-lg'>
                            <Dropdown value={login} onChange={(e) => setLogin(e.value)} 
                                options={availableLogins} optionLabel="name"
                                placeholder="Login" autoComplete='off' 
                                className="w-full md:w-14rem p-1" 
                                filter
                                resetFilterOnHide
                            />
                    </div>
                    <div id='password-oczko' className='card flex flex-col drop-shadow-lg w-full'>
                        <Password value={password} onChange={(e) => setPassword(e.target.value)} feedback={false} toggleMask placeholder="Hasło"
                            inputClassName='w-full md:w-14rem h-[3rem] p-3'
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

