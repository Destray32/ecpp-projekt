import React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * komponent górnego menu, wyświetlający "Pracownik", "Czas", "Plan tygodnia 'V'".
 * @example
 * return (
 *   <GorneMenu />
 * )
 */

export default function GorneMenu({ setMenu, activeMenu }) {

    useEffect(() => {
        const savedMenu = localStorage.getItem('selectedMenu');
        if (savedMenu) {
            setMenu(savedMenu);
        }
    }, [setMenu]);

    const handleMenuClick = (menu) => {
        setMenu(menu);
        localStorage.setItem('selectedMenu', menu);
    };

    return (
        <div className='bg-szary flex justify-center items-center'>
            <Link to="/home/pracownik" className={`cursor-pointer w-full h-12 flex justify-center items-center hover:bg-hover-szary transition-colors duration-300 
                    ${activeMenu === 'Pracownik' ? 'bg-hover-szary text-black' : 'text-gray-700 hover:text-black'}`}  onClick={() => handleMenuClick('Pracownik')}>
                Pracownik
            </Link>
            <Link to="/home/czas" className={`cursor-pointer w-full h-12 flex justify-center items-center hover:bg-hover-szary transition-colors duration-300 
                    ${activeMenu === 'Czas' ? 'bg-hover-szary text-black' : 'text-gray-700 hover:text-black'}`} onClick={() => handleMenuClick('Czas')}>
                Czas
            </Link>
            <Link to="/home/plan" className={`cursor-pointer w-full h-12 flex justify-center items-center hover:bg-hover-szary transition-colors duration-300 
                    ${activeMenu === 'PlanTygodnia' ? 'bg-hover-szary text-black' : 'text-gray-700 hover:text-black'}`} onClick={() => handleMenuClick('PlanTygodnia')}>
                Plan tygodnia "V"
            </Link>
        </div>
    );

}