import { format, startOfWeek, addWeeks, subDays } from 'date-fns';

export const generateWeek = (startDate = new Date()) => {
    const week = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        week.push(date);
    }
    return week;
};

export const formatWeek = (date) => {
    const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'dd.MM.yyyy');
    const end = format(subDays(addWeeks(startOfWeek(date, { weekStartsOn: 1 }), 1), 1), 'dd.MM.yyyy');
    return `${start} - ${end}`;
};

export const calculateDailyTotal = (dayHours) => {
    const start = dayHours?.start || "00:00";
    const breakTime = dayHours?.break || "00:00";
    const end = dayHours?.end || "00:00";

    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    const breakDate = new Date(`2000-01-01T${breakTime}`);

    if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);

    const totalHours = (endDate - startDate) / (1000 * 60 * 60);
    const breakHours = breakDate.getHours() + breakDate.getMinutes() / 60;

    return totalHours - breakHours;
};

export const calculateWeeklyTotal = (hours, daysOfWeek) => {
    return daysOfWeek.reduce((total, day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        return total + calculateDailyTotal(hours[dayKey]);
    }, 0);
};

export const calculateProjectTotal = (project, daysOfWeek) => {
    return daysOfWeek.reduce((total, day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        return total + (parseFloat(project?.hours?.[dateKey]?.hoursWorked) || 0);
    }, 0);
};