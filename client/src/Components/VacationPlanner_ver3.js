
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
        const input = plannerRef.current;

        const firstWeek = tygodnie[0][0].data;
        const lastWeek = tygodnie[tygodnie.length - 1][6].data;

        const dateStr = `${firstWeek.toISOString().split('T')[0]}_to_${lastWeek.toISOString().split('T')[0]}`;
        const timestamp = new Date().toISOString().split('.')[0].replace(/[:-]/g, '');

        html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'px', 'a4', true);
            const imgWidth = pdf.internal.pageSize.getWidth() - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight, undefined, 'FAST');
            const fileName = `VacationPlan_${getYearLocalStorage()}_Week${getWeekLocalStorage()}_${dateStr}_${timestamp}.pdf`;
            pdf.save(fileName);
        });
    };

    // generowanie tablicy dni dla widoku kalendarza
    const generujDni = (rok = getYearLocalStorage()) => {
        const allDays = [];

        // ustawiamy date poczatkowa na wybrany tydzien
        const startDate = new Date(rok, 0, 1);
        startDate.setDate(startDate.getDate() + (week * 7));

        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);

        // szukamy pierwszego poniedzialku
        let currentDate = new Date(startDate);
        while (currentDate.getDay() !== 1) {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // generujemy wszystkie dni
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

        // dzielimy dni na tygodnie
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

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Plan urlopow {getYearLocalStorage()}</h1>
            <button onClick={downloadPDF} className="mb-4 p-2 bg-blue-500 text-white rounded">
                Pobierz PDF
            </button>
            {/* tabela z kalendarzem */}
            <div ref={plannerRef} className="overflow-x-auto">
                <table className="w-full border-collapse text-center">
                    <thead>
                        {/* naglowek z miesiacami */}
                        <tr>
                            <th rowSpan="3" className="border border-gray-400">Pracownik</th>
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
                                            <th key={currentMonth + index} colSpan={colspan} className="border border-gray-400">
                                                {currentMonth}
                                            </th>
                                        );
                                        currentMonth = tydzienMonths.find(m => m !== currentMonth) || currentMonth;
                                        colspan = 1;
                                    }
                                });

                                monthHeaders.push(
                                    <th key={currentMonth + 'last'} colSpan={colspan} className="border border-gray-400">
                                        {currentMonth}
                                    </th>
                                );

                                return monthHeaders;
                            })()}
                        </tr>
                        {/* numery tygodni */}
                        <tr>
                            {tygodnie.map((_, index) => (
                                <th key={`week-${index}`} className="border border-gray-400">
                                    {((parseInt(week) + index - 1) % 52) + 1}
                                </th>
                            ))}
                        </tr>
                        {/* dni miesiaca */}
                        <tr>
                            {tygodnie.map((tydzien, index) => (
                                <th key={`days-${index}`} className="border border-gray-400 min-w-6">
                                    {tydzien.map((dzien) => {
                                        if (index === 0) {
                                            return (
                                                <div key={`${dzien.data.toISOString()}`}>
                                                    {`${dzien.nazwaDniaTygodnia} ${dzien.dzienMiesiaca}`}
                                                </div>
                                            )
                                        }
                                        else {
                                            return (
                                                <div key={`${dzien.data.toISOString()}`}>
                                                    {`${dzien.dzienMiesiaca}`}
                                                </div>
                                            )
                                        }
                                    })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {/* dane pracownikow i ich urlopy */}
                    <tbody>
                        {vacationData.map((employee) => (
                            <tr key={employee.id}>
                                <td className="border border-gray-400">{employee.name}</td>
                                {tygodnie.map((tydzien, weekIndex) => (
                                    <td
                                        key={`${employee.id}-week-${weekIndex}`}
                                        className="p-0 relative"
                                        style={{ height: '50px' }}
                                    >
                                        <div className="grid grid-cols-7 h-full">
                                            {tydzien.map((dzien) => {
                                                const isSunday = dzien.dzienTygodnia === 0;
                                                const vacation = aktywnosci[employee.name]?.find(
                                                    v => dzien.data >= v.od && dzien.data <= v.do
                                                );

                                                const isVacationDay = vacation !== undefined;

                                                let spanWidth = '100%';
                                                let spanLeft = '0';

                                                if (isVacationDay) {
                                                    const isFirstDayOfVacation = dzien.data.getTime() === vacation.od.getTime();
                                                    const isLastDayOfVacation = dzien.data.getTime() === vacation.do.getTime();

                                                    const daysUntilEndOfWeek = 7 - dzien.dzienTygodnia;
                                                    const daysUntilEndOfVacation = Math.floor((vacation.do - dzien.data) / (1000 * 60 * 60 * 24));
                                                    const spanDays = Math.min(daysUntilEndOfWeek, daysUntilEndOfVacation) + 1;

                                                    spanWidth = `${spanDays * 100}%`;
                                                }

                                                return (
                                                    <div
                                                        key={dzien.data.toISOString()}
                                                        className="h-full relative border border-gray-500"
                                                    >
                                                        {/* oznaczenie urlopu */}
                                                        {isVacationDay && (
                                                            <div
                                                                className="absolute h-6 top-1/2 -translate-y-1/2 z-10"
                                                                style={{
                                                                    left: spanLeft,
                                                                    width: spanWidth,
                                                                    backgroundColor: vacation.typ === 'zielony'
                                                                        ? '#22c55e'
                                                                        : vacation.typ === 'zolty'
                                                                            ? '#eab308'
                                                                            : '#ef4444',
                                                                    borderRadius: '0.125rem'
                                                                }}
                                                            />
                                                        )}
                                                        {/* oznaczenie niedzieli */}
                                                        {isSunday && (
                                                            <div className="absolute inset-0 bg-red-500" />
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
            </div>
        </div>
    );
};

export default VacationPlanner;