import React, { useState, useEffect } from 'react';


export default function AmberBox({ children, style }) {
    return (
        <div className={`w-auto h-auto bg-amber-100 outline outline-1
                            outline-gray-500 flex flex-row items-center space-x-4 m-2 p-3 ${style}`}>
            {children}
        </div>
    )
}