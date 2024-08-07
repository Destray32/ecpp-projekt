import React from 'react';

/**
 * komponent górnego menu, wyświetlający "Pracownik", "Czas", "Plan tygodnia 'V'".
 * @example
 * return (
 *   <GorneMenu />
 * )
 */

export default function GorneMenu() {
    return (
        <div className='bg-szary flex justify-around items-center p-4
         '>
            <div className='cursor-pointer text-gray-700 hover:text-black'>Pracownik</div>
            <div className='cursor-pointer text-gray-700 hover:text-black'>Czas</div>
            <div className='cursor-pointer text-gray-700 hover:text-black'>Plan tygodnia "V"</div>
        </div>
    )

}