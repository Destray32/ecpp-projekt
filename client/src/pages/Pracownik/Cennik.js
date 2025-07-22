import React, { useState, useEffect } from 'react';
import { Table, Input, Button, InputNumber, notification, Spin, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import checkUserType from '../../utils/accTypeUtils';
import { message } from 'antd';

export default function CennikPage() {
    const [cennikData, setCennikData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [accountType, setAccountType] = useState('');
    const [globalRates, setGlobalRates] = useState({});
    const baseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        checkUserType(setAccountType);
        fetchCennikData();
    }, []);

    const fetchCennikData = async () => {
        try {
            setLoading(true);

            const response = await axios.get(`${baseUrl}/api/cennik`, { withCredentials: true });
            console.log('Pobrano dane cennika:', response.data);
            const cennikData = response.data;

            // Pobierz wszystkie dostępne grupy urlopowe
            const allGroupsResponse = await axios.get(`${baseUrl}/api/pracownik/grupy`, { withCredentials: true });
            const groups = {};

            // Najpierw dodaj wszystkie dostępne grupy
            allGroupsResponse.data.forEach(group => {
                groups[group.idGrupa_urlopowa] = {
                    nazwa: group.Zleceniodawca,
                    stawka: group.Stawka
                };
            });

            // Potem zaktualizuj danymi z cennika (jeśli istnieją)
            cennikData.forEach(item => {
                if (groups[item.idGrupa_urlopowa]) {
                    groups[item.idGrupa_urlopowa].stawka = item.stawka_globalna;
                }
            });

            // Aktualizuj dane lokalnie, uwzględniając indywidualne stawki
            const updatedData = cennikData.map(item => ({
                ...item,
                stawka_obowiazujaca: item.stawka_indywidualna !== undefined && item.stawka_indywidualna !== null
                    ? item.stawka_indywidualna
                    : item.stawka_globalna
            }));

            setCennikData(updatedData);
            setGlobalRates(groups);
        } catch (error) {
            console.error('Błąd pobierania danych cennika:', error);

            if (error.response && error.response.status === 404) {
                notification.error({
                    message: 'Błąd',
                    description: 'Nie znaleziono danych cennika. Wyświetlam dane domyślne.'
                });
                setCennikData([]); // Fallback to empty data
            } else {
                notification.error({
                    message: 'Błąd',
                    description: 'Nie udało się pobrać danych cennika'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGlobalRateChange = async (value, grupaId) => {
    setSaving(true);
    try {
        // Allow null values for global rates
        const payload = {
            grupaId,
            stawka: value === null || value === '' ? null : parseFloat(value),
        };

        await axios.put(`${baseUrl}/api/cennik/globalna`, payload, { withCredentials: true });

        // Update cennikData for all employees affected by this global rate change
        setCennikData(prevData =>
            prevData.map(item => {
                if (item.idGrupa_urlopowa === parseInt(grupaId)) {
                    // This row is affected by the global rate change
                    const hasIndividualRate = item.stawka_indywidualna !== null && item.stawka_indywidualna !== undefined;
                    return {
                        ...item,
                        stawka_globalna: payload.stawka,
                        // Only update the effective rate if no individual rate is set
                        stawka_obowiazujaca: hasIndividualRate ? item.stawka_indywidualna : payload.stawka
                    };
                }
                return item;
            })
        );

        // Update the global rates object
        setGlobalRates(prev => ({
            ...prev,
            [grupaId]: {
                ...prev[grupaId],
                stawka: payload.stawka,
            }
        }));

        message.success('Zaktualizowano stawkę globalną');
    } catch (error) {
        console.error('Błąd podczas aktualizacji stawki globalnej:', error);
        message.error('Błąd podczas aktualizacji stawki globalnej');
    } finally {
        setSaving(false);
    }
};

    const handleIndividualRateChange = async (pracownikId, grupaId, value) => {
        setSaving(true);
        try {
            // Convert empty string to null for proper backend handling
            const rateValue = value === '' || value === null ? null : parseFloat(value);
            
            await axios.put(`${baseUrl}/api/cennik/stawka`, {
                pracownikId,
                grupaId,
                stawka: rateValue
            }, { withCredentials: true });

            // Update local state with the new value
            setCennikData(prevData =>
                prevData.map(item =>
                    item.idPracownik === pracownikId && item.idGrupa_urlopowa === grupaId
                        ? {
                            ...item,
                            stawka_indywidualna: rateValue,
                            stawka_obowiazujaca: rateValue !== null ? rateValue : item.stawka_globalna
                        }
                        : item
                )
            );

            message.success('Zaktualizowano stawkę');
        } catch (error) {
            console.error('Błąd podczas zapisu stawki:', error);
            message.error('Błąd podczas zapisu stawki');
        } finally {
            setSaving(false);
        }
    };


    // Grupowanie danych według pracowników
    const groupedData = cennikData.reduce((acc, item) => {
        const key = `${item.idPracownik}_${item.pracownik_nazwa}`;
        if (!acc[key]) {
            acc[key] = {
                idPracownik: item.idPracownik,
                pracownik: item.pracownik_nazwa,
                stawki: []
            };
        }
        acc[key].stawki.push(item);
        return acc;
    }, {});

    const employees = Object.values(groupedData).sort((a, b) => 
        a.pracownik.localeCompare(b.pracownik, 'pl')
    );

    // Sortowanie zleceniodawców
    const sortedClients = Object.entries(globalRates).sort((a, b) => 
        a[1].nazwa.localeCompare(b[1].nazwa, 'pl')
    );

    const canEdit = accountType === 'Administrator' || accountType === 'Kierownik';

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-2">
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-1 p-2 text-white">
                <h1 className="text-lg font-bold">Cennik - Stawki Pracowników</h1>
                <Tooltip title="Ustaw globalną stawkę u góry dla wszystkich pracowników, lub indywidualną stawkę dla każdego pracownika">
                    <InfoCircleOutlined />
                </Tooltip>
            </div>

            <div className="bg-amber-100 outline outline-1 outline-gray-500 m-1 p-3">
                <h2 className="text-base font-semibold mb-3">Stawki Globalne</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                    {sortedClients.map(([grupaId, grupa]) => (
                        <div key={grupaId} className="bg-white p-2 rounded border">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                {grupa.nazwa}
                            </label>
                            <InputNumber
                                value={grupa.stawka}
                                onChange={(val) => {
                                    // Update local UI immediately, but don't save yet
                                    setGlobalRates(prev => ({
                                        ...prev,
                                        [grupaId]: {
                                            ...prev[grupaId],
                                            stawka: val
                                        }
                                    }));

                                    // Also update the UI for all cells that use this global rate
                                    if (val === null || val === '') {
                                        // If clearing the global rate
                                        setCennikData(prevData =>
                                            prevData.map(item => {
                                                if (item.idGrupa_urlopowa === parseInt(grupaId)) {
                                                    const hasIndividualRate = item.stawka_indywidualna !== null && item.stawka_indywidualna !== undefined;
                                                    return {
                                                        ...item,
                                                        stawka_globalna: null,
                                                        stawka_obowiazujaca: hasIndividualRate ? item.stawka_indywidualna : null
                                                    };
                                                }
                                                return item;
                                            })
                                        );
                                    } else {
                                        // If setting a new global rate
                                        setCennikData(prevData =>
                                            prevData.map(item => {
                                                if (item.idGrupa_urlopowa === parseInt(grupaId)) {
                                                    const hasIndividualRate = item.stawka_indywidualna !== null && item.stawka_indywidualna !== undefined;
                                                    return {
                                                        ...item,
                                                        stawka_globalna: val,
                                                        stawka_obowiazujaca: hasIndividualRate ? item.stawka_indywidualna : val
                                                    };
                                                }
                                                return item;
                                            })
                                        );
                                    }
                                }}
                                onBlur={() => {
                                    // Save on blur if the value has changed
                                    handleGlobalRateChange(grupa.stawka, grupaId);
                                }}
                                placeholder="Brak"
                                style={{ width: '100%' }}
                                precision={2}
                                min={0}
                                allowClear={true}
                                disabled={!canEdit || saving}
                                addonAfter="PLN/h"
                                size="small"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-100 outline outline-1 outline-gray-500 m-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-700 text-white">
                            <tr>
                                <th className="border-r px-2 py-1 text-left min-w-[150px]">
                                    Pracownik
                                </th>
                                {sortedClients.map(([grupaId, grupa]) => (
                                    <th key={grupaId} className="border-r px-2 py-1 text-center min-w-[120px]">
                                        <div className="text-xs">{grupa.nazwa}</div>
                                        {grupa.stawka && (
                                            <div className="text-xs opacity-80">
                                                (glob: {grupa.stawka})
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee, index) => (
                                <tr key={employee.idPracownik} 
                                    className={index % 2 === 0 ? "bg-gray-200" : "bg-gray-300"}>
                                    <td className="border-r px-2 py-1 font-medium text-xs">
                                        {employee.pracownik}
                                    </td>
                                    {sortedClients.map(([grupaId, grupa]) => {
                                        const stawka = employee.stawki.find(s => s.idGrupa_urlopowa === parseInt(grupaId));
                                        const isIndividualRate = stawka?.stawka_indywidualna !== null && stawka?.stawka_indywidualna !== undefined;
                                        // Determine what placeholder to show
                                        const placeholderValue = stawka?.stawka_globalna || grupa.stawka || "Brak";
                                        
                                        return (
                                            <td key={grupaId} className="border-r px-1 py-1 text-center">
                                                <InputNumber
                                                    value={stawka?.stawka_indywidualna}
                                                    onChange={(val) => {
                                                        // Update local UI immediately
                                                        setCennikData(prevData =>
                                                            prevData.map(item =>
                                                                item.idPracownik === employee.idPracownik && item.idGrupa_urlopowa === parseInt(grupaId)
                                                                    ? {
                                                                        ...item,
                                                                        stawka_indywidualna: val,
                                                                        stawka_obowiazujaca: val !== null && val !== undefined ? val : item.stawka_globalna
                                                                    }
                                                                    : item
                                                            )
                                                        );
                                                    }}
                                                    onBlur={() => {
                                                        // Save on blur
                                                        const individualRate = stawka?.stawka_indywidualna;
                                                        handleIndividualRateChange(employee.idPracownik, parseInt(grupaId), individualRate);
                                                    }}
                                                    placeholder={placeholderValue}
                                                    style={{ 
                                                        width: '100px',
                                                        backgroundColor: isIndividualRate ? '#d1d5db' : '#f3f4f6',
                                                        fontWeight: isIndividualRate ? 'bold' : 'normal'
                                                    }}
                                                    className={isIndividualRate ? "individual-rate" : "global-rate"}
                                                    precision={2}
                                                    min={0}
                                                    allowClear={true}
                                                    disabled={!canEdit || saving}
                                                    size="small"
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {!canEdit && (
                <div className="m-1 p-2 bg-yellow-100 border border-yellow-400 rounded">
                    <p className="text-yellow-800 text-sm">
                        Nie masz uprawnień do edycji stawek. Skontaktuj się z administratorem.
                    </p>
                </div>
            )}
        </div>
    );
}
