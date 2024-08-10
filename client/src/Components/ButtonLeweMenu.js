import React from 'react';
import { Link } from 'react-router-dom';

export default function ButtonLewy({ nazwa, link, onClick }) {
    return (
        <Link 
            to={link}
            onClick={onClick}
            className="block bg-blue-300 p-2 rounded cursor-pointer hover:bg-blue-200 transition duration-300 text-center">
            {nazwa}
        </Link>
    );
}
