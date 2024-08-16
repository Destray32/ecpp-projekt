import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Radio, Select, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function OgloszeniaPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [radioValue, setRadioValue] = useState('grupy');
    const [ogloszenia, setOgloszenia] = useState([]);
    const [pracownicy, setPracownicy] = useState([]);
    const [grupy, setGrupy] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchOgloszenia();
        fetchPracownicy();
        fetchGrupy();
    }, []);

    const fetchOgloszenia = () => {
        axios.get('http://localhost:5000/api/ogloszenia')
            .then((response) => {
                const ogloszenia = response.data.map(ogloszenie => ({
                    id: ogloszenie.idOgloszenia,
                    tytul: ogloszenie.Tytul,
                    tresc: ogloszenie.Wiadomosc,
                    grupa: ogloszenie.Zleceniodawca ? [ogloszenie.Zleceniodawca] : [],
                    osoby: ogloszenie.Pracownik_idPracownik || [],
                }));
                setOgloszenia(ogloszenia);
            })
            .catch((error) => {
                console.error('Błąd pobierania ogłoszeń:', error);
            });
    };

    const fetchPracownicy = () => {
        axios.get('http://localhost:5000/api/ogloszenia/pracownicy')
            .then((response) => {
                setPracownicy(response.data);
            })
            .catch((error) => {
                console.error('Błąd pobierania pracowników:', error);
            });
    };

    const fetchGrupy = () => {
        axios.get('http://localhost:5000/api/ogloszenia/grupy')
            .then((response) => {
                setGrupy(response.data);
            })
            .catch((error) => {
                console.error('Błąd pobierania grup urlopowych:', error);
            });
    };

    const showModal = () => {
        form.setFieldsValue({
            do: 'grupy',
            grupa: [],
            osoby: [],
            tytul: '',
            tresc: '',
        });
        setRadioValue('grupy');
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            const postData = {
                tytul: values.tytul,
                tresc: values.tresc,
                grupa: values.grupa || [],
                osoby: values.osoby || []
            };

            axios.post('http://localhost:5000/api/ogloszenia', postData)
                .then(() => {
                    fetchOgloszenia();
                    setIsModalOpen(false);
                    form.resetFields();
                })
                .catch((error) => {
                    console.error('Błąd dodawania ogłoszenia:', error);
                });
        }).catch((errorInfo) => {
            console.log('Validation Failed:', errorInfo);
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleRadioChange = (e) => {
        setRadioValue(e.target.value);
    };

    const showDeleteConfirm = (id) => {
        setItemToDelete(id);
        setConfirmDeleteVisible(true);
    };

    const handleDeleteOk = () => {
        if (itemToDelete) {
            axios.delete(`http://localhost:5000/api/ogloszenia/${itemToDelete}`)
                .then(() => {
                    fetchOgloszenia();
                    setConfirmDeleteVisible(false);
                })
                .catch((error) => {
                    console.error('Błąd usuwania ogłoszenia:', error);
                });
        }
    };

    const handleDeleteCancel = () => {
        setConfirmDeleteVisible(false);
    };

    return (
        <div className='w-full h-auto flex flex-col items-start justify-start p-2'>
            <div className='w-full h-15 flex flex-row items-start justify-between bg-amber-100 outline outline-1 outline-gray-500 p-2'>
                <h1 className='text-2xl'>Ogłoszenia</h1>
                <Button type='primary' onClick={showModal}>Dodaj ogłoszenie</Button>
                <Modal title='Dodaj ogłoszenie' open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                    <Form form={form}>
                        <Form.Item label='Do' name='do'>
                            <Radio.Group onChange={handleRadioChange} value={radioValue}>
                                <Radio value='grupy'>Grupy</Radio>
                                <Radio value='osoby'>Osoby</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {radioValue === 'grupy' && (
                            <Form.Item label='Wybierz grupę' name='grupa'>
                                <Select>
                                    {grupy.map(grupa => (
                                        <Select.Option key={grupa.idGrupa_urlopowa} value={grupa.idGrupa_urlopowa}>
                                            {grupa.Zleceniodawca}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                        {radioValue === 'osoby' && (
                            <Form.Item label='Wybierz osoby' name='osoby'>
                                <Select mode='multiple'>
                                    {pracownicy.map(pracownik => (
                                        <Select.Option key={pracownik.idPracownik} value={pracownik.idPracownik}>
                                            {`${pracownik.Nazwa_uzytkownika}`}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                        <Form.Item label='Tytuł' name='tytul' rules={[{ required: true, message: 'Proszę wpisać tytuł' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label='Treść' name='tresc' rules={[{ required: true, message: 'Proszę wpisać treść' }]}>
                            <Input.TextArea />
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title='Potwierdzenie usunięcia'
                    open={confirmDeleteVisible}
                    onOk={handleDeleteOk}
                    onCancel={handleDeleteCancel}
                    okText='Usuń'
                    cancelText='Anuluj'
                >
                    <p>Czy na pewno chcesz usunąć to ogłoszenie?</p>
                </Modal>
            </div>
            <div className='w-full mt-4'>
                {ogloszenia.length > 0 ? (
                    ogloszenia.map((ogloszenie) => (
                        <div key={ogloszenie.id} className='w-auto p-2 border-b border-gray-300 relative'>
                            <CloseOutlined className='text-red-600 text-2xl absolute top-2 right-2 cursor-pointer' onClick={() => showDeleteConfirm(ogloszenie.id)} />
                            <h2 className='text-xl font-bold'>{ogloszenie.tytul}</h2>
                            <p className='break-all'>{ogloszenie.tresc}</p>
                            <p className='text-gray-600'>
                                <strong>Do:</strong> Grupa: {ogloszenie.grupa.length > 0 ? ogloszenie.grupa.join(', ') : 'Brak'} Osoby: {ogloszenie.osoby.length > 0 ? ogloszenie.osoby.join(', ') : 'Brak'}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>Brak ogłoszeń.</p>
                )}
            </div>
        </div>
    );
}