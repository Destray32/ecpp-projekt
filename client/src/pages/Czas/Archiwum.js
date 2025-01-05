import React, { useState, useEffect } from 'react';
import { Segmented, Table, Button } from 'antd';
import axios from 'axios';

export default function ArchiwumPage() {
    const [selectedOption, setSelectedOption] = useState('Pracownicy');
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, [selectedOption]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`https://api-service-ecpp.onrender.com/api/czas/archiwum/${selectedOption}`, { withCredentials: true });
            setData(response.data);
            console.log('Data:', response.data);
        }
        catch (error) {
            console.error(error);
        }
    };

    const handleActionClick = async (record) => {
        try {
            await axios.post(`https://api-service-ecpp.onrender.com/api/czas/archiwum/przywroc`, {
                tableName: selectedOption,
                recordId: record.idPracownik || record.idFirma || record.idProjekty || record.idPojazdy || record.idGrupa_urlopowa
            }, { withCredentials: true });
            fetchData();
        } catch (error) {
            console.error('Failed to restore record:', error);
        }
    };

    const columns = {
        'Pracownicy': [
            { title: 'ID', dataIndex: 'idPracownik', key: 'idPracownik' },
            { title: 'Nazwa Użytkownika', dataIndex: 'Nazwa_uzytkownika', key: 'Nazwa_uzytkownika' },
            { title: 'Imię', dataIndex: 'Imie', key: 'Imie' },
            { title: 'Nazwisko', dataIndex: 'Nazwisko', key: 'Nazwisko' },
            {
                title: 'Akcja',
                key: 'action',
                render: (text, record) => (
                    <Button onClick={() => handleActionClick(record)}>Przywróć</Button>
                ),
            },
        ],
        'Firmy': [
            { title: 'ID', dataIndex: 'idFirma', key: 'idFirma' },
            { title: 'Nazwa Firmy', dataIndex: 'Nazwa_firmy', key: 'Nazwa_firmy' },
            { title: 'Właściciel Firmy', dataIndex: 'Wlasciciel_firmy', key: 'Wlasciciel_firmy' },
            { title: 'Liczba Pracowników', dataIndex: 'Liczba_pracownikow', key: 'Liczba_pracownikow' },
            {
                title: 'Akcja',
                key: 'action',
                render: (text, record) => (
                    <Button onClick={() => handleActionClick(record)}>Przywróć</Button>
                ),
            },
        ],
        'Projekty': [
            { title: 'ID', dataIndex: 'idProjekty', key: 'idProjekty' },
            { title: 'Firma', dataIndex: 'Firma', key: 'Firma' },
            { title: 'Zleceniodawca', dataIndex: 'Zleceniodawca', key: 'Zleceniodawca' },
            { title: 'Nazwa Projektu', dataIndex: 'NazwaKod_Projektu', key: 'NazwaKod_Projektu' },
            {
                title: 'Akcja',
                key: 'action',
                render: (text, record) => (
                    <Button onClick={() => handleActionClick(record)}>Przywróć</Button>
                ),
            },
        ],
        'Pojazdy': [
            { title: 'ID', dataIndex: 'idPojazdy', key: 'idPojazdy' },
            { title: 'Marka', dataIndex: 'Marka', key: 'Marka' },
            { title: 'Nr Rejestracyjny', dataIndex: 'Nr_rejestracyjny', key: 'Nr_rejestracyjny' },
            { title: 'Uwagi', dataIndex: 'Uwagi', key: 'Uwagi' },
            {
                title: 'Akcja',
                key: 'action',
                render: (text, record) => (
                    <Button onClick={() => handleActionClick(record)}>Przywróć</Button>
                ),
            },
        ],
        'Grupy Urlopowe': [
            { title: 'ID', dataIndex: 'idGrupa_urlopowa', key: 'idGrupa_urlopowa' },
            { title: 'Zleceniodawca', dataIndex: 'Zleceniodawca', key: 'Zleceniodawca' },
            { title: 'Cennik', dataIndex: 'Cennik', key: 'Cennik' },
            { title: 'Stawka', dataIndex: 'Stawka', key: 'Stawka' },
            {
                title: 'Akcja',
                key: 'action',
                render: (text, record) => (
                    <Button onClick={() => handleActionClick(record)}>Przywróć</Button>
                ),
            },
        ]
    };

    return (
        <div className='flex flex-col items-center p-4'>
            <div className='w-full flex justify-center mb-4'>
                <Segmented size='large'
                    options={['Pracownicy', 'Firmy', 'Projekty', 'Pojazdy', 'Grupy Urlopowe']}
                    onChange={setSelectedOption}
                    value={selectedOption}
                />
            </div>
            <Table
                columns={columns[selectedOption]}
                dataSource={data}
                rowKey={(record) => record.idPracownik || record.idFirma || record.idProjekty || record.idPojazdy || record.idGrupa_urlopowa}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
}