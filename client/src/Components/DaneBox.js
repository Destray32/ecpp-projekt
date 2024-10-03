import React from 'react';

export default function DaneBox({children, name}) {
    return (
        <div className='w-full m-2'>
            <div className="w-auto h-auto p-3 bg-blue-800 outline outline-1 outline-gray-500 flex flex-row items-center">
                <h1 className='text-white'>{name}</h1>
            </div>
            <div className="w-auto h-auto min-h-[350px] p-8 bg-szary outline outline-1 outline-gray-500 flex flex-row justify-evenly items-center space-x-4">
                {children}
            </div>
        </div>
    )
}