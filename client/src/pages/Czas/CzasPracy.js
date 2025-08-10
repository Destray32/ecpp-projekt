import React, { useState, useEffect, useCallback } from "react";
import { format, startOfWeek, addWeeks, endOfWeek, addDays, subWeeks, getWeek, set, parseISO, isWithinInterval } from 'date-fns';
import { pl } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { Alert, notification, Modal } from 'antd';
import Axios from "axios";
import jsPDF from 'jspdf';

import WeekNavigation from "../../Components/CzasPracy/WeekNavigation";
import TimeInputs from "../../Components/CzasPracy/TimeInputs";
import AdditionalProjects from "../../Components/CzasPracy/AdditionalProjects/AdditionalProjects";
import ActionButtons from "../../Components/CzasPracy/ActionButtons";
import { generateWeek, formatWeek, calculateWeeklyTotal, calculateProjectTotal, calculateDailyTotal } from '../../utils/dateUtils';
import { font } from "../../fonts/OpenSans-Regular-normal";

// Utility function for debouncing
const debounce = (func, delay) => {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (let key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
};

export default function CzasPracyPage() {
    const [userType, setUserType] = useState(null);
    const [Pracownik, setPracownik] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [pracownicy, setPracownicy] = useState([]);
    const [Firma, setFirma] = useState("PC Husbyggen");
    const [firmy, setFirmy] = useState([]);
    const [Zleceniodawca, setZleceniodawca] = useState(null);
    const [zleceniodawcy, setZleceniodawcy] = useState([]);
    const [Projekty, setProjekty] = useState(null);
    const [dostepneProjekty, setDostepneProjekty] = useState([]);
    const [hours, setHours] = useState({});
    const [additionalProjects, setAdditionalProjects] = useState([]);
    const [daysOfWeek, setDaysOfWeek] = useState(generateWeek(startOfWeek(new Date(), { weekStartsOn: 1 })));
    const [samochody, setSamochody] = useState([]);
    const [statusTygodnia, setStatusTygodnia] = useState(null);
    const [przekroczoneGodziny, setPrzekroczoneGodziny] = useState(false);
    const [isOver10h, setIsOver10h] = useState([
        false, false, false, false, false, false
    ]);
    const [blockStatus, setBlockStatus] = useState(false);
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const [availableGroups, setAvailableGroups] = useState([]);
    const [nazwaGrupyPracownika, setNazwaGrupyPracownika] = useState(null);
    const [idGrupy, setIdGrupy] = useState(null);
    const [pracownicyWGrupie, setPracownicyWGrupie] = useState([]);
    const [czyZapisano, setCzyZapisano] = useState(false);

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error
    const [lastSaved, setLastSaved] = useState(null);
    const [activeProject, setActiveProject] = useState(null);
    const [activeDate, setActiveDate] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [pendingDateChange, setPendingDateChange] = useState(null);
    const [loadingCounter, setLoadingCounter] = useState(0);
    const [initialHours, setInitialHours] = useState({});
    const [initialAdditionalProjects, setInitialAdditionalProjects] = useState([]);

    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

    //#region UseEffects
    useEffect(() => {
        if (statusTygodnia == "Zamknięty") {
            setCzyZapisano(true);
        }
    }, [statusTygodnia]);

    useEffect(() => {
        if (idGrupy) {
            fetchGrupaWTygodniu();
        }
    }, [idGrupy, currentDate]);
    
    useEffect(() => {
        fetchZalogowanyUzytkownik();
        fetchPojazdy();
        fetchPracownicy();
        fetchFirmy();
        fetchZleceniodawcy();
        fetchProjekty();
        fetchBlockStatus();
    }, []);

    useEffect(() => {
        // console.log("Grupy", availableGroups);
    }, [availableGroups]);

    useEffect(() => {
        // console.log("Pracownik", Pracownik);
        // console.log("vac group", idGrupy);
    }, [Pracownik]);

    useEffect(() => {
        setDaysOfWeek(generateWeek(startOfCurrentWeek));
    }, [currentDate]);

    useEffect(() => {
        if (Pracownik && dostepneProjekty.length > 0 && (userType === "Administrator")) {
            fetchWorkHours(Pracownik, currentDate);
            fetchAdditionalProjects(Pracownik, currentDate);
        } else if (Pracownik && dostepneProjekty.length > 0 && (userType === "Pracownik" || userType === "Kierownik" || userType === "Biuro")) {
            fetchWorkHours(Pracownik, currentDate);
            fetchAdditionalProjects(Pracownik, currentDate);
            setPracownicy([{ label: Pracownik, value: Pracownik }]);
        }
    }, [Pracownik, currentDate, dostepneProjekty]);

    useEffect(() => {
        if (currentUserId) {
            fetchStatusTygodnia();
        }
        fetchBlockStatus();
    }, [currentUserId, currentDate]);

    useEffect(() => {
        if (Pracownik) {
            fetchUserId();
        }
    }, [Pracownik]);

    // Network status detection
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            notification.success({
                message: 'Połączenie przywrócone',
                description: 'Jesteś teraz online. Możesz zapisać zmiany.',
                placement: 'topRight',
                duration: 3,
            });
        };

        const handleOffline = () => {
            setIsOnline(false);
            notification.warning({
                message: 'Brak połączenia',
                description: 'Utracono połączenie z internetem. Zapisywanie danych nie jest możliwe.',
                placement: 'topRight',
                duration: 5,
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Track changes to hours and additional projects
    useEffect(() => {
        if (Pracownik && statusTygodnia !== "Zamknięty" && loadingCounter === 0) {
            const hasHoursChanged = !deepEqual(hours, initialHours);
            const hasProjectsChanged = !deepEqual(additionalProjects, initialAdditionalProjects);
            
            if (hasHoursChanged || hasProjectsChanged) {
                setHasUnsavedChanges(true);
            } else {
                setHasUnsavedChanges(false);
            }
        }
    }, [hours, additionalProjects, Pracownik, statusTygodnia, loadingCounter, initialHours, initialAdditionalProjects]);

    useEffect(() => {
        if (czyZapisano) {
            setHasUnsavedChanges(false);
        }
    }, [czyZapisano]);

    useEffect(() => {
        setHasUnsavedChanges(false);
    }, [Pracownik, currentDate]);

    //#region fetching

    const fetchGrupaWTygodniu = async () => {
        const from = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const to = format(addDays(endOfWeek(currentDate, { weekStartsOn: 1 }), 1), 'yyyy-MM-dd');
    
        const urlRequest = `${baseUrl}/api/planTygodnia/zaplanuj?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    
        try {
            const res = await Axios.get(urlRequest, { 
                withCredentials: true 
            });
            const planData = res.data;
    
            const filteredPlanData = planData.filter(entry => {
                const dataOd = parseISO(entry.data_od);
                const dataDo = parseISO(entry.data_do);
                const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
                const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
                return (
                    isWithinInterval(dataOd, { start: weekStart, end: weekEnd }) ||
                    isWithinInterval(dataDo, { start: weekStart, end: weekEnd })
                );
            });
    
            if (filteredPlanData.length > 0) {
                const userGroups = filteredPlanData.filter(entry => entry.pracownikId === currentUserId);
                setNazwaGrupyPracownika(userGroups[0]?.Zleceniodawca || null);
                setZleceniodawca(userGroups[0]?.grupaId || null);
    
                const grupaIds = [
                    ...new Set(userGroups.map(group => group.grupaId))
                ];
    
                const pracownicyGrupy = filteredPlanData
                    .filter(entry => grupaIds.includes(entry.grupaId) && entry.pracownikId !== null)
                    .map(employee => ({
                        label: `${employee.imie} ${employee.nazwisko}`,
                        value: employee.pracownikId
                    }));
    
                setPracownicyWGrupie(pracownicyGrupy);
            } else {
                setPracownicyWGrupie([]);
                setNazwaGrupyPracownika(null);
                setZleceniodawca(null);
            }
        } catch (err) {
            setPracownicyWGrupie([]);
            setNazwaGrupyPracownika(null);
            setZleceniodawca(null);
        }
    };

    const fetchBlockStatus = async () => {
        try {
            const response = await Axios.get(`${baseUrl}/api/czas/warnings`, {
                withCredentials: true
            });
            setBlockStatus(false);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                notification.error({
                    message: 'Konto zablokowane',
                    description: 'Skontaktuj się z administratorem',
                    placement: 'topRight',
                });
                setBlockStatus(true);
            }
        }
    }

    const fetchUserId = async () => {
        try {
            await Axios.get(`${baseUrl}/api/pracownicy`, { withCredentials: true })
                .then((response) => {
                    const userId = response.data.find(pracownik => `${pracownik.name} ${pracownik.surname}` === Pracownik).id;
                    setCurrentUserId(userId);
                    setIdGrupy(response.data.find(pracownik => `${pracownik.name} ${pracownik.surname}` === Pracownik).vacationGroup);
                })
                .catch((error) => {
                    console.error(error);
                });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchZalogowanyUzytkownik = () => {
        Axios.get(`${baseUrl}/api/imie`, { withCredentials: true })
            .then((response) => {
                const fullName = `${response.data.name} ${response.data.surename}`;
                setPracownik(fullName);
                setUserType(response.data.accountType);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const fetchPojazdy = () => {
        Axios.get(`${baseUrl}/api/pojazdy`, { withCredentials: true })
            .then((response) => {
                setSamochody(response.data.pojazdy.map(pojazd => ({id: pojazd.id, label: pojazd.numerRejestracyjny, value: pojazd.numerRejestracyjny })));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const fetchPracownicy = () => {
        Axios.get(`${baseUrl}/api/pracownicy`, { withCredentials: true })
            .then((response) => {
                setPracownicy(response.data.map(pracownik => ({ label: `${pracownik.name} ${pracownik.surname}`, value: `${pracownik.name} ${pracownik.surname}` })));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const fetchFirmy = () => {
        Axios.get(`${baseUrl}/api/firmy`, { withCredentials: true })
            .then((response) => {
                setFirmy(response.data.map(firma => ({ label: firma.Nazwa_firmy, value: firma.idFirma })));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const fetchZleceniodawcy = () => {
        Axios.get(`${baseUrl}/api/grupy`, { withCredentials: true })
            .then((response) => {
                setZleceniodawcy(response.data.grupy.map(zleceniodawca => ({
                    label: zleceniodawca.Zleceniodawca,
                    value: zleceniodawca.id
                })));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const fetchProjekty = () => {
        Axios.get(`${baseUrl}/api/czas/projekty`, { withCredentials: true })
            .then((response) => {
                setDostepneProjekty(response.data.projekty.map(projekt => ({
                    label: projekt.NazwaKod_Projektu,
                    value: projekt.NazwaKod_Projektu,
                    Firma_idFirma: projekt.Firma_idFirma,
                    Grupa_urlopowa_idGrupa_urlopowa: projekt.Grupa_urlopowa_idGrupa_urlopowa
                })));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const fetchWorkHours = async (employeeName, date) => {
        try {
            setLoadingCounter(prev => prev + 1);
            const weekData = getWeek(date, { weekStartsOn: 1 });
            const year = date.getFullYear();
            const response = await Axios.get(`${baseUrl}/api/czas`, {
                withCredentials: true,
                params: {
                    pracownikName: employeeName,
                    weekData: weekData,
                    year: year,
                }
            });

            if (response.data && response.data.days) {
                setHours(response.data.days);
                setInitialHours(JSON.parse(JSON.stringify(response.data.days)));
            } else {
                setHours({});
                setInitialHours({});
            }
        } catch (error) {
            console.error("Error fetching work hours", error);
            setHours({});
            setInitialHours({});
        } finally {
            setLoadingCounter(prev => prev - 1);
        }
    };

    const fetchAdditionalProjects = async (employeeName, date) => {
        try {
            setLoadingCounter(prev => prev + 1);
            const weekData = getWeek(date, { weekStartsOn: 1 });
            const year = date.getFullYear();

            const response = await Axios.get(`${baseUrl}/api/czas/projekty/dodane`, {
                withCredentials: true,
                params: {
                    pracownikName: employeeName,
                    weekData: weekData,
                    year: year,
                }
            });

            if (response.data && response.data.projects) {
                const startOfWeekDate = startOfWeek(date, { weekStartsOn: 1 });
                
                const dayNameToDateMap = {
                    'Poniedziałek': format(startOfWeekDate, 'yyyy-MM-dd'),
                    'Wtorek': format(addDays(startOfWeekDate, 1), 'yyyy-MM-dd'),
                    'Środa': format(addDays(startOfWeekDate, 2), 'yyyy-MM-dd'),
                    'Czwartek': format(addDays(startOfWeekDate, 3), 'yyyy-MM-dd'),
                    'Piątek': format(addDays(startOfWeekDate, 4), 'yyyy-MM-dd'),
                    'Sobota': format(addDays(startOfWeekDate, 5), 'yyyy-MM-dd'),
                    'Niedziela': format(addDays(startOfWeekDate, 6), 'yyyy-MM-dd'),
                };

                const loadedProjects = response.data.projects.map(project => {
                    const updatedHours = {};

                    Object.keys(project.hours).forEach(dayOfWeek => {
                        const dateKey = dayNameToDateMap[dayOfWeek];
                        updatedHours[dateKey] = {
                            ...project.hours[dayOfWeek],
                            // Preserve the car selection if it exists
                            car: project.hours[dayOfWeek].car || ""
                        };
                    });

                    const projectInfo = dostepneProjekty.find(p => p.value === project.projekt);
                    const zleceniodawcaId = projectInfo ? projectInfo.Grupa_urlopowa_idGrupa_urlopowa : null;

                    return {
                        ...project,
                        id: uuidv4(),
                        zleceniodawca: zleceniodawcaId,
                        hours: updatedHours
                    };
                });

                setAdditionalProjects(loadedProjects);
                setInitialAdditionalProjects(JSON.parse(JSON.stringify(loadedProjects)));
            } else {
                setAdditionalProjects([]);
                setInitialAdditionalProjects([]);
            }
        } catch (error) {
            setAdditionalProjects([]);
            setInitialAdditionalProjects([]);

            if (error.response && error.response.status === 404) {
                //console.log("brak dodatkowych projektów");
            } else {
                console.error("Błąd podczas pobierania dodatkowych projektów", error);
            }
        } finally {
            setLoadingCounter(prev => prev - 1);
        }
    };

    const fetchStatusTygodnia = async () => {
        try {
            const weekData = getWeek(currentDate, { weekStartsOn: 1 });
            const year = currentDate.getFullYear();
            const response = await Axios.get(`${baseUrl}/api/tydzien/${year}/${weekData}`, {
                withCredentials: true
            });

            if (response.data && response.data.length) {
                const userId = currentUserId;

                const userStatus = response.data.find(item => item.idPracownik === userId);

                if (userStatus) {
                    setStatusTygodnia(userStatus.Status_tygodnia);
                } else {
                    console.log("Brak statusu tygodnia dla użytkownika");
                    setStatusTygodnia(null);
                }
            } else {
                setStatusTygodnia(null);
            }

        } catch (error) {
            console.error("Error fetching week status", error);
        }
    };
    //#endregion

    //#region Week Navigation with Unsaved Changes Warning
    const handleWeekChange = (newDate) => {
        if (hasUnsavedChanges && statusTygodnia !== "Zamknięty") {
            setPendingDateChange(newDate);
            Modal.confirm({
                title: 'Niezapisane zmiany',
                content: 'Masz niezapisane zmiany. Czy chcesz kontynuować bez zapisywania? Wszystkie zmiany zostaną utracone.',
                okText: 'Tak, kontynuuj',
                cancelText: 'Anuluj',
                onOk: () => {
                    setCurrentDate(newDate);
                    setHasUnsavedChanges(false);
                    setCzyZapisano(false);
                    setPendingDateChange(null);
                    setInitialHours({});
                    setInitialAdditionalProjects([]);
                },
                onCancel: () => {
                    setPendingDateChange(null);
                }
            });
        } else {
            setCurrentDate(newDate);
            setCzyZapisano(false);
            setInitialHours({});
            setInitialAdditionalProjects([]);
        }
    };

    const handleEmployeeChange = (newEmployee) => {
        if (hasUnsavedChanges && statusTygodnia !== "Zamknięty") {
            Modal.confirm({
                title: 'Niezapisane zmiany',
                content: 'Masz niezapisane zmiany. Czy chcesz kontynuować bez zapisywania? Wszystkie zmiany zostaną utracone.',
                okText: 'Tak, kontynuuj',
                cancelText: 'Anuluj',
                onOk: () => {
                    setPracownik(newEmployee);
                    setHasUnsavedChanges(false);
                    setCzyZapisano(false);
                    // Reset initial data when changing employee
                    setInitialHours({});
                    setInitialAdditionalProjects([]);
                },
                onCancel: () => {
                    // Do nothing, keep current employee
                }
            });
        } else {
            setPracownik(newEmployee);
            setCzyZapisano(false);
            // Reset initial data when changing employee
            setInitialHours({});
            setInitialAdditionalProjects([]);
        }
    };
    //#endregion

    //#region handlers
    const handleSave = async (autoSave = false) => {
        // Skip saving if no data or status is closed
        if (statusTygodnia === "Zamknięty" || !isOnline || !Pracownik) {
            return;
        }
        
        if (!autoSave) {
            setSaveStatus("saving");
        }

        const totalHours = calculateWeeklyTotal(hours, daysOfWeek);
        const projectNames = additionalProjects.map(project => project.label);

        const formattedAdditionalProjects = additionalProjects.map(project => ({
            ...project,
            totalHours: calculateProjectTotal(project, daysOfWeek),
            days: daysOfWeek.map(day => {
                const dayName = format(day, 'EEEE', { locale: pl });
                const formattedDate = format(day, 'yyyy-MM-dd');
                const projectData = project.hours[formattedDate];
                const hoursWorked = projectData?.hoursWorked || 0;

                return {
                    dayOfWeek: dayName,
                    hoursWorked: hoursWorked,
                    // Send car data only if hoursWorked > 0 or if a car was previously selected
                    car: projectData?.car || null, 
                    comment: hoursWorked > 0 ? projectData?.comment || "" : "", 
                    diet: projectData?.diet || "",
                    km: projectData?.km || "",
                    materials: projectData?.materials || "",
                    parking: projectData?.parking || "",
                    tools: projectData?.tools || ""
                };
            })
        }));

        if (przekroczoneGodziny && !autoSave) {
            notification.warning({
                message: 'Przekroczone godziny',
                description: `W dniach: ${daysOfWeek
                    .slice(0, 6)
                    .filter((day, index) => isOver10h[index + 1])
                    .map(day => format(day, 'EEEE', { locale: pl }))
                    .join(', ')} przekroczono limit 10ciu godzin`,
                placement: 'topRight',
            });
        }

        try {
            const response = await Axios.post(`${baseUrl}/api/czas`, {
                pracownikName: Pracownik,
                projektyName: Projekty,
                weekData: getWeek(currentDate, { weekStartsOn: 1 }),
                year: currentDate.getFullYear(),
                days: daysOfWeek.map(day => {
                    const formattedDate = format(day, 'yyyy-MM-dd');
                    const hoursData = hours[formattedDate] || {};
                    return {
                        dayOfWeek: format(day, 'EEEE', { locale: pl }),
                        start: hoursData.start || "00:00",
                        end: hoursData.end || "00:00",
                        break: hoursData.break && hoursData.break.trim() !== "" ? hoursData.break : "00:00",
                    };
                }),
                totalHours: totalHours,
                additionalProjects: formattedAdditionalProjects,
            }, { withCredentials: true });

            if (response.status === 200) {
                setLastSaved(new Date());
                setSaveStatus("saved");
                setHasUnsavedChanges(false);
                
                setInitialHours(JSON.parse(JSON.stringify(hours)));
                setInitialAdditionalProjects(JSON.parse(JSON.stringify(additionalProjects)));
                
                if (!autoSave) {
                    notification.success({
                        message: 'Sukces',
                        description: 'Zapisano dane',
                        placement: 'topRight',
                    });
                }
                
                setCzyZapisano(true);
                
                // Chowaj additional rows po zapisie
                setActiveProject(null);
                setActiveDate(null);
                
                // Reset save status after a short delay
                setTimeout(() => {
                    setSaveStatus("idle");
                }, 3000);
            }
        } catch (error) {
            console.error(error);
            setSaveStatus("error");
            
            if (!autoSave) {
                notification.error({
                    message: 'Błąd',
                    description: 'Nie udało się zapisać danych',
                    placement: 'topRight',
                });
            }
            
            // Reset save status after a short delay
            setTimeout(() => {
                setSaveStatus("idle");
            }, 3000);
        }
    };

    const toMinutes = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') val = val.toString();
    val = val.replace(',', '.');
    if (val.includes(':')) {
        const [h, m] = val.split(':').map(Number);
        return (parseInt(h) || 0) * 60 + (parseInt(m) || 0);
    }
    const [h, m] = val.split('.').map(Number);
    return (parseInt(h) || 0) * 60 + (parseInt(m) || 0);
};

const handleZamknijTydzien = async () => {
    let hasMissingFields = false;
    let hasMissingStartEndBreak = false;
    let dayHourMismatch = false;

    // zamieniamy na minuty
    const totalMinutes = toMinutes(calculateWeeklyTotal(hours, daysOfWeek));
    let projectTotalMinutes = additionalProjects
        .map(project => toMinutes(calculateProjectTotal(project, daysOfWeek)))
        .reduce((acc, curr) => acc + curr, 0);

    additionalProjects.forEach(project => {
        daysOfWeek.forEach(day => {
            const dayName = format(day, 'EEEE', { locale: pl });
            if (dayName !== 'Niedziela') {
                const formattedDate = format(day, 'yyyy-MM-dd');
                const projectData = project.hours[formattedDate];
                const hoursWorked = projectData?.hoursWorked || 0;
                if (toMinutes(hoursWorked) > 0) {
                    if ((!hours[formattedDate]?.start || !hours[formattedDate]?.end)) {
                        hasMissingStartEndBreak = true;
                    }
                    if (!projectData?.car || !projectData?.comment) {
                        hasMissingFields = true;
                    }
                }
            }
        });
    });

    // sprawdzanie mismatchów w dniach
    const mismatchDays = [];
    daysOfWeek.forEach(day => {
        const dayName = format(day, 'EEEE', { locale: pl });
        const formattedDate = format(day, 'yyyy-MM-dd');
        const dailyHours = hours[formattedDate] || {};

        let totalDayMinutes = 0;
        if (dailyHours.end && dailyHours.start) {
            totalDayMinutes =
                toMinutes(dailyHours.end) -
                toMinutes(dailyHours.start) -
                toMinutes(dailyHours.break || '0');
            if (totalDayMinutes < 0) totalDayMinutes = 0;
        }

        let projectDayMinutes = 0;
        additionalProjects.forEach(project => {
            const projectData = project.hours[formattedDate];
            if (projectData?.hoursWorked) {
                projectDayMinutes += toMinutes(projectData.hoursWorked);
            }
        });

        if (totalDayMinutes !== projectDayMinutes) {
            dayHourMismatch = true;
            const toHHMM = (min) => {
                const h = Math.floor(min / 60);
                const m = min % 60;
                return `${h}:${m.toString().padStart(2, '0')}`;
            };
            mismatchDays.push(`${dayName} (${formattedDate}): ${toHHMM(totalDayMinutes)} ≠ ${toHHMM(projectDayMinutes)}`);
        }
    });

    if (hasMissingFields) {
        notification.error({
            message: 'Puste pola w dodatkowych projektach',
            description: 'Wybierz samochód i dodaj komentarz do wszystkich projektów',
            placement: 'topRight',
        });
        return;
    }

    if (hasMissingStartEndBreak) {
        notification.error({
            message: 'Puste pola',
            description: 'Wybierz godziny rozpoczęcia, zakończenia i przerwy dla dni w których są projekty',
            placement: 'topRight',
        });
        return;
    }

    if (dayHourMismatch) {
        notification.error({
            message: 'Różnica w godzinach',
            description: `Suma godzin pracy nie zgadza się z sumą godzin w dodatkowych projektach dla dni:\n${mismatchDays.join('\n')}`,
            placement: 'topRight',
            duration: 8,
        });
        return;
    }

    if (projectTotalMinutes !== totalMinutes) {
    notification.error({
        message: 'Błąd',
        description: 'Suma godzin w dodatkowych projektach nie zgadza się z sumą godzin pracy',
        placement: 'topRight',
    });
    return;
}else {
            try {
                await handleSave();
                
                fetchUserId();
                try {
            const weeklyHoursDecimal = (totalMinutes / 60).toFixed(2); // np. 42.50
            console.log(weeklyHoursDecimal);
            const warning_response = await Axios.post(`${baseUrl}/api/czas/warnings`, {
                weeklyHours: weeklyHoursDecimal,
                id: currentUserId,
            }, { withCredentials: true });
                    if (warning_response.status === 403) {
                        notification.error({
                            message: 'Konto zablokowane',
                            description: 'Skontaktuj się z administratorem',
                            placement: 'topRight',
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
                const response = await Axios.delete(`${baseUrl}/api/tydzien`, {
                    data: {
                        tydzienRoku: getWeek(currentDate, { weekStartsOn: 1 }),
                        pracownikId: currentUserId,
                        year: currentDate.getFullYear(),
                    },
                    withCredentials: true
                });
                if (response.status === 200) {
                    notification.success({
                        message: 'Success',
                        description: 'Zamknięto tydzień',
                        placement: 'topRight',
                    });
                    // Chowaj additional rows po zamknięciu tygodnia
                    setActiveProject(null);
                    setActiveDate(null);
                    fetchStatusTygodnia();
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleOtworzTydzien = async () => {
        try {
            fetchUserId();
            const response = await Axios.post(`${baseUrl}/api/tydzien`, {
                tydzienRoku: getWeek(currentDate, { weekStartsOn: 1 }),
                pracownikId: currentUserId,
                year: currentDate.getFullYear(),
            }, { withCredentials: true });

            if (response.status === 200) {
                notification.success({
                    message: 'Success',
                    description: 'Otwarto tydzień',
                    placement: 'topRight',
                });
                fetchStatusTygodnia();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleDrukujRaport = async () => {
        const doc = new jsPDF();

        doc.setFont("OpenSans-Regular", "normal");

        // ----- pierwsza ala "tabelka" -----
        const weekNumber = getWeek(currentDate, { locale: pl });
        const dateStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd.MM.yyyy');
        const dateEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd.MM.yyyy');
        const status = statusTygodnia.charAt(0).toUpperCase() + statusTygodnia.slice(1);
        const userName = `${Pracownik}`;

        const firstTableData = [
            ['Tydzien ' + weekNumber, `${dateStart} -${dateEnd}`, status, userName],
        ];

        // odstep od gory
        doc.setFontSize(12);
        doc.text('Raport Tygodniowy', 14, 15);
        doc.setFontSize(10);

        doc.autoTable({
            startY: 20,
            theme: 'plain',
            styles: { cellPadding: 3, fontSize: 10 },
            head: [['', '', '', '']],
            body: firstTableData,
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 60 },
                2: { cellWidth: 40 },
                3: { cellWidth: 60 },
            },
            tableWidth: 'wrap',
            styles: { font: 'OpenSans-Regular', fontStyle: 'normal' },
        });

        // ----- Druga tabelka -----
        const polishWeekdays = ['Pon', 'Wto', 'Sro', 'Czw', 'Pia', 'Sob', 'Nie'];
        const headers = ['', ...daysOfWeek.map((day, index) =>
            `${polishWeekdays[index]}\n${format(day, 'dd')}`)
        ];

        const rows = [
            ['Rozpoczęcie', ...daysOfWeek.map((day) => hours[format(day, 'yyyy-MM-dd')]?.start || '-')],
            ['Przerwa', ...daysOfWeek.map((day) => hours[format(day, 'yyyy-MM-dd')]?.break || '-')],
            ['Zakończenie', ...daysOfWeek.map((day) => hours[format(day, 'yyyy-MM-dd')]?.end || '-')],
            ['Razem (godz.)', ...daysOfWeek.map((day) => {
                const dayHours = hours[format(day, 'yyyy-MM-dd')] || { start: '', break: '', end: '' };
                const dailyTotal = calculateDailyTotal(dayHours);
                return dailyTotal ? `${dailyTotal} godz.` : '-';
            })],
        ];

        const weeklyTotal = calculateWeeklyTotal(hours, daysOfWeek);

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [headers],
            body: rows,
            styles: { cellPadding: 3, fontSize: 10, font: 'OpenSans-Regular', fontStyle: 'normal' },
            theme: 'grid',
            headStyles: { cellPadding: 2, fontSize: 8 },
        });

        // ten weekly total pod tabelka
        doc.setFontSize(12);
        doc.text(`Razem: ${weeklyTotal} godz.`, 14, doc.lastAutoTable.finalY + 10);

        // sygnatury
        doc.setFontSize(10);
        doc.text('____________________', 14, doc.internal.pageSize.height - 30);
        doc.text(`${Pracownik}`, 14, doc.internal.pageSize.height - 25);
        doc.text(`${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 20);
        doc.text('____________________', doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 30);
        doc.text('Szef', doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 25);

        doc.save(`Raport_Tydzien_${weekNumber}.pdf`);
    };
    //#endregion
    
    function convertTimeToDecimal(timeStr) {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours + minutes / 60;
    }

    //#region Render
    return (
        <div>
            <WeekNavigation
                currentDate={currentDate}
                setCurrentDate={handleWeekChange}
                Pracownik={Pracownik}
                setPracownik={handleEmployeeChange}
                pracownicy={pracownicy}
                userType={userType}
                statusTyg={statusTygodnia}
                isOnline={isOnline}
                lastSaved={lastSaved}
                saveStatus={saveStatus}
                hasUnsavedChanges={hasUnsavedChanges}
            />
            <TimeInputs
                daysOfWeek={daysOfWeek}
                hours={hours}
                setHours={setHours}
                statusTyg={statusTygodnia}
                setPrzekroczone={setPrzekroczoneGodziny}
                isOver10h={isOver10h}
                setIsOver10h={setIsOver10h}
                blockStatus={blockStatus}
                nazwaGrupyPracownika={nazwaGrupyPracownika}
                pracownicyWGrupie={pracownicyWGrupie}
                czyZapisano={czyZapisano}
            />
            <AdditionalProjects
                Firma={Firma}
                setFirma={setFirma}
                firmy={firmy}
                Zleceniodawca={Zleceniodawca}
                setZleceniodawca={setZleceniodawca}
                zleceniodawcy={zleceniodawcy}
                Projekty={Projekty}
                setProjekty={setProjekty}
                dostepneProjekty={dostepneProjekty}
                additionalProjects={additionalProjects}
                setAdditionalProjects={setAdditionalProjects}
                daysOfWeek={daysOfWeek}
                samochody={samochody}
                loggedUserName={Pracownik}
                currentDate={currentDate}
                statusTyg={statusTygodnia}
                blockStatus={blockStatus}
                activeProject={activeProject}
                setActiveProject={setActiveProject}
                activeDate={activeDate}
                setActiveDate={setActiveDate}
            />
            <ActionButtons 
                handleSave={() => handleSave(false)}
                handleCloseWeek={handleZamknijTydzien} 
                handleOpenWeek={handleOtworzTydzien} 
                handlePrintReport={handleDrukujRaport}
                statusTyg={statusTygodnia} 
                userType={userType} 
                blockStatus={blockStatus}
                isOnline={isOnline}
                saveStatus={saveStatus}
            />
            {!isOnline && (
                <div className="fixed bottom-4 right-4 bg-amber-100 p-4 rounded-md shadow-lg border border-amber-500">
                    <div className="flex items-center">
                        <span className="text-amber-700 font-semibold">Offline</span>
                        <span className="ml-2 text-sm">Zmiany nie mogą być zapisane</span>
                    </div>
                </div>
            )}
        </div>
    );
    //#endregion
}
