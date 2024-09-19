import React, { useState, useEffect } from "react";
import { format, startOfWeek, addWeeks, addDays, subWeeks, getWeek, set } from 'date-fns';
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

    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

    //#region UseEffects
    useEffect(() => {
        fetchZalogowanyUzytkownik();
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
        } else if (Pracownik && (userType === "Pracownik")) {
            fetchWorkHours(Pracownik, currentDate);
            fetchAdditionalProjects(Pracownik, currentDate);
            setPracownicy([{ label: Pracownik, value: Pracownik }]);
        }
    }, [Pracownik, currentDate]);

    useEffect(() => {
        if (currentUserId) {
            fetchStatusTygodnia();
        }
    }, [currentUserId, currentDate]);

    useEffect(() => {
        if (Pracownik) {
            fetchUserId();
        }
    }, [Pracownik]);
    //#endregion

    //#region fetching
    const fetchUserId = async () => {
        try {
        await Axios.get("http://localhost:5000/api/pracownicy", { withCredentials: true })
            .then((response) => {
                //console.log(response.data);
                const userId = response.data.find(pracownik => `${pracownik.name} ${pracownik.surname}` === Pracownik).id;
                setCurrentUserId(userId);
            })
            .catch((error) => {
                console.error(error);
            });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchZalogowanyUzytkownik = () => {
        Axios.get("http://localhost:5000/api/imie", { withCredentials: true })
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
                setFirmy(response.data.map(firma => ({ label: firma.Nazwa_firmy, value: firma.idFirma })));
            })
            .catch((error) => {
                console.error(error);
            });
    }
    
    const fetchZleceniodawcy = () => {
        Axios.get("http://localhost:5000/api/grupy", { withCredentials: true })
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
        Axios.get("http://localhost:5000/api/czas/projekty", { withCredentials: true })
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

    const fetchStatusTygodnia = async () => {
    try {
        const weekData = getWeek(currentDate, { weekStartsOn: 1 });
        const response = await Axios.get(`http://localhost:5000/api/tydzien/${weekData}`, {
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

        // if (response.data && response.data.status) {
            //     if (response.data.status === "Zamknięty") {
            //         notification.error({
            //             message: 'Błąd',
            //             description: 'Tydzień jest zamknięty',
            //             placement: 'topRight',
            //         });
            //     }
            // }

    } catch (error) {
        console.error("Error fetching week status", error);
    }
};
    //#endregion

    //#region handlers
    const handleSave = async () => {
        const totalHours = calculateWeeklyTotal(hours, daysOfWeek);

        let hasMissingFields = false; // stan dla sprawdzania czy brakuje pola w dodatkowych projektach
        let hasMissingStartEndBreak = false; // stan dla sprawdzania czy godziny sa ustawione dla dodatkowych projektow ale nie ma start, end, lub break
        let dayHourMismatch = false; // stan dla sprawdzania czy godziny przypisane do projektow zgadzaja sie z godzinami pracy

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
                    car: hoursWorked > 0 ? projectData?.car || null : null, // null jesli nie ma godzin pracy
                    comment: hoursWorked > 0 ? projectData?.comment || "" : "", // tak samo tutaj 
                    diet: projectData?.diet || "",
                    km: projectData?.km || "",
                    materials: projectData?.materials || "",
                    parking: projectData?.parking || "",
                    tools: projectData?.tools || ""
                };
            })
        }));

        additionalProjects.forEach(project => {
            daysOfWeek.forEach(day => {
                const dayName = format(day, 'EEEE', { locale: pl });

                // pomijanie niedzieli
                if (dayName !== 'Niedziela') {
                    const formattedDate = format(day, 'yyyy-MM-dd');
                    const projectData = project.hours[formattedDate];
                    const hoursWorked = projectData?.hoursWorked || 0; // default 0 jesli nie ma godzin pracy

                    // przeskipowanie checkowania jesli nie ma godzin pracy w danym dniu
                    if (hoursWorked > 0) {
                        // sprawdza czy godziny sa ustawione dla danego dnia w projekcie ale nie ma start, end, lub break
                        if ((!hours[formattedDate]?.start || !hours[formattedDate]?.end || !hours[formattedDate]?.break)) {
                            console.log(`Additional project is filled but start, break, or end times are missing for ${dayName} (${formattedDate}).`);
                            hasMissingStartEndBreak = true;
                        }
                        if (!projectData?.car || !projectData?.comment) {
                            hasMissingFields = true;
                            console.log(`Missing car or comment for ${dayName} (${formattedDate}).`);
                        }
                    }
                }
            });
        });

        daysOfWeek.forEach(day => {
            const dayName = format(day, 'EEEE', { locale: pl });
            const formattedDate = format(day, 'yyyy-MM-dd');
            const dailyHours = hours[formattedDate] || {};
        
            const breakHours = dailyHours.break ? parseFloat(dailyHours.break.split(":")[0]) : 0;
            
            const totalDayHours = dailyHours.end && dailyHours.start ? 
                parseFloat(dailyHours.end.split(":")[0]) - parseFloat(dailyHours.start.split(":")[0]) - breakHours 
                : 0;
        
            let projectDayHours = 0;
        
            additionalProjects.forEach(project => {
                const projectData = project.hours[formattedDate];
                if (projectData?.hoursWorked) {
                    projectDayHours += parseFloat(projectData.hoursWorked);
                }
            });
        
            if (totalDayHours !== projectDayHours) {
                dayHourMismatch = true;
                console.log(`Różnica w godzinach dla ${dayName}. Godziny pracy: ${totalDayHours}, godziny w dodatkowych projektach: ${projectDayHours}`);
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
                description: 'Suma godzin pracy nie zgadza się z sumą godzin w dodatkowych projektach',
                placement: 'topRight',
            });
            return;
        }

        try {
            const response = await Axios.post("http://localhost:5000/api/czas", {
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
                        break: hoursData.break || "00:00",
                    };
                }),
                totalHours: totalHours,
                additionalProjects: formattedAdditionalProjects,
            }, { withCredentials: true });

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

    const handleZamknijTydzien = async () => {
        const totalHours = calculateWeeklyTotal(hours, daysOfWeek);
        let projectTotalHours = additionalProjects.map(project => calculateProjectTotal(project, daysOfWeek));
        projectTotalHours = projectTotalHours.reduce((acc, curr) => acc + curr, 0);

        if (projectTotalHours !== totalHours) {
            notification.error({
                message: 'Błąd',
                description: 'Suma godzin w dodatkowych projektach nie zgadza się z sumą godzin pracy',
                placement: 'topRight',
            });
            return;
        } else {
            try {
                fetchUserId();
                const response = await Axios.delete("http://localhost:5000/api/tydzien", {
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
                    //setStatusTygodnia("Zamknięty");
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
            const response = await Axios.post("http://localhost:5000/api/tydzien", {
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
                //setStatusTygodnia(null);
                fetchStatusTygodnia();
            }
        } catch (error) {
            console.error(error);
        }
    }
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
                statusTyg={statusTygodnia}
            />
            <TimeInputs
                daysOfWeek={daysOfWeek}
                hours={hours}
                setHours={setHours}
                statusTyg={statusTygodnia}
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
            />
            <ActionButtons handleSave={handleSave} handleCloseWeek={handleZamknijTydzien} handleOpenWeek={handleOtworzTydzien} statusTyg={statusTygodnia} userType={userType} />
        </div>
    );
    //#endregion
}