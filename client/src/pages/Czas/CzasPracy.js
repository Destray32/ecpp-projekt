import React, { useState, useEffect } from "react";
import { format, startOfWeek, addWeeks, addDays, subWeeks, getWeek } from 'date-fns';
import { pl } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { Alert, notification } from 'antd';
import Axios from "axios";

import WeekNavigation from "../../Components/CzasPracy/WeekNavigation";
import TimeInputs from "../../Components/CzasPracy/TimeInputs";
import AdditionalProjects from "../../Components/CzasPracy/AdditionalProjects/AdditionalProjects";
import ActionButtons from "../../Components/CzasPracy/ActionButtons";
import { generateWeek, formatWeek, calculateWeeklyTotal, calculateProjectTotal } from '../../utils/dateUtils';

export default function CzasPracyPage() {
    const [userType, setUserType] = useState("Pracownik");
    const [loggedUserName, setLoggedUserName] = useState("Jan Kowalski");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [Pracownik, setPracownik] = useState(null);
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

    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

    //#region UseEffects
    useEffect(() => {
        fetchPojazdy();
        fetchPracownicy();
        fetchFirmy();
        fetchZleceniodawcy();
        fetchProjekty();
    }, []);

    useEffect(() => {
        setDaysOfWeek(generateWeek(startOfCurrentWeek));
    }, [currentDate]);

    useEffect(() => {
        if (Pracownik && (userType === "Administrator")) {
            fetchWorkHours(Pracownik, currentDate);
            fetchAdditionalProjects(Pracownik, currentDate);
        } else if (loggedUserName && (userType === "Pracownik")) {
            fetchWorkHours(loggedUserName, currentDate);
            fetchAdditionalProjects(loggedUserName, currentDate);
            setPracownicy([{ label: loggedUserName, value: loggedUserName }]);
            setPracownik(loggedUserName);
        }
    }, [Pracownik, currentDate]);
    //#endregion

    //#region fetching
    const fetchPojazdy = () => {
        Axios.get("http://localhost:5000/api/pojazdy", { withCredentials: true })
            .then((response) => {
                setSamochody(response.data.pojazdy.map(pojazd => ({ label: pojazd.numerRejestracyjny, value: pojazd.numerRejestracyjny })));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const fetchPracownicy = () => {
        Axios.get("http://localhost:5000/api/pracownicy", { withCredentials: true })
            .then((response) => {
                setPracownicy(response.data.map(pracownik => ({ label: `${pracownik.name} ${pracownik.surname}`, value: `${pracownik.name} ${pracownik.surname}` })));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const fetchFirmy = () => {
        Axios.get("http://localhost:5000/api/firmy", { withCredentials: true })
            .then((response) => {
                setFirmy(response.data.map(firma => ({ label: firma.Nazwa_firmy, value: firma.Nazwa_firmy })));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const fetchZleceniodawcy = () => {
        Axios.get("http://localhost:5000/api/grupy", { withCredentials: true })
            .then((response) => {
                setZleceniodawcy(response.data.grupy.map(zleceniodawca => ({ label: zleceniodawca.Zleceniodawca, value: zleceniodawca.Zleceniodawca })));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const fetchProjekty = () => {
        Axios.get("http://localhost:5000/api/czas/projekty", { withCredentials: true })
            .then((response) => {
                setDostepneProjekty(response.data.projekty.map(projekt => ({ label: projekt.NazwaKod_Projektu, value: projekt.NazwaKod_Projektu })));
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const fetchWorkHours = async (employeeName, date) => {
        try {
            const weekData = getWeek(date, { weekStartsOn: 1 });
            const year = date.getFullYear();
            const response = await Axios.get("http://localhost:5000/api/czas", {
                withCredentials: true,
                params: {
                    pracownikName: employeeName,
                    weekData: weekData,
                    year: year,
                }
            });

            if (response.data && response.data.days) {
                setHours(response.data.days);
            } else {
                setHours({});
            }
        } catch (error) {
            console.error("Error fetching work hours", error);
        }
    };

    const fetchAdditionalProjects = async (employeeName, date) => {
        try {
            const weekData = getWeek(date, { weekStartsOn: 1 });
            const year = date.getFullYear();
            
            const response = await Axios.get("http://localhost:5000/api/czas/projekty/dodane", {
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
                        updatedHours[dateKey] = project.hours[dayOfWeek];
                    });
    
                    return {
                        ...project,
                        id: uuidv4(),
                        hours: updatedHours
                    };
                });
    
                setAdditionalProjects(loadedProjects);
            } else {
                setAdditionalProjects([]);
            }
        } catch (error) {
            setAdditionalProjects([]);
            
            if (error.response && error.response.status === 404) {
                console.log("brak dodatkowych projektów");
            } else {
                console.error("Błąd podczas pobierania dodatkowych projektów", error);
            }
        }
    };
    //#endregion

    //#region handlers
    const handleSave = async () => {
        const totalHours = calculateWeeklyTotal(hours, daysOfWeek);
        let hasMissingFields = false;

        const formattedAdditionalProjects = additionalProjects.map(project => ({
            ...project,
            totalHours: calculateProjectTotal(project, daysOfWeek),
            days: daysOfWeek.map(day => ({
                dayOfWeek: format(day, 'EEEE', { locale: pl }),
                hoursWorked: project.hours[format(day, 'yyyy-MM-dd')]?.hoursWorked || 0,
                car: project.hours[format(day, 'yyyy-MM-dd')]?.car || null,
                comment: project.hours[format(day, 'yyyy-MM-dd')]?.comment || "",
                diet: project.hours[format(day, 'yyyy-MM-dd')]?.diet || "",
                km: project.hours[format(day, 'yyyy-MM-dd')]?.km || "",
                materials: project.hours[format(day, 'yyyy-MM-dd')]?.materials || "",
                other: project.hours[format(day, 'yyyy-MM-dd')]?.other || "",
                parking: project.hours[format(day, 'yyyy-MM-dd')]?.parking || "",
                tools: project.hours[format(day, 'yyyy-MM-dd')]?.tools || "",

            }))
        }));

        // pętla sprawdzająca czy wszystkie pola samochód i komentarz są wypełnione
        additionalProjects.forEach(project => {
            daysOfWeek.forEach(day => {
                const dayName = format(day, 'EEEE', { locale: pl });
                const niedziela = dayName === 'niedziela';

                const formattedDate = format(day, 'yyyy-MM-dd');
                const projectData = project.hours[formattedDate];

                if ((!projectData || !projectData.comment || !projectData.car) && !niedziela) {
                    if (projectData !== undefined) {
                        hasMissingFields = true;
                    }  
                }
            });
        });

        if (hasMissingFields) {
            notification.error({
                message: 'Missing Fields',
                description: 'Wybierz samochód i dodaj komentarz do wszystkich projektów',
                placement: 'topRight',
            });
            return; // przerwij zapis
        }


        try {
            const response = await Axios.post("http://localhost:5000/api/czas", {
                pracownikName: Pracownik,
                projektyName: Projekty,
                weekData: getWeek(currentDate, { weekStartsOn: 1 }),
                year: currentDate.getFullYear(),
                days: daysOfWeek.map(day => ({
                    dayOfWeek: format(day, 'EEEE', { locale: pl }),
                    start: hours[format(day, 'yyyy-MM-dd')]?.start || "00:00",
                    end: hours[format(day, 'yyyy-MM-dd')]?.end || "00:00",
                    break: hours[format(day, 'yyyy-MM-dd')]?.break || "00:00",
                })),
                totalHours: totalHours,
                additionalProjects: formattedAdditionalProjects,
            },
            { withCredentials: true });
            if (response.status === 200) {
                notification.success({
                    message: 'Success',
                    description: 'Zapisano dane',
                    placement: 'topRight',
                });
            }
        } catch (error) {
            console.error(error);
        }
    };
    //#endregion

//#region Render
    return (
        <div>
            <WeekNavigation 
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                Pracownik={Pracownik}
                setPracownik={setPracownik}
                pracownicy={pracownicy}
                userType={userType}
            />
            <TimeInputs 
                daysOfWeek={daysOfWeek}
                hours={hours}
                setHours={setHours}
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
                loggedUserName={loggedUserName}
                currentDate={currentDate}
            />
            <ActionButtons handleSave={handleSave} />
        </div>
    );
//#endregion
}