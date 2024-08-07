import React from 'react';
import { Outlet } from 'react-router-dom';
import GorneMenu from '../../../Components/GorneMenu';
import ButtonLewy from '../../../Components/ButtonLeweMenu';

export default function HomePage() {
    return (
        <>
            {/* Main layout using grid */}
            <div className='grid grid-cols-[250px_1fr] grid-rows-[auto_1fr] min-h-screen'>
                <header className="col-span-2 bg-primary text-white p-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">ECPP</h1>
                    <span> {/* Placeholder for user name and date */} </span>
                </header>
                <nav className="bg-primary p-4">
                    <div className="bg-white w-full h-[0.5px] my-4"></div>
                    <div className="space-y-2">
                        <ButtonLewy link={"czaspracy"} nazwa='Czas pracy' />
                        <ButtonLewy link={"administracja"} nazwa='Administracja' />
                        <ButtonLewy link={"tydzien"} nazwa='Tydzień' />
                        <ButtonLewy link={"raporty"} nazwa='Raporty' />
                        <ButtonLewy link={"sprawdzsamochod"} nazwa='Sprawdź samochód' />
                        <ButtonLewy nazwa='Wyloguj' />
                    </div>
                </nav>
                <main className=""> {/* Main content area */} 
                    <GorneMenu />
                    
                </main>
            </div>
        </>
    )
}
