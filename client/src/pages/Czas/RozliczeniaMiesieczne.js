import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Axios from 'axios';
import { countWorkingDays, addWorkingDays, snapToNextWorkingDay, snapToPreviousWorkingDay } from '../../utils/leaveUtils';
import { downloadRozliczeniePDF } from '../../Components/RozliczeniaPDF';

const RozliczeniaMiesieczne = () => {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const [pracownicy, setPracownicy] = useState([]);
    const [selectedPracownik, setSelectedPracownik] = useState('');
    const [miesiacRok, setMiesiacRok] = useState(new Date().toISOString().slice(0, 7));
    const [userAccountType, setUserAccountType] = useState('');

    const [rozliczenie, setRozliczenie] = useState({
        Godziny_przepracowane: 0,
        Mozliwe_godziny: '',
        Nadgodziny_wyplata: 0,
        Nadgodziny_z_poprzedniego: 0,
        Nadgodziny_na_kolejny: 0,
        Atf_wykorzystane: 0,
        Czerwone_dni: 0,
        Urlop_zalegly_pula: 0,
        Nadgodziny_stawka: '',
        Nadgodziny_unlocked: 0,
        Urlop: [],
        Urlop_zalegly: [],
        L4: { from: '', to: '' },
        L4cd: { from: '', to: '' },
        VAB: { from: '', to: '' },
        Pappaledi: { from: '', to: '' }
    });

    const [isDraft, setIsDraft] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [carryoverHours, setCarryoverHours] = useState(0);
    const [atfOtherMonthsTotal, setAtfOtherMonthsTotal] = useState(0);
    const [urlopOtherMonthsTotal, setUrlopOtherMonthsTotal] = useState(0);
    const [urlopZaleglyOtherMonthsTotal, setUrlopZaleglyOtherMonthsTotal] = useState(0);
    const [urlopYearTotal, setUrlopYearTotal] = useState(0);
    const [urlopZaleglyYearTotal, setUrlopZaleglyYearTotal] = useState(0);
    const [yearlyZaleglyPula, setYearlyZaleglyPula] = useState(0);

    const location = useLocation();

    // 1. Weryfikacja użytkownika i pobranie listy pracowników
    useEffect(() => {
        Axios.get(`${baseUrl}/api/mojedane`, { withCredentials: true })
            .then((response) => {
                const data = response.data;
                const loggedInUser = Array.isArray(data) ? data[0] : data;
                const userId = loggedInUser.idPracownik || loggedInUser.id;
                setUserAccountType(loggedInUser.Typ_konta || '');

                if (location.state?.pracownikId) {
                    setSelectedPracownik(location.state.pracownikId);
                } else {
                    setSelectedPracownik(userId);
                }

                if (location.state?.miesiacRok) {
                    setMiesiacRok(location.state.miesiacRok);
                }

                const hasAdminAccess = ['Administrator', 'Kierownik', 'Biuro'].includes(loggedInUser.Typ_konta);

                if (hasAdminAccess) {
                    Axios.get(`${baseUrl}/api/pracownicy`, { withCredentials: true })
                        .then((empResponse) => {
                            const activeEmployees = empResponse.data.filter(p => p.accountStatus === 'Aktywne');
                            const formatted = activeEmployees.map(p => ({
                                idPracownik: p.id,
                                Imie: p.name,
                                Nazwisko: p.surname
                            }));
                            setPracownicy(formatted);
                        })
                        .catch(err => console.error('Błąd:', err));
                } else {
                    setPracownicy([{
                        idPracownik: userId,
                        Imie: loggedInUser.Imie || loggedInUser.name,
                        Nazwisko: loggedInUser.Nazwisko || loggedInUser.surname
                    }]);
                }
            })
            .catch(err => console.error('Błąd weryfikacji:', err));
    }, []);

    const parseJsonValue = (value, fallback) => {
        if (value === null || value === undefined || value === '') return fallback;
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (err) {
                return fallback;
            }
        }
        return value;
    };

    const normalizeLeaveEntries = (entries) => {
        if (!Array.isArray(entries)) return [];
        return entries.map((entry) => ({
            from: entry?.from || '',
            to: entry?.to || '',
            days: entry?.days !== undefined && entry?.days !== null ? String(entry.days) : ''
        }));
    };

    const normalizeRange = (range) => ({
        from: range?.from || '',
        to: range?.to || ''
    });

    const getRangeDays = (range) => {
        if (!range?.from || !range?.to) return 0;
        return countWorkingDays(range.from, range.to);
    };

    const sumDays = (leaveArray) => {
        if (!Array.isArray(leaveArray)) return 0;
        return leaveArray.reduce((acc, entry) => acc + (Number(entry.days) || 0), 0);
    };

    const updateLeaveEntry = (field, index, key, value) => {
        setRozliczenie((prev) => {
            const nextEntries = [...prev[field]];
            let nextEntry = { ...nextEntries[index], [key]: value };

            // Automatically snap OD to next Monday if weekend is selected
            if (key === 'from' && nextEntry.from) {
                nextEntry.from = snapToNextWorkingDay(nextEntry.from);
            }
            // Automatically snap DO to previous Friday if weekend is selected
            if (key === 'to' && nextEntry.to) {
                nextEntry.to = snapToPreviousWorkingDay(nextEntry.to);
            }

            if (key === 'from' || key === 'to') {
                if (nextEntry.from && nextEntry.to) {
                    const days = countWorkingDays(nextEntry.from, nextEntry.to);
                    nextEntry.days = days > 0 ? String(days) : '';
                }
            } else if (key === 'days') {
                const numVal = Math.floor(Math.max(Number(value) || 0, 0));
                nextEntry.days = numVal > 0 ? String(numVal) : '';
                if (nextEntry.from && numVal > 0) {
                    nextEntry.from = snapToNextWorkingDay(nextEntry.from);
                    nextEntry.to = addWorkingDays(nextEntry.from, numVal);
                }
            }

            // Specific validation for overdue leave pool limit
            if (field === 'Urlop_zalegly') {
                const totalPula = Number(prev.Urlop_zalegly_pula || yearlyZaleglyPula || 0);
                const otherEntriesSum = nextEntries.reduce((acc, ent, i) => i === index ? acc : acc + (Number(ent.days) || 0), 0);
                const maxAllowed = Math.max(totalPula - urlopZaleglyOtherMonthsTotal - otherEntriesSum, 0);

                if (Number(nextEntry.days) > maxAllowed) {
                    nextEntry.days = maxAllowed > 0 ? String(maxAllowed) : '';
                    if (nextEntry.from && maxAllowed > 0) {
                        nextEntry.from = snapToNextWorkingDay(nextEntry.from);
                        nextEntry.to = addWorkingDays(nextEntry.from, maxAllowed);
                    } else if (maxAllowed === 0) {
                        nextEntry.to = nextEntry.from;
                    }
                }
            }

            nextEntries[index] = nextEntry;
            return { ...prev, [field]: nextEntries };
        });
    };

    const addLeaveEntry = (field) => {
        setRozliczenie((prev) => ({
            ...prev,
            [field]: [...prev[field], { from: '', to: '', days: '' }]
        }));
    };

    const removeLeaveEntry = (field, index) => {
        setRozliczenie((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const updateRangeField = (field, key, value) => {
        setRozliczenie((prev) => ({
            ...prev,
            [field]: { ...prev[field], [key]: value }
        }));
    };

    const getPreviousMonth = (monthValue) => {
        if (!monthValue) return '';
        const [yearPart, monthPart] = monthValue.split('-').map(Number);
        if (!yearPart || !monthPart) return '';
        const date = new Date(yearPart, monthPart - 1, 1);
        date.setMonth(date.getMonth() - 1);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    const shiftMonth = (offset) => {
        if (!miesiacRok) return;
        const [yearPart, monthPart] = miesiacRok.split('-').map(Number);
        if (!yearPart || !monthPart) return;
        const date = new Date(yearPart, monthPart - 1, 1);
        date.setMonth(date.getMonth() + offset);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        setMiesiacRok(`${year}-${month}`);
    };

    // 2. Proste pobieranie godzin i rozliczenia dla całego miesiąca
    useEffect(() => {
        if (!selectedPracownik || !miesiacRok) return;

        setIsLoading(true);
        setMessage({ text: '', type: '' });

        Axios.get(`${baseUrl}/api/rozliczenia`, {
            withCredentials: true,
            params: {
                pracownikId: selectedPracownik,
                miesiacRok: miesiacRok
            }
        })
            .then((response) => {
                const result = response.data;
                if (result.status === 'success') {
                    setRozliczenie({
                        Godziny_przepracowane: result.data.Godziny_przepracowane || 0,
                        Mozliwe_godziny: (result.data.Mozliwe_godziny !== null && result.data.Mozliwe_godziny !== undefined) ? result.data.Mozliwe_godziny : '',
                        Nadgodziny_wyplata: result.data.Nadgodziny_wyplata || 0,
                        Nadgodziny_z_poprzedniego: result.data.Nadgodziny_z_poprzedniego || 0,
                        Nadgodziny_na_kolejny: result.data.Nadgodziny_na_kolejny || 0,
                        Atf_wykorzystane: result.data.Atf_wykorzystane || 0,
                        Czerwone_dni: result.data.Czerwone_dni || 0,
                        Urlop_zalegly_pula: result.data.Urlop_zalegly_pula || result.yearlyZaleglyPula || 0,
                        Nadgodziny_stawka: result.data.Nadgodziny_stawka || '',
                        Nadgodziny_unlocked: result.data.Nadgodziny_unlocked || 0,
                        Urlop: normalizeLeaveEntries(parseJsonValue(result.data.Urlop, [])),
                        Urlop_zalegly: normalizeLeaveEntries(parseJsonValue(result.data.Urlop_zalegly, [])),
                        L4: normalizeRange(parseJsonValue(result.data.L4, {})),
                        L4cd: normalizeRange(parseJsonValue(result.data.L4cd, {})),
                        VAB: normalizeRange(parseJsonValue(result.data.VAB, {})),
                        Pappaledi: normalizeRange(parseJsonValue(result.data.Pappaledi, {}))
                    });
                    setIsDraft(result.isDraft);
                    setAtfOtherMonthsTotal(result.atfOtherMonthsTotal || 0);
                    setUrlopOtherMonthsTotal(result.urlopOtherMonthsTotal || 0);
                    setUrlopZaleglyOtherMonthsTotal(result.urlopZaleglyOtherMonthsTotal || 0);
                    setUrlopYearTotal(result.urlopYearTotal || 0);
                    setUrlopZaleglyYearTotal(result.urlopZaleglyYearTotal || 0);
                    setYearlyZaleglyPula(result.yearlyZaleglyPula || 0);
                }
            })
            .catch(err => {
                setMessage({ text: 'Wystąpił błąd pobierania danych.', type: 'error' });
            })
            .finally(() => setIsLoading(false));
    }, [selectedPracownik, miesiacRok]);

    useEffect(() => {
        if (!selectedPracownik || !miesiacRok) return;

        const previousMonth = getPreviousMonth(miesiacRok);
        if (!previousMonth) {
            setCarryoverHours(0);
            return;
        }

        Axios.get(`${baseUrl}/api/rozliczenia`, {
            withCredentials: true,
            params: {
                pracownikId: selectedPracownik,
                miesiacRok: previousMonth
            }
        })
            .then((response) => {
                const previousData = response.data?.data;
                const value = Number(previousData?.Nadgodziny_na_kolejny) || 0;
                setCarryoverHours(value);

                // Auto-populate Nadgodziny_z_poprzedniego from bank godzin if zero
                setRozliczenie(prev => {
                    if (!prev.Nadgodziny_z_poprzedniego && value > 0) {
                        return { ...prev, Nadgodziny_z_poprzedniego: value };
                    }
                    return prev;
                });
            })
            .catch(() => setCarryoverHours(0));
    }, [selectedPracownik, miesiacRok]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? (checked ? 1 : 0) : value;
        setRozliczenie(prev => ({ ...prev, [name]: val }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsLoading(true);

        const l4Days = getRangeDays(rozliczenie.L4);
        if (l4Days > 14) {
            setMessage({ text: 'L4 moze miec maksymalnie 14 dni.', type: 'error' });
            setIsLoading(false);
            return;
        }

        const payload = {
            Pracownik_idPracownik: selectedPracownik,
            Miesiac_rok: miesiacRok,
            ...rozliczenie,
            Urlop: JSON.stringify(rozliczenie.Urlop || []),
            Urlop_zalegly: JSON.stringify(rozliczenie.Urlop_zalegly || []),
            L4: JSON.stringify(rozliczenie.L4 || { from: '', to: '' }),
            L4cd: JSON.stringify(rozliczenie.L4cd || { from: '', to: '' }),
            VAB: JSON.stringify(rozliczenie.VAB || { from: '', to: '' }),
            Pappaledi: JSON.stringify(rozliczenie.Pappaledi || { from: '', to: '' })
        };

        Axios.post(`${baseUrl}/api/rozliczenia`, payload, { withCredentials: true })
            .then((response) => {
                const data = response.data;
                if (data.message) {
                    setMessage({ text: 'Zapisano pomyślnie!', type: 'success' });
                    setIsDraft(false);
                }
            })
            .catch(err => setMessage({ text: 'Błąd zapisu.', type: 'error' }))
            .finally(() => setIsLoading(false));
    };

    const handlePrintSinglePDF = async () => {
        const selectedEmpObj = pracownicy.find(p => String(p.idPracownik) === String(selectedPracownik));
        const name = selectedEmpObj ? `${selectedEmpObj.Imie} ${selectedEmpObj.Nazwisko}` : 'Pracownik';

        const sheetData = {
            pracownikName: name,
            miesiacRok: miesiacRok,
            godzinyPrzepracowane: rozliczenie.Godziny_przepracowane,
            mozliweGodziny: rozliczenie.Mozliwe_godziny,
            nadgodzinyWyplata: rozliczenie.Nadgodziny_wyplata,
            nadgodzinyStawka: rozliczenie.Nadgodziny_stawka,
            czerwoneDni: rozliczenie.Czerwone_dni,
            nadgodzinyZPoprzedniego: rozliczenie.Nadgodziny_z_poprzedniego,
            atfWykorzystane: rozliczenie.Atf_wykorzystane,
            atfOtherMonthsTotal: atfOtherMonthsTotal,
            urlopOtherMonthsTotal: urlopOtherMonthsTotal,
            urlopZaleglyOtherMonthsTotal: urlopZaleglyOtherMonthsTotal,
            yearlyZaleglyPula: yearlyZaleglyPula,
            urlopPulaInput: rozliczenie.Urlop_zalegly_pula,
            urlop: rozliczenie.Urlop,
            urlopZalegly: rozliczenie.Urlop_zalegly,
            l4: rozliczenie.L4,
            l4cd: rozliczenie.L4cd,
            vab: rozliczenie.VAB,
            pappaledi: rozliczenie.Pappaledi,
            nadgodzinyNaKolejny: rozliczenie.Nadgodziny_na_kolejny,
            email: ''
        };

        const filename = `Rozliczenie_${name.replace(/\s+/g, '_')}_${miesiacRok}.pdf`;
        await downloadRozliczeniePDF([sheetData], filename);
    };

    const handlePrintAllPDF = async () => {
        setIsLoading(true);
        try {
            const sheets = [];
            for (const p of pracownicy) {
                const res = await Axios.get(`${baseUrl}/api/rozliczenia`, {
                    withCredentials: true,
                    params: { pracownikId: p.idPracownik, miesiacRok: miesiacRok }
                });
                if (res.data?.status === 'success') {
                    const d = res.data.data;
                    sheets.push({
                        pracownikName: `${p.Imie} ${p.Nazwisko}`,
                        miesiacRok: miesiacRok,
                        godzinyPrzepracowane: d.Godziny_przepracowane || 0,
                        mozliweGodziny: d.Mozliwe_godziny || '',
                        nadgodzinyWyplata: d.Nadgodziny_wyplata || 0,
                        nadgodzinyStawka: d.Nadgodziny_stawka || '',
                        czerwoneDni: d.Czerwone_dni || 0,
                        nadgodzinyZPoprzedniego: d.Nadgodziny_z_poprzedniego || 0,
                        atfWykorzystane: d.Atf_wykorzystane || 0,
                        atfOtherMonthsTotal: res.data.atfOtherMonthsTotal || 0,
                        urlopOtherMonthsTotal: res.data.urlopOtherMonthsTotal || 0,
                        urlopZaleglyOtherMonthsTotal: res.data.urlopZaleglyOtherMonthsTotal || 0,
                        yearlyZaleglyPula: res.data.yearlyZaleglyPula || 0,
                        urlopPulaInput: d.Urlop_zalegly_pula || 0,
                        urlop: parseJsonValue(d.Urlop, []),
                        urlopZalegly: parseJsonValue(d.Urlop_zalegly, []),
                        l4: parseJsonValue(d.L4, {}),
                        l4cd: parseJsonValue(d.L4cd, {}),
                        vab: parseJsonValue(d.VAB, {}),
                        pappaledi: parseJsonValue(d.Pappaledi, {}),
                        nadgodzinyNaKolejny: d.Nadgodziny_na_kolejny || 0,
                        email: ''
                    });
                }
            }
            await downloadRozliczeniePDF(sheets, `Rozliczenia_Wszyscy_${miesiacRok}.pdf`);
        } catch (err) {
            console.error('Błąd drukowania zbiorczego PDF:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Miesięczna Karta Rozliczeniowa</h2>

            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1 min-w-[220px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pracownik</label>
                    <select
                        value={selectedPracownik}
                        onChange={(e) => setSelectedPracownik(e.target.value)}
                        disabled={pracownicy.length <= 1}
                        className={`w-full border border-gray-300 rounded p-2 ${pracownicy.length <= 1 ? 'bg-gray-100 cursor-not-allowed font-semibold' : 'bg-white'}`}
                    >
                        {pracownicy.map(p => (
                            <option key={p.idPracownik} value={p.idPracownik}>{p.Imie} {p.Nazwisko}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 min-w-[220px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Miesiąc i Rok</label>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="border border-gray-300 rounded px-2 py-2 text-gray-600 hover:bg-gray-50"
                            onClick={() => shiftMonth(-1)}
                            aria-label="Poprzedni miesiąc"
                        >
                            &larr;
                        </button>
                        <input
                            type="month"
                            value={miesiacRok}
                            onChange={(e) => setMiesiacRok(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2"
                        />
                        <button
                            type="button"
                            className="border border-gray-300 rounded px-2 py-2 text-gray-600 hover:bg-gray-50"
                            onClick={() => shiftMonth(1)}
                            aria-label="Następny miesiąc"
                        >
                            &rarr;
                        </button>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                        <span className="font-bold text-gray-600">Aktualizowanie danych...</span>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-700">Szczegóły: {miesiacRok}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isDraft ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {isDraft ? 'Szkic (niezapisany)' : 'Zapisane w bazie'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded border border-blue-200">
                            <label className="block text-xs font-bold text-blue-800 uppercase">Suma godzin za cały miesiąc</label>
                            <span className="text-3xl font-bold text-blue-700">{rozliczenie.Godziny_przepracowane} h</span>
                            <p className="text-xs text-blue-600 mt-1">
                                Pobrane automatycznie z Twojego kalendarza
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mozliwe godziny w miesiacu</label>
                            <input
                                type="number"
                                step="0.5"
                                name="Mozliwe_godziny"
                                value={rozliczenie.Mozliwe_godziny}
                                onChange={handleInputChange}
                                placeholder="puste"
                                className="mt-1 w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                            />
                            <p className="text-xs text-gray-500 mt-1">Wpisywane recznie lub przez administratora w widoku zbiorczym.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nadgodziny (do wypłaty)</label>
                            <input type="number" step="0.5" name="Nadgodziny_wyplata" value={rozliczenie.Nadgodziny_wyplata} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 font-semibold" />
                        </div>

                        {/* Stawki / dodatki nadgodzin pod pracownikiem */}
                        <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
                            <label className="block text-xs font-bold text-gray-700 uppercase">Stawka / dodatki</label>
                            <input
                                type="text"
                                name="Nadgodziny_stawka"
                                value={rozliczenie.Nadgodziny_stawka || ''}
                                onChange={handleInputChange}
                                placeholder="np. 100% + 10kr"
                                className="w-full border border-gray-300 rounded p-2 text-sm bg-white font-semibold focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Z banku godzin z poprzedniego miesiąca</label>
                            <input type="number" step="0.5" name="Nadgodziny_z_poprzedniego" value={rozliczenie.Nadgodziny_z_poprzedniego} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 rounded p-2 focus:ring-blue-500" />
                            <p className="text-xs text-gray-500 mt-1">Automatycznie trafiły z banku godzin z poprzedniego miesiąca: {carryoverHours} h</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 text-red-600">Czerwone dni (ilość)</label>
                            <input type="number" name="Czerwone_dni" value={rozliczenie.Czerwone_dni} onChange={handleInputChange} className="mt-1 w-full border border-red-300 rounded p-2 focus:ring-red-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">ATF (wybrane w tym miesiącu)</label>
                            <input type="number" step="0.5" name="Atf_wykorzystane" value={rozliczenie.Atf_wykorzystane} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" />
                            <p className="text-xs text-gray-500 mt-1">Ilość wykorzystanych godzin w wybranym miesiącu</p>

                            {/* Wskaźnik rocznego limitu ATF */}
                            {miesiacRok && (
                                <div className={`mt-2 p-2 rounded border text-xs flex justify-between items-center transition-colors ${(atfOtherMonthsTotal + (Number(rozliczenie.Atf_wykorzystane) || 0)) > 40
                                        ? 'bg-red-50 border-red-200 text-red-800'
                                        : 'bg-blue-50 border-blue-200 text-blue-800'
                                    }`}>
                                    <span>Pozostało w roku ({miesiacRok.slice(0, 4)}):</span>
                                    <span className="font-bold">
                                        {Math.max(40 - (atfOtherMonthsTotal + (Number(rozliczenie.Atf_wykorzystane) || 0)), 0)} h
                                        ({(Math.max(40 - (atfOtherMonthsTotal + (Number(rozliczenie.Atf_wykorzystane) || 0)), 0) / 8).toFixed(1)} dni) ATF
                                        {(atfOtherMonthsTotal + (Number(rozliczenie.Atf_wykorzystane) || 0)) > 40 && ' (Przekroczono limit!)'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nadgodziny przeniesione na kolejny miesiąc</label>
                            {(() => {
                                const isCarryoverLocked = carryoverHours > 0 && !Boolean(rozliczenie.Nadgodziny_unlocked);
                                return (
                                    <>
                                        <input
                                            type="number"
                                            step="0.5"
                                            name="Nadgodziny_na_kolejny"
                                            value={rozliczenie.Nadgodziny_na_kolejny}
                                            onChange={handleInputChange}
                                            disabled={isCarryoverLocked}
                                            className={`mt-1 w-full border rounded p-2 focus:ring-blue-500 ${isCarryoverLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300' : 'border-gray-300'
                                                }`}
                                        />
                                        {isCarryoverLocked && (
                                            <p className="text-xs text-red-600 mt-1 font-semibold">
                                                🚫 Nadgodziny nie mogą zostać przeniesione 2 miesiące z rzędu.
                                            </p>
                                        )}
                                        {['Administrator', 'Kierownik'].includes(userAccountType) && (
                                            <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="Nadgodziny_unlocked"
                                                    checked={Boolean(rozliczenie.Nadgodziny_unlocked)}
                                                    onChange={handleInputChange}
                                                    className="w-3.5 h-3.5 text-blue-600 rounded"
                                                />
                                                Odblokuj przeniesienie nadgodzin (opcja administratora)
                                            </label>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Pula zaległego urlopu */}
                        <div className="bg-amber-50 p-3 rounded border border-amber-200">
                            <label className="block text-xs font-bold text-amber-900 uppercase">Pula zaległego urlopu na ten rok</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    name="Urlop_zalegly_pula"
                                    value={rozliczenie.Urlop_zalegly_pula}
                                    onChange={handleInputChange}
                                    disabled={Number(rozliczenie.Urlop_zalegly_pula || yearlyZaleglyPula || 0) > 0 && userAccountType !== 'Administrator'}
                                    className={`w-24 border rounded p-1.5 text-sm font-bold focus:ring-amber-500 ${
                                        Number(rozliczenie.Urlop_zalegly_pula || yearlyZaleglyPula || 0) > 0 && userAccountType !== 'Administrator'
                                        ? 'bg-amber-100/70 text-amber-700 cursor-not-allowed border-amber-300'
                                        : 'bg-white text-amber-900 border-amber-300'
                                    }`}
                                    placeholder="dni"
                                />
                                <span className="text-xs text-amber-800 font-semibold">dni (wpisywane raz w roku)</span>
                            </div>
                            {Number(rozliczenie.Urlop_zalegly_pula || yearlyZaleglyPula || 0) > 0 && userAccountType !== 'Administrator' && (
                                <p className="text-[11px] text-amber-700 mt-1">
                                    🔒 Pula została wprowadzona i zablokowana. Edycja dostępna tylko dla Administratora.
                                </p>
                            )}
                            {userAccountType === 'Administrator' && Number(rozliczenie.Urlop_zalegly_pula || yearlyZaleglyPula || 0) > 0 && (
                                <p className="text-[11px] text-amber-800 mt-1 font-semibold">
                                    ✏️ Edycja puli odblokowana dla Administratora.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Urlopy i nieobecnosci</h4>

                    {/* Enforce overdue leave prerequisite */}
                    {(() => {
                        const currentZaleglySum = sumDays(rozliczenie.Urlop_zalegly);
                        const totalZaleglyUsed = urlopZaleglyOtherMonthsTotal + currentZaleglySum;
                        const totalPula = Number(rozliczenie.Urlop_zalegly_pula || yearlyZaleglyPula || 0);
                        const remainingZalegly = Math.max(totalPula - totalZaleglyUsed, 0);
                        const hasRemainingZalegly = remainingZalegly > 0;

                        const currentRegularSum = sumDays(rozliczenie.Urlop);
                        const totalRegularUsed = urlopOtherMonthsTotal + currentRegularSum;
                        const remainingRegular = Math.max(25 - totalRegularUsed, 0);

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Urlop zwykły na lewo */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700">Urlop (zakres + dni)</label>
                                            <span className="text-xs text-blue-700 font-semibold">
                                                Pozostało urlopu w roku: {remainingRegular} / 25 dni (wykorzystano {totalRegularUsed} d)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={hasRemainingZalegly}
                                            className={`text-sm font-semibold transition ${hasRemainingZalegly ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
                                                }`}
                                            onClick={() => addLeaveEntry('Urlop')}
                                        >
                                            + Dodaj datę
                                        </button>
                                    </div>

                                    {hasRemainingZalegly && (
                                        <div className="p-3 bg-amber-100 border border-amber-300 rounded text-xs text-amber-900 font-semibold">
                                            ⚠️ Najpierw musisz wykorzystać zaległy urlop (pozostało: {remainingZalegly} dni), zanim będziesz mógł wpisać zwykły urlop.
                                        </div>
                                    )}

                                    {rozliczenie.Urlop.length === 0 && !hasRemainingZalegly && (
                                        <p className="text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded p-3 text-center">
                                            Brak wpisów zwykłego urlopu.
                                        </p>
                                    )}

                                    <div className="space-y-2">
                                        {rozliczenie.Urlop.map((entry, index) => (
                                            <div key={`urlop-${index}`} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 shadow-sm transition hover:border-gray-300">
                                                <div className="flex gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Od</label>
                                                        <input
                                                            type="date"
                                                            value={entry.from}
                                                            disabled={hasRemainingZalegly}
                                                            onChange={(e) => updateLeaveEntry('Urlop', index, 'from', e.target.value)}
                                                            className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Do</label>
                                                        <input
                                                            type="date"
                                                            value={entry.to}
                                                            disabled={hasRemainingZalegly}
                                                            onChange={(e) => updateLeaveEntry('Urlop', index, 'to', e.target.value)}
                                                            className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-gray-600">Dni:</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            value={entry.days}
                                                            disabled={hasRemainingZalegly}
                                                            onChange={(e) => updateLeaveEntry('Urlop', index, 'days', e.target.value)}
                                                            className="w-16 border border-gray-300 rounded p-1 text-center text-sm bg-white font-bold focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="dni"
                                                        />
                                                        <span className="text-xs font-bold text-blue-700">
                                                            {entry.days ? `${Number(entry.days) * 8} h` : ''}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="text-xs font-bold text-red-600 hover:text-red-800 transition"
                                                        onClick={() => removeLeaveEntry('Urlop', index)}
                                                    >
                                                        Usuń
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Urlop zaległy na prawo */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-sm font-bold text-amber-800">Urlop zaległy (zakres + dni)</label>
                                            <span className="text-xs text-amber-700 font-semibold">
                                                Pozostało zaległego: {remainingZalegly} dni (z Puli: {totalPula} dni)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                                            onClick={() => addLeaveEntry('Urlop_zalegly')}
                                            disabled={remainingZalegly <= 0 && rozliczenie.Urlop_zalegly.length > 0}
                                        >
                                            + Dodaj datę
                                        </button>
                                    </div>
                                    {rozliczenie.Urlop_zalegly.length === 0 && (
                                        <p className="text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded p-3 text-center">
                                            Brak wpisów zaległego urlopu.
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        {rozliczenie.Urlop_zalegly.map((entry, index) => (
                                            <div key={`urlop-zalegly-${index}`} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2 shadow-sm transition hover:border-amber-300">
                                                <div className="flex gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Od</label>
                                                        <input
                                                            type="date"
                                                            value={entry.from}
                                                            onChange={(e) => updateLeaveEntry('Urlop_zalegly', index, 'from', e.target.value)}
                                                            className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Do</label>
                                                        <input
                                                            type="date"
                                                            value={entry.to}
                                                            onChange={(e) => updateLeaveEntry('Urlop_zalegly', index, 'to', e.target.value)}
                                                            className="w-full border border-gray-300 rounded p-2 text-sm bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-semibold text-gray-600">Dni:</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            value={entry.days}
                                                            onChange={(e) => updateLeaveEntry('Urlop_zalegly', index, 'days', e.target.value)}
                                                            className="w-16 border border-gray-300 rounded p-1 text-center text-sm bg-white font-bold focus:ring-1 focus:ring-blue-500"
                                                            placeholder="dni"
                                                        />
                                                        <span className="text-xs font-bold text-amber-800">
                                                            {entry.days ? `${Number(entry.days) * 8} h` : ''}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="text-xs font-bold text-red-600 hover:text-red-800 transition"
                                                        onClick={() => removeLeaveEntry('Urlop_zalegly', index)}
                                                    >
                                                        Usuń
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">L4 (od-do, max 14 dni)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={rozliczenie.L4.from}
                                    onChange={(e) => updateRangeField('L4', 'from', e.target.value)}
                                    className="flex-1 min-w-0 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="date"
                                    value={rozliczenie.L4.to}
                                    onChange={(e) => updateRangeField('L4', 'to', e.target.value)}
                                    className="flex-1 min-w-0 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            {getRangeDays(rozliczenie.L4) > 0 && (
                                <p className="text-xs text-gray-500">Liczba dni roboczych: {getRangeDays(rozliczenie.L4)}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">L4c.d. (od-do)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={rozliczenie.L4cd.from}
                                    onChange={(e) => updateRangeField('L4cd', 'from', e.target.value)}
                                    className="flex-1 min-w-0 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="date"
                                    value={rozliczenie.L4cd.to}
                                    onChange={(e) => updateRangeField('L4cd', 'to', e.target.value)}
                                    className="flex-1 min-w-0 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">VAB (od-do)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={rozliczenie.VAB.from}
                                    onChange={(e) => updateRangeField('VAB', 'from', e.target.value)}
                                    className="flex-1 min-w-0 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="date"
                                    value={rozliczenie.VAB.to}
                                    onChange={(e) => updateRangeField('VAB', 'to', e.target.value)}
                                    className="flex-1 min-w-0 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Pappaledi (od-do)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={rozliczenie.Pappaledi.from}
                                    onChange={(e) => updateRangeField('Pappaledi', 'from', e.target.value)}
                                    className="flex-1 min-w-0 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <input
                                    type="date"
                                    value={rozliczenie.Pappaledi.to}
                                    onChange={(e) => updateRangeField('Pappaledi', 'to', e.target.value)}
                                    className="flex-1 min-w-0 border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handlePrintSinglePDF}
                            className="bg-emerald-600 text-white px-5 py-2.5 rounded font-bold hover:bg-emerald-700 transition shadow flex items-center gap-2"
                        >
                            📄 Drukuj / Pobierz PDF (Pojedynczy)
                        </button>
                        {['Administrator', 'Kierownik', 'Biuro'].includes(userAccountType) && (
                            <button
                                type="button"
                                onClick={handlePrintAllPDF}
                                className="bg-purple-700 text-white px-5 py-2.5 rounded font-bold hover:bg-purple-800 transition shadow flex items-center gap-2"
                            >
                                📚 Drukuj PDF (Dla wszystkich)
                            </button>
                        )}
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700 transition shadow-lg text-lg">
                        Zapisz rozliczenie
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RozliczeniaMiesieczne;