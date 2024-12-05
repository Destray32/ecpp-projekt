// Pobierz.js
import React, { useEffect } from 'react';
import Axios from 'axios';

export default function PobierzSkrypt() {

    const pobierzSkrypt = async () => {
        try {
            const response = await Axios.get('http://47.76.209.242:5000/api/home/pobierz', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'skrot.bat');
            document.body.appendChild(link);
            link.click();
            link.remove();

            // window.location.href = 'http://localhost:3000/home/czas';
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    }

    useEffect(() => {
        pobierzSkrypt();
    }, []);

    return (
        <div></div>
    );
}