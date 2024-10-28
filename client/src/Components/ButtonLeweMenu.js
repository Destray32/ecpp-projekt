import React from 'react';
import { Link } from 'react-router-dom';

export default function ButtonLewy({ nazwa, link, onClick, isActive }) {
    return (
        <Link 
            to={link}
            onClick={onClick}
            className={`block p-2 rounded cursor-pointer text-center transition duration-300 ${isActive ? 'bg-blue-500 text-white' : 'bg-blue-300 hover:bg-blue-200'}`} >
            {nazwa}
        </Link>
    );
}