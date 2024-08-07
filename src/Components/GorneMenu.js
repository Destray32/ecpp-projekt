import React from 'react';
import { Link } from 'react-router-dom';

/**
 * komponent górnego menu, wyświetlający "Pracownik", "Czas", "Plan tygodnia 'V'".
 * @example
 * return (
 *   <GorneMenu />
 * )
 */

export default function GorneMenu({ setMenu }) {
    return (
        <div className='bg-szary flex justify-center items-center'>
            <Link to="/home/pracownik" className='cursor-pointer w-full h-14 flex justify-center items-center hover:bg-hover-szary text-gray-700 hover:text-black' onClick={() => setMenu('Pracownik')}>
                Pracownik
            </Link>
            <Link to="/home/czas" className='cursor-pointer w-full h-14 flex justify-center items-center hover:bg-hover-szary text-gray-700 hover:text-black' onClick={() => setMenu('Czas')}>
                Czas
            </Link>
            <Link to="/home/plan" className='cursor-pointer w-full h-14 flex justify-center items-center hover:bg-hover-szary text-gray-700 hover:text-black' onClick={() => setMenu('PlanTygodnia')}>
                Plan tygodnia "V"
            </Link>
        </div>
    );

}