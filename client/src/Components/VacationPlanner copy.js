import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, getISOWeek, parseISO, setISOWeek, startOfWeek, isWithinInterval } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const VacationPlanner = () => {
    const [vacationData, setVacationData] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const plannerRef = useRef();

    const getYearLocalStorage = () => {
        const storedSelectedWeekAndYear = localStorage.getItem('selectedWeekAndYear');
        if (storedSelectedWeekAndYear) {
            const [week, year] = JSON.parse(storedSelectedWeekAndYear);
            return year;
        }
        return new Date().getFullYear();
    };

    useEffect(() => {
        const storedSelectedWeekAndYear = localStorage.getItem('selectedWeekAndYear');
        if (storedSelectedWeekAndYear) {
            const [week, year] = JSON.parse(storedSelectedWeekAndYear);
            const calculatedStartDate = setISOWeek(new Date(year, 0, 1), parseInt(week, 10));
            setStartDate(calculatedStartDate);
            setEndDate(new Date(year, 11, 31));
        }

        const storedVacationData = localStorage.getItem('vacationData');
        if (storedVacationData) {
            setVacationData(JSON.parse(storedVacationData));
        }
    }, []);

    const renderHeader = () => {
        const headers = [];
        let currentDate = startDate;
        let weekNumber = getISOWeek(currentDate);

        while (currentDate <= endDate) {
            const weekStartDate = startOfWeek(currentDate, { weekStartsOn: 1 });

            headers.push(
                <th
                    key={weekStartDate.toISOString()}
                    className="border border-gray-400 text-xl w-[20px] text-center"
                    colSpan="7"
                >
                    {`${weekNumber}`}
                </th>
            );

            // Move to the next week
            currentDate = addDays(weekStartDate, 7);
            weekNumber = getISOWeek(currentDate);
        }
        return headers;
    };

    const downloadPDF = () => {
        const input = plannerRef.current;
        
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
            pdf.save('Urlopy.pdf');
        });
    };
    

    const renderVacationRow = (employee) => {
        let currentDate = startDate;
        const cells = [];
        let weekNumber = getISOWeek(currentDate);

        while (currentDate <= endDate) {
            const weekStartDate = startOfWeek(currentDate, { weekStartsOn: 1 });

            for (let i = 0; i < 7; i++) {
                let bgColor = '';
                const isSunday = format(currentDate, 'i') === '7'; 

                employee.vacations.forEach((vacation) => {
                    const from = parseISO(vacation.from);
                    const to = parseISO(vacation.to);

                    if (isWithinInterval(currentDate, { start: from, end: to })) {
                        switch (vacation.status) {
                            case 'Zatwierdzone':
                                bgColor = 'bg-green-300';
                                break;
                            case 'Do zatwierdzenia':
                                bgColor = 'bg-yellow-200';
                                break;
                            case 'Anulowane':
                                bgColor = 'bg-red-200';
                                break;
                            default:
                                break;
                        }
                    }
                });

                const cellStyle = `${bgColor} ${isSunday ? 'bg-red-100' : ''}`;

                cells.push(
                    <td
                        key={currentDate.toISOString()}
                        className={`border border-gray-400 overflow-hidden truncate ${cellStyle}`}
                    ></td>
                );

                currentDate = addDays(currentDate, 1);
            }

            currentDate = addDays(weekStartDate, 7);
        }
        return cells;
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Plan urlopów {getYearLocalStorage()}</h1>
            <button onClick={downloadPDF} className="mb-4 p-2 bg-blue-500 text-white rounded">
                Pobierz PDF
            </button>
            <div ref={plannerRef} className="overflow-x-auto">
                <table className="w-full border-collapse text-center border-gray-400 table-fixed">
                    <thead>
                        <tr>
                            <th className="border border-gray-400 p-2 truncate w-[55px]">Imię i Nazwisko</th>
                            {renderHeader()}
                        </tr>
                    </thead>
                    <tbody>
                        {vacationData.map((employee) => (
                            <tr key={employee.id}>
                                <td className="border border-gray-400 p-2 w-[55px] truncate">{employee.name}</td>
                                {renderVacationRow(employee)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VacationPlanner;
