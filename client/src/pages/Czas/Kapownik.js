import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { downloadRozliczeniePDF } from '../../Components/RozliczeniaPDF';

const Kapownik = () => {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const navigate = useNavigate();

    const [miesiacRok, setMiesiacRok] = useState(new Date().toISOString().slice(0, 7));
    const [dane, setDane] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const pobierzDaneKapownika = () => {
        setIsLoading(true);
        setMessage('');
        Axios.get(`${baseUrl}/api/rozliczenia/kapownik`, {
            withCredentials: true,
            params: { miesiacRok }
        })
            .then(response => {
                if (response.data.status === 'success') {
                    setDane(response.data.data);
                } else {
                    setMessage('Błąd podczas pobierania danych.');
                }
            })
            .catch(err => {
                console.error(err);
                setMessage('Nie udało się pobrać danych kapownika.');
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        pobierzDaneKapownika();
    }, [miesiacRok]);

    const shiftMonth = (offset) => {
        if (!miesiacRok) return;
        const [yearPart, monthPart] = miesiacRok.split('-').map(Number);
        const date = new Date(yearPart, monthPart - 1, 1);
        date.setMonth(date.getMonth() + offset);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        setMiesiacRok(`${year}-${month}`);
    };

    const handleGoToDetails = (idPracownik) => {
        navigate('/home/rozliczenia', {
            state: {
                pracownikId: idPracownik,
                miesiacRok: miesiacRok
            }
        });
    };

    const sumDays = (leaveArray) => {
        if (!Array.isArray(leaveArray)) return 0;
        return leaveArray.reduce((acc, entry) => acc + (Number(entry.days) || 0), 0);
    };

    const formatRange = (range) => {
        if (!range || !range.from || !range.to) return '';
        // Format from YYYY-MM-DD to DD.MM
        const formatDate = (str) => {
            if (!str) return '';
            const parts = str.split('-');
            if (parts.length === 3) return `${parts[2]}.${parts[1]}`;
            return str;
        };
        return `${formatDate(range.from)} - ${formatDate(range.to)}`;
    };

    const countRangeDays = (range) => {
        if (!range || !range.from || !range.to) return 0;
        const fromDate = new Date(range.from);
        const toDate = new Date(range.to);
        if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return 0;
        const diffMs = toDate.getTime() - fromDate.getTime();
        if (diffMs < 0) return 0;
        return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    };

    const [domyslneMozliwe, setDomyslneMozliwe] = useState('');

    const handleDomyslneChange = (val) => {
        setDomyslneMozliwe(val);
        setDane(prev => prev.map(item => ({
            ...item,
            Mozliwe_godziny: val === '' ? '' : Number(val)
        })));
    };

    const handleRowMozliweChange = (idPracownik, val) => {
        setDane(prev => prev.map(item => {
            if (item.idPracownik === idPracownik) {
                return { ...item, Mozliwe_godziny: val === '' ? '' : Number(val) };
            }
            return item;
        }));
    };

    const handleZapiszWszystkieMozliwe = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const promises = dane.map(item => {
                const payload = {
                    Pracownik_idPracownik: item.idPracownik,
                    Miesiac_rok: miesiacRok,
                    Godziny_przepracowane: item.Godziny_przepracowane || 0,
                    Mozliwe_godziny: item.Mozliwe_godziny === '' ? null : item.Mozliwe_godziny,
                    Nadgodziny_wyplata: item.Nadgodziny_wyplata || 0,
                    Nadgodziny_z_poprzedniego: item.Nadgodziny_z_poprzedniego || 0,
                    Nadgodziny_na_kolejny: item.Nadgodziny_na_kolejny || 0,
                    Atf_wykorzystane: item.Atf_wykorzystane || 0,
                    Czerwone_dni: item.Czerwone_dni || 0,
                    Urlop: JSON.stringify(item.Urlop || []),
                    Urlop_zalegly: JSON.stringify(item.Urlop_zalegly || []),
                    L4: JSON.stringify(item.L4 || { from: '', to: '' }),
                    L4cd: JSON.stringify(item.L4cd || { from: '', to: '' }),
                    VAB: JSON.stringify(item.VAB || { from: '', to: '' }),
                    Pappaledi: JSON.stringify(item.Pappaledi || { from: '', to: '' })
                };
                return Axios.post(`${baseUrl}/api/rozliczenia`, payload, { withCredentials: true });
            });
            await Promise.all(promises);
            setMessage('Zapisano możliwe godziny dla wszystkich pracowników.');
        } catch (err) {
            console.error(err);
            setMessage('Błąd podczas zapisywania możliwych godzin.');
        } finally {
            setIsLoading(false);
        }
    };

    const parseJsonValue = (value, fallback) => {
        if (value === null || value === undefined || value === '') return fallback;
        if (typeof value === 'string') {
            try { return JSON.parse(value); } catch (e) { return fallback; }
        }
        return value;
    };

    const handleDrukujPDFPojedynczy = async (item) => {
        setIsLoading(true);
        try {
            const res = await Axios.get(`${baseUrl}/api/rozliczenia`, {
                withCredentials: true,
                params: { pracownikId: item.idPracownik, miesiacRok: miesiacRok }
            });

            const d = res.data?.status === 'success' ? res.data.data : item;
            const extra = res.data || {};

            const sheetData = {
                pracownikName: `${item.Imie} ${item.Nazwisko}`,
                miesiacRok: miesiacRok,
                godzinyPrzepracowane: d.Godziny_przepracowane || item.Godziny_przepracowane || 0,
                mozliweGodziny: d.Mozliwe_godziny || item.Mozliwe_godziny || '',
                nadgodzinyWyplata: d.Nadgodziny_wyplata || item.Nadgodziny_wyplata || 0,
                nadgodzinyStawka: d.Nadgodziny_stawka || item.Nadgodziny_stawka || '',
                czerwoneDni: d.Czerwone_dni || item.Czerwone_dni || 0,
                nadgodzinyZPoprzedniego: d.Nadgodziny_z_poprzedniego || item.Nadgodziny_z_poprzedniego || 0,
                atfWykorzystane: d.Atf_wykorzystane || item.Atf_wykorzystane || 0,
                atfOtherMonthsTotal: extra.atfOtherMonthsTotal || 0,
                urlopOtherMonthsTotal: extra.urlopOtherMonthsTotal || 0,
                urlopZaleglyOtherMonthsTotal: extra.urlopZaleglyOtherMonthsTotal || 0,
                yearlyZaleglyPula: extra.yearlyZaleglyPula || 0,
                urlopPulaInput: d.Urlop_zalegly_pula || item.Urlop_zalegly_pula || 0,
                urlop: parseJsonValue(d.Urlop, item.Urlop || []),
                urlopZalegly: parseJsonValue(d.Urlop_zalegly, item.Urlop_zalegly || []),
                l4: parseJsonValue(d.L4, item.L4 || {}),
                l4cd: parseJsonValue(d.L4cd, item.L4cd || {}),
                vab: parseJsonValue(d.VAB, item.VAB || {}),
                pappaledi: parseJsonValue(d.Pappaledi, item.Pappaledi || {}),
                nadgodzinyNaKolejny: d.Nadgodziny_na_kolejny || item.Nadgodziny_na_kolejny || 0,
                email: item.Email || item.email || ''
            };

            const filename = `Rozliczenie_${item.Imie}_${item.Nazwisko}_${miesiacRok}.pdf`;
            await downloadRozliczeniePDF([sheetData], filename);
        } catch (err) {
            console.error('Błąd drukowania pojedynczego PDF z kapownika:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectAll = (filteredItems) => {
        if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredItems.map(item => item.idPracownik));
        }
    };

    const toggleSelectEmployee = (idPracownik) => {
        setSelectedIds(prev =>
            prev.includes(idPracownik)
                ? prev.filter(id => id !== idPracownik)
                : [...prev, idPracownik]
        );
    };

    const handleDrukujPDFZaznaczeni = async () => {
        if (selectedIds.length === 0) {
            setMessage('Zaznacz przynajmniej jednego pracownika w tabeli (checkbox), aby wygenerować PDF.');
            return;
        }
        setIsLoading(true);
        setMessage('');
        try {
            const sheets = [];
            const targetItems = dane.filter(item => selectedIds.includes(item.idPracownik));
            for (const item of targetItems) {
                const res = await Axios.get(`${baseUrl}/api/rozliczenia`, {
                    withCredentials: true,
                    params: { pracownikId: item.idPracownik, miesiacRok: miesiacRok }
                });

                const d = res.data?.status === 'success' ? res.data.data : item;
                const extra = res.data || {};

                sheets.push({
                    pracownikName: `${item.Imie} ${item.Nazwisko}`,
                    miesiacRok: miesiacRok,
                    godzinyPrzepracowane: d.Godziny_przepracowane || item.Godziny_przepracowane || 0,
                    mozliweGodziny: d.Mozliwe_godziny || item.Mozliwe_godziny || '',
                    nadgodzinyWyplata: d.Nadgodziny_wyplata || item.Nadgodziny_wyplata || 0,
                    nadgodzinyStawka: d.Nadgodziny_stawka || item.Nadgodziny_stawka || '',
                    czerwoneDni: d.Czerwone_dni || item.Czerwone_dni || 0,
                    nadgodzinyZPoprzedniego: d.Nadgodziny_z_poprzedniego || item.Nadgodziny_z_poprzedniego || 0,
                    atfWykorzystane: d.Atf_wykorzystane || item.Atf_wykorzystane || 0,
                    atfOtherMonthsTotal: extra.atfOtherMonthsTotal || 0,
                    urlopOtherMonthsTotal: extra.urlopOtherMonthsTotal || 0,
                    urlopZaleglyOtherMonthsTotal: extra.urlopZaleglyOtherMonthsTotal || 0,
                    yearlyZaleglyPula: extra.yearlyZaleglyPula || 0,
                    urlopPulaInput: d.Urlop_zalegly_pula || item.Urlop_zalegly_pula || 0,
                    urlop: parseJsonValue(d.Urlop, item.Urlop || []),
                    urlopZalegly: parseJsonValue(d.Urlop_zalegly, item.Urlop_zalegly || []),
                    l4: parseJsonValue(d.L4, item.L4 || {}),
                    l4cd: parseJsonValue(d.L4cd, item.L4cd || {}),
                    vab: parseJsonValue(d.VAB, item.VAB || {}),
                    pappaledi: parseJsonValue(d.Pappaledi, item.Pappaledi || {}),
                    nadgodzinyNaKolejny: d.Nadgodziny_na_kolejny || item.Nadgodziny_na_kolejny || 0,
                    email: item.Email || item.email || ''
                });
            }
            await downloadRozliczeniePDF(sheets, `Rozliczenia_Zaznaczeni_${miesiacRok}.pdf`);
        } catch (err) {
            console.error('Błąd drukowania wybranych z kapownika:', err);
            setMessage('Wystąpił błąd podczas generowania pliku PDF.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrukujPDFWszyscy = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const sheets = [];
            for (const item of dane) {
                const res = await Axios.get(`${baseUrl}/api/rozliczenia`, {
                    withCredentials: true,
                    params: { pracownikId: item.idPracownik, miesiacRok: miesiacRok }
                });

                const d = res.data?.status === 'success' ? res.data.data : item;
                const extra = res.data || {};

                sheets.push({
                    pracownikName: `${item.Imie} ${item.Nazwisko}`,
                    miesiacRok: miesiacRok,
                    godzinyPrzepracowane: d.Godziny_przepracowane || item.Godziny_przepracowane || 0,
                    mozliweGodziny: d.Mozliwe_godziny || item.Mozliwe_godziny || '',
                    nadgodzinyWyplata: d.Nadgodziny_wyplata || item.Nadgodziny_wyplata || 0,
                    nadgodzinyStawka: d.Nadgodziny_stawka || item.Nadgodziny_stawka || '',
                    czerwoneDni: d.Czerwone_dni || item.Czerwone_dni || 0,
                    nadgodzinyZPoprzedniego: d.Nadgodziny_z_poprzedniego || item.Nadgodziny_z_poprzedniego || 0,
                    atfWykorzystane: d.Atf_wykorzystane || item.Atf_wykorzystane || 0,
                    atfOtherMonthsTotal: extra.atfOtherMonthsTotal || 0,
                    urlopOtherMonthsTotal: extra.urlopOtherMonthsTotal || 0,
                    urlopZaleglyOtherMonthsTotal: extra.urlopZaleglyOtherMonthsTotal || 0,
                    yearlyZaleglyPula: extra.yearlyZaleglyPula || 0,
                    urlopPulaInput: d.Urlop_zalegly_pula || item.Urlop_zalegly_pula || 0,
                    urlop: parseJsonValue(d.Urlop, item.Urlop || []),
                    urlopZalegly: parseJsonValue(d.Urlop_zalegly, item.Urlop_zalegly || []),
                    l4: parseJsonValue(d.L4, item.L4 || {}),
                    l4cd: parseJsonValue(d.L4cd, item.L4cd || {}),
                    vab: parseJsonValue(d.VAB, item.VAB || {}),
                    pappaledi: parseJsonValue(d.Pappaledi, item.Pappaledi || {}),
                    nadgodzinyNaKolejny: d.Nadgodziny_na_kolejny || item.Nadgodziny_na_kolejny || 0,
                    email: item.Email || item.email || ''
                });
            }
            await downloadRozliczeniePDF(sheets, `Rozliczenia_Wszyscy_${miesiacRok}.pdf`);
        } catch (err) {
            console.error('Błąd drukowania zbiorczego PDF:', err);
            setMessage('Wystąpił błąd podczas generowania pliku PDF.');
        } finally {
            setIsLoading(false);
        }
    };

    // Filtrowanie pracowników na podstawie wpisanego wyszukiwania
    const filteredDane = dane.filter(item => {
        const fullName = `${item.Imie} ${item.Nazwisko}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Miesięczne Rozliczenia Pracowników (Administrator)</h2>

            {/* Panel kontrolny (Miesiąc / Wyszukiwarka / Domyślne możliwe godziny) */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 max-w-sm">
                    <button
                        type="button"
                        className="border border-gray-300 rounded px-3 py-2 text-gray-600 hover:bg-gray-50 transition"
                        onClick={() => shiftMonth(-1)}
                    >
                        &larr;
                    </button>
                    <input
                        type="month"
                        value={miesiacRok}
                        onChange={(e) => setMiesiacRok(e.target.value)}
                        className="border border-gray-300 rounded p-2 font-semibold text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        type="button"
                        className="border border-gray-300 rounded px-3 py-2 text-gray-600 hover:bg-gray-50 transition"
                        onClick={() => shiftMonth(1)}
                    >
                        &rarr;
                    </button>
                </div>

                <div className="flex items-center gap-2 border-l border-r px-4 py-1 border-gray-200">
                    <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                        Domyślne możliwe godziny dla wszystkich:
                    </label>
                    <input
                        type="number"
                        placeholder="np. 160"
                        value={domyslneMozliwe}
                        onChange={(e) => handleDomyslneChange(e.target.value)}
                        className="w-24 border border-gray-300 rounded p-1.5 text-sm focus:ring-blue-500 focus:border-blue-500 font-semibold"
                    />
                    <button
                        type="button"
                        onClick={handleZapiszWszystkieMozliwe}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded transition shadow-sm"
                    >
                        Zapisz dla wszystkich
                    </button>
                    <button
                        type="button"
                        onClick={handleDrukujPDFZaznaczeni}
                        className={`text-xs font-bold px-3 py-2 rounded transition shadow-sm flex items-center gap-1 text-white ${
                            selectedIds.length > 0 ? 'bg-purple-700 hover:bg-purple-800 ring-2 ring-purple-400' : 'bg-purple-400 cursor-not-allowed'
                        }`}
                        disabled={selectedIds.length === 0}
                    >
                        🖨️ Drukuj PDF (Zaznaczeni: {selectedIds.length})
                    </button>
                    <button
                        type="button"
                        onClick={handleDrukujPDFWszyscy}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded transition shadow-sm flex items-center gap-1"
                    >
                        📚 Drukuj PDF (Wszyscy)
                    </button>
                </div>

                <div className="w-full lg:max-w-xs">
                    <input
                        type="text"
                        placeholder="Szukaj pracownika..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>
            </div>

            {message && (
                <div className="p-4 mb-6 rounded bg-red-100 text-red-700 text-sm flex items-center justify-between">
                    <span>{message}</span>
                    <button type="button" onClick={() => setMessage('')} className="font-bold text-red-800 text-xs">✕ Zamknij</button>
                </div>
            )}

            {/* Tabela kapownika */}
            <div className="bg-white rounded-lg shadow overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                        <span className="font-bold text-gray-600">Ładowanie i generowanie PDF...</span>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase tracking-wider border-b text-[10px] font-bold">
                                <th className="p-3 w-10 text-center sticky left-0 bg-gray-100 z-20">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredDane.length && filteredDane.length > 0}
                                        onChange={() => toggleSelectAll(filteredDane)}
                                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                                        title="Zaznacz/odznacz wszystkich"
                                    />
                                </th>
                                <th className="p-3 sticky left-10 bg-gray-100 z-10">Pracownik</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Godziny (B)</th>
                                <th className="p-3 text-center">Możliwe</th>
                                <th className="p-3 text-center">Nadgodziny</th>
                                <th className="p-3 text-center">Z banku</th>
                                <th className="p-3 text-center">Na kolejny</th>
                                <th className="p-3 text-center">ATF</th>
                                <th className="p-3 text-center">Czer. dni</th>
                                <th className="p-3">L4</th>
                                <th className="p-3">VAB / Pappaledi</th>
                                <th className="p-3">Urlop (akt / zal)</th>
                                <th className="p-3 text-center">Akcja</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredDane.length === 0 ? (
                                <tr>
                                    <td colSpan="14" className="p-8 text-center text-gray-500 text-sm">
                                        {isLoading ? 'Ładowanie...' : 'Brak danych do wyświetlenia.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredDane.map((item) => {
                                    const isSelected = selectedIds.includes(item.idPracownik);
                                    const l4Days = countRangeDays(item.L4);
                                    const l4cdDays = countRangeDays(item.L4cd);
                                    const vabDays = countRangeDays(item.VAB);
                                    const pappaDays = countRangeDays(item.Pappaledi);

                                    const urlopDays = sumDays(item.Urlop);
                                    const urlopZaleglyDays = sumDays(item.Urlop_zalegly);

                                    return (
                                        <tr key={item.idPracownik} className={`transition-colors ${isSelected ? 'bg-purple-50/70' : 'hover:bg-gray-50'}`}>
                                            {/* Checkbox zaznaczenia */}
                                            <td className="p-3 text-center sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectEmployee(item.idPracownik)}
                                                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                                                />
                                            </td>

                                            {/* Pracownik */}
                                            <td className="p-3 font-semibold text-gray-900 sticky left-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                {item.Nazwisko} {item.Imie}
                                            </td>

                                            {/* Status */}
                                            <td className="p-3">
                                                {item.idRozliczenia ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-800">
                                                        ZAPISANE
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-yellow-100 text-yellow-800">
                                                        SZKIC
                                                    </span>
                                                )}
                                            </td>

                                            {/* Godziny ogółem */}
                                            <td className="p-3 text-center font-bold text-blue-700">
                                                {item.Godziny_przepracowane}h
                                            </td>

                                            {/* Możliwe */}
                                            <td className="p-3 text-center text-gray-600">
                                                <input
                                                    type="number"
                                                    value={item.Mozliwe_godziny ?? ''}
                                                    placeholder="—"
                                                    onChange={(e) => handleRowMozliweChange(item.idPracownik, e.target.value)}
                                                    className="w-16 border border-gray-300 rounded p-1 text-center text-xs focus:ring-1 focus:ring-blue-500 font-semibold"
                                                />
                                            </td>

                                            {/* Nadgodziny */}
                                            <td className="p-3 text-center text-gray-600">
                                                {item.Nadgodziny_wyplata ? `${item.Nadgodziny_wyplata}h` : '—'}
                                            </td>

                                            {/* Z banku */}
                                            <td className="p-3 text-center text-gray-600">
                                                {item.Nadgodziny_z_poprzedniego ? `${item.Nadgodziny_z_poprzedniego}h` : '—'}
                                            </td>

                                            {/* Na kolejny */}
                                            <td className="p-3 text-center text-gray-600">
                                                {item.Nadgodziny_na_kolejny ? `${item.Nadgodziny_na_kolejny}h` : '—'}
                                            </td>

                                            {/* ATF */}
                                            <td className="p-3 text-center font-semibold text-gray-700">
                                                {item.Atf_wykorzystane ? `${item.Atf_wykorzystane}h` : '—'}
                                            </td>

                                            {/* Czerwone dni */}
                                            <td className="p-3 text-center text-red-600 font-semibold">
                                                {item.Czerwone_dni ? `${item.Czerwone_dni} dni` : '—'}
                                            </td>

                                            {/* L4 (Chorobowe) */}
                                            <td className="p-3 space-y-1">
                                                {l4Days > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[9px] font-bold">L4 ({l4Days}d):</span>
                                                        <span className="text-gray-600">{formatRange(item.L4)}</span>
                                                    </div>
                                                )}
                                                {l4cdDays > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[9px] font-bold">c.d. ({l4cdDays}d):</span>
                                                        <span className="text-gray-600">{formatRange(item.L4cd)}</span>
                                                    </div>
                                                )}
                                                {!l4Days && !l4cdDays && <span className="text-gray-400">—</span>}
                                            </td>

                                            {/* VAB / Pappaledi */}
                                            <td className="p-3 space-y-1">
                                                {vabDays > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">VAB ({vabDays}d):</span>
                                                        <span className="text-gray-600">{formatRange(item.VAB)}</span>
                                                    </div>
                                                )}
                                                {pappaDays > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[9px] font-bold">PAPPA ({pappaDays}d):</span>
                                                        <span className="text-gray-600">{formatRange(item.Pappaledi)}</span>
                                                    </div>
                                                )}
                                                {!vabDays && !pappaDays && <span className="text-gray-400">—</span>}
                                            </td>

                                            {/* Urlop */}
                                            <td className="p-3 space-y-1">
                                                {urlopDays > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-semibold text-gray-700">Bieżący:</span>
                                                        <span className="text-blue-700 font-bold">{urlopDays} dni</span>
                                                    </div>
                                                )}
                                                {urlopZaleglyDays > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-semibold text-gray-500 font-semibold">Zaległy:</span>
                                                        <span className="text-orange-700 font-bold">{urlopZaleglyDays} dni</span>
                                                    </div>
                                                )}
                                                {!urlopDays && !urlopZaleglyDays && <span className="text-gray-400">—</span>}
                                            </td>

                                            {/* Akcja */}
                                            <td className="p-3 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold shadow-sm transition"
                                                        onClick={() => handleGoToDetails(item.idPracownik)}
                                                    >
                                                        Karta
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-sm transition flex items-center gap-1"
                                                        onClick={() => handleDrukujPDFPojedynczy(item)}
                                                        title="Pobierz rozliczenie w PDF dla księgowej"
                                                    >
                                                        📄 PDF
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Kapownik;
