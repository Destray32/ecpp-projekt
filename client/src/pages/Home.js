import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import { Button, Badge, Modal } from 'antd';
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
        console.log(accountType);
    }, [accountType]);

    useEffect(() => {
        if (location.pathname !== '/home/zmien-dane' && location.pathname !== '/home') {
            daneUzupelnione();
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await axios.post('http://47.76.209.242:5000/api/logout', {}, { withCredentials: true });
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    }

    const checkTokenValidity = async () => {
        try {
            await axios.get('http://47.76.209.242:5000/api/check-token', { withCredentials: true });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            }
        }
    }

    const daneUzupelnione = async () => {
        try {
            const response = await axios.get('http://47.76.209.242:5000/api/dane-uzupelnione', { withCredentials: true });
            if (response.data === false && location.pathname !== '/home/zmien-dane') {
                Modal.error({
                    title: 'Uzupełnij dane',
                    content: 'Aby móc kontynuować, uzupełnij swoje dane osobowe.',
                    onOk: () => {
                        navigate('/home/zmien-dane');
                    }
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getImie = async () => {
        try {
            const response = await axios.get('http://47.76.209.242:5000/api/imie', { withCredentials: true });
            const { name, surename } = response.data;
            setImie(`${name} ${surename}`);
        } catch (error) {
            console.error(error);
        }
    }

    const getBadgeCount = async () => {
        try {
            const response = await axios.get('http://47.76.209.242:5000/api/ogloszenia/count', { withCredentials: true });
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
        //     navigator.sendBeacon('http://47.76.209.242:5000/api/zamkniecieStrony');
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
    //             navigator.sendBeacon('http://47.76.209.242:5000/api/zamkniecieStrony');
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
                                {accountType === 'Administrator' ? (
                                <>
                                    <ButtonLewy link="pracownik" nazwa='Pracownik' onClick={closeMobileMenu} isActive={location.pathname === '/home/pracownik'} />
                                    <ButtonLewy link="logowanie" nazwa='Logowanie' onClick={closeMobileMenu} isActive={location.pathname === '/home/logowanie'} />
                                </>
                                ) : (
                                <ButtonLewy link="pracownik" nazwa='Pracownik' onClick={closeMobileMenu} isActive={location.pathname === '/home/pracownik'} 
                                />
                                )}

                                <ButtonLewy nazwa='Wyloguj' onClick={() => { handleLogout(); closeMobileMenu(); }} isActive={false} 
                                />
                            </>
                            )}
                            {menu === "Czas" && (
                                <>
                                {accountType === 'Administrator' ? (
                                    <>
                                    <ButtonLewy link="czas" nazwa='Czas Pracy' onClick={closeMobileMenu} isActive={location.pathname === '/home/czas'} />
                                    <ButtonLewy nazwa='Administracja' onClick={() => { toggleSubMenu(); }} />
                                {showSubMenu && (
                                    <div className='ml-5 space-y-2'>
                                        <ButtonLewy link="projekty" nazwa='Projekty' onClick={closeMobileMenu} isActive={location.pathname === '/home/projekty'} />
                                        <ButtonLewy link="urlopy" nazwa='Urlopy' onClick={closeMobileMenu} isActive={location.pathname === '/home/urlopy'} />
                                        <ButtonLewy link="pojazdy" nazwa='Pojazdy' onClick={closeMobileMenu} isActive={location.pathname === '/home/pojazdy'} />
                                        <ButtonLewy link="archiwum" nazwa='Archiwum' onClick={closeMobileMenu} isActive={location.pathname === '/home/archiwum'} />
                                    </div>
                                )}
                                <ButtonLewy link="tydzien" nazwa='Tydzien' onClick={closeMobileMenu} isActive={location.pathname === '/home/tydzien'} />
                                <ButtonLewy link="raporty" nazwa='Raporty' onClick={closeMobileMenu} isActive={location.pathname === '/home/raporty'} />
                                <ButtonLewy link="sprawdzsamochod" nazwa='Sprawdź samochód' onClick={closeMobileMenu} isActive={location.pathname === '/home/sprawdzsamochod'} />  
                                </>
                            ) : accountType === 'Pracownik' ? (
                                <>
                                    <ButtonLewy link="czas" nazwa='Czas Pracy' onClick={closeMobileMenu} isActive={location.pathname === '/home/czas'} />
                                    <ButtonLewy nazwa='Administracja' onClick={() => { toggleSubMenu(); }} />
                                    {showSubMenu && (
                                        <div className='ml-5 space-y-2'>
                                            <ButtonLewy link="urlopy" nazwa='Urlopy' onClick={closeMobileMenu} isActive={location.pathname === '/home/urlopy'} />
                                        </div>
                                    )}
                                    <ButtonLewy link="raporty" nazwa='Raporty' onClick={closeMobileMenu} isActive={location.pathname === '/home/raporty'} />
                                </>
                            ) : accountType === "Kierownik" ? (
                                <>
                                    <ButtonLewy link="czas" nazwa='Czas Pracy' onClick={closeMobileMenu} isActive={location.pathname === '/home/czas'} />
                                    <ButtonLewy nazwa='Administracja' onClick={() => { toggleSubMenu(); }} />
                                    {showSubMenu && (
                                        <div className='ml-5 space-y-2'>
                                            <ButtonLewy link="projekty" nazwa='Projekty' onClick={closeMobileMenu} isActive={location.pathname === '/home/projekty'} />
                                            <ButtonLewy link="urlopy" nazwa='Urlopy' onClick={closeMobileMenu} isActive={location.pathname === '/home/urlopy'} />
                                            <ButtonLewy link="pojazdy" nazwa='Pojazdy' onClick={closeMobileMenu} isActive={location.pathname === '/home/pojazdy'} />
                                        </div>
                                    )}
                                    <ButtonLewy link="raporty" nazwa='Raporty' onClick={closeMobileMenu} isActive={location.pathname === '/home/raporty'} />
                                    <ButtonLewy link="sprawdzsamochod" nazwa='Sprawdź samochód' onClick={closeMobileMenu} isActive={location.pathname === '/home/sprawdzsamochod'} />  
                                </>
                            ) : accountType === "Biuro" ? (
                                <>
                                    <ButtonLewy link="czas" nazwa='Czas Pracy' onClick={closeMobileMenu} isActive={location.pathname === '/home/czas'} />
                                    <ButtonLewy nazwa='Administracja' onClick={() => { toggleSubMenu(); }} />
                                    {showSubMenu && (
                                        <div className='ml-5 space-y-2'>
                                            <ButtonLewy link="projekty" nazwa='Projekty' onClick={closeMobileMenu} isActive={location.pathname === '/home/projekty'} />
                                            <ButtonLewy link="urlopy" nazwa='Urlopy' onClick={closeMobileMenu} isActive={location.pathname === '/home/urlopy'} />
                                            <ButtonLewy link="pojazdy" nazwa='Pojazdy' onClick={closeMobileMenu} isActive={location.pathname === '/home/pojazdy'} />
                                        </div>
                                    )}
                                    <ButtonLewy link="tydzien" nazwa='Tydzien' onClick={closeMobileMenu} isActive={location.pathname === '/home/tydzien'} />
                                    <ButtonLewy link="raporty" nazwa='Raporty' onClick={closeMobileMenu} isActive={location.pathname === '/home/raporty'} />
                                    <ButtonLewy link="sprawdzsamochod" nazwa='Sprawdź samochód' onClick={closeMobileMenu} isActive={location.pathname === '/home/sprawdzsamochod'} />
                                </>
                            ) : null}
                            <ButtonLewy nazwa='Wyloguj' onClick={() => { handleLogout(); closeMobileMenu(); }} isActive={false} />
                            </>
                            )}
                            {menu === "PlanTygodnia" && (
                                <>
                                    <ButtonLewy link="plan" nazwa='Plan Tygodnia' onClick={closeMobileMenu} isActive={location.pathname === '/home/plan'} />
                                    {isAdmin && (
                                <ButtonLewy link="zaplanuj" nazwa='Zaplanuj Tydzień' onClick={closeMobileMenu} isActive={location.pathname === '/home/zaplanuj'} />
                                    )}
                                <ButtonLewy nazwa='Wyloguj' onClick={() => { handleLogout(); closeMobileMenu(); }} isActive={false} />
                                </>
                            )}
                        </div>
                    </nav>
                    <main className={`w-full min-w-[1250px]`}>
                        <GorneMenu setMenu={setMenu} activeMenu={menu} />
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}