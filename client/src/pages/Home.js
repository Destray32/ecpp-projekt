import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import { Button, Badge } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import axios from 'axios';

import GorneMenu from '../Components/GorneMenu';
import ButtonLewy from '../Components/ButtonLeweMenu';
import checkUserType from '../utils/accTypeUtils';

export default function HomePage() {
    const [data, setData] = useState([]);
    const [imie, setImie] = useState('placeholder');
    const [menu, setMenu] = useState('Pracownik');
    const [showSubMenu, setShowSubMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [badgeCount, setBadgeCount] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [accountType, setAccountType] = useState('');

    useEffect(() => {
        checkUserType(setAccountType);
    }, []);

    useEffect(() => {
        if (accountType === 'Administrator') {
            setIsAdmin(true);
        }
    }, [accountType]);

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

    const getImie = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/imie', { withCredentials: true });
            const { name, surename } = response.data;
            setImie(`${name} ${surename}`);
        } catch (error) {
            console.error(error);
        }
    }

    const getBadgeCount = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/ogloszenia/count', { withCredentials: true });
            setBadgeCount(response.data.count);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => { // useEffect ze względu na to żeby tata się zmieniała w razie potrzeby
        // moment.locale('pl'); // nie wiem jeszcze czy potrzebna jest data polska czy szwedzka

        checkTokenValidity();
        getImie();
        getBadgeCount();

        // const handlePageUnload = () => {
        //     navigator.sendBeacon('http://localhost:5000/api/zamkniecieStrony');
        // };

        // window.addEventListener('beforeunload', handlePageUnload);

        const timer = setInterval(() => {
            setData(moment().format('DD/MM/YYYY'));
        }, 1000);

        return () => {
            clearInterval(timer);
            //window.removeEventListener('beforeunload', handlePageUnload);
        }
    }, []);

    // useEffect(() => {
    //     const unlisten = navigate((location, action) => {
    //         if (action === 'POP') {
    //             navigator.sendBeacon('http://localhost:5000/api/zamkniecieStrony');
    //         }
    //     });

    //     return unlisten;
    // }, [navigate]);

    const toggleSubMenu = () => {
        setShowSubMenu(prevState => !prevState);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <>
            <div className='flex flex-col min-h-screen'>
                <header className="w-full bg-primary text-white p-4 flex justify-between items-center">
                    <button
                        className="min-[1470px]:hidden text-white p-2"
                        onClick={toggleMobileMenu}
                    >
                        <MenuOutlined className='text-2xl' />
                    </button>
                    <h1 className="text-2xl font-bold">ECPP</h1>
                    <div className="flex items-center">
                        <span className="mr-4">{imie + ' ' + data}</span>
                        <Link to="/home/ogloszenia" className='mr-4'>
                            <Badge count={badgeCount}>
                                <Button type="primary" size="large">
                                    Ogłoszenia
                                </Button>
                            </Badge>
                        </Link>
                    </div>
                </header>
                <div className='flex flex-1'>
                    <nav className={`min-w-[200px] bg-primary p-4 ${mobileMenuOpen ? 'fixed top-0 left-0 w-screen h-screen z-50 block' : 'hidden'} min-[1470px]:block`}>
                        <div className="bg-white w-full h-[0.5px] my-4"></div>
                        <div className="space-y-2 max-h-[80%]">
                            {menu === "Pracownik" && (
                                <>
                                    <ButtonLewy link="pracownik" nazwa='Pracownik' onClick={closeMobileMenu} />
                                    {isAdmin && (
                                    <ButtonLewy link="logowanie" nazwa='Logowanie' onClick={closeMobileMenu} />
                                    )}
                                <ButtonLewy nazwa='Wyloguj' onClick={() => { handleLogout(); closeMobileMenu(); }} />
                                </>
                            )}
                            {menu === "Czas" && (
                                <>
                                    <ButtonLewy link="czas" nazwa='Czas Pracy' onClick={closeMobileMenu} />
                                    <ButtonLewy nazwa='Administracja' onClick={() => { toggleSubMenu(); }} />
                                {showSubMenu && (
                                    <div className='ml-5 space-y-2'>
                                        <ButtonLewy link="projekty" nazwa='Projekty' onClick={closeMobileMenu} />
                                        <ButtonLewy link="urlopy" nazwa='Urlopy' onClick={closeMobileMenu} />
                                        <ButtonLewy link="pojazdy" nazwa='Pojazdy' onClick={closeMobileMenu} />
                                        <ButtonLewy link="archiwum" nazwa='Archiwum' onClick={closeMobileMenu} />
                                    </div>
                                )}
                                    {isAdmin && (
                                    <ButtonLewy link="admin" nazwa='Admin' onClick={closeMobileMenu} />
                                    )}
                                <ButtonLewy link="raporty" nazwa='Raporty' onClick={closeMobileMenu} />
                                    <ButtonLewy link="sprawdzsamochod" nazwa='Sprawdź samochód' onClick={closeMobileMenu} />
                                    <ButtonLewy nazwa='Wyloguj' onClick={() => { handleLogout(); closeMobileMenu(); }} />
                                </>
                            )}
                            {menu === "PlanTygodnia" && (
                                <>
                                    <ButtonLewy link="plan" nazwa='Plan Tygodnia' onClick={closeMobileMenu} />
                                    {isAdmin && (
                                <ButtonLewy link="zaplanuj" nazwa='Zaplanuj Tydzień' onClick={closeMobileMenu} />
                                    )}
                                <ButtonLewy nazwa='Wyloguj' onClick={() => { handleLogout(); closeMobileMenu(); }} />
                                </>
                            )}
                        </div>
                    </nav>
                    <main className={`w-full min-w-[1250px]`}>
                        <GorneMenu setMenu={setMenu}  />
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}