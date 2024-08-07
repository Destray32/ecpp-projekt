import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import moment from 'moment';

import GorneMenu from '../Components/GorneMenu';
import ButtonLewy from '../Components/ButtonLeweMenu';

export default function HomePage() {
    const [data, setData] = useState([]);
    const [imie, setImie] = useState('placeholder');

    useEffect(() => { // useEffect ze względu na to żeby tata się zmieniała w razie potrzeby
        // moment.locale('pl'); // nie wiem jeszcze czy potrzebna jest data polska czy szwedzka

        const timer = setInterval(() => {
            setData(moment().format('DD/MM/YYYY'));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
            {/* to jest głowny layout w gridzie */}
            <div className='grid grid-cols-[250px_1fr] grid-rows-[auto_1fr] min-h-screen'>
                <header class="col-span-2 bg-primary text-white p-4 flex justify-between items-center">
                    <h1 class="text-2xl font-bold">ECPP</h1>
                    <span>{imie + '  ' + data}</span> {/* imie i data */}
                </header>
                <nav class="bg-primary p-4">
                    <div class="bg-white w-full h-[0.5px] my-4"></div>
                    <div class="space-y-2">
                        <ButtonLewy link={"pracownik"} nazwa='Pracownik' />
                        <ButtonLewy link={"podzial"} nazwa='Podział' />
                        <ButtonLewy link={"logowanie"} nazwa='Logowanie' />
                        <ButtonLewy link={"administracja"} nazwa='Administracja' />
                        <ButtonLewy nazwa='Wyloguj' />
                    </div>
                </nav>
                <main class=""> {/* to jest główna treść, ten biały box na stronie */}
                    <GorneMenu />
                    <Outlet />
                </main>
            </div>
        </>
    )
}