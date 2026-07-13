import React, { useState, useEffect } from 'react';
import { Table, notification } from 'antd';
import { Button } from 'primereact/button';
import Axios from 'axios';

export default function NieaktywniPage() {
    const [tableData, setTableData] = useState([]);
    const baseUrl = process.env.REACT_APP_BASE_URL;

    const columns = [
        {
            title: 'Imię',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Nazwisko',
            dataIndex: 'surname',
            key: 'surname',
        },
        {
            title: 'Pesel',
            dataIndex: 'pesel',
            key: 'pesel',
        },
        {
            title: 'Firma',
            dataIndex: 'company',
            key: 'company',
        },
        {
            title: 'E-mail',
            dataIndex: 'email',
            key: 'email',
            render: (text) => {
                const normalizedEmail = (text || '').toString().trim();
                if (!normalizedEmail) return '';
                return <a href={`mailto:${normalizedEmail}`}>{normalizedEmail}</a>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'accountStatus',
            key: 'accountStatus',
        },
        {
            title: 'Akcja',
            key: 'action',
            render: (_, record) => (
                <Button onClick={() => restoreUser(record.id)} className="bg-green-600 text-white p-1 mx-1">Przywróć</Button>
            ),
        },
    ];

    useEffect(() => {
        fetchInactiveUsers();
    }, []);

    const restoreUser = async (id) => {
        try {
            const response = await Axios.put(`${baseUrl}/api/pracownik/aktywuj/${id}`, {}, {
                withCredentials: true
            });

            if (response.status === 200) {
                notification.success({
                    message: 'Użytkownik przywrócony',
                    description: 'Pracownik został przywrócony do aktywnych.'
                });
                fetchInactiveUsers(); // odświeżenie tabeli
            }
        } catch (error) {
            console.error(error);
            notification.error({
                message: 'Błąd',
                description: 'Nie udało się przywrócić pracownika.'
            });
        }
    };

    const fetchInactiveUsers = async () => {
        try {
            const response = await Axios.get(`${baseUrl}/api/pracownicy`, {
                withCredentials: true,
            });

            const inactiveUsers = (response.data || []).filter(
                (item) => item.accountStatus === 'Nieaktywne'
            );

            if (inactiveUsers.length === 0) {
                notification.info({
                    message: 'Brak nieaktywnych pracowników',
                    description: 'Lista nieaktywnych pracowników jest pusta.',
                });
            }

            setTableData(inactiveUsers);
        } catch (error) {
            console.error(error);
            notification.error({
                message: 'Błąd',
                description: 'Nie udało się pobrać listy nieaktywnych pracowników.',
            });
        }
    };

    return (
        <div className="w-auto bg-gray-300 m-2 outline outline-1 outline-gray-500">
            <Table
                columns={columns}
                dataSource={tableData}
                rowKey="id"
                pagination={{ pageSize: 20 }}
            />
        </div>
    );
}
