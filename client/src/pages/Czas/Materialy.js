import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AmberBox from '../../Components/AmberBox';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import { message } from 'antd';
import Axios from 'axios';

addLocale('pl-materialy-v2', {
    firstDayOfWeek: 1,
    dayNames: ['niedziela', 'poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek', 'sobota'],
    dayNamesShort: ['ndz', 'pon', 'wt', 'sro', 'czw', 'pt', 'sob'],
    dayNamesMin: ['N', 'P', 'W', 'S', 'C', 'P', 'S'],
    monthNames: ['Styczen', 'Luty', 'Marzec', 'Kwiecien', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpien', 'Wrzesien', 'Pazdziernik', 'Listopad', 'Grudzien'],
    monthNamesShort: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paz', 'lis', 'gru'],
    weekHeader: 'V',
    today: 'Dzisiaj',
    clear: 'Wyczysc'
});

export default function MateriialyPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [projektName, setProjektName] = useState('');
    const [zleceniodawcaName, setZleceniodawcaName] = useState('');
    const [materialy, setMaterialy] = useState([]);
    const [editingMaterialId, setEditingMaterialId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nazwafaktury: '',
        data: '',
        koszty: '',
        opis: ''
    });
    const baseUrl = process.env.REACT_APP_BASE_URL;

    const normalizeDateOnly = (value) => {
        if (!value) return '';
        const raw = String(value).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
        if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.slice(0, 10);
        const parsed = new Date(raw);
        if (Number.isNaN(parsed.getTime())) return '';
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        fetchProjektName();
        fetchMaterialy();
    }, [id]);

    const fetchProjektName = async () => {
        try {
            const response = await Axios.get(`${baseUrl}/api/czas/projekty/${id}`, {
                withCredentials: true
            });
            if (Array.isArray(response.data) && response.data.length > 0) {
                setProjektName(response.data[0].NazwaKod_Projektu || '');
                setZleceniodawcaName(response.data[0].Zleceniodawca || '');
            }
        } catch (error) {
            console.error('Błąd pobierania nazwy projektu:', error);
            message.error('Nie udało się pobrać nazwy projektu');
        }
    };

    const fetchMaterialy = async () => {
        try {
            setLoading(true);
            const response = await Axios.get(`${baseUrl}/api/czas/materialy/${id}`, {
                withCredentials: true
            });
            if (response.data && Array.isArray(response.data.materialy)) {
                setMaterialy(response.data.materialy);
            }
        } catch (error) {
            console.error('Błąd pobierania materiałów:', error);
            message.error('Nie udało się pobrać materiałów');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const parseIsoDate = (value) => {
        if (!value) return null;
        const [year, month, day] = String(value).split('-').map(Number);
        if (!year || !month || !day) return null;
        return new Date(year, month - 1, day);
    };

    const formatIsoDate = (dateValue) => {
        if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) return '';
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getIsoWeekNumber = (dateValue) => {
        if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) return null;
        const date = new Date(Date.UTC(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate()));
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    };

    const handleSaveMaterial = async () => {
        if (!formData.nazwafaktury || !formData.data || !formData.koszty) {
            message.warning('Wypełnij wszystkie pola');
            return;
        }

        try {
            const response = await Axios.post(
                `${baseUrl}/api/czas/materialy/${id}`,
                {
                    materialId: editingMaterialId,
                    nazwafaktury: formData.nazwafaktury,
                    data: formData.data,
                    koszty: parseFloat(formData.koszty),
                    opis: formData.opis || ''
                },
                { withCredentials: true }
            );

            if (response.data && response.data.success) {
                message.success(editingMaterialId ? 'Faktura zaktualizowana pomyślnie' : 'Faktura zapisana pomyślnie');
                setFormData({
                    nazwafaktury: '',
                    data: '',
                    koszty: '',
                    opis: ''
                });
                setEditingMaterialId(null);
                fetchMaterialy();
            }
        } catch (error) {
            console.error('Błąd zapisu faktury:', error);
            message.error('Nie udało się zapisać faktury');
        }
    };

    const handleEditMaterial = (item) => {
        setEditingMaterialId(item.id);
        setFormData({
            nazwafaktury: item.NazwaFaktury || '',
            data: normalizeDateOnly(item.Data),
            koszty: item.Koszty ?? '',
            opis: item.Opis || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingMaterialId(null);
        setFormData({
            nazwafaktury: '',
            data: '',
            koszty: '',
            opis: ''
        });
    };

    const handleDeleteMaterial = async (materialId) => {
        try {
            const response = await Axios.delete(`${baseUrl}/api/czas/materialy/${id}/${materialId}`, {
                withCredentials: true
            });

            if (response.data?.success) {
                message.success('Faktura usunięta pomyślnie');

                if (editingMaterialId === materialId) {
                    handleCancelEdit();
                }

                fetchMaterialy();
            }
        } catch (error) {
            console.error('Błąd usuwania faktury:', error);
            message.error('Nie udało się usunąć faktury');
        }
    };

    const handleGoBack = () => {
        navigate('/home/projekty');
    };

    return (
        <div className="p-4 md:p-6">
            <div className="mx-auto w-full max-w-4xl">
                <AmberBox>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
                        <button
                            type="button"
                            onClick={handleGoBack}
                            className="inline-flex items-center gap-2 self-start rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
                        >
                            <span aria-hidden="true">&larr;</span>
                            Wróć do projektów
                        </button>

                        <h1 className="text-xl font-semibold tracking-tight text-gray-900 md:text-2xl">
                            Projekt: {projektName || 'Brak nazwy projektu'}{zleceniodawcaName ? ` - ${zleceniodawcaName}` : ''}
                        </h1>
                    </div>
                </AmberBox>

                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-6 flex flex-col gap-1">
                        <h2 className="text-xl font-semibold text-gray-900">Faktura materiałowa</h2>
                        <p className="text-sm text-gray-500">Dodaj jedną lub wiele faktur przypisanych do projektu.</p>
                    </div>

                    {loading ? (
                        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">Ładowanie danych faktury...</div>
                    ) : (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Nazwa faktury</label>
                                    <input
                                        type="text"
                                        name="nazwafaktury"
                                        value={formData.nazwafaktury}
                                        onChange={handleInputChange}
                                        placeholder="f1231231"
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Data</label>
                                    <Calendar
                                        value={parseIsoDate(formData.data)}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                data: formatIsoDate(e.value),
                                            }));
                                        }}
                                        locale="pl-materialy-v2"
                                        dateFormat="dd.mm.yy"
                                        showWeek
                                        weekHeader="V"
                                        showIcon={false}
                                        className="w-full"
                                        panelClassName="materialy-kalendarz-panel"
                                        inputClassName="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500"
                                    />
                                    {parseIsoDate(formData.data) && (
                                        <p className="mt-1 text-[11px] text-gray-500">
                                            Tydzien: <span className="font-semibold text-blue-700">V{getIsoWeekNumber(parseIsoDate(formData.data))}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Koszty</label>
                                    <input
                                        type="number"
                                        name="koszty"
                                        value={formData.koszty}
                                        onChange={handleInputChange}
                                        placeholder="0,00"
                                        step="0.01"
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Opis</label>
                                <textarea
                                    name="opis"
                                    value={formData.opis}
                                    onChange={handleInputChange}
                                    placeholder="Krótki opis faktury"
                                    rows={5}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-end pt-2">
                                {editingMaterialId && (
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="mr-2 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
                                    >
                                        Anuluj edycję
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleSaveMaterial}
                                    className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                                >
                                    <span aria-hidden="true">&#10003;</span>
                                    {editingMaterialId ? 'Zapisz zmiany' : 'Zapisz'}
                                </button>
                            </div>

                            <div className="pt-4">
                                <h3 className="mb-3 text-base font-semibold text-gray-800">Lista faktur</h3>
                                {materialy.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">
                                        Brak zapisanych faktur dla tego projektu.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Nazwa faktury</th>
                                                    <th className="px-3 py-2 text-left">Data</th>
                                                    <th className="px-3 py-2 text-right">Koszty</th>
                                                    <th className="px-3 py-2 text-left">Opis</th>
                                                    <th className="px-3 py-2 text-right">Akcje</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {materialy.map((item) => (
                                                    <tr key={item.id} className="border-t border-gray-200 odd:bg-white even:bg-gray-50">
                                                        <td className="px-3 py-2">{item.NazwaFaktury || '-'}</td>
                                                        <td className="px-3 py-2">{normalizeDateOnly(item.Data) || '-'}</td>
                                                        <td className="px-3 py-2 text-right">{Number(item.Koszty || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td className="px-3 py-2">{item.Opis || '-'}</td>
                                                        <td className="px-3 py-2 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditMaterial(item)}
                                                                className="mr-2 rounded border border-blue-600 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                                            >
                                                                Edytuj
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteMaterial(item.id)}
                                                                className="rounded border border-red-600 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                                                            >
                                                                Usuń
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .materialy-kalendarz-panel {
                    font-size: 14.5px !important;
                    min-width: 20rem !important;
                    width: 20rem !important;
                }

                .materialy-kalendarz-panel .p-datepicker-header {
                    padding: 0.35rem 0.52rem !important;
                }

                .materialy-kalendarz-panel .p-datepicker-title {
                    font-size: 0.94rem !important;
                }

                .materialy-kalendarz-panel .p-datepicker-prev,
                .materialy-kalendarz-panel .p-datepicker-next {
                    width: 2rem !important;
                    height: 2rem !important;
                }

                .materialy-kalendarz-panel table th {
                    padding: 0.16rem !important;
                    font-size: 0.8rem !important;
                }

                .materialy-kalendarz-panel table td {
                    padding: 0.12rem !important;
                }

                .materialy-kalendarz-panel table td > span {
                    width: 1.82rem !important;
                    height: 1.82rem !important;
                    font-size: 0.9rem !important;
                }

                .materialy-kalendarz-panel .p-datepicker-weeknumber {
                    color: #1d4ed8;
                    font-weight: 600;
                    font-size: 0.83rem !important;
                }

                .materialy-kalendarz-panel .p-datepicker-group {
                    width: 100% !important;
                }
            `}</style>
        </div>
    );
}
