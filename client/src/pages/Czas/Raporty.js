import React, { useEffect, useMemo, useState } from "react";
import AmberBox from "../../Components/AmberBox";
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from "primereact/checkbox";
import axios from "axios";
import 'jspdf-autotable';
import PDF_PracownikAnalizaCzasu from "../../Components/Raporty/PDF_PracownikAnalizaCzasu";
import PDF_AnalizaSwiadczenPracowniczych from "../../Components/Raporty/PDF_AnalizaSwiadczenPracowniczych";
import PDF_SprawozdanieSzczegolowe from "../../Components/Raporty/PDF_SprawozdanieSzczegolowe";
import PDF_SprawozdaniePodsumowanie from "../../Components/Raporty/PDF_SprawozdaniePodsumowanie";
import { notification } from "antd";
import checkUserType, { hasSpecialAccess } from "../../utils/accTypeUtils";
import CalendarIsoInput from "../../Components/CalendarIsoInput";

export default function RaportyPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [Projekt, setProjekt] = useState(null);
    const [projektyOptions, setProjektyOptions] = useState([]);
    const [showRaportyFirma, setShowRaportyFirma] = useState(false);
    const [showRaportyPracownik, setShowRaportyPracownik] = useState(false);
    const [interfaceFirma, setInterfaceFirma] = useState(false);
    const [interfacePracownik, setInterfacePracownik] = useState(false);
    const [pracownik, setPracownik] = useState(null);
    const [availablePracownicy, setAvailablePracownicy] = useState([]);
    const [ignorujDatyFirma, setIgnorujDatyFirma] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [wybranyRaport, setWybranyRaport] = useState(null);
    const [raport, setRaport] = useState([]);
    const [materialyRaport, setMaterialyRaport] = useState([]);
    const [cennikData, setCennikData] = useState([]);
    const [accountType, setAccountType] = useState('');
    const [imie, setImie] = useState('');
    const [nazwisko, setNazwisko] = useState('');
    const [allPracownicyOptions, setAllPracownicyOptions] = useState([]);
    const [selectedZleceniodawcy, setSelectedZleceniodawcy] = useState([]);
    const [uniqueZleceniodawcy, setUniqueZleceniodawcy] = useState([]);
    const [projectOrderMap, setProjectOrderMap] = useState({});
    const [selectedWysylkaWeekKey, setSelectedWysylkaWeekKey] = useState(null);
    const [selectedWysylkaZleceniodawca, setSelectedWysylkaZleceniodawca] = useState(null);
    const [wysylkaSummary, setWysylkaSummary] = useState(null);
    const [wysylkaInvoiceNames, setWysylkaInvoiceNames] = useState({});
    const baseUrl = process.env.REACT_APP_BASE_URL;

    const WYSYLKA_REPORT_NAME = "Podsumowanie(wysyłka)";
    const isWysylkaReport = wybranyRaport === WYSYLKA_REPORT_NAME;

    const parseDataToDate = (dataStr) => {
        if (!dataStr) return null;
        const [datePart] = dataStr.split(' ');
        const [day, month, year] = datePart.split('.');
        const parsed = new Date(`${year}-${month}-${day}`);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const parseIsoDateOnly = (dataStr) => {
        if (!dataStr) return null;
        const [year, month, day] = dataStr.split('-');
        const parsed = new Date(`${year}-${month}-${day}`);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const getIsoWeekAndYear = (dateValue) => {
        if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
            return null;
        }

        const utcDate = new Date(Date.UTC(
            dateValue.getFullYear(),
            dateValue.getMonth(),
            dateValue.getDate()
        ));

        const day = utcDate.getUTCDay() || 7;
        utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

        const isoYear = utcDate.getUTCFullYear();
        const yearStart = new Date(Date.UTC(isoYear, 0, 1));
        const week = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);

        return { year: isoYear, week };
    };

    const getIsoWeekKeyFromEntry = (entry) => {
        const entryDate = parseDataToDate(entry?.Data);
        const iso = getIsoWeekAndYear(entryDate);
        if (!iso) return null;
        return `${iso.year}-${String(iso.week).padStart(2, '0')}`;
    };

    const getIsoWeekDateRange = (isoYear, isoWeek) => {
        const jan4 = new Date(Date.UTC(isoYear, 0, 4));
        const jan4Day = jan4.getUTCDay() || 7;
        const week1Monday = new Date(jan4);
        week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

        const monday = new Date(week1Monday);
        monday.setUTCDate(week1Monday.getUTCDate() + ((isoWeek - 1) * 7));

        const sunday = new Date(monday);
        sunday.setUTCDate(monday.getUTCDate() + 6);

        return {
            start: new Date(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate()),
            end: new Date(sunday.getUTCFullYear(), sunday.getUTCMonth(), sunday.getUTCDate()),
        };
    };

    const formatNumber = (value, fractionDigits = 2) => {
        const safeValue = Number(value || 0);
        return safeValue.toLocaleString('pl-PL', {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        });
    };

    const formatDateLabel = (dateValue) => {
        if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
            return '';
        }
        return dateValue.toLocaleDateString('pl-PL');
    };

    const formatNumberForCopy = (value) => {
        const safeValue = Number(value || 0);
        if (!Number.isFinite(safeValue)) return '0,00';
        return safeValue.toFixed(2).replace('.', ',');
    };

    const parseDecimal = (value) => {
        if (value === null || value === undefined) return 0;
        const normalized = String(value).replace(',', '.').trim();
        const match = normalized.match(/-?\d+(?:\.\d+)?/);
        const parsed = match ? parseFloat(match[0]) : Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const sanitizeCopyCell = (value) => {
        return String(value ?? '')
            .replace(/\t/g, ' ')
            .replace(/\r?\n/g, ' ')
            .trim();
    };

    const escapeHtml = (value) => {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const normalizeLegacyHours = (hoursValue) => {
        const numericValue = Number(hoursValue || 0);
        if (!Number.isFinite(numericValue)) return 0;

        const sign = numericValue < 0 ? -1 : 1;
        const absoluteValue = Math.abs(numericValue);
        const wholeHours = Math.floor(absoluteValue);
        const decimalPart = Number((absoluteValue - wholeHours).toFixed(1));

        let extraHours = decimalPart;
        if (decimalPart === 0.3) extraHours = 0.5;
        if (decimalPart === 0.6) extraHours = 1;

        return sign * (wholeHours + extraHours);
    };

    const getInvoiceFieldKey = (projectName, weekKey = selectedWysylkaWeekKey, zleceniodawca = selectedWysylkaZleceniodawca) => {
        return `${weekKey || ''}__${zleceniodawca || ''}__${projectName || ''}`;
    };

    const updateWysylkaInvoiceName = (projectName, value) => {
        const key = getInvoiceFieldKey(projectName);
        setWysylkaInvoiceNames((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const weekOptionsWysylka = useMemo(() => {
        if ((!Array.isArray(raport) || raport.length === 0) && (!Array.isArray(materialyRaport) || materialyRaport.length === 0)) {
            return [];
        }

        const grouped = raport.reduce((acc, entry) => {
            const currentDate = parseDataToDate(entry.Data);
            const iso = getIsoWeekAndYear(currentDate);
            if (!iso) return acc;

            const key = `${iso.year}-${String(iso.week).padStart(2, '0')}`;

            if (!acc[key]) {
                acc[key] = {
                    key,
                    rok: iso.year,
                    tydzien: iso.week,
                };
            }

            return acc;
        }, {});

        materialyRaport.forEach((material) => {
            const currentDate = parseIsoDateOnly(material.Data);
            const iso = getIsoWeekAndYear(currentDate);
            if (!iso) return;

            const key = `${iso.year}-${String(iso.week).padStart(2, '0')}`;

            if (!grouped[key]) {
                grouped[key] = {
                    key,
                    rok: iso.year,
                    tydzien: iso.week,
                };
            }
        });

        return Object.values(grouped)
            .sort((a, b) => {
                if (a.rok !== b.rok) return b.rok - a.rok;
                return b.tydzien - a.tydzien;
            })
            .map((weekItem) => ({
                label: `V${weekItem.tydzien} (${formatDateLabel(getIsoWeekDateRange(weekItem.rok, weekItem.tydzien).start)} - ${formatDateLabel(getIsoWeekDateRange(weekItem.rok, weekItem.tydzien).end)})`,
                value: weekItem.key,
                tydzien: weekItem.tydzien,
                rok: weekItem.rok,
            }));
    }, [raport, materialyRaport]);

    const zleceniodawcyWysylkaOptions = useMemo(() => {
        if (!selectedWysylkaWeekKey) return [];

        const [rokStr, tydzienStr] = selectedWysylkaWeekKey.split('-');
        const rok = Number(rokStr);
        const tydzien = Number(tydzienStr);

        const unique = new Set();

        raport
            .filter((entry) => {
                const iso = getIsoWeekAndYear(parseDataToDate(entry.Data));
                return iso && Number(iso.year) === rok && Number(iso.week) === tydzien;
            })
            .forEach((entry) => unique.add(entry.Zleceniodawca || 'Bez zleceniodawcy'));

        materialyRaport
            .filter((material) => {
                const iso = getIsoWeekAndYear(parseIsoDateOnly(material.Data));
                return iso && Number(iso.year) === rok && Number(iso.week) === tydzien;
            })
            .forEach((material) => unique.add(material.Zleceniodawca || 'Bez zleceniodawcy'));

        return Array.from(unique)
            .sort((a, b) => a.localeCompare(b, 'pl', { sensitivity: 'base' }))
            .map((zleceniodawca) => ({ label: zleceniodawca, value: zleceniodawca }));
    }, [raport, materialyRaport, selectedWysylkaWeekKey]);

    useEffect(() => {
        if (isWysylkaReport) {
            setStartDate('');
            setEndDate('');
            setProjekt(null);
            setIgnorujDatyFirma(false);
            setSelectedZleceniodawcy([]);
        }
    }, [isWysylkaReport]);

    useEffect(() => {
        if (!selectedWysylkaWeekKey) {
            setSelectedWysylkaZleceniodawca(null);
            return;
        }

        const exists = zleceniodawcyWysylkaOptions.some(option => option.value === selectedWysylkaZleceniodawca);
        if (!exists) {
            setSelectedWysylkaZleceniodawca(null);
        }
    }, [selectedWysylkaWeekKey, zleceniodawcyWysylkaOptions, selectedWysylkaZleceniodawca]);
    
    useEffect(() => {
        checkUserType(setAccountType);
        getImie();
        fetchPracownicy(); // Add this line
    }, []);

    const getImie = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/imie`, { withCredentials: true });
            const { name, surename } = response.data;
            setImie(`${name}`);
            setNazwisko(`${surename}`);
        } catch (error) {
            console.error(error);
        }
    }

    const weekItemTemplate = (option) => {
    if (!option) return null;

    // Zakładamy, że format to "V16 (data - data)"
    // Szukamy spacji, która oddziela "V16" od reszty
    const firstSpaceIndex = option.label.indexOf(' ');
    
    if (firstSpaceIndex === -1) return <span>{option.label}</span>;

    const vPart = option.label.substring(0, firstSpaceIndex); // np. "V16"
    const restPart = option.label.substring(firstSpaceIndex); // np. " (20.04.2026 - 26.04.2026)"

    return (
        <span>
            <strong className="font-bold">{vPart}</strong>
            <span className="text-gray-500">{restPart}</span>
        </span>
    );
};

    // Add this new function after getImie()
    const fetchPracownicy = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/pracownicy`, { withCredentials: true });
            const pracownicyOptions = response.data.map(pracownik => ({
                label: `${pracownik.name} ${pracownik.surname}`,
                value: pracownik.id
            }));
            
            // Sort employees alphabetically by label
            pracownicyOptions.sort((a, b) => a.label.localeCompare(b.label));
            
            setAvailablePracownicy(pracownicyOptions);
            setAllPracownicyOptions(pracownicyOptions);
            
        } catch (error) {
            console.error('Error fetching employees:', error);
            notification.error({
                message: 'Błąd',
                description: 'Nie udało się pobrać listy pracowników',
                placement: 'topRight',
            });
        }
    };

    // Add useEffect to handle auto-selection after both accountType and employees are loaded
    useEffect(() => {
        if (accountType === 'Pracownik' && availablePracownicy.length > 0 && imie && nazwisko) {
            const currentUser = availablePracownicy.find(p => 
                p.label.includes(imie) && p.label.includes(nazwisko)
            );
            if (currentUser) {
                setPracownik(currentUser.value);
                // Filter to show only current user for Pracownik account type
                setAvailablePracownicy([currentUser]);
            }
        } else if (accountType !== 'Pracownik' && allPracownicyOptions.length > 0) {
            // For non-Pracownik accounts, show all employees
            setAvailablePracownicy(allPracownicyOptions);
        }
    }, [accountType, allPracownicyOptions, imie, nazwisko]);

    useEffect(() => {
        setStartDate('');
        setEndDate('');
    }, [ignorujDatyFirma, accountType]);

    useEffect(() => {
        if (Projekt && projektyOptions.length > 0) {
            // Check if project is available in grouped structure
            const projectStillAvailable = projektyOptions.some(group => 
                group.items && group.items.some(p => p.value === Projekt)
            );
            if (!projectStillAvailable) {
                setProjekt(null);
            }
        }
    }, [projektyOptions, Projekt]);

    // Update to ensure date changes trigger project filtering
    useEffect(() => {
        fetchProjektyAndRaport();
    }, [startDate, endDate, selectedZleceniodawcy, ignorujDatyFirma]);

    const fetchProjektyAndRaport = () => {
        Promise.all([
            axios.get(`${baseUrl}/api/czas/projekty`, { withCredentials: true }),
            axios.get(`${baseUrl}/api/generujRaport`, { withCredentials: true }),
            axios.get(`${baseUrl}/api/czas/materialy/lista`, { withCredentials: true })
                .catch(() => ({ data: { materialy: [] } })),
            axios.get(`${baseUrl}/api/cennik`, { withCredentials: true })
                .catch(() => ({ data: [] }))
        ])
        .then(([projektyResponse, raportResponse, materialyResponse, cennikResponse]) => {
            const projekty = projektyResponse.data.projekty.map((projekt, index) => ({
                label: projekt.NazwaKod_Projektu,
                value: projekt.id,
                zleceniodawca: projekt.Zleceniodawca,
                order: index,
            }));
            setProjectOrderMap(Object.fromEntries(projekty.map((projekt) => [projekt.value, projekt.order])));
            
            const raportData = raportResponse.data.raport;
            setRaport(raportData);
            setMaterialyRaport(materialyResponse?.data?.materialy || []);
            setCennikData(cennikResponse?.data || []);

            let filteredProjekty = projekty;

            // Filter by date range dynamically
            if (startDate || endDate) {
                const startDateObj = startDate ? new Date(startDate) : null;
                const endDateObj = endDate ? new Date(endDate) : null;

                const projectsInDateRange = new Set(
                    raportData
                        .filter(entry => {
                            if (!entry.Data) return false;
                            const datePart = entry.Data.split(' ')[0]; 
                            const [day, month, year] = datePart.split('.'); 
                            const entryDate = new Date(`${year}-${month}-${day}`);
                            return (!startDateObj || entryDate >= startDateObj) && (!endDateObj || entryDate <= endDateObj);
                        })
                        .map(entry => entry.ProjektID)
                );

                filteredProjekty = projekty.filter(projekt => 
                    projectsInDateRange.has(projekt.value)
                );
            }

            // Extract unique zleceniodawcy from filtered projects
            const zleceniodawcySet = new Set(filteredProjekty.map(projekt => projekt.zleceniodawca || 'Bez zleceniodawcy'));

            // Include already selected zleceniodawcy to prevent them from disappearing
            selectedZleceniodawcy.forEach(zleceniodawca => zleceniodawcySet.add(zleceniodawca));
            
            // Define special order for zleceniodawcy
            const specialOrder = {
                "NCW Plåt": 1,
                "NCC": 2,
                "Do dyspozycji": 98,
                "-------------------------------": 99,
                "Urlopy": 100,
                "Urlop tacierzyński / L4": 101
            };
            
            // Sort zleceniodawcy by the special order, then alphabetically
            const zleceniodawcyList = Array.from(zleceniodawcySet).sort((a, b) => {
                const orderA = specialOrder[a] || 50;
                const orderB = specialOrder[b] || 50;
                
                if (orderA !== orderB) return orderA - orderB;
                return a.localeCompare(b, 'pl', { sensitivity: 'base' });
            });
            
            setUniqueZleceniodawcy(zleceniodawcyList);

            // Filter by selected zleceniodawca
            if (selectedZleceniodawcy.length > 0) {
                filteredProjekty = filteredProjekty.filter(projekt => 
                    selectedZleceniodawcy.includes(projekt.zleceniodawca || 'Bez zleceniodawcy')
                );
            }
            
            // Group projects by zleceniodawca for display
            const groupedProjekty = filteredProjekty.reduce((groups, projekt) => {
                const zleceniodawca = projekt.zleceniodawca || 'Bez zleceniodawcy';
                if (!groups[zleceniodawca]) {
                    groups[zleceniodawca] = [];
                }
                groups[zleceniodawca].push(projekt);
                return groups;
            }, {});
            
            // Convert to PrimeReact's optgroup format
            const groupedOptions = zleceniodawcyList
                .filter(zleceniodawca => groupedProjekty[zleceniodawca] && groupedProjekty[zleceniodawca].length > 0)
                .map(zleceniodawca => ({
                    label: `${zleceniodawca} (${groupedProjekty[zleceniodawca].length})`,
                    items: groupedProjekty[zleceniodawca]
                }));
            
            setProjektyOptions(groupedOptions);
        })
        .catch((error) => {
            console.error(error);
            notification.error({
                message: 'Błąd',
                description: 'Nie udało się pobrać danych projektów i raportów',
                placement: 'topRight',
            });
        });
    };

    const handleGenerateWysylkaReport = () => {
        if (!selectedWysylkaWeekKey || !selectedWysylkaZleceniodawca) {
            notification.info({
                message: 'Informacja',
                description: 'Wybierz tydzień i zleceniodawcę',
                placement: 'topRight',
            });
            return;
        }

        const [rokStr, tydzienStr] = selectedWysylkaWeekKey.split('-');
        const selectedRok = Number(rokStr);
        const selectedTydzien = Number(tydzienStr);

        const projectIdsForZleceniodawca = new Set(
            projektyOptions.flatMap(group =>
                (group.items || []).filter(item =>
                    (item.zleceniodawca || 'Bez zleceniodawcy') === selectedWysylkaZleceniodawca
                ).map(item => item.value)
            )
        );
        const selectedZleceniodawcaRate = parseDecimal(
            cennikData.find(entry => (entry.Zleceniodawca || 'Bez zleceniodawcy') === selectedWysylkaZleceniodawca)?.Stawka
        );
        const kmMultiplier = selectedZleceniodawcaRate > 0 ? selectedZleceniodawcaRate : 0;

        const materialsForWeek = materialyRaport.filter((material) => {
            const iso = getIsoWeekAndYear(parseIsoDateOnly(material.Data));
            return iso && Number(iso.year) === selectedRok && Number(iso.week) === selectedTydzien;
        });

        const materialsForWeekFiltered = materialsForWeek.filter((material) => {
            if (projectIdsForZleceniodawca.size > 0) {
                return projectIdsForZleceniodawca.has(material.ProjektID);
            }

            const materialZleceniodawca = material.Zleceniodawca || 'Bez zleceniodawcy';
            return materialZleceniodawca === selectedWysylkaZleceniodawca;
        });

        const filtered = raport.filter((entry) => {
            const iso = getIsoWeekAndYear(parseDataToDate(entry.Data));
            const matchesWeek = iso &&
                Number(iso.year) === selectedRok &&
                Number(iso.week) === selectedTydzien;
            if (!matchesWeek) return false;

            if (projectIdsForZleceniodawca.size > 0) {
                return projectIdsForZleceniodawca.has(entry.ProjektID);
            }

            const entryZleceniodawca = entry.Zleceniodawca || 'Bez zleceniodawcy';
            return entryZleceniodawca === selectedWysylkaZleceniodawca;
        });

        if (filtered.length === 0 && materialsForWeekFiltered.length === 0) {
            setWysylkaSummary(null);
            notification.info({
                message: 'Brak danych',
                description: 'Brak danych dla wybranego tygodnia i zleceniodawcy',
                placement: 'topRight',
            });
            return;
        }

        const groupedByProject = materialsForWeekFiltered.reduce((acc, material) => {
            const projectName = material.Projekt || 'Bez nazwy projektu';
            const materialCost = parseDecimal(material.Koszty);

            if (!acc[projectName]) {
                acc[projectName] = {
                    projectName,
                    hours: 0,
                    km: 0,
                    parking: 0,
                    material: 0,
                    hoursAmount: 0,
                    kmAmount: 0,
                    defaultInvoiceName: '',
                    order: projectOrderMap[material.ProjektID] ?? Number.MAX_SAFE_INTEGER,
                };
            }

            acc[projectName].material += materialCost;
            return acc;
        }, {});

        const hasMaterialsForWeek = materialsForWeekFiltered.length > 0;

        filtered.reduce((acc, entry) => {
            const projectName = entry.Projekt || 'Bez nazwy projektu';
            const entryHours = normalizeLegacyHours(entry.GodzinyPrzepracowane);
            const entryKm = parseDecimal(entry.Kilometry);
            const entryParking = parseDecimal(entry.Parking);
            const entryHoursRate = parseDecimal(entry.StawkaGodzinowa);
            const entryOrder = projectOrderMap[entry.ProjektID] ?? Number.MAX_SAFE_INTEGER;

            if (!acc[projectName]) {
                acc[projectName] = {
                    projectName,
                    hours: 0,
                    km: 0,
                    parking: 0,
                    material: 0,
                    hoursAmount: 0,
                    kmAmount: 0,
                    defaultInvoiceName: entry.DomyslnaNazwaFaktury || '',
                    order: entryOrder,
                };
            }

            if (entryOrder < (acc[projectName].order ?? Number.MAX_SAFE_INTEGER)) {
                acc[projectName].order = entryOrder;
            }

            if (!acc[projectName].defaultInvoiceName && entry.DomyslnaNazwaFaktury) {
                acc[projectName].defaultInvoiceName = entry.DomyslnaNazwaFaktury;
            }

            if (!hasMaterialsForWeek && acc[projectName].material === 0 && parseDecimal(entry.DomyslnyKosztFaktury) > 0) {
                acc[projectName].material = parseDecimal(entry.DomyslnyKosztFaktury);
            }

            acc[projectName].hours += entryHours;
            acc[projectName].km += entryKm;
            acc[projectName].parking += entryParking;
            acc[projectName].hoursAmount += entryHours * entryHoursRate;
            acc[projectName].kmAmount += entryKm * kmMultiplier;
            return acc;
        }, groupedByProject);

        const projects = Object.values(groupedByProject)
            .sort((a, b) => {
                const aOrder = Number.isFinite(Number(a.order)) ? Number(a.order) : Number.MAX_SAFE_INTEGER;
                const bOrder = Number.isFinite(Number(b.order)) ? Number(b.order) : Number.MAX_SAFE_INTEGER;
                if (aOrder !== bOrder) return aOrder - bOrder;
                return a.projectName.localeCompare(b.projectName, 'pl', { sensitivity: 'base' });
            });

        const hoursRate = parseDecimal(
            filtered.find(entry => parseDecimal(entry.StawkaGodzinowa) > 0)?.StawkaGodzinowa
        );
        const kmRate = kmMultiplier;

        const totalHours = projects.reduce((sum, project) => sum + project.hours, 0);
        const totalKm = projects.reduce((sum, project) => sum + project.km, 0);
        const totalParking = projects.reduce((sum, project) => sum + project.parking, 0);
        const totalMaterial = projects.reduce((sum, project) => sum + project.material, 0);

        const projectsWithAmounts = projects.map((project) => ({
            ...project,
            amount: project.hoursAmount + project.kmAmount + project.parking + project.material,
        }));


        const kmAmount = projectsWithAmounts.reduce((sum, project) => sum + project.kmAmount, 0);
        const totalKmCost = totalKm * kmMultiplier;
        const grandTotal = projectsWithAmounts.reduce((sum, project) => sum + project.amount, 0);

        const selectedWeekLabel = weekOptionsWysylka.find(option => option.value === selectedWysylkaWeekKey)?.label || `V${selectedTydzien}`;

        setWysylkaSummary({
            weekLabel: selectedWeekLabel,
            projects: projectsWithAmounts,
            totalKm,
            kmRate,
            kmAmount,
            totalKmCost,
            totalParking,
            totalMaterial,
            grandTotal,
            hoursRate,
            totalHours,
        });
    };

    const copyWysylkaSummaryToClipboard = async () => {
        if (!wysylkaSummary) return;

        const tab = '\t';
        const lines = [
            sanitizeCopyCell(wysylkaSummary.weekLabel),
            ['Pozycja', 'Godz', 'km', 'Parking', 'Materiał', 'Suma', 'Nazwa faktury', 'OK'].join(tab),
            ...wysylkaSummary.projects.map(project =>
                [
                    sanitizeCopyCell(project.projectName),
                    formatNumberForCopy(project.hours),
                    formatNumberForCopy(project.km),
                    formatNumberForCopy(project.parking),
                    formatNumberForCopy(project.material),
                    formatNumberForCopy(project.amount),
                    sanitizeCopyCell(wysylkaInvoiceNames[getInvoiceFieldKey(project.projectName)] || ''),
                    '[ ]',
                ].join(tab)
            ),
            [
                'TOTAL',
                formatNumberForCopy(wysylkaSummary.totalHours),
                `${formatNumberForCopy(wysylkaSummary.totalKm)} (${formatNumberForCopy(wysylkaSummary.totalKmCost)})`,
                formatNumberForCopy(wysylkaSummary.totalParking),
                formatNumberForCopy(wysylkaSummary.totalMaterial),
                formatNumberForCopy(wysylkaSummary.grandTotal),
                '',
                '',
            ].join(tab),
        ];

        try {
            await navigator.clipboard.writeText(lines.join('\n'));
            notification.success({
                message: 'Skopiowano',
                description: 'Podsumowanie zostało skopiowane do schowka',
                placement: 'topRight',
            });
        } catch (error) {
            notification.error({
                message: 'Błąd',
                description: 'Nie udało się skopiować podsumowania',
                placement: 'topRight',
            });
        }
    };

    const copyWysylkaSummaryToExcel = async () => {
        if (!wysylkaSummary) return;

        const tab = '\t';
        const headers = ['Pozycja', 'Godz', 'km', 'Parking', 'Materiał', 'Suma', 'Nazwa faktury', 'OK'];
        const rows = wysylkaSummary.projects.map((project) => ([
            sanitizeCopyCell(project.projectName),
            formatNumberForCopy(project.hours),
            formatNumberForCopy(project.km),
            formatNumberForCopy(project.parking),
            formatNumberForCopy(project.material),
            formatNumberForCopy(project.amount),
            sanitizeCopyCell(wysylkaInvoiceNames[getInvoiceFieldKey(project.projectName)] || ''),
            '[ ]',
        ]));

        const totalRow = [
            'TOTAL',
            formatNumberForCopy(wysylkaSummary.totalHours),
            `${formatNumberForCopy(wysylkaSummary.totalKm)} (${formatNumberForCopy(wysylkaSummary.totalKmCost)})`,
            formatNumberForCopy(wysylkaSummary.totalParking),
            formatNumberForCopy(wysylkaSummary.totalMaterial),
            formatNumberForCopy(wysylkaSummary.grandTotal),
            '',
            '',
        ];

        const plainText = [
            sanitizeCopyCell(wysylkaSummary.weekLabel),
            headers.join(tab),
            ...rows.map((row) => row.join(tab)),
            totalRow.join(tab),
        ].join('\n');

        const htmlRows = rows
            .map((row) => `<tr>${row.map((cell, idx) => `<td style="padding:4px 8px; line-height:1.3; text-align:${idx === 0 || idx === 6 ? 'left' : 'right'};">${escapeHtml(cell)}</td>`).join('')}</tr>`)
            .join('');

        const htmlTable = `
            <table border="1" style="border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt;">
                <caption style="caption-side: top; text-align: left; font-weight: 700; padding-bottom: 6px;">${escapeHtml(wysylkaSummary.weekLabel)}</caption>
                <thead>
                    <tr>${headers.map((header, idx) => `<th style="padding:5px 8px; background:#f2f2f2; text-align:${idx === 0 || idx === 6 ? 'left' : 'right'};">${escapeHtml(header)}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${htmlRows}
                    <tr style="font-weight:700; background:#e6f0ff;">${totalRow.map((cell, idx) => `<td style="padding:5px 8px; text-align:${idx === 0 || idx === 6 ? 'left' : 'right'};">${escapeHtml(cell)}</td>`).join('')}</tr>
                </tbody>
            </table>
        `;

        try {
            if (navigator.clipboard && window.ClipboardItem) {
                const clipboardItem = new window.ClipboardItem({
                    'text/html': new Blob([htmlTable], { type: 'text/html' }),
                    'text/plain': new Blob([plainText], { type: 'text/plain' }),
                });
                await navigator.clipboard.write([clipboardItem]);
            } else {
                await navigator.clipboard.writeText(plainText);
            }

            notification.success({
                message: 'Skopiowano',
                description: 'Tabela została skopiowana w formacie Excel/Outlook',
                placement: 'topRight',
            });
        } catch (error) {
            notification.error({
                message: 'Błąd',
                description: 'Nie udało się skopiować tabeli do Excela',
                placement: 'topRight',
            });
        }
    };

    const handleGenerateReport = () => {
    if (isWysylkaReport) {
        handleGenerateWysylkaReport();
        return;
    }

    if (!wybranyRaport || 
        (['Sprawozdanie z działalności - szczegółowe', 'Sprawozdanie z działalności - podsumowanie'].includes(wybranyRaport) && !Projekt) ||
        (['Analiza świadczeń pracowniczych', 'Pracownik Analiza czasu - działalność'].includes(wybranyRaport) && !pracownik) ||
        (!ignorujDatyFirma && (!startDate || !endDate))) {
        
        notification.info({
            message: 'Informacja',
            description: 'Wypełnij wszystkie wymagane pola',
            placement: 'topRight',
        });
        return;
    }

    let filteredRaport = raport;

    // Filter by project for company reports
    if (Projekt && ['Sprawozdanie z działalności - szczegółowe', 'Sprawozdanie z działalności - podsumowanie'].includes(wybranyRaport)) {
        filteredRaport = filteredRaport.filter(entry => entry.ProjektID === Projekt);
    }

    // Filter by employee for employee reports
    if (pracownik && ['Analiza świadczeń pracowniczych', 'Pracownik Analiza czasu - działalność'].includes(wybranyRaport)) {
        filteredRaport = filteredRaport.filter(entry => entry.PracownikID === pracownik);
    }

    // Filter by date range if not ignored
    if (!ignorujDatyFirma && startDate && endDate) {
        filteredRaport = filteredRaport.filter(entry => {
            if (!entry.Data) return false;
            const datePart = entry.Data.split(' ')[0]; 
            const [day, month, year] = datePart.split('.'); 
            const entryDate = new Date(`${year}-${month}-${day}`);
            return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
        });
    }

    // Check if there's any data after all filtering
    if (filteredRaport.length === 0) {
        let message = 'Brak danych dla wybranych kryteriów.';
        
        if (['Analiza świadczeń pracowniczych', 'Pracownik Analiza czasu - działalność'].includes(wybranyRaport)) {
            message = 'Brak danych dla wybranego pracownika w podanym okresie.';
        } else if (['Sprawozdanie z działalności - szczegółowe', 'Sprawozdanie z działalności - podsumowanie'].includes(wybranyRaport)) {
            message = 'Brak danych dla wybranego projektu w podanym okresie.';
        }
        
        notification.info({
            message: 'Brak danych',
            description: message,
            placement: 'topRight',
        });
        return;
    }

    const passedStartDate = ignorujDatyFirma ? null : startDate;
    const passedEndDate = ignorujDatyFirma ? null : endDate;

    // Create zleceniodawca mapping from grouped projektyOptions
    const projectZleceniodawcaMapping = {};
    projektyOptions.forEach(group => {
        if (group.items) {
            group.items.forEach(projekt => {
                projectZleceniodawcaMapping[projekt.value] = projekt.zleceniodawca;
            });
        }
    });

    switch (wybranyRaport) {
        case "Sprawozdanie z działalności - szczegółowe":
            PDF_SprawozdanieSzczegolowe(filteredRaport, passedStartDate, passedEndDate, Projekt, projectZleceniodawcaMapping);
            break;
        case "Sprawozdanie z działalności - podsumowanie":
            PDF_SprawozdaniePodsumowanie(
                filteredRaport,
                passedStartDate,
                passedEndDate,
                Projekt,
                projectZleceniodawcaMapping,
                projectOrderMap
            );
            break;
        case "Analiza świadczeń pracowniczych":
            PDF_AnalizaSwiadczenPracowniczych(filteredRaport, passedStartDate, passedEndDate, pracownik);
            break;
        case "Pracownik Analiza czasu - działalność":
            PDF_PracownikAnalizaCzasu(filteredRaport, passedStartDate, passedEndDate, pracownik);
            break;
        default:
            break;
    }
};

    const handleGenerateWszystkie = () => {
        if (isWysylkaReport) {
            handleGenerateWysylkaReport();
            return;
        }

        if(!ignorujDatyFirma && (!startDate || !endDate)) {
            notification.info({
                message: 'Informacja',
                description: 'Wypełnij wszystkie wymagane pola',
                placement: 'topRight',
            });
            return;
        }	

        // Filter the report data based on selected criteria
        let filteredRaport = raport;

        // Filter by date range if not ignored and dates are provided
        if (!ignorujDatyFirma && startDate && endDate) {
            filteredRaport = filteredRaport.filter(entry => {
                if (!entry.Data) return false;
                const datePart = entry.Data.split(' ')[0]; 
                const [day, month, year] = datePart.split('.'); 
                const entryDate = new Date(`${year}-${month}-${day}`);
                return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
            });
        }

        // Filter by selected zleceniodawcy if any are selected
        if (selectedZleceniodawcy.length > 0) {
            filteredRaport = filteredRaport.filter(entry => {
                // Get zleceniodawca from the entry or from project mapping
                const entryZleceniodawca = entry.Zleceniodawca || 'Bez zleceniodawcy';
                return selectedZleceniodawcy.includes(entryZleceniodawca);
            });
        }

        // Create zleceniodawca mapping from grouped projektyOptions
        const projectZleceniodawcaMapping = {};
        projektyOptions.forEach(group => {
            if (group.items) {
                group.items.forEach(projekt => {
                    projectZleceniodawcaMapping[projekt.value] = projekt.zleceniodawca;
                });
            }
        });

        const passedStartDate = ignorujDatyFirma ? null : startDate;
        const passedEndDate = ignorujDatyFirma ? null : endDate;

        switch (wybranyRaport) {
            case "Sprawozdanie z działalności - szczegółowe":
                PDF_SprawozdanieSzczegolowe(filteredRaport, passedStartDate, passedEndDate, null, projectZleceniodawcaMapping);
                break;
            case "Sprawozdanie z działalności - podsumowanie":
                PDF_SprawozdaniePodsumowanie(
                    filteredRaport,
                    passedStartDate,
                    passedEndDate,
                    null,
                    projectZleceniodawcaMapping,
                    projectOrderMap
                );
                break;
            default:
                break;
        }
    };
    const handleGenerateAllEmployees = () => {
        if (!startDate || !endDate) {
            notification.info({
            message: 'Informacja',
            description: 'Wypełnij daty',
            placement: 'topRight'
            });
            return;
        }

        const [sd, ed] = [new Date(startDate), new Date(endDate)];

        let filtered = raport.filter(e => {
            if (!e.Data) return false;
            const [datePart] = e.Data.split(' ');
            const [d, m, y] = datePart.split('.');
            const dt = new Date(`${y}-${m}-${d}`);
            return dt >= sd && dt <= ed;
        });

        // If user is Pracownik, filter to show only their data
        if (accountType === 'Pracownik' && pracownik) {
            filtered = filtered.filter(e => e.PracownikID === pracownik);
        }

        switch (wybranyRaport) {
            case "Analiza świadczeń pracowniczych":
            PDF_AnalizaSwiadczenPracowniczych(filtered, startDate, endDate, null);
            break;
            case "Pracownik Analiza czasu - działalność":
            PDF_PracownikAnalizaCzasu(filtered, startDate, endDate, null);
            break;
        }
        };


    const przejscieDoInterfejsuFirma = () => {
        // Reset all states first
        setProjekt(null);
        setPracownik(null);
        setIgnorujDatyFirma(false);
        setSelectedZleceniodawcy([]);
        
        // Then switch interface
        setInterfaceFirma(true);
        setInterfacePracownik(false);
        
        // Trigger project reload when switching to company interface
        // Use setTimeout to ensure state is updated before fetching
        setTimeout(() => {
            fetchProjektyAndRaport();
        }, 0);
    };

    const przejscieDoInterfejsuPracownik = () => {
        // Reset states first
        setProjekt(null);
        setIgnorujDatyFirma(false);
        setSelectedZleceniodawcy([]);
        
        // Switch interface
        setInterfaceFirma(false);
        setInterfacePracownik(true);
        
        // Ensure employees are loaded when switching to employee interface
        if (allPracownicyOptions.length === 0) {
            fetchPracownicy();
        }
        
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
            if (accountType === 'Pracownik') {
                // For Pracownik account type, auto-select current user and filter options
                const currentUser = allPracownicyOptions.find(p => 
                    p.label.includes(imie) && p.label.includes(nazwisko)
                );
                if (currentUser) {
                    setPracownik(currentUser.value);
                    setAvailablePracownicy([currentUser]);
                }
            } else {
                setPracownik(null);
                setAvailablePracownicy(allPracownicyOptions);
            }
        }, 0);
    };

    const handleRowClick = (rowName) => {
        if (rowName === WYSYLKA_REPORT_NAME && accountType !== 'Administrator') {
            return;
        }
        setSelectedRow(rowName);
        setWysylkaSummary(null);

        if (rowName === "Sprawozdanie z działalności - szczegółowe" || 
            rowName === "Sprawozdanie z działalności - podsumowanie" ||
            rowName === WYSYLKA_REPORT_NAME) {
            przejscieDoInterfejsuFirma();

            if (rowName === WYSYLKA_REPORT_NAME) {
                setProjekt(null);
            }
        } else {
            przejscieDoInterfejsuPracownik();
        }
        setWybranyRaport(rowName);
    };

    const getRowStyle = (rowName) => {
        return selectedRow === rowName ? { fontWeight: 'bold', textDecoration: 'underline' } : {};
    };

    // Function to handle zleceniodawca checkbox changes
    const handleZleceniodawcaChange = (zleceniodawca) => {
        if (selectedZleceniodawcy.includes(zleceniodawca)) {
            setSelectedZleceniodawcy(selectedZleceniodawcy.filter(z => z !== zleceniodawca));
        } else {
            setSelectedZleceniodawcy([...selectedZleceniodawcy, zleceniodawca]);
        }
    };

    // Function to select/deselect all zleceniodawca
    const handleSelectAllZleceniodawcy = (select) => {
        if (select) {
            setSelectedZleceniodawcy([...uniqueZleceniodawcy]);
        } else {
            setSelectedZleceniodawcy([]);
        }
    };

    // Reset selected zleceniodawca when dates change
    useEffect(() => {
        setSelectedZleceniodawcy([]);
    }, [startDate, endDate, ignorujDatyFirma]);

    // Filter pracownicy for selected date range when 'Raporty dla pracownika' is open
    useEffect(() => {
        // Only apply date filtering if interfacePracownik is active
        if (interfacePracownik && startDate && endDate && raport.length > 0) {
            // Get IDs of employees who have entries in the selected date range
            const [sd, ed] = [new Date(startDate), new Date(endDate)];
            const pracownicyInRange = new Set(
                raport.filter(e => {
                    if (!e.Data) return false;
                    const [datePart] = e.Data.split(' ');
                    const [d, m, y] = datePart.split('.');
                    const dt = new Date(`${y}-${m}-${d}`);
                    return dt >= sd && dt <= ed;
                }).map(e => e.PracownikID)
            );
            // Filter allPracownicyOptions to only those in the set
            const filtered = allPracownicyOptions.filter(p => pracownicyInRange.has(p.value));
            setAvailablePracownicy(filtered);
        } else if (interfacePracownik && allPracownicyOptions.length > 0) {
            setAvailablePracownicy(allPracownicyOptions);
        }
    }, [interfacePracownik, startDate, endDate, raport, allPracownicyOptions]);

    return (
        <div>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Opcje</p>
            </div>
            <AmberBox>
              <div className="flex flex-col items-center justify-center space-y-4 w-full">
                  {!isWysylkaReport && (
                      <>
                          <p>Wybierz okres raportowania</p>
                          <div className="flex flex-row items-center space-x-4">
                            <CalendarIsoInput
                                value={startDate}
                                onChange={setStartDate}
                                placeholder="Data od"
                                disabled={interfaceFirma && ignorujDatyFirma}
                                className="w-44"
                                inputClassName="w-full rounded p-2.5"
                            />
                            <CalendarIsoInput
                                value={endDate}
                                onChange={setEndDate}
                                placeholder="Data do"
                                disabled={interfaceFirma && ignorujDatyFirma}
                                min={startDate || undefined}
                                className="w-44"
                                inputClassName="w-full rounded p-2.5"
                            />
                        </div>
                      </>
                  )}
          
                  {interfaceFirma && !isWysylkaReport && (
                      <div className="flex items-center">
                          <Checkbox
                              inputId="firma"
                              checked={ignorujDatyFirma}
                              onChange={() => setIgnorujDatyFirma(!ignorujDatyFirma)}
                          />
                          <span className="ml-2">Ignoruj daty</span>
                      </div>
                  )}
          
                  {interfacePracownik && (
                      <Dropdown
                          key={`pracownik-dropdown-${interfacePracownik}-${availablePracownicy.length}`}
                          value={pracownik}
                          options={availablePracownicy}
                          onChange={(e) => setPracownik(e.value)}
                          showClear={accountType !== 'Pracownik'}
                          filter
                          className="w-96"
                          filterInputAutoFocus
                          resetFilterOnHide
                          placeholder="Wybierz pracownika"
                          disabled={accountType === 'Pracownik'}
                          emptyMessage="Brak pracowników"
                      />
                  )}
          
                  {/* Fixed layout with better positioning */}
                  {interfaceFirma && !isWysylkaReport && (
                      <div className="flex w-full relative" style={{ minHeight: "180px" }}>
                          {/* Zleceniodawcy filter on left side with fixed width */}
                          <div className="absolute left-4 bottom-1 w-64">
                              <div className="border rounded bg-white p-2">
                                  <div className="font-bold pb-1 mb-1 border-b">Filtruj po zleceniodawcy:</div>
                                  <div className="flex justify-between mb-2">
                                      <span 
                                          onClick={() => handleSelectAllZleceniodawcy(true)}
                                          className="text-xs text-blue-600 cursor-pointer hover:underline"
                                      >
                                          Zaznacz wszystkie
                                      </span>
                                      <span 
                                          onClick={() => handleSelectAllZleceniodawcy(false)}
                                          className="text-xs text-blue-600 cursor-pointer hover:underline"
                                      >
                                          Odznacz wszystkie
                                      </span>
                                  </div>
                                  <div className="max-h-80 overflow-y-auto border rounded">
                                      {uniqueZleceniodawcy.map(zleceniodawca => (
                                          <div key={zleceniodawca} className="flex items-center bg-gray-100 p-1">
                                              <Checkbox
                                                  inputId={`zlec_${zleceniodawca}`}
                                                  checked={selectedZleceniodawcy.includes(zleceniodawca)}
                                                  onChange={() => handleZleceniodawcaChange(zleceniodawca)}
                                              />
                                              <label htmlFor={`zlec_${zleceniodawca}`} className="ml-2 cursor-pointer text-sm truncate">
                                                  {zleceniodawca}
                                              </label>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          {/* Projects and buttons properly centered with fixed width */}
                          <div className="flex-1 flex justify-center">
                              <div className="w-96 flex flex-col items-center">
                                  <Dropdown
                                      key={`projekt-dropdown-${interfaceFirma}-${projektyOptions.length}`}
                                      value={Projekt}
                                      options={projektyOptions}
                                      onChange={(e) => setProjekt(e.value)}
                                      showClear
                                      placeholder="Wybierz projekt"
                                      emptyMessage="Brak projektów"
                                      filter
                                      className="w-full"
                                      filterInputAutoFocus
                                      resetFilterOnHide
                                      optionGroupLabel="label"
                                      optionGroupChildren="items"
                                      optionGroupTemplate={(option) => (
                                          <div className="flex justify-between items-center font-bold text-blue-800 p-2 border-b">
                                              <span>{option.label}</span>
                                          </div>
                                      )}
                                  />
                                  <div className="flex flex-row items-center space-x-4 mt-4 justify-center">
                                      <Button
                                          onClick={handleGenerateReport}
                                          label="Generuj raport"
                                          className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                                      />
                                      <Button
                                          onClick={handleGenerateWszystkie}
                                          label="Generuj wszystkie"
                                          className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {interfaceFirma && isWysylkaReport && (
                      <div className="w-full max-w-5xl bg-white border rounded p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Dropdown
                                    value={selectedWysylkaWeekKey}
                                    options={weekOptionsWysylka}
                                    onChange={(e) => {
                                        setSelectedWysylkaWeekKey(e.value);
                                        setWysylkaSummary(null);
                                    }}
                                    itemTemplate={weekItemTemplate}
                                    valueTemplate={(option, props) => option ? weekItemTemplate(option) : props.placeholder} // Wygląd po wybraniu
                                    showClear
                                    filter
                                    className="w-full"
                                    placeholder="Wybierz tydzień (Vxx)"
                                    emptyMessage="Brak tygodni"
                                />
                              <Dropdown
                                  value={selectedWysylkaZleceniodawca}
                                  options={zleceniodawcyWysylkaOptions}
                                  onChange={(e) => {
                                      setSelectedWysylkaZleceniodawca(e.value);
                                      setWysylkaSummary(null);
                                  }}
                                  showClear
                                  filter
                                  className="w-full"
                                  placeholder="Wybierz zleceniodawcę"
                                  emptyMessage="Brak zleceniodawców"
                                  disabled={!selectedWysylkaWeekKey}
                              />
                          </div>

                          <div className="flex items-center gap-3">
                              <Button
                                  onClick={handleGenerateWysylkaReport}
                                  label="Generuj raport"
                                  className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                              />
                              <Button
                                  onClick={copyWysylkaSummaryToExcel}
                                  label="Kopiuj do Excela"
                                  className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                                  disabled={!wysylkaSummary}
                              />
                              <Button
                                  onClick={copyWysylkaSummaryToClipboard}
                                  label="Kopiuj jako tekst"
                                  className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                                  disabled={!wysylkaSummary}
                              />
                          </div>

                          {wysylkaSummary && (
                              <div className="border rounded overflow-hidden">
                                  <div className="bg-gray-100 px-3 py-2 font-extrabold text-base">{wysylkaSummary.weekLabel}</div>
                                  <table className="w-full text-sm table-fixed">
                                      <thead className="bg-gray-200">
                                          <tr>
                                              <th className="text-left px-2 py-2 border-b w-2/6">Pozycja</th>
                                              <th className="text-right px-2 py-2 border-b w-1/12">Godziny</th>
                                              <th className="text-right px-2 py-2 border-b w-1/12">km</th>
                                              <th className="text-right px-2 py-2 border-b w-1/12">Parking</th>
                                              <th className="text-right px-2 py-2 border-b w-1/12">Materiał</th>
                                              <th className="text-right px-2 py-2 border-b w-1/12">Suma</th>
                                              <th className="text-left px-2 py-2 border-b w-1/12">Nazwa faktury</th>
                                              <th className="text-center px-2 py-2 border-b w-1/12">OK</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {wysylkaSummary.projects.map((project) => (
                                              <tr key={project.projectName} className="odd:bg-white even:bg-gray-50">
                                                  <td className="px-2 py-2 border-b truncate" title={project.projectName}>{project.projectName}</td>
                                                  <td className="px-2 py-2 border-b text-right">{formatNumber(project.hours, 2)}</td>
                                                  <td className="px-2 py-2 border-b text-right">{formatNumber(project.km, 2)}</td>
                                                  <td className="px-2 py-2 border-b text-right">{formatNumber(project.parking, 2)}</td>
                                                  <td className="px-2 py-2 border-b text-right">{formatNumber(project.material, 2)}</td>
                                                  <td className="px-2 py-2 border-b text-right">{formatNumber(project.amount, 2)}</td>
                                                  <td className="px-2 py-2 border-b">
                                                      <input
                                                          type="text"
                                                          value={wysylkaInvoiceNames[getInvoiceFieldKey(project.projectName)] || ''}
                                                          onChange={(e) => updateWysylkaInvoiceName(project.projectName, e.target.value)}
                                                          placeholder="np. f12652"
                                                          className="w-full border rounded px-1.5 py-1"
                                                      />
                                                  </td>
                                                  <td className="px-2 py-2 border-b text-center">[ ]</td>
                                              </tr>
                                          ))}
                                          <tr className="bg-blue-100 font-bold">
                                              <td className="px-2 py-2">TOTAL</td>
                                              <td className="px-2 py-2 text-right">{formatNumber(wysylkaSummary.totalHours, 2)}</td>
                                              <td className="px-2 py-2 text-right">
                                                  {formatNumber(wysylkaSummary.totalKm, 2)} ({formatNumber(wysylkaSummary.totalKmCost, 2)})
                                              </td>
                                              <td className="px-2 py-2 text-right">{formatNumber(wysylkaSummary.totalParking, 2)}</td>
                                              <td className="px-2 py-2 text-right">{formatNumber(wysylkaSummary.totalMaterial, 2)}</td>
                                              <td className="px-2 py-2 text-right">{formatNumber(wysylkaSummary.grandTotal, 2)}</td>
                                              <td className="px-2 py-2">-</td>
                                              <td className="px-2 py-2 text-center">-</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                          )}
                      </div>
                  )}
                  
                  {/* Only show this for non-firma interface */}
                  {interfacePracownik && (
                      <div className="flex flex-row items-center space-x-4">
                          <Button
                              onClick={handleGenerateReport}
                              label="Generuj raport"
                              className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                          />
                          <Button
                              onClick={handleGenerateAllEmployees}
                              label="Generuj wszystkie"
                              className="p-button-outlined border-2 p-2.5 bg-white text-black stable-button"
                          />
                      </div>
                  )}
              </div>
          </AmberBox>
            <div className="w-auto h-auto bg-blue-700 outline outline-1 outline-black flex flex-row items-center space-x-4 m-2 p-3 text-white">
                <p>Raporty</p>
            </div>
            <div className="w-auto bg-gray-300 h-full m-2 outline outline-1 outline-gray-500">
            <table className="w-full">
                <tbody className="text-left cursor-pointer">
                    <tr className={`border-b ${accountType !== 'Pracownik' ? 'hover:underline cursor-pointer' : 'cursor-not-allowed opacity-50'} even:bg-gray-200 odd:bg-gray-300`}
                        onClick={() => {
                            if (accountType !== 'Pracownik') {
                                setShowRaportyFirma(!showRaportyFirma);
                            }
                        }}>
                        <th className="border-r">Raporty dla firmy</th>
                    </tr>
                    <tr className={`${showRaportyFirma && accountType !== 'Pracownik' ? "" : "hidden"}`}>
                        <td onClick={() => {
                            if (accountType !== 'Pracownik') {
                                handleRowClick("Sprawozdanie z działalności - szczegółowe");
                            }
                        }}
                            style={getRowStyle("Sprawozdanie z działalności - szczegółowe")}
                            className={`border-r ${accountType !== 'Pracownik' ? 'hover:underline cursor-pointer' : 'cursor-not-allowed opacity-50'} even:bg-gray-200 odd:bg-gray-300`}>
                            Szczegółowy
                        </td>
                    </tr>
                    <tr className={`${showRaportyFirma && accountType !== 'Pracownik' ? "" : "hidden"}`}>
                        <td onClick={() => {
                            if (accountType !== 'Pracownik') {
                                handleRowClick("Sprawozdanie z działalności - podsumowanie");
                            }
                        }}
                            style={getRowStyle("Sprawozdanie z działalności - podsumowanie")}
                            className={`border-r ${accountType !== 'Pracownik' ? 'hover:underline cursor-pointer' : 'cursor-not-allowed opacity-50'} even:bg-gray-200 odd:bg-gray-300`}>
                            Podsumowanie
                        </td>
                    </tr>
                    {accountType === 'Administrator' && (
                    <tr className={`${showRaportyFirma && accountType !== 'Pracownik' ? "" : "hidden"}`}>
                        <td onClick={() => {
                            if (accountType !== 'Pracownik') {
                                handleRowClick(WYSYLKA_REPORT_NAME);
                            }
                        }}
                            style={getRowStyle(WYSYLKA_REPORT_NAME)}
                            className={`border-r ${accountType !== 'Pracownik' ? 'hover:underline cursor-pointer' : 'cursor-not-allowed opacity-50'} even:bg-gray-200 odd:bg-gray-300`}>
                            Podsumowanie(wysyłka)
                        </td>
                    </tr>
                    )}

                    <tr className="border-b hover:underline even:bg-gray-200 odd:bg-gray-300"
                        onClick={() => setShowRaportyPracownik(!showRaportyPracownik)}>
                        <th className="border-r">Raporty dla pracownika</th>
                    </tr>
                    <tr className={`${showRaportyPracownik ? "" : "hidden"}`}>
                        <td onClick={() => handleRowClick("Analiza świadczeń pracowniczych")}
                            style={getRowStyle("Analiza świadczeń pracowniczych")}
                            className="border-r hover:underline even:bg-gray-200 odd:bg-gray-300">
                            Szczegółowy
                        </td>
                    </tr>
                    <tr className={`${showRaportyPracownik ? "" : "hidden"}`}>
                        <td onClick={() => handleRowClick("Pracownik Analiza czasu - działalność")}
                            style={getRowStyle("Pracownik Analiza czasu - działalność")}
                            className="border-r hover:underline even:bg-gray-200 odd:bg-gray-300">
                            Podsumowanie
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);
}