import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, getISOWeek, startOfWeek, endOfWeek, isWithinInterval, parseISO, setISOWeek } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';



const VacationPlanner = () => {
    const [vacationData, setVacationData] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const plannerRef = useRef();

    useEffect(() => {
        const storedSelectedWeekAndYear = localStorage.getItem('selectedWeekAndYear');
        if (storedSelectedWeekAndYear) {
            const [week, year] = JSON.parse(storedSelectedWeekAndYear);

            // Calculate the start date based on the selected week and year
            const calculatedStartDate = setISOWeek(new Date(year, 0, 1), parseInt(week, 10));

            // Set the start date and end date
            setStartDate(calculatedStartDate);
            setEndDate(new Date(year, 11, 31)); // End date for the entire year
        }

        const storedVacationData = localStorage.getItem('vacationData');
        if (storedVacationData) {
            setVacationData(JSON.parse(storedVacationData));
        }
        const timeoutId = setTimeout(() => {
            downloadPDF();
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, []);

    const getWeekDates = (date) => {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(date, { weekStartsOn: 1 });
        return { start, end };
    };

    const renderHeader = () => {
        let currentDate = startDate;
        const headers = [];
        while (currentDate <= endDate) {
            const { start, end } = getWeekDates(currentDate);
            headers.push(
                <th key={currentDate.toISOString()} className="border text-xs" colSpan={7}>
                    <div>{getISOWeek(currentDate)}</div>
                </th>
            );
            currentDate = addDays(currentDate, 7);
        }
        return headers;
    };

    const renderDayHeaders = () => {
        return ['P', 'W', 'S', 'C', 'P', 'S', 'N'].map((day, index) => (
            <th key={index} className="border text-xs w-[1px]">
                {day}
            </th>
        ));
    };

    const renderVacationRow = (employee) => {
        let currentDate = startDate;
        const cells = [];

        while (currentDate <= endDate) {
            for (let i = 0; i < 7; i++) {
                let bgColor = '';

                employee.vacations.forEach(vacation => {
                    const from = parseISO(vacation.from);
                    const to = parseISO(vacation.to);

                    if (isWithinInterval(currentDate, { start: from, end: to })) {
                        switch (vacation.status) {
                            case 'Zatwierdzone':
                                bgColor = 'bg-green-200';
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

                cells.push(
                    <td
                        key={currentDate.toISOString()}
                        className={`border ${bgColor} ${i === 6 ? 'bg-red-100' : ''}`}
                    >
                    </td>
                );

                currentDate = addDays(currentDate, 1);
            }
        }
        return cells;
    };

    const downloadPDF = () => {
        const input = plannerRef.current;
        html2canvas(input).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const imgWidth = 297; // A4 width 
            const pageHeight = 210; // A4 height
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('VacationPlanner.pdf');
        });
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Plan urlopów 2023</h1>
            <button onClick={downloadPDF} className="mb-4 p-2 bg-blue-500 text-white rounded">
                Download as PDF
            </button>
            <div ref={plannerRef} className="overflow-x-auto">
                <table className="w-full border-collapse text-center">
                    <thead>
                        <tr>
                            <th className="border p-2">Company</th>
                            <th className="border p-2">Department</th>
                            <th className="border p-2">Name</th>
                            {renderHeader()}
                        </tr>

                    </thead>
                    <tbody>
                        {vacationData.map((employee, index) => (
                            <tr key={employee.id}>
                                <td className="border p-2">{employee.company}</td>
                                <td className="border p-2">{employee.department}</td>
                                <td className="border p-2">{employee.name}</td>
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
