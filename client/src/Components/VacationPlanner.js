import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const VacationPlanner = () => {
  const [year, setYear] = useState(new Date().getFullYear());

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const getWeeksInYear = (year) => {
    const d = new Date(year, 11, 31);
    const week = d.getWeek();
    return week == 1 ? 52 : week;
  };

  const generateCalendarData = () => {
    let data = [];
    let currentDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    while (currentDate <= endDate) {
      data.push({
        date: new Date(currentDate),
        week: currentDate.getWeek(),
        month: currentDate.getMonth(),
        day: currentDate.getDate(),
        dayOfWeek: currentDate.getDay(),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  };

  const calendarData = generateCalendarData();

  // dummy dane
  const vacationData = [
    { employee: "John Doe", startDate: new Date(year, 5, 15), endDate: new Date(year, 5, 25), type: "vacation" },
    { employee: "Jane Smith", startDate: new Date(year, 7, 1), endDate: new Date(year, 7, 14), type: "holiday" },
  ];

  return (
    <div className="vacation-planner p-4">
      <h1 className="text-2xl font-bold mb-4">Vacation Planner {year}</h1>
      <div className="calendar overflow-x-auto">
        <div className="header flex">
          <div className="column w-32 font-semibold">Company</div>
          <div className="column w-32 font-semibold">Department</div>
          <div className="column w-40 font-semibold">Employee</div>
          {months.map((month, index) => (
            <div key={month} className="column flex-1 font-semibold text-center">
              {month}
            </div>
          ))}
        </div>
        <div className="body">
          {vacationData.map((vacation, index) => (
            <div key={index} className="row flex border-t">
              <div className="column w-32 p-1">ACME Inc.</div>
              <div className="column w-32 p-1">IT</div>
              <div className="column w-40 p-1">{vacation.employee}</div>
              {months.map((month, monthIndex) => (
                <div key={month} className="column flex-1 flex flex-wrap">
                  {calendarData.filter(d => d.month === monthIndex).map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`day w-4 h-4 text-xs flex items-center justify-center
                        ${day.dayOfWeek === 0 ? 'text-red-500' : ''}
                        ${vacation.startDate <= day.date && day.date <= vacation.endDate 
                          ? vacation.type === 'vacation' ? 'bg-blue-200' : 'bg-green-200'
                          : ''
                        }`}
                    >
                      {day.day}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="legend flex mt-4 space-x-4">
        <div className="legend-item flex items-center">
          <div className="w-4 h-4 bg-blue-200 mr-2"></div>
          <span>Vacation</span>
        </div>
        <div className="legend-item flex items-center">
          <div className="w-4 h-4 bg-green-200 mr-2"></div>
          <span>Holiday</span>
        </div>
      </div>
      <div className="mt-8 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={vacationData}>
            <XAxis dataKey="employee" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="days" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// helper do pobierania numeru tygodnia
Date.prototype.getWeek = function() {
  var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
};

export default VacationPlanner;