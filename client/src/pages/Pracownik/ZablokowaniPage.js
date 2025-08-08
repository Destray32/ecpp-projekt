import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Modal, ConfigProvider, Select, Form, notification } from 'antd';
import { Button } from 'primereact/button';
import Axios from 'axios';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { getWeek } from 'date-fns';

export default function ZablokowaniPage() {

    const [tableData, setTableData] = useState([]);
    const baseUrl = process.env.REACT_APP_BASE_URL;

    const columns = [
        {
            title: 'Imię',
            dataIndex: 'name',
            key: 'name',
            render: text => <a>{text}</a>,
        },
        {
            title: 'Nazwisko',
            dataIndex: 'surname',
            key: 'surname',
        },
        {
            title: 'Tydzień ostrzeżenia',
            dataIndex: 'data_ostrzezenia',
            key: 'data_ostrzezenia',
            render: date => {
                const start = format(startOfWeek(new Date(date), { weekStartsOn: 1 }), 'dd.MM.yyyy');
                const end = format(endOfWeek(new Date(date), { weekStartsOn: 1 }), 'dd.MM.yyyy');
                const weekNumber = getWeek(new Date(date), { weekStartsOn: 1 });
                return `Tydzień ${weekNumber} (${start} - ${end})`;
            }
            ,
        },
        {
            title: 'Akcje',
            key: 'action',
            render: (text, record) => (
                <Button onClick={() => handleOdblokuj(record.id)} className="bg-red-500 text-white p-1 mx-1">Odblokuj</Button>
            ),
        },
    ]

    //#region useEffect
    useEffect(() => {
        fetchBlockedUsers();
    }, []);
    //#endregion

    //#region fetching
    const fetchBlockedUsers = async () => {
        try {
            const response = await Axios.get(`${baseUrl}/api/pracownik/blocked`, {
                withCredentials: true
            });

            if (response.status === 200) {
                setTableData(response.data);
                //console.log(response.data);
            }
        } catch (error) {
            if (error.response.status === 404) {
                notification.error({
                    message: 'Brak zablokowanych użytkowników',
                    description: 'Nie ma zablokowanych użytkowników w bazie danych'
                });
                setTableData([]);
            }
        }
    }
    //#endregion

    const handleOdblokuj = async (id) => {
        try {
            const response = await Axios.put(`${baseUrl}/api/pracownik/unblock/${id}`, {}, {
            withCredentials: true
            });

            if (response.status === 200) {
                notification.success({
                    message: 'Użytkownik odblokowany',
                    description: 'Użytkownik został odblokowany'
                });
                fetchBlockedUsers(); // refresh kolumn
            }
        } catch (error) {
            console.log(error);
            notification.error({
                message: 'Błąd',
                description: 'Coś poszło nie tak'
            });
        }
    }

    return (
        <div className="w-auto bg-gray-300 m-2 outline outline-1 outline-gray-500">
            <Table columns={columns} dataSource={tableData} />
        </div>
    )

}