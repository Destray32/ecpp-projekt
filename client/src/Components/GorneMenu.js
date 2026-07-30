import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import checkUserType from '../utils/accTypeUtils';


/**
 * komponent górnego menu, wyświetlający "Pracownik", "Czas", "Plan tygodnia 'V'".
 * @example
 * return (
 *   <GorneMenu />
 * )
 */

export default function GorneMenu({ setMenu, activeMenu, onUrlopyClick }) {
    const [accountType, setAccountType] = useState('');

    useEffect(() => {
        const savedMenu = localStorage.getItem('selectedMenu');
        if (savedMenu) {
            setMenu(savedMenu);
        }
    }, [setMenu]);

    useEffect(() => {
        checkUserType(setAccountType);
    }, []);

    const handleMenuClick = (menu) => {
        setMenu(menu);
        localStorage.setItem('selectedMenu', menu);
    };

    const canAddProject = ['Administrator', 'Kierownik', 'Biuro'].includes(accountType);

    return (
        <div className='bg-szary flex justify-center items-center border-b'>
            <Link to="/home/pracownik" className={`cursor-pointer w-full h-12 flex justify-center items-center hover:bg-hover-szary transition-colors duration-300 border-r border-black 
                    ${activeMenu === 'Pracownik' ? 'bg-hover-szary text-black' : 'text-gray-700 hover:text-black'}`}  onClick={() => handleMenuClick('Pracownik')}>
                Pracownik
            </Link>
            <Link to="/home/czas" className={`cursor-pointer w-full h-12 flex justify-center items-center hover:bg-hover-szary transition-colors duration-300 border-r border-black
                    ${activeMenu === 'Czas' ? 'bg-hover-szary text-black' : 'text-gray-700 hover:text-black'}`} onClick={() => handleMenuClick('Czas')}>
                Czas Pracy
            </Link>
            {canAddProject && (
                <Link to="/home/nowy-projekt" className={`cursor-pointer w-full h-12 flex justify-center items-center hover:bg-hover-szary transition-colors duration-300 border-r border-black text-blue-900 bg-blue-50/40 font-semibold px-2 text-center text-sm`} onClick={() => handleMenuClick('Czas')}>
                    + Dodaj nowy projekt
                </Link>
            )}
            <Link to="/home/urlopy" className={`cursor-pointer w-full h-12 flex justify-center items-center hover:bg-hover-szary transition-colors duration-300 border-r border-black
                    ${activeMenu === 'Urlopy' ? 'bg-hover-szary text-black' : 'text-gray-700 hover:text-black'}`} onClick={onUrlopyClick ? onUrlopyClick : () => handleMenuClick('Urlopy')}>
                Urlopy
            </Link>
            <Link 
                to={accountType === 'Pracownik' ? '#' : '/home/plan'} 
                className={`cursor-pointer w-full h-12 flex justify-center items-center hover:bg-hover-szary transition-colors duration-300 
                            ${activeMenu === 'PlanTygodnia' ? 'bg-hover-szary text-black' : 'text-gray-700 hover:text-black'} 
                            ${accountType === 'Pracownik' ? 'pointer-events-none text-gray-400' : ''}`}
                onClick={accountType === 'Pracownik' ? (e) => e.preventDefault() : () => handleMenuClick('PlanTygodnia')}
            >
                Plan tygodnia "V"
            </Link>
        </div>
    );

}