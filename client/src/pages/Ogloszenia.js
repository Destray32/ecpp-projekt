import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Radio, Select, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function OgloszeniaPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [radioValue, setRadioValue] = useState('grupy');
    const [ogloszenia, setOgloszenia] = useState([]);
    const [pracownicy, setPracownicy] = useState([]);
    const [grupy, setGrupy] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        axios.get('http://localhost:5000/api/ogloszenia')
            .then((response) => {
                const ogloszenia = response.data.map(ogloszenie => ({
                    id: ogloszenie.idOgloszenia,
                    tytul: ogloszenie.Tytul,
                    tresc: ogloszenie.Wiadomosc,
                    grupa: ogloszenie.Grupa_urlopowa_idGrupa_urlopowa ? [ogloszenie.Grupa_urlopowa_idGrupa_urlopowa] : undefined,
                    osoby: ogloszenie.Pracownik_idPracownik ? [ogloszenie.Pracownik_idPracownik] : [],
                }));
                setOgloszenia(ogloszenia);
            })
            .catch((error) => {
                console.error('Błąd pobierania ogłoszeń:', error);
            });

        axios.get('http://localhost:5000/api/ogloszenia/pracownicy')
            .then((response) => {
                setPracownicy(response.data);
            })
            .catch((error) => {
                console.error('Błąd pobierania pracowników:', error);
            });

        axios.get('http://localhost:5000/api/ogloszenia/grupy')
            .then((response) => {
                setGrupy(response.data);
            })
            .catch((error) => {
                console.error('Błąd pobierania grup urlopowych:', error);
            });
    }, []);

    const showModal = () => {
        form.setFieldsValue({
            do: 'grupy',
            grupa: undefined,
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
                    setOgloszenia([...ogloszenia, postData]);
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

    const deleteOgloszenie = (indexToDelete) => {
        axios.delete(`http://localhost:5000/api/ogloszenia/${indexToDelete}`)
            .then(() => {
                setOgloszenia(ogloszenia.filter((ogloszenie) => ogloszenie.id !== indexToDelete));
            })

            .catch((error) => {
                console.error('Błąd usuwania ogłoszenia:', error);
            });
    }

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
                                <Select mode="multiple">
                                    {grupy.map(grupa => (
                                        <Select.Option key={grupa.idGrupa_urlopowa} value={grupa.idGrupa_urlopowa}>
                                            {grupa.Grupa_urlopowacol}
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
            </div>
            <div className='w-full mt-4'>
                {ogloszenia.length > 0 ? (
                    ogloszenia.map((ogloszenie, index) => (
                        <div key={ogloszenie.id} className='w-auto p-2 border-b border-gray-300 relative'>
                            <CloseOutlined className='text-red-600 text-2xl absolute top-2 right-2 cursor-pointer' onClick={() => deleteOgloszenie(ogloszenie.id)} />
                            <h2 className='text-xl font-bold'>{ogloszenie.tytul}</h2>
                            <p className='break-all'>{ogloszenie.tresc}</p>
                            <p className='text-gray-600'>
                                <strong>Do:</strong> Grupa: {ogloszenie.grupa ? ogloszenie.grupa.join(', ') : 'Brak'} Osoby: {ogloszenie.osoby ? ogloszenie.osoby.join(', ') : 'Brak'}
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