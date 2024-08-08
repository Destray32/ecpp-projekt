import React from 'react';

export default function AmberBox({children}) {
    return (
        <div className="w-auto h-auto bg-amber-100 outline outline-1
                            outline-gray-500 flex flex-row items-center space-x-4">
            {children}
        </div>
    )
}