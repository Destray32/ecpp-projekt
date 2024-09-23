import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, getWeek } from 'date-fns';
import { pl } from 'date-fns/locale';

import TimeInputs from './TimeInputs';

const getCurrentUser = () => ({
  firstName: 'Jan',
  lastName: 'Kowalski',
});

const WeeklyReport = () => {
  const [currentWeekNumber, setCurrentWeekNumber] = useState(0);
  const [weekStart, setWeekStart] = useState(new Date());
  const [weekEnd, setWeekEnd] = useState(new Date());
  const [statusTyg, setStatusTyg] = useState('otwarty');
  const [hours, setHours] = useState({});
  const [daysOfWeek, setDaysOfWeek] = useState([]);

  const user = getCurrentUser();

  useEffect(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });

    setCurrentWeekNumber(getWeek(today, { weekStartsOn: 1, locale: pl }));
    setWeekStart(start);
    setWeekEnd(end);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    setDaysOfWeek(days);

    const initialHours = {};
    days.forEach((day) => {
      const key = format(day, 'yyyy-MM-dd');
      initialHours[key] = { start: '', break: '', end: '' };
    });
    setHours(initialHours);
  }, []);

  const formatWeekRange = (start, end) => {
    return `${format(start, 'dd.MM', { locale: pl })} -${format(end, 'dd.MM.yyyy', { locale: pl })}`;
  };

  return (
    <div className="container mx-auto p-4">
      <table className="min-w-full bg-white border border-gray-300 mb-6">
        <tbody>
          <tr>
            <td className="py-2 px-4 border-b text-center">Tydzień {currentWeekNumber}</td>
            <td className="py-2 px-4 border-b text-center">{formatWeekRange(weekStart, weekEnd)}</td>
            <td className="py-2 px-4 border-b text-center capitalize">{statusTyg}</td>
            <td className="py-2 px-4 border-b text-center">
              {user.firstName} {user.lastName}
            </td>
          </tr>
        </tbody>
      </table>

      {/* timeinputs sekcja */}
      <TimeInputs daysOfWeek={daysOfWeek} hours={hours} setHours={setHours} statusTyg={statusTyg} />

      {/* sygnatury */}
      <div className="flex justify-between mt-8">
        <div>
          <p>________________________</p>
          <p>Podpis Pracownika</p>
          <p>{new Date().toLocaleString()}</p>
        </div>
        <div>
          <p>________________________</p>
          <p>Podpis Przełożonego</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;
