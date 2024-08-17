import React, { useState, useEffect } from 'react';
import { format, addDays, getISOWeek, startOfWeek, endOfWeek } from 'date-fns';

const dummyVacationData = [
    {
        id: 1,
        company: "ABC Corp",
        department: "IT",
        name: "John Doe",
        vacationDates: [
            "2023-01-10", "2023-01-11", "2023-01-12", "2023-01-13",
            "2023-05-01", "2023-05-02", "2023-05-03", "2023-05-04", "2023-05-05",
            "2023-08-14", "2023-08-15", "2023-08-16", "2023-08-17", "2023-08-18"
        ]
    },
    {
        id: 2,
        company: "ABC Corp",
        department: "HR",
        name: "Jane Smith",
        vacationDates: [
            "2023-03-20", "2023-03-21", "2023-03-22", "2023-03-23", "2023-03-24",
            "2023-07-03", "2023-07-04", "2023-07-05", "2023-07-06", "2023-07-07",
            "2023-12-27", "2023-12-28", "2023-12-29"
        ]
    },
    {
        id: 3,
        company: "XYZ Inc",
        department: "Sales",
        name: "Bob Johnson",
        vacationDates: [
            "2023-02-13", "2023-02-14", "2023-02-15", "2023-02-16", "2023-02-17",
            "2023-06-19", "2023-06-20", "2023-06-21", "2023-06-22", "2023-06-23",
            "2023-10-09", "2023-10-10", "2023-10-11", "2023-10-12", "2023-10-13"
        ]
    },
    {
        id: 4,
        company: "XYZ Inc",
        department: "Marketing",
        name: "Alice Brown",
        vacationDates: [
            "2023-04-03", "2023-04-04", "2023-04-05", "2023-04-06", "2023-04-07",
            "2023-09-11", "2023-09-12", "2023-09-13", "2023-09-14", "2023-09-15",
            "2023-12-18", "2023-12-19", "2023-12-20", "2023-12-21", "2023-12-22"
        ]
    }
];


const VacationPlanner = () => {
    const [vacationData, setVacationData] = useState([]);
    const [startDate, setStartDate] = useState(new Date(2023, 0, 1));
    const [endDate, setEndDate] = useState(new Date(2023, 11, 31));


    useEffect(() => {
        setVacationData(dummyVacationData);
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
                <th key={currentDate.toISOString()} className="border p-1 text-xs" colSpan={7}>
                    <div>{format(start, 'MMM d')} - {format(end, 'MMM d')}</div>
                    <div>Week {getISOWeek(currentDate)}</div>
                </th>
            );
            currentDate = addDays(currentDate, 7);
        }
        return headers;
    };

    const renderDayHeaders = () => {
        return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <th key={day} className="border p-1 text-xs w-4">
                {day}
            </th>
        ));
    };

    const renderVacationRow = (employee) => {
        let currentDate = startDate;
        const cells = [];
        while (currentDate <= endDate) {
            for (let i = 0; i < 7; i++) {
                const isVacation = employee.vacationDates.includes(format(currentDate, 'yyyy-MM-dd'));
                cells.push(
                    <td
                        key={currentDate.toISOString()}
                        className={`border p-1 ${isVacation ? 'bg-blue-200' : ''} ${i === 6 ? 'bg-red-100' : ''}`}
                    >
                        {format(currentDate, 'd')}
                    </td>
                );
                currentDate = addDays(currentDate, 1);
            }
        }
        return cells;
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Vacation Plan 2023</h1>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-center">
                    <thead>
                        <tr>
                            <th className="border p-2">Company</th>
                            <th className="border p-2">Department</th>
                            <th className="border p-2">Name</th>
                            {renderHeader()}
                        </tr>
                        <tr>
                            <th colSpan={3}></th>
                            {renderDayHeaders()}
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

