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

    if (isNaN(startDate) || isNaN(endDate) || isNaN(breakDate)) {
        return "0"; // Return 0 if any date is invalid
    }

    if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);

    const totalHours = (endDate - startDate) / (1000 * 60 * 60);
    const breakHours = breakDate.getHours() + breakDate.getMinutes() / 60;

    const netHours = totalHours - breakHours;
    const hours = Math.floor(netHours);
    const minutes = Math.round((netHours - hours) * 60);

    return netHours > 0 ? (minutes > 0 ? `${hours}.${minutes}` : `${hours}`) : "0";
};

export const calculateWeeklyTotal = (weeklyHours, daysOfWeek) => {
    const total = daysOfWeek.reduce((sum, day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dailyTotal = calculateDailyTotal(weeklyHours[dayKey]);

        if (typeof dailyTotal === 'string' && dailyTotal.includes('.')) {
            const [h, m] = dailyTotal.split('.').map(Number);
            if (isNaN(h) || isNaN(m)) return sum;
            return sum + h + m / 60;
        }

        const numericValue = Number(dailyTotal);
        return sum + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);

    const hours = Math.floor(total);
    const minutes = Math.round((total - hours) * 60);

    return total > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : "0";
};

export const calculateProjectTotal = (project, daysOfWeek) => {
    let totalHours = 0;
    let totalMinutes = 0;

    daysOfWeek.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const rawValue = project?.hours?.[dateKey]?.hoursWorked;

        if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
            const [hPart, mPart] = rawValue.toString().split('.');
            const hours = parseInt(hPart, 10) || 0;
            const minutes = parseInt(mPart, 10) || 0; // bez przeliczania z dziesiętnej

            totalHours += hours;
            totalMinutes += minutes;
        }
    });

    // Normalizacja minut do godzin
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    return `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`;
};
