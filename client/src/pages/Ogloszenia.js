import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Radio, Select, Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function OgloszeniaPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [radioValue, setRadioValue] = useState('grupy');
    const [ogloszenia, setOgloszenia] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        axios.get('http://localhost:5000/api/ogloszenia')
            .then((response) => {
                setOgloszenia(response.data);
            })
            .catch((error) => {
                console.error('Błąd pobierania ogłoszeń:', error);
            });
    }
    , []);

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
            setOgloszenia([...ogloszenia, values]);
            setIsModalOpen(false);
            form.resetFields();
        }).catch((errorInfo) => {
            console.log('Validation Failed:', errorInfo);
        });
    }

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    }

    const handleRadioChange = (e) => {
        setRadioValue(e.target.value);
    }

    const deleteOgloszenie = (indexToDelete) => {
        axios.delete(`http://localhost:5000/api/ogloszenia/${indexToDelete}`)
            .then(() => {
                setOgloszenia(ogloszenia.filter((_, index) => index !== indexToDelete));
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
                                    <Select.Option value="grupa1">Grupa 1</Select.Option>
                                    <Select.Option value="grupa2">Grupa 2</Select.Option>
                                    <Select.Option value="grupa3">Grupa 3</Select.Option>
                                </Select>
                            </Form.Item>
                        )}

                        {radioValue === 'osoby' && (
                            <Form.Item label='Wybierz osoby' name='osoby'>
                                <Select mode='multiple'>
                                    <Select.Option value="osoba1">Osoba 1</Select.Option>
                                    <Select.Option value="osoba2">Osoba 2</Select.Option>
                                    <Select.Option value="osoba3">Osoba 3</Select.Option>
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
                        <div key={index} className='w-auto p-2 border-b border-gray-300 relative'>
                            <CloseOutlined className='text-red-600 text-2xl absolute top-2 right-2 cursor-pointer' onClick={() => deleteOgloszenie(index)} />
                            <h2 className='text-xl font-bold'>{ogloszenie.tytul}</h2>
                            <p className='break-all'>{ogloszenie.tresc}</p>
                            <p className='text-gray-600'>
                                <strong>Do:</strong> {ogloszenie.do === 'grupy' ? `Grupa: ${ogloszenie.grupa}` : `Osoby: ${ogloszenie.osoby.join(', ')}`}
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