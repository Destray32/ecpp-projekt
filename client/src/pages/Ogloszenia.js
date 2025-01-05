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
    const [accountType, setAccountType] = useState(null);
    const [openAnnouncementId, setOpenAnnouncementId] = useState(null);

    useEffect(() => {
        fetchUserAccountType();
        fetchOgloszenia();
        fetchPracownicy();
        fetchGrupy();
    }, []);

    const fetchUserAccountType = () => {
        axios.get(`https://api-service-ecpp.onrender.com/api/imie`, { withCredentials: true })
            .then(response => {
                setAccountType(response.data.accountType);
            })
            .catch(error => {
                console.error('Error fetching user account type:', error);
            });
    };

    const fetchOgloszenia = () => {
        axios.get(`https://api-service-ecpp.onrender.com/api/ogloszenia`, { withCredentials: true })
            .then((response) => {
                const ogloszenia = response.data.map(ogloszenie => ({
                    id: ogloszenie.idOgloszenia,
                    tytul: ogloszenie.Tytul,
                    tresc: ogloszenie.Wiadomosc,
                    grupa: ogloszenie.Zleceniodawca ? [ogloszenie.Zleceniodawca] : [],
                    osoby: ogloszenie.Pracownik_idPracownik || [],
                    przeczytane: ogloszenie.Przeczytane
                }));
                setOgloszenia(ogloszenia);
            })
            .catch((error) => {
                console.error('Błąd pobierania ogłoszeń:', error);
            });
    };

    const fetchPracownicy = () => {
        axios.get(`https://api-service-ecpp.onrender.com/api/ogloszenia/pracownicy`, { withCredentials: true })
            .then((response) => {
                setPracownicy(response.data);
            })
            .catch((error) => {
                console.error('Błąd pobierania pracowników:', error);
            });
    };

    const fetchGrupy = () => {
        axios.get(`https://api-service-ecpp.onrender.com/api/ogloszenia/grupy`, { withCredentials: true })
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

            axios.post(`https://api-service-ecpp.onrender.com/api/ogloszenia`, postData, { withCredentials: true })
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
            axios.delete(`https://api-service-ecpp.onrender.com/api/ogloszenia/${itemToDelete}`, { withCredentials: true })
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

    const markAsRead = (announcementId) => {
        axios.post(`https://api-service-ecpp.onrender.com/api/ogloszenia/przeczytane`, { idOgloszenia: announcementId }, { withCredentials: true })
          .then(response => {
            if (response.status === 200) {
              fetchOgloszenia();
            }
          })
          .catch(error => {
            console.error('Error marking announcement as read:', error);
          });
      };

    const toggleAnnouncementDetails = (id) => {
        setOpenAnnouncementId(openAnnouncementId === id ? null : id);
        const announcement = ogloszenia.find(ogloszenie => ogloszenie.id === id);
        if (!announcement.przeczytane) {
            markAsRead(id);
        }
    };

    return (
        <div className='w-full h-auto flex flex-col items-start justify-start p-2'>
            <div className='w-full h-15 flex flex-row items-start justify-between bg-amber-100 outline outline-1 outline-gray-500 p-2'>
                <h1 className='text-2xl'>Ogłoszenia</h1>
                    {accountType === 'Administrator' || accountType === 'Majster' ? (
                        <Button type='primary' onClick={showModal}>Dodaj ogłoszenie</Button>
                    ) : null}
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
                                            {`${pracownik.Imie} ${pracownik.Nazwisko}`}
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
                        <div key={ogloszenie.id} className={`w-auto p-2 border-b border-gray-300 relative ${ogloszenie.przeczytane ? '' : 'bg-orange-100'}`}>
                            <h2
                                className='text-xl font-bold cursor-pointer'
                                onClick={() => toggleAnnouncementDetails(ogloszenie.id)}
                            >
                                {ogloszenie.tytul}
                            </h2>
                            {openAnnouncementId === ogloszenie.id && (
                                <div>
                                    <p className='break-all'>{ogloszenie.tresc}</p>
                                    <p className='text-gray-600'>
                                        <strong>Do:</strong> {ogloszenie.grupa.length > 0 ? ogloszenie.grupa.join(', ') : 'Brak'} | {ogloszenie.osoby.length > 0 ? ogloszenie.osoby.join(', ') : 'Brak'}
                                    </p>
                                    {accountType === 'Administrator' || accountType === 'Majster' ? (
                                        <CloseOutlined className='text-red-600 text-2xl absolute top-2 right-2 cursor-pointer' onClick={() => showDeleteConfirm(ogloszenie.id)} />
                                    ) : null}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Brak ogłoszeń.</p>
                )}
            </div>
        </div>
    );
}