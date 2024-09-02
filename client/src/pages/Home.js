import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Button, Badge } from 'antd';
import axios from 'axios';

import GorneMenu from '../Components/GorneMenu';
import ButtonLewy from '../Components/ButtonLeweMenu';

export default function HomePage() {
    const [data, setData] = useState([]);
    const [imie, setImie] = useState('placeholder');
    const [menu, setMenu] = useState('Pracownik');
    const [showSubMenu, setShowSubMenu] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true });
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    }

    const checkTokenValidity = async () => {
        try {
            await axios.get('http://localhost:5000/api/check-token', { withCredentials: true });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            }
        }
    }

    useEffect(() => { // useEffect ze względu na to żeby tata się zmieniała w razie potrzeby
        // moment.locale('pl'); // nie wiem jeszcze czy potrzebna jest data polska czy szwedzka

        checkTokenValidity();

        const timer = setInterval(() => {
            setData(moment().format('DD/MM/YYYY'));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const toggleSubMenu = () => {
        setShowSubMenu(prevState => !prevState);
    };

    return (
        <>
            {/* to jest głowny layout w gridzie */}
            <div className='grid grid-cols-[250px_1fr] grid-rows-[auto_1fr] min-h-screen'>
                <header className="col-span-2 bg-primary text-white p-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">ECPP</h1>
                    <div className="flex items-center">
                        <span className="mr-4">{imie + ' ' + data}</span> {/* imie i data */}
                        <Link to="/home/ogloszenia" className='mr-4'>
                            <Badge count={5} >
                                <Button type="primary" size="large">
                                    Ogłoszenia
                                </Button>
                            </Badge>
                        </Link>
                    </div>
                </header>
                <nav className="bg-primary p-4">
                    <div className="bg-white w-full h-[0.5px] my-4"></div>
                    <div className="space-y-2">
                        {menu === "Pracownik" && (
                            <>
                                <ButtonLewy link="pracownik" nazwa='Pracownik' />
                                <ButtonLewy link="podzial" nazwa='Podział' />
                                <ButtonLewy link="logowanie" nazwa='Logowanie' />
                                <ButtonLewy nazwa='Wyloguj' onClick={handleLogout} />
                            </>
                        )}
                        {menu === "Czas" && (
                            <>
                                <ButtonLewy link="czas" nazwa='Czas Pracy' />
                                <ButtonLewy nazwa='Administracja' onClick={toggleSubMenu} />
                                    {showSubMenu && (
                                        <div className='ml-5 space-y-2'>
                                            <ButtonLewy link="projekty" nazwa='Projekty' />
                                            <ButtonLewy link="urlopy" nazwa='Urlopy' />
                                            <ButtonLewy link="pojazdy" nazwa='Pojazdy' />
                                        </div>
                                    )}
                                <ButtonLewy link="tydzien" nazwa='Tydzien' />
                                <ButtonLewy link="raporty" nazwa='Raporty' />
                                <ButtonLewy link="sprawdzsamochod" nazwa='Sprawdź samochód' />
                                <ButtonLewy nazwa='Wyloguj' onClick={handleLogout} />
                            </>
                        )}
                        {menu === "PlanTygodnia" && (
                            <>
                                <ButtonLewy link="plan" nazwa='Plan Tygodnia' />
                                <ButtonLewy link="zaplanuj" nazwa='Zaplanuj Tydzień' />
                                <ButtonLewy nazwa='Wyloguj' onClick={handleLogout} />
                            </>
                        )}
                    </div>
                </nav>
                <main className=""> {/* to jest główna treść, ten biały box na stronie */}
                    <GorneMenu setMenu={setMenu}/>
                    <Outlet />
                </main>
            </div>
        </>
    )
}