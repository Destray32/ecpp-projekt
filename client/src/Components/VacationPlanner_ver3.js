import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Komponent planera urlopow pracownikow
 * 
 * @component
 * @example
 * // Przyklad uzycia:
 * import VacationPlanner from './VacationPlanner';
 * 
 * function App() {
 *   return <VacationPlanner />;
 * }
 * 
 * // Format danych wejsciowych (zapisywanych w localStorage pod kluczem 'vacationData'):
 * const przykladoweDane = [
 *   {
 *     id: "1",
 *     name: "Jan Kowalski",
 *     vacations: [
 *       {
 *         from: "2024-01-15",  // format daty: YYYY-MM-DD
 *         to: "2024-01-19",
 *         status: "Zatwierdzone"  // mozliwe statusy: "Zatwierdzone", "Do zatwierdzenia", "Odrzucone"
 *       },
 *       {
 *         from: "2024-06-01",
 *         to: "2024-06-14",
 *         status: "Do zatwierdzenia"
 *       }
 *     ]
 *   },
 *   {
 *     id: "2",
 *     name: "Anna Nowak",
 *     vacations: [
 *       {
 *         from: "2024-07-01",
 *         to: "2024-07-21",
 *         status: "Zatwierdzone"
 *       }
 *     ]
 *   }
 * ];
 * 
 * // Format danych w localStorage:
 * // 'selectedWeekAndYear': [numer_tygodnia, rok]  // np. [1, 2024]
 * // 'vacationData': [...przykladoweDane]
 * 
 * @returns {JSX.Element} Komponent React wyswietlajacy plan urlopow
 * 
 * @description
 * Komponent wyswietla plan urlopow pracownikow w formie kalendarza tygodniowego.
 * Urlopy sa oznaczone kolorami:
 * - zielony: urlop zatwierdzony
 * - zolty: urlop oczekujacy na zatwierdzenie
 * - czerwony: urlop odrzucony
 * 
 * @requires react
 * @requires html2canvas
 * @requires jspdf
 */
const VacationPlanner = () => {
    // stan komponentu
    const [vacationData, setVacationData] = useState([]); // dane o urlopach
    const [selectedWeekAndYear, setSelectedWeekAndYear] = useState([0, 0]); // wybrany tydzien i rok
    const [week, setWeek] = useState(0); // aktualny tydzien
    const [isDownloading, setIsDownloading] = useState(false); // znacznik pobierania
    const plannerRef = useRef(); // referencja do elementu do eksportu PDF

    // nazwy miesiecy po polsku
    const nazwyMiesiacow = [
        'Styczen', 'Luty', 'Marzec', 'Kwiecien', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpien', 'Wrzesien', 'Pazdziernik', 'Listopad', 'Grudzien'
    ];

    const nazwyDniTygodnia = [
        'N', 'P', 'W', 'S', 'C', 'P', 'S'
    ]

    // pobieranie roku z local storage
    const getYearLocalStorage = () => {
        const storedSelectedWeekAndYear = localStorage.getItem('selectedWeekAndYear');
        if (storedSelectedWeekAndYear) {
            const [_, year] = JSON.parse(storedSelectedWeekAndYear);
            return year;
        }
        return new Date().getFullYear(); // domyslnie aktualny rok
    };

    // pobieranie tygodnia z local storage
    const getWeekLocalStorage = () => {
        const storedSelectedWeekAndYear = localStorage.getItem('selectedWeekAndYear');
        if (storedSelectedWeekAndYear) {
            const [week, year] = JSON.parse(storedSelectedWeekAndYear);
            return week;
        }
        return 0; // domyslnie pierwszy tydzien
    };

    // ladowanie danych przy starcie komponentu
    useEffect(() => {
        const storedVacationData = localStorage.getItem('vacationData');
        if (storedVacationData) {
            setVacationData(JSON.parse(storedVacationData));
            setWeek(getWeekLocalStorage());
        }
    }, []);

    // generowanie i pobieranie pliku PDF
    const downloadPDF = () => {
        setIsDownloading(true); // ustaw znacznik na start
        const input = plannerRef.current;

        const firstWeek = tygodnie[0][0].data;
        const lastWeek = tygodnie[tygodnie.length - 1][6].data;

        const dateStr = `${firstWeek.toISOString().split('T')[0]}_to_${lastWeek.toISOString().split('T')[0]}`;
        const timestamp = new Date().toISOString().split('.')[0].replace(/[:-]/g, '');

        html2canvas(input, {
            scale: 5,
            useCORS: true,
            logging: false,
            allowTaint: true
        }).then((canvas) => {
            const pdf = new jsPDF('l', 'mm', [600, 420], true);
            const imgWidth = pdf.internal.pageSize.getWidth() - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 12, 12, imgWidth, imgHeight, undefined, 'FAST');
            const fileName = `VacationPlan_${getYearLocalStorage()}_Week${getWeekLocalStorage()}_${dateStr}_${timestamp}.pdf`;
            pdf.save(fileName);
            setIsDownloading(false); // wyłącz znacznik po zakończeniu
        }).catch(() => {
            setIsDownloading(false); // wyłącz znacznik w przypadku błędu
        });
    };

    const getFirstDayOfISOWeek = (week, year) => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
};

    // Fix date comparison for proper vacation rendering
    const compareDates = (date1, date2) => {
        if (!date1 || !date2) return false;
        
        // Compare only year, month, and day - ignore time
        return date1.getFullYear() === date2.getFullYear() && 
               date1.getMonth() === date2.getMonth() && 
               date1.getDate() === date2.getDate();
    };
    
    const isDateInRange = (date, start, end) => {
        if (!date || !start || !end) return false;
        
        // Clone dates to avoid modifying the original
        const testDate = new Date(date.getTime());
        const startDate = new Date(start.getTime());
        const endDate = new Date(end.getTime());
        
        // Reset time to midnight for accurate day comparison
        testDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        
        return testDate >= startDate && testDate <= endDate;
    };

    // Keep the original implementation of generujDni
    const generujDni = (rok = getYearLocalStorage()) => {
        const allDays = [];

        const startDate = getFirstDayOfISOWeek(week, rok);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 52 * 7); // 52 tygodnie

        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            allDays.push({
                data: new Date(currentDate),
                dzienMiesiaca: currentDate.getDate(),
                dzienTygodnia: currentDate.getDay(),
                miesiac: nazwyMiesiacow[currentDate.getMonth()],
                nazwaDniaTygodnia: nazwyDniTygodnia[currentDate.getDay()]
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const tygodnie = [];
        for (let i = 0; i < allDays.length; i += 7) {
            if (allDays.length - i >= 7) {
                tygodnie.push(allDays.slice(i, i + 7));
            }
        }

        return tygodnie;
    };


    // konwersja danych o urlopach na format wewnetrzny
    const convertToAktywnosci = () => {
        const aktywnosci = {};

        vacationData.forEach(employee => {
            aktywnosci[employee.name] = employee.vacations.map(vacation => ({
                od: new Date(vacation.from),
                do: new Date(vacation.to),
                typ: vacation.status === 'Zatwierdzone' ? 'zielony' :
                    vacation.status === 'Do zatwierdzenia' ? 'zolty' : 'czerwony'
            }));
        });

        return aktywnosci;
    };

    const tygodnie = generujDni();
    const aktywnosci = convertToAktywnosci();

    // Add this function to get the ISO week number for a date
    const getWeekNumber = (date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    };

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold mb-8">Plan urlopów {getYearLocalStorage()}</h1>
            <div className="flex items-center mb-8">
                <button
                    onClick={downloadPDF}
                    className="p-4 bg-blue-600 text-white rounded text-xl font-bold"
                    disabled={isDownloading}
                >
                    Pobierz PDF
                </button>
                {isDownloading && (
                    <span className="ml-4 text-blue-700 font-semibold flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-blue-700" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z"/>
                        </svg>
                        Generowanie PDF...
                    </span>
                )}
            </div>
            {/* tabela z kalendarzem */}
            <div ref={plannerRef} className="overflow-x-auto">
                <table className="w-full border-collapse text-center table-fixed text-lg"> {/* Zwiększona czcionka */}
                    <thead>
                        {/* Header with month names */}
                        <tr>
                            <th rowSpan="2" className="border border-gray-400 bg-gray-200" style={{width: '200px', fontSize: '1.3em'}}>Pracownik</th>
                            {(() => {
                                const monthHeaders = [];
                                let currentMonth = tygodnie[0][0].miesiac;
                                let colspan = 0;

                                tygodnie.forEach((tydzien, index) => {
                                    const tydzienMonths = tydzien.map(d => d.miesiac);
                                    if (tydzienMonths.includes(currentMonth)) {
                                        colspan++;
                                    } else {
                                        monthHeaders.push(
                                            <th key={currentMonth + index} colSpan={colspan} className="border border-gray-400 bg-blue-300" style={{fontSize: '1.2em'}}>
                                                {currentMonth}
                                            </th>
                                        );
                                        currentMonth = tydzienMonths.find(m => m !== currentMonth) || currentMonth;
                                        colspan = 1;
                                    }
                                });

                                monthHeaders.push(
                                    <th key={currentMonth + 'last'} colSpan={colspan} className="border border-gray-400 bg-blue-300" style={{fontSize: '1.2em'}}>
                                        {currentMonth}
                                    </th>
                                );

                                return monthHeaders;
                            })()}
                        </tr>

                        {/* Day names and week numbers below */}
                        <tr>
                            {tygodnie.map((tydzien, index) => (
                                <th 
                                    key={`days-${index}`} 
                                    className="border border-gray-400 p-0 bg-gray-100"
                                    style={{ 
                                        width: '22px', // Zmniejszona szerokość kolumny
                                        minWidth: '22px', 
                                        maxWidth: '22px',
                                        fontSize: '1em'
                                    }}
                                >
                                    {tydzien.map((dzien, dayIndex) => (
                                        <div key={`${dzien.data.toISOString()}`} className="leading-tight">
                                            {index === 0 ? (
                                                <div className="text-[0.9rem] font-bold">
                                                    <span className="font-bold">{dzien.nazwaDniaTygodnia}</span>
                                                    <span className="ml-0.5">{dzien.dzienMiesiaca}</span>
                                                </div>
                                            ) : (
                                                <div className="text-[0.9rem]">{`${dzien.dzienMiesiaca}`}</div>
                                            )}
                                        </div>
                                    ))}
                                    <hr className="my-0.5 border-gray-400" />
                                    <div className="text-[1rem] font-bold bg-yellow-300 py-0.5 rounded">
                                        {getWeekNumber(tydzien[0].data)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {/* dane pracownikow i ich urlopy */}
                    <tbody>
                        {vacationData.map((employee, index) => (
                            <tr
                                key={employee.id}
                                className={
                                    index % 2 === 0
                                        ? 'bg-gray-100'
                                        : 'bg-white'
                                }
                                style={{
                                    borderBottom: '4px solid #2563eb', // mocniejsze odcięcie wierszy
                                    boxShadow: '0 2px 0 #2563eb', // cień pod każdym wierszem
                                }}
                            >
                                <td className="border border-gray-400 text-left pl-2 text-lg font-semibold truncate">{employee.name}</td>
                                {tygodnie.map((tydzien, weekIndex) => (
                                    <td
                                        key={`${employee.id}-week-${weekIndex}`}
                                        className="p-0 relative"
                                        style={{ height: '40px' }} // Większa wysokość
                                    >
                                        <div className="grid grid-cols-7 h-full">
                                            {tydzien.map((dzien) => {
                                                const isSunday = dzien.dzienTygodnia === 0;
                                                const vacation = aktywnosci[employee.name]?.find(
                                                    v => isDateInRange(dzien.data, v.od, v.do)
                                                );

                                                const isVacationDay = vacation !== undefined;

                                                let spanWidth = '100%';
                                                let spanLeft = '0';

                                                if (isVacationDay) {
                                                    const isFirstDayOfVacation = compareDates(dzien.data, vacation.od);
                                                    const isLastDayOfVacation = compareDates(dzien.data, vacation.do);

                                                    const daysUntilEndOfWeek = 7 - dzien.dzienTygodnia;
                                                    const daysUntilEndOfVacation = Math.floor((vacation.do - dzien.data) / (1000 * 60 * 60 * 24));
                                                    const spanDays = Math.min(daysUntilEndOfWeek, daysUntilEndOfVacation) + 1;

                                                    spanWidth = `${spanDays * 100}%`;
                                                }

                                                return (
                                                    <div
                                                        key={dzien.data.toISOString()}
                                                        className="h-full relative border border-gray-300"
                                                    >
                                                        {/* oznaczenie urlopu */}
                                                        {isVacationDay && (
                                                            <div
                                                                className="absolute h-6 top-1/2 -translate-y-1/2 z-10"
                                                                style={{
                                                                    left: spanLeft,
                                                                    width: spanWidth,
                                                                    backgroundColor: vacation.typ === 'zielony'
                                                                        ? '#16a34a' // żywszy zielony
                                                                        : vacation.typ === 'zolty'
                                                                            ? '#facc15' // żywszy żółty
                                                                            : '#dc2626', // żywszy czerwony
                                                                    borderRadius: '0.25rem'
                                                                }}
                                                            />
                                                        )}
                                                        {/* oznaczenie niedzieli */}
                                                        {isSunday && (
                                                            <div className="absolute inset-0 bg-pink-300 opacity-60" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* Legend */}
                <div className="mt-8 flex space-x-8 text-xl">
                    <div className="flex items-center">
                        <div className="w-5 h-5 mr-2" style={{backgroundColor: '#16a34a', borderRadius: '0.25rem'}}></div>
                        <span className="font-bold">Zatwierdzone</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-5 h-5 mr-2" style={{backgroundColor: '#facc15', borderRadius: '0.25rem'}}></div>
                        <span className="font-bold">Do zatwierdzenia</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-5 h-5 mr-2" style={{backgroundColor: '#dc2626', borderRadius: '0.25rem'}}></div>
                        <span className="font-bold">Anulowane</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-5 h-5 mr-2 bg-pink-300 opacity-60 rounded"></div>
                        <span className="font-bold">Niedziela</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VacationPlanner;