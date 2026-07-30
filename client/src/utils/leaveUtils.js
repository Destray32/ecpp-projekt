/**
 * Parse YYYY-MM-DD string to local Date object at noon (12:00) to prevent UTC timezone shifts.
 */
const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) {
        const d = new Date(dateStr);
        d.setHours(12, 0, 0, 0);
        return d;
    }
    const str = String(dateStr).split('T')[0];
    const parts = str.split('-').map(Number);
    if (parts.length < 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
};

/**
 * Format local Date object to YYYY-MM-DD string.
 */
const formatLocalDate = (date) => {
    if (!date || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * If date falls on Saturday (6) or Sunday (0), snap forward to next Monday.
 */
export const snapToNextWorkingDay = (dateStr) => {
    if (!dateStr) return '';
    const d = parseLocalDate(dateStr);
    if (!d) return dateStr;
    while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + 1);
    }
    return formatLocalDate(d);
};

/**
 * If date falls on Saturday (6) or Sunday (0), snap back to previous Friday.
 */
export const snapToPreviousWorkingDay = (dateStr) => {
    if (!dateStr) return '';
    const d = parseLocalDate(dateStr);
    if (!d) return dateStr;
    while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() - 1);
    }
    return formatLocalDate(d);
};

/**
 * Count integer working days (Monday-Friday) between fromDateStr and toDateStr inclusive.
 * Excludes Saturdays (6) and Sundays (0). No half-days.
 */
export const countWorkingDays = (fromDateStr, toDateStr) => {
    if (!fromDateStr || !toDateStr) return 0;
    const cur = parseLocalDate(fromDateStr);
    const end = parseLocalDate(toDateStr);
    if (!cur || !end || end < cur) return 0;

    let count = 0;
    while (cur <= end) {
        const dayOfWeek = cur.getDay(); // 0: Sun, 6: Sat
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        cur.setDate(cur.getDate() + 1);
    }

    return count;
};

/**
 * Add N working days (Monday-Friday) starting from fromDateStr.
 * Returns the end date formatted as YYYY-MM-DD.
 */
export const addWorkingDays = (fromDateStr, numDays) => {
    if (!fromDateStr || !numDays || Number(numDays) <= 0) return fromDateStr || '';
    const n = Math.floor(Number(numDays));
    const cur = parseLocalDate(fromDateStr);
    if (!cur) return fromDateStr;

    // If starting date is a weekend, push to next Monday
    while (cur.getDay() === 0 || cur.getDay() === 6) {
        cur.setDate(cur.getDate() + 1);
    }

    let added = 1;
    while (added < n) {
        cur.setDate(cur.getDate() + 1);
        const dayOfWeek = cur.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            added++;
        }
    }

    return formatLocalDate(cur);
};
