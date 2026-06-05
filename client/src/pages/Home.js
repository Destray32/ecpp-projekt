import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import { Button, Badge, Modal } from 'antd';
import { MenuOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';

import GorneMenu from '../Components/GorneMenu';
import ButtonLewy from '../Components/ButtonLeweMenu';
import checkUserType, { hasSpecialAccess } from '../utils/accTypeUtils';

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
    const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState(0);
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const lastSessionRefreshRef = useRef(0);
    const baseUrl = process.env.REACT_APP_BASE_URL;

    const formatSessionTime = (totalSeconds) => {
        const safeSeconds = Math.max(totalSeconds || 0, 0);
        const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(safeSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const canAccessRoute = (path) => {
        if (!accountType) {
            return true;
        }

        if (path === '/home' || path === '/home/pracownik' || path === '/home/zmien-dane' || path === '/home/pobierz' || path === '/home/ogloszenia') {
            return true;
        }

        if (accountType === 'Administrator') {
            return true;
        }

        if (path === '/home/dodaj-pracownika' ||
            path.startsWith('/home/edytuj-pracownika/') ||
            path === '/home/zablokowani-pracownicy' ||
            path === '/home/nieaktywni-pracownicy' ||
            path === '/home/logowanie' ||
            path === '/home/cennik' ||
            path === '/home/archiwum' ||
            path === '/home/zaplanuj' ||
            path.startsWith('/home/projekt/') ||
            path === '/home/grupy-projektow' ||
            path === '/home/nowa-grupa' ||
            path.startsWith('/home/grupa/') ||
            path === '/home/nowy-pojazd') {
            return false;
        }

        if (path === '/home/czas' || path === '/home/urlopy' || path === '/home/raporty') {
            return true;
        }

        if (path === '/home/projekty' || path === '/home/nowy-projekt') {
            return accountType === 'Biuro' || accountType === 'Kierownik' || hasSpecialAccess(name, surname, 'projekty');
        }

        if (path === '/home/pojazdy' || path === '/home/sprawdzsamochod') {
            return accountType === 'Biuro' || accountType === 'Kierownik';
        }

        if (path === '/home/tydzien') {
            return accountType === 'Biuro' || hasSpecialAccess(name, surname, 'tydzien');
        }

        if (path === '/home/plan') {
            return accountType !== 'Pracownik';
        }

        return true;
    };

    useEffect(() => {
        checkUserType(setAccountType);
    }, []);

    useEffect(() => {
        if (accountType === 'Administrator') {
            setIsAdmin(true);
        }
    }, [accountType]);

    useEffect(() => {
        if (location.pathname !== '/home/zmien-dane' && location.pathname !== '/home') {
            daneUzupelnione();
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await axios.post(`${baseUrl}/api/logout`, {}, { withCredentials: true });
            localStorage.removeItem('selectedMenu');
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    }

    const checkTokenValidity = useCallback(async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/check-token`, { withCredentials: true });
            setSessionRemainingSeconds(response.data?.remainingSeconds || 0);
            lastSessionRefreshRef.current = Date.now();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            }
        }
    }, [baseUrl, navigate]);

    const refreshSessionOnActivity = useCallback(() => {
        const now = Date.now();
        // Avoid sending a request for every mouse move; one refresh per minute is enough.
        if (now - lastSessionRefreshRef.current < 60000) {
            return;
        }

        checkTokenValidity();
    }, [checkTokenValidity]);

    const daneUzupelnione = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/dane-uzupelnione`, { withCredentials: true });
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
            const response = await axios.get(`${baseUrl}/api/imie`, { withCredentials: true });
            const { name, surename } = response.data;
            setName(name);
            setSurname(surename);
            setImie(`${name} ${surename}`);
        } catch (error) {
            console.error(error);
        }
    }

    const getBadgeCount = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/ogloszenia/count`, { withCredentials: true });
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
        //     navigator.sendBeacon(${baseUrl}/api/zamkniecieStrony');
        // };

        // window.addEventListener('beforeunload', handlePageUnload);

        const timer = setInterval(() => {
            setData(moment().format('DD/MM/YYYY'));
            setSessionRemainingSeconds((prev) => Math.max((prev || 0) - 1, 0));
        }, 1000);

        const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        activityEvents.forEach((eventName) => {
            window.addEventListener(eventName, refreshSessionOnActivity, { passive: true });
        });

        const visibilityHandler = () => {
            if (document.visibilityState === 'visible') {
                refreshSessionOnActivity();
            }
        };

        document.addEventListener('visibilitychange', visibilityHandler);

        return () => {
            clearInterval(timer);
            activityEvents.forEach((eventName) => {
                window.removeEventListener(eventName, refreshSessionOnActivity);
            });
            document.removeEventListener('visibilitychange', visibilityHandler);
            //window.removeEventListener('beforeunload', handlePageUnload);
        }
    }, [checkTokenValidity, refreshSessionOnActivity]);

    useEffect(() => {
        if (location.pathname === '/home' || location.pathname === '/home/') {
            navigate('/home/czas', { replace: true });
        }
    }, [location.pathname, navigate]);

    useEffect(() => {
        if (!accountType) {
            return;
        }

        if (!canAccessRoute(location.pathname)) {
            navigate('/home/czas', { replace: true });
        }
    }, [accountType, location.pathname, name, surname, navigate]);

    // useEffect(() => {
    //     const unlisten = navigate((location, action) => {
    //         if (action === 'POP') {
    //             navigator.sendBeacon(${baseUrl}/api/zamkniecieStrony');
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

    // Handler for top Urlopy tab
    const handleTopUrlopyClick = () => {
        setMenu('Czas');
        setShowSubMenu(true);
        navigate('/home/urlopy');
    };

    return (
        <>
            <div className='flex flex-col min-h-screen overflow-x-auto'>
            <header className="w-full min-w-[1250px] bg-primary text-white p-2 pl-8 flex justify-between items-center">
                    <button
                        className="min-[1470px]:hidden text-white p-2"
                        onClick={toggleMobileMenu}
                    >
                        <MenuOutlined className='text-2xl' />
                    </button>
                    <h1 className="text-2xl font-bold">ECPP</h1>
                    <div className="flex items-center">
                        <span className="mr-4">{imie + ' ' + data} | Sesja: {formatSessionTime(sessionRemainingSeconds)}</span>
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
                            <>                                {accountType === 'Administrator' ? (
                                <>
                                    <ButtonLewy link="pracownik" nazwa='Pracownik' onClick={closeMobileMenu} isActive={location.pathname === '/home/pracownik'} />
                                    <ButtonLewy link="logowanie" nazwa='Logowanie' onClick={closeMobileMenu} isActive={location.pathname === '/home/logowanie'} />
                                    <ButtonLewy link="cennik" nazwa='Cennik' onClick={closeMobileMenu} isActive={location.pathname === '/home/cennik'} />
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
                                    <ButtonLewy link="kapownik" nazwa='Rozliczenie' onClick={closeMobileMenu} isActive={location.pathname === '/home/kapownik'} />
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
                                    {accountType === 'Administrator' && (
                                <ButtonLewy link="zaplanuj" nazwa='Zaplanuj Tydzień' onClick={closeMobileMenu} isActive={location.pathname === '/home/zaplanuj'} />
                                    )}
                                <ButtonLewy nazwa='Wyloguj' onClick={() => { handleLogout(); closeMobileMenu(); }} isActive={false} />
                                </>
                            )}
                        </div>
                        <div className='absolute bottom-10 left-[4.8rem]'>
                            <Link to='/home/pobierz'>
                                <DownloadOutlined className='text-3xl hover:text-white transition-all duration-500 ease-in-out'/>
                            </Link>
                        </div>
                    </nav>
                    <main className={`w-full min-w-[1250px]`}>
                        <GorneMenu setMenu={setMenu} activeMenu={menu} onUrlopyClick={handleTopUrlopyClick} />
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}