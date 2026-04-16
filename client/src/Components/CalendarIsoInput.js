import React from 'react';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';

addLocale('pl-materialy-v2', {
    firstDayOfWeek: 1,
    dayNames: ['niedziela', 'poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek', 'sobota'],
    dayNamesShort: ['ndz', 'pon', 'wt', 'sro', 'czw', 'pt', 'sob'],
    dayNamesMin: ['N', 'P', 'W', 'S', 'C', 'P', 'S'],
    monthNames: ['Styczen', 'Luty', 'Marzec', 'Kwiecien', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpien', 'Wrzesien', 'Pazdziernik', 'Listopad', 'Grudzien'],
    monthNamesShort: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paz', 'lis', 'gru'],
    weekHeader: 'V',
    today: 'Dzisiaj',
    clear: 'Wyczysc'
});

const parseIsoDate = (value) => {
    if (!value) return null;
    const [year, month, day] = String(value).split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};

const formatIsoDate = (dateValue) => {
    if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) return '';
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function CalendarIsoInput({
    value,
    onChange,
    min,
    max,
    placeholder = 'Wybierz date',
    disabled = false,
    className = '',
    inputClassName = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500',
    panelClassName = 'materialy-kalendarz-panel',
    showWeek = true,
    weekHeader = 'V'
}) {
    return (
        <Calendar
            value={parseIsoDate(value)}
            onChange={(e) => onChange(formatIsoDate(e.value))}
            locale="pl-materialy-v2"
            dateFormat="dd.mm.yy"
            showWeek={showWeek}
            weekHeader={weekHeader}
            showIcon={false}
            className={className}
            panelClassName={panelClassName}
            inputClassName={inputClassName}
            placeholder={placeholder}
            disabled={disabled}
            minDate={parseIsoDate(min)}
            maxDate={parseIsoDate(max)}
        />
    );
}
