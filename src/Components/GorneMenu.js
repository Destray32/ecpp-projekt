import React from 'react';
import { Link } from 'react-router-dom';

/**
 * komponent górnego menu, wyświetlający "Pracownik", "Czas", "Plan tygodnia 'V'".
 * @example
 * return (
 *   <GorneMenu />
 * )
 */

export default function GorneMenu() {
    return (
        <div className='bg-szary flex justify-around items-center p-4'>
            <Link to="/home/pracownik" className='cursor-pointer text-gray-700 hover:text-black'>
                Pracownik
            </Link>
            <Link to="/czas" className='cursor-pointer text-gray-700 hover:text-black'>
                Czas
            </Link>
            <Link to="/plan" className='cursor-pointer text-gray-700 hover:text-black'>
                Plan tygodnia "V"
            </Link>
        </div>
    );

}