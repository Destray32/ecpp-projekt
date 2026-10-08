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
        Atf_zielone: 0,
        Czerwone_dni: 0,
        Urlop_zalegly_pula: 0,
        Nadgodziny_stawka: '',
        Nadgodziny_unlocked: 0,
        Mieszkanie: 0,
        Email: '',
        Nr_konta: '',
        Konto_typ: 'PL',
        Zapisal_admin: 0,
        Urlop: [],
        Urlop_zalegly: [],
        L4: { from: '', to: '' },
        L4cd: { from: '', to: '' },
        VAB: { from: '', to: '' },
        Pappaledi: { from: '', to: '' }
    });

    const [isDraft, setIsDraft] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [carryoverHours, setCarryoverHours] = useState(0);
    const [atfOtherMonthsTotal, setAtfOtherMonthsTotal] = useState(0);
    const [urlopOtherMonthsTotal, setUrlopOtherMonthsTotal] = useState(0);
    const [urlopZaleglyOtherMonthsTotal, setUrlopZaleglyOtherMonthsTotal] = useState(0);
    const [urlopYearTotal, setUrlopYearTotal] = useState(0);
    const [urlopZaleglyYearTotal, setUrlopZaleglyYearTotal] = useState(0);
    const [yearlyZaleglyPula, setYearlyZaleglyPula] = useState(0);
    const [latestLockedMonth, setLatestLockedMonth] = useState(null);

    const location = useLocation();

    // Ostrzeżenie przed zamknięciem lub odświeżeniem karty przy niezapisanych zmianach
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

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

            // Dynamic validation for regular vacation pool limit (max 25 days/year)
            if (field === 'Urlop') {
                const totalRegularPool = 25;
                const otherEntriesSum = nextEntries.reduce((acc, ent, i) => i === index ? acc : acc + (Number(ent.days) || 0), 0);
                const maxAllowed = Math.max(totalRegularPool - urlopOtherMonthsTotal - otherEntriesSum, 0);

                if (Number(nextEntry.days) > maxAllowed) {
                    nextEntry.days = maxAllowed > 0 ? String(maxAllowed) : '';
                    if (nextEntry.from && maxAllowed > 0) {
                        nextEntry.from = snapToNextWorkingDay(nextEntry.from);
                        nextEntry.to = addWorkingDays(nextEntry.from, maxAllowed);
                    } else if (maxAllowed === 0 && nextEntry.from) {
                        nextEntry.to = nextEntry.from;
                    }
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
                    } else if (maxAllowed === 0 && nextEntry.from) {
                        nextEntry.to = nextEntry.from;
                    }
                }
            }

            nextEntries[index] = nextEntry;
            setHasUnsavedChanges(true);
            return { ...prev, [field]: nextEntries };
        });
    };

    const addLeaveEntry = (field) => {
        if (isLockedForUser) return;
        setHasUnsavedChanges(true);
        setRozliczenie((prev) => ({
            ...prev,
            [field]: [...prev[field], { from: '', to: '', days: '' }]
        }));
    };

    const removeLeaveEntry = (field, index) => {
        if (isLockedForUser) return;
        setHasUnsavedChanges(true);
        setRozliczenie((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const updateRangeField = (field, key, value) => {
        if (isLockedForUser) return;
        setHasUnsavedChanges(true);
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
        if (hasUnsavedChanges) {
            const confirmLeave = window.confirm('Masz niezapisane zmiany w tym miesiącu. Czy na pewno chcesz opuścić formularz bez zapisywania?');
            if (!confirmLeave) return;
        }
        const [yearPart, monthPart] = miesiacRok.split('-').map(Number);
        if (!yearPart || !monthPart) return;
        const date = new Date(yearPart, monthPart - 1, 1);
        date.setMonth(date.getMonth() + offset);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const targetMonth = `${year}-${month}`;

        if (!['Administrator', 'Kierownik', 'Biuro'].includes(userAccountType) && latestLockedMonth && targetMonth < latestLockedMonth) {
            alert(`Miesiąc ${targetMonth} jest zablokowany. Administrator zatwierdził rozliczenia do miesiąca ${latestLockedMonth}. Nie można przejść do wcześniejszych miesięcy.`);
            return;
        }
        setMiesiacRok(targetMonth);
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
                        Atf_zielone: result.data.Atf_zielone || 0,
                        Czerwone_dni: result.data.Czerwone_dni || 0,
                        Urlop_zalegly_pula: result.data.Urlop_zalegly_pula || result.yearlyZaleglyPula || 0,
                        Nadgodziny_stawka: result.data.Nadgodziny_stawka || '',
                        Nadgodziny_unlocked: result.data.Nadgodziny_unlocked || 0,
                        Mieszkanie: result.data.Mieszkanie || 0,
                        Email: result.data.Email || '',
                        Nr_konta: result.data.Nr_konta || '',
                        Konto_typ: result.data.Konto_typ || 'PL',
                        Zapisal_admin: Number(result.data.Zapisal_admin) || 0,
                        Urlop: normalizeLeaveEntries(parseJsonValue(result.data.Urlop, [])),
                        Urlop_zalegly: normalizeLeaveEntries(parseJsonValue(result.data.Urlop_zalegly, [])),
                        L4: normalizeRange(parseJsonValue(result.data.L4, {})),
                        L4cd: normalizeRange(parseJsonValue(result.data.L4cd, {})),
                        VAB: normalizeRange(parseJsonValue(result.data.VAB, {})),
                        Pappaledi: normalizeRange(parseJsonValue(result.data.Pappaledi, {}))
                    });
                    setIsDraft(result.isDraft);
                    setHasUnsavedChanges(false);
                    setLatestLockedMonth(result.latestLockedMonth || null);
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

    const isLockedByLaterMonth = Boolean(latestLockedMonth && miesiacRok < latestLockedMonth && !['Administrator', 'Kierownik', 'Biuro'].includes(userAccountType));
    const isLockedForUser = (Boolean(rozliczenie.Zapisal_admin) || isLockedByLaterMonth) && !['Administrator', 'Kierownik', 'Biuro'].includes(userAccountType);
    const isPrevDisabled = !['Administrator', 'Kierownik', 'Biuro'].includes(userAccountType) && Boolean(latestLockedMonth) && miesiacRok <= latestLockedMonth;

    const handleInputChange = (e) => {
        if (isLockedForUser) return;
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? (checked ? 1 : 0) : value;
        setRozliczenie(prev => ({ ...prev, [name]: val }));
        setHasUnsavedChanges(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (isLockedForUser) {
            setMessage({ text: 'Rozliczenie zostało zablokowane przez administratora i nie może być modyfikowane.', type: 'error' });
            return;
        }
        setIsLoading(true);

        const l4Days = getRangeDays(rozliczenie.L4);
        if (l4Days > 14) {
            setMessage({ text: 'L4 moze miec maksymalnie 14 dni.', type: 'error' });
            setIsLoading(false);
            return;
        }

        const currentRegularSum = sumDays(rozliczenie.Urlop);
        const totalRegularUsed = urlopOtherMonthsTotal + currentRegularSum;
        if (totalRegularUsed > 25) {
            setMessage({ text: `Nie można zapisać: Przekroczono roczny limit urlopu zwykłego. Maksymalnie można wykorzystać 25 dni w roku (wykorzystano ${totalRegularUsed} d).`, type: 'error' });
            setIsLoading(false);
            return;
        }

        const currentZaleglySum = sumDays(rozliczenie.Urlop_zalegly);
        const totalZaleglyUsed = urlopZaleglyOtherMonthsTotal + currentZaleglySum;
        const totalPula = Number(rozliczenie.Urlop_zalegly_pula || yearlyZaleglyPula || 0);
        if (totalZaleglyUsed > totalPula) {
            setMessage({ text: `Nie można zapisać: Przekroczono dostępną pulę zaległego urlopu (wykorzystano ${totalZaleglyUsed} d z puli ${totalPula} d).`, type: 'error' });
            setIsLoading(false);
            return;
        }

        const payload = {
            Pracownik_idPracownik: selectedPracownik,
            Miesiac_rok: miesiacRok,
            ...rozliczenie,
            userAccountType: userAccountType,
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
                    setHasUnsavedChanges(false);
                }
            })
            .catch(err => {
                const errMsg = err.response?.data?.error || 'Błąd zapisu.';
                setMessage({ text: errMsg, type: 'error' });
            })
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
            mieszkanie: rozliczenie.Mieszkanie || 0,
            urlop: rozliczenie.Urlop,
            urlopZalegly: rozliczenie.Urlop_zalegly,
            l4: rozliczenie.L4,
            l4cd: rozliczenie.L4cd,
            vab: rozliczenie.VAB,
            pappaledi: rozliczenie.Pappaledi,
            nadgodzinyNaKolejny: rozliczenie.Nadgodziny_na_kolejny,
            email: rozliczenie.Email || '',
            nrKonta: rozliczenie.Nr_konta || '',
            kontoTyp: rozliczenie.Konto_typ || 'PL'
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
                        mieszkanie: d.Mieszkanie || 0,
                        urlop: parseJsonValue(d.Urlop, []),
                        urlopZalegly: parseJsonValue(d.Urlop_zalegly, []),
                        l4: parseJsonValue(d.L4, {}),
                        l4cd: parseJsonValue(d.L4cd, {}),
                        vab: parseJsonValue(d.VAB, {}),
                        pappaledi: parseJsonValue(d.Pappaledi, {}),
                        nadgodzinyNaKolejny: d.Nadgodziny_na_kolejny || 0,
                        email: d.Email || '',
                        nrKonta: d.Nr_konta || '',
                        kontoTyp: d.Konto_typ || 'PL'
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
                        onChange={(e) => {
                            if (hasUnsavedChanges) {
                                const confirmLeave = window.confirm('Masz niezapisane zmiany dla obecnego pracownika. Czy na pewno chcesz zmienić pracownika bez zapisywania?');
                                if (!confirmLeave) return;
                            }
                            setSelectedPracownik(e.target.value);
                        }}
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
                            disabled={isPrevDisabled}
                            className={`border rounded px-2 py-2 transition ${
                                isPrevDisabled 
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => shiftMonth(-1)}
                            title={isPrevDisabled ? `Zablokowane: administrator zatwierdził rozliczenia do miesiąca ${latestLockedMonth}` : 'Poprzedni miesiąc'}
                            aria-label="Poprzedni miesiąc"
                        >
                            &larr;
                        </button>
                        <input
                            type="month"
                            value={miesiacRok}
                            min={!['Administrator', 'Kierownik', 'Biuro'].includes(userAccountType) && latestLockedMonth ? latestLockedMonth : undefined}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!['Administrator', 'Kierownik', 'Biuro'].includes(userAccountType) && latestLockedMonth && val < latestLockedMonth) {
                                    alert(`Nie można wybrać miesiąca wcześniejszego niż ${latestLockedMonth}. Administrator zatwierdził rozliczenia do tego miesiąca.`);
                                    return;
                                }
                                if (hasUnsavedChanges) {
                                    const confirmLeave = window.confirm('Masz niezapisane zmiany w tym miesiącu. Czy na pewno chcesz zmienić miesiąc bez zapisywania?');
                                    if (!confirmLeave) return;
                                }
                                setMiesiacRok(val);
                            }}
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

                {/* Ostrzeżenie o blokadzie przez administratora */}
                {isLockedByLaterMonth ? (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-900 rounded shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔒</span>
                            <div>
                                <h4 className="font-bold text-sm">Miesiąc zablokowany (Modyfikacja wsteczna niedozwolona)</h4>
                                <p className="text-xs text-red-700 mt-0.5">
                                    Administrator zatwierdził rozliczenia do miesiąca <strong>{latestLockedMonth}</strong>. Nie można edytować wcześniejszych miesięcy ({miesiacRok}).
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-bold bg-red-200 text-red-800 px-3 py-1 rounded-full uppercase tracking-wider">
                            Zablokowane wstecz
                        </span>
                    </div>
                ) : isLockedForUser ? (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-900 rounded shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔒</span>
                            <div>
                                <h4 className="font-bold text-sm">Rozliczenie zablokowane przez Administratora</h4>
                                <p className="text-xs text-red-700 mt-0.5">
                                    Dane za ten miesiąc zostały uzupełnione i zatwierdzone przez administratora. Formularz jest w trybie tylko do odczytu.
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-bold bg-red-200 text-red-800 px-3 py-1 rounded-full uppercase tracking-wider">
                            Tylko podgląd
                        </span>
                    </div>
                ) : null}

                <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b gap-3">
                    <h3 className="text-lg font-semibold text-gray-700">Szczegóły: {miesiacRok}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {Boolean(rozliczenie.Zapisal_admin) && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1 shadow-sm">
                                🔒 Zapisane przez Administratora
                            </span>
                        )}
                        {['Administrator', 'Kierownik', 'Biuro'].includes(userAccountType) && (
                            <label className="flex items-center gap-2 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded cursor-pointer hover:bg-indigo-100 transition shadow-sm">
                                <input
                                    type="checkbox"
                                    name="Zapisal_admin"
                                    checked={Boolean(rozliczenie.Zapisal_admin)}
                                    onChange={(e) => {
                                        setRozliczenie(prev => ({ ...prev, Zapisal_admin: e.target.checked ? 1 : 0 }));
                                        setHasUnsavedChanges(true);
                                    }}
                                    className="w-3.5 h-3.5 text-indigo-600 rounded"
                                />
                                <span>Zablokuj dla pracownika</span>
                            </label>
                        )}
                        {hasUnsavedChanges && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse flex items-center gap-1 shadow-sm">
                                ⚠️ Niezapisane zmiany
                            </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isDraft ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                            {isDraft ? 'Szkic (niezapisany)' : 'Zapisane w bazie'}
                        </span>
                    </div>
                </div>

                {hasUnsavedChanges && (
                    <div className="mb-6 p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded flex items-center justify-between text-sm shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">⚠️</span>
                            <div>
                                <span className="font-bold">Masz niezapisane zmiany!</span>
                                <span className="text-amber-700 ml-1 text-xs">Pamiętaj, aby zapisać rozliczenie przed opuszczeniem formularza.</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow"
                        >
                            Zapisz teraz
                        </button>
                    </div>
                )}

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
                                disabled={isLockedForUser}
                                placeholder="puste"
                                className={`mt-1 w-full border rounded p-2 font-semibold ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-blue-500'}`}
                            />
                            <p className="text-xs text-gray-500 mt-1">Wpisywane recznie lub przez administratora w widoku zbiorczym.</p>
                        </div>

                        {/* Stawki / dodatki nadgodzin pod pracownikiem z gotowymi przyciskami */}
                        <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase">Stawka / dodatki</label>
                            <div className="flex flex-wrap items-center gap-2">
                                {['100%', '100% + 10kr', '88%'].map((stawka) => (
                                    <button
                                        key={stawka}
                                        type="button"
                                        disabled={isLockedForUser}
                                        onClick={() => {
                                            if (isLockedForUser) return;
                                            setRozliczenie(prev => ({ ...prev, Nadgodziny_stawka: stawka }));
                                            setHasUnsavedChanges(true);
                                        }}
                                        className={`px-3 py-1 text-xs font-bold rounded border transition ${
                                            rozliczenie.Nadgodziny_stawka === stawka
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                        } ${isLockedForUser ? 'cursor-not-allowed opacity-70' : ''}`}
                                    >
                                        {stawka}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                name="Nadgodziny_stawka"
                                value={rozliczenie.Nadgodziny_stawka || ''}
                                onChange={handleInputChange}
                                disabled={isLockedForUser}
                                placeholder="Wybierz gotową powyżej lub wpisz ręcznie (np. 100% + 10kr)"
                                className={`w-full border rounded p-2 text-sm font-semibold ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300 focus:ring-blue-500'}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Z banku godzin z poprzedniego miesiąca</label>
                            <input
                                type="number"
                                step="0.5"
                                name="Nadgodziny_z_poprzedniego"
                                value={rozliczenie.Nadgodziny_z_poprzedniego}
                                onChange={handleInputChange}
                                disabled={isLockedForUser}
                                className={`mt-1 w-full border rounded p-2 ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-blue-500'}`}
                            />
                            <p className="text-xs text-gray-500 mt-1">Automatycznie trafiły z banku godzin z poprzedniego miesiąca: {carryoverHours} h</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Odjąć za mieszkanie</label>
                            <input
                                type="number"
                                step="100"
                                name="Mieszkanie"
                                value={rozliczenie.Mieszkanie !== undefined && rozliczenie.Mieszkanie !== null && rozliczenie.Mieszkanie !== 0 ? rozliczenie.Mieszkanie : ''}
                                onChange={handleInputChange}
                                disabled={isLockedForUser}
                                placeholder="np. 3000"
                                className={`mt-1 w-full border rounded p-2 font-semibold ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-blue-500'}`}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 text-red-600">Czerwone dni (ilość)</label>
                            <input
                                type="number"
                                name="Czerwone_dni"
                                value={rozliczenie.Czerwone_dni}
                                onChange={handleInputChange}
                                disabled={isLockedForUser}
                                className={`mt-1 w-full border rounded p-2 ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-red-300 focus:ring-red-500'}`}
                            />
                        </div>

                        {/* ATF */}
                        <div>
                            <div className="grid grid-cols-2 gap-3 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ATF</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        name="Atf_wykorzystane"
                                        value={rozliczenie.Atf_wykorzystane !== undefined && rozliczenie.Atf_wykorzystane !== null && rozliczenie.Atf_wykorzystane !== 0 ? rozliczenie.Atf_wykorzystane : ''}
                                        onChange={handleInputChange}
                                        disabled={isLockedForUser}
                                        placeholder="0"
                                        className={`w-full border rounded p-2 font-semibold text-sm ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-blue-500'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pozostało:</label>
                                    <div className="w-full border border-yellow-300 bg-yellow-50 rounded p-2 font-bold text-gray-800 flex items-center justify-between text-sm">
                                        <span>{Math.max(40 - atfOtherMonthsTotal - (Number(rozliczenie.Atf_wykorzystane) || 0), 0)} h</span>
                                        <span className="text-xs font-normal text-gray-500">(z 40 h)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Nadgodziny (do wypłaty) przeniesione nad nadgodziny przeniesione na kolejny miesiąc */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nadgodziny (do wypłaty)</label>
                            <input
                                type="number"
                                step="0.5"
                                name="Nadgodziny_wyplata"
                                value={rozliczenie.Nadgodziny_wyplata}
                                onChange={handleInputChange}
                                disabled={isLockedForUser}
                                className={`mt-1 w-full border rounded p-2 font-semibold ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-blue-500'}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nadgodziny przeniesione na kolejny miesiąc</label>
                            {(() => {
                                const isCarryoverLocked = isLockedForUser || (carryoverHours > 0 && !Boolean(rozliczenie.Nadgodziny_unlocked));
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
                                                {isLockedForUser ? '🔒 Rozliczenie zablokowane' : '🚫 Nadgodziny nie mogą zostać przeniesione 2 miesiące z rzędu.'}
                                            </p>
                                        )}
                                        {['Administrator', 'Kierownik'].includes(userAccountType) && (
                                            <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="Nadgodziny_unlocked"
                                                    checked={Boolean(rozliczenie.Nadgodziny_unlocked)}
                                                    onChange={handleInputChange}
                                                    disabled={isLockedForUser}
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
                                    disabled={isLockedForUser || (Number(rozliczenie.Urlop_zalegly_pula || yearlyZaleglyPula || 0) > 0 && userAccountType !== 'Administrator')}
                                    className={`w-24 border rounded p-1.5 text-sm font-bold focus:ring-amber-500 ${(isLockedForUser || (Number(rozliczenie.Urlop_zalegly_pula || yearlyZaleglyPula || 0) > 0 && userAccountType !== 'Administrator'))
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

                {/* Sekcja: Dane do wypłaty i e-mail */}
                <div className="mt-8 border-t pt-6 bg-slate-50/80 p-5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <span>💳</span> Dane do wypłaty i kontakt
                        </h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-semibold">
                            Zapamiętywane na kolejne miesiące
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                        Wprowadzony e-mail oraz konto bankowe zostaną automatycznie przeniesione i uzupełnione na przyszłe miesiące.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* E-mail */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Aktualny e-mail pracownika
                            </label>
                            <input
                                type="email"
                                name="Email"
                                value={rozliczenie.Email || ''}
                                onChange={handleInputChange}
                                disabled={isLockedForUser}
                                placeholder="np. jan.kowalski@gmail.com"
                                className={`w-full border rounded-lg p-2.5 text-sm transition ${
                                    isLockedForUser
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200'
                                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                                }`}
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Adres, na który trafiają rozliczenia i powiadomienia</p>
                        </div>

                        {/* Konto do wypłaty */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Konto do wypłaty
                            </label>
                            <div className="flex gap-2">
                                {/* Przełącznik PL / SE */}
                                <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white shrink-0">
                                    <button
                                        type="button"
                                        disabled={isLockedForUser}
                                        onClick={() => !isLockedForUser && setRozliczenie(prev => ({ ...prev, Konto_typ: 'PL' }))}
                                        className={`px-3 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                                            (rozliczenie.Konto_typ || 'PL') === 'PL'
                                                ? 'bg-blue-600 text-white shadow-inner'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        } ${isLockedForUser ? 'cursor-not-allowed opacity-75' : ''}`}
                                    >
                                        <span>🇵🇱</span> PL
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isLockedForUser}
                                        onClick={() => !isLockedForUser && setRozliczenie(prev => ({ ...prev, Konto_typ: 'SE' }))}
                                        className={`px-3 py-2 text-xs font-bold transition border-l border-gray-200 flex items-center gap-1.5 ${
                                            rozliczenie.Konto_typ === 'SE'
                                                ? 'bg-blue-600 text-white shadow-inner'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        } ${isLockedForUser ? 'cursor-not-allowed opacity-75' : ''}`}
                                    >
                                        <span>🇸🇪</span> SE
                                    </button>
                                </div>

                                {/* Numer konta */}
                                <input
                                    type="text"
                                    name="Nr_konta"
                                    value={rozliczenie.Nr_konta || ''}
                                    onChange={handleInputChange}
                                    disabled={isLockedForUser}
                                    placeholder={(rozliczenie.Konto_typ || 'PL') === 'PL' ? '00 0000 0000 0000 0000 0000 0000' : 'Numer konta / IBAN (SE)'}
                                    className={`flex-1 min-w-0 border rounded-lg p-2.5 text-sm font-mono transition ${
                                        isLockedForUser
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200'
                                            : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                                    }`}
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">
                                Typ konta: <strong className="text-gray-600">{rozliczenie.Konto_typ || 'PL'}</strong>. Wybierz kraj i wprowadź numer rachunku.
                            </p>
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
                                            disabled={isLockedForUser || hasRemainingZalegly}
                                            className={`text-sm font-semibold transition ${(isLockedForUser || hasRemainingZalegly) ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'
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
                                                            disabled={isLockedForUser || hasRemainingZalegly}
                                                            onChange={(e) => updateLeaveEntry('Urlop', index, 'from', e.target.value)}
                                                            className={`w-full border rounded p-2 text-sm ${(isLockedForUser || hasRemainingZalegly) ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Do</label>
                                                        <input
                                                            type="date"
                                                            value={entry.to}
                                                            disabled={isLockedForUser || hasRemainingZalegly}
                                                            onChange={(e) => updateLeaveEntry('Urlop', index, 'to', e.target.value)}
                                                            className={`w-full border rounded p-2 text-sm ${(isLockedForUser || hasRemainingZalegly) ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
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
                                                            disabled={isLockedForUser || hasRemainingZalegly}
                                                            onChange={(e) => updateLeaveEntry('Urlop', index, 'days', e.target.value)}
                                                            className={`w-16 border rounded p-1 text-center text-sm font-bold ${(isLockedForUser || hasRemainingZalegly) ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
                                                            placeholder="dni"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={isLockedForUser}
                                                        className={`text-xs font-bold transition ${isLockedForUser ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
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
                                            className={`text-sm font-semibold transition ${(isLockedForUser || (remainingZalegly <= 0 && rozliczenie.Urlop_zalegly.length > 0)) ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                                            onClick={() => addLeaveEntry('Urlop_zalegly')}
                                            disabled={isLockedForUser || (remainingZalegly <= 0 && rozliczenie.Urlop_zalegly.length > 0)}
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
                                                            disabled={isLockedForUser}
                                                            onChange={(e) => updateLeaveEntry('Urlop_zalegly', index, 'from', e.target.value)}
                                                            className={`w-full border rounded p-2 text-sm ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Do</label>
                                                        <input
                                                            type="date"
                                                            value={entry.to}
                                                            disabled={isLockedForUser}
                                                            onChange={(e) => updateLeaveEntry('Urlop_zalegly', index, 'to', e.target.value)}
                                                            className={`w-full border rounded p-2 text-sm ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
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
                                                            disabled={isLockedForUser}
                                                            onChange={(e) => updateLeaveEntry('Urlop_zalegly', index, 'days', e.target.value)}
                                                            className={`w-16 border rounded p-1 text-center text-sm font-bold ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300 focus:ring-1 focus:ring-blue-500'}`}
                                                            placeholder="dni"
                                                        />

                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={isLockedForUser}
                                                        className={`text-xs font-bold transition ${isLockedForUser ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
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
                                    disabled={isLockedForUser}
                                    onChange={(e) => updateRangeField('L4', 'from', e.target.value)}
                                    className={`flex-1 min-w-0 border rounded p-2 ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
                                />
                                <input
                                    type="date"
                                    value={rozliczenie.L4.to}
                                    disabled={isLockedForUser}
                                    onChange={(e) => updateRangeField('L4', 'to', e.target.value)}
                                    className={`flex-1 min-w-0 border rounded p-2 ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
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
                                    disabled={isLockedForUser}
                                    onChange={(e) => updateRangeField('L4cd', 'from', e.target.value)}
                                    className={`flex-1 min-w-0 border rounded p-2 ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
                                />
                                <input
                                    type="date"
                                    value={rozliczenie.L4cd.to}
                                    disabled={isLockedForUser}
                                    onChange={(e) => updateRangeField('L4cd', 'to', e.target.value)}
                                    className={`flex-1 min-w-0 border rounded p-2 ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">VAB (od-do)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={rozliczenie.VAB.from}
                                    disabled={isLockedForUser}
                                    onChange={(e) => updateRangeField('VAB', 'from', e.target.value)}
                                    className={`flex-1 min-w-0 border rounded p-2 ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
                                />
                                <input
                                    type="date"
                                    value={rozliczenie.VAB.to}
                                    disabled={isLockedForUser}
                                    onChange={(e) => updateRangeField('VAB', 'to', e.target.value)}
                                    className={`flex-1 min-w-0 border rounded p-2 ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Pappaledi (od-do)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={rozliczenie.Pappaledi.from}
                                    disabled={isLockedForUser}
                                    onChange={(e) => updateRangeField('Pappaledi', 'from', e.target.value)}
                                    className={`flex-1 min-w-0 border rounded p-2 ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
                                />
                                <input
                                    type="date"
                                    value={rozliczenie.Pappaledi.to}
                                    disabled={isLockedForUser}
                                    onChange={(e) => updateRangeField('Pappaledi', 'to', e.target.value)}
                                    className={`flex-1 min-w-0 border rounded p-2 ${isLockedForUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'}`}
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
                    {isLockedForUser ? (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm text-sm">
                            🔒 Rozliczenie zablokowane przez Administratora (Tylko do odczytu)
                        </div>
                    ) : (
                        <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700 transition shadow-lg text-lg">
                            Zapisz rozliczenie
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default RozliczeniaMiesieczne;