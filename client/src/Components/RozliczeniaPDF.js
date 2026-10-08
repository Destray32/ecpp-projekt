import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const monthMianownik = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
];

const monthDopelniacz = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopad', 'grudnia'
];

export const getMonthNameMianownik = (miesiacRokStr) => {
    if (!miesiacRokStr) return '';
    const parts = miesiacRokStr.split('-');
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    const m = monthMianownik[monthIdx] || '';
    const capitalized = m ? m.charAt(0).toUpperCase() + m.slice(1) : '';
    return `${capitalized}  ${year}`;
};

export const getPrevMonthDopelniacz = (miesiacRokStr) => {
    if (!miesiacRokStr) return '';
    const parts = miesiacRokStr.split('-');
    let monthIdx = parseInt(parts[1], 10) - 2; // previous month (0-indexed)
    if (monthIdx < 0) monthIdx = 11;
    return monthDopelniacz[monthIdx] || '';
};

const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const parts = String(dateStr).split('T')[0].split('-');
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}`;
    }
    return dateStr;
};

const formatLeaveText = (leaveArray) => {
    if (!Array.isArray(leaveArray) || leaveArray.length === 0) return '';
    return leaveArray.map(entry => {
        const daysStr = entry.days ? `${entry.days}dni` : '';
        const rangeStr = (entry.from && entry.to) ? `od ${formatDateShort(entry.from)} do ${formatDateShort(entry.to)}` : '';
        return `${daysStr} ${rangeStr}`.trim();
    }).filter(Boolean).join('; ');
};

const formatRangeText = (rangeObj) => {
    if (!rangeObj || !rangeObj.from || !rangeObj.to) return '';
    return `od ${formatDateShort(rangeObj.from)} do ${formatDateShort(rangeObj.to)}`;
};

const formatNum = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return String(val);
    if (Number.isInteger(num)) return String(num);
    return num.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
};

const formatCurrency = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const num = Number(String(val).replace(/\s/g, '').replace(',', '.'));
    if (isNaN(num)) return String(val);
    return num.toLocaleString('pl-PL').replace(/\u00a0/g, ' ');
};

/**
 * Single Employee Rozliczenie Sheet formatted exactly like Excel mockup image
 */
export const RozliczenieSheet = React.forwardRef(({ data }, ref) => {
    if (!data) return null;

    const {
        pracownikName = '',
        miesiacRok = '',
        godzinyPrzepracowane = 0,
        mozliweGodziny = '',
        nadgodzinyWyplata = 0,
        nadgodzinyStawka = '',
        czerwoneDni = 0,
        nadgodzinyZPoprzedniego = 0,
        atfWykorzystane = 0,
        atfOtherMonthsTotal = 0,
        urlopYearTotal = 0,
        urlopOtherMonthsTotal = 0,
        urlopZaleglyYearTotal = 0,
        urlopZaleglyOtherMonthsTotal = 0,
        yearlyZaleglyPula = 0,
        urlopPulaInput = 0,
        mieszkanie = 0,
        urlop = [],
        urlopZalegly = [],
        l4 = {},
        l4cd = {},
        vab = {},
        pappaledi = {},
        nadgodzinyNaKolejny = 0,
        email = '',
        nrKonta = '',
        kontoTyp = 'PL'
    } = data;

    const formattedMonth = getMonthNameMianownik(miesiacRok);

    const sumDays = (arr) => Array.isArray(arr) ? arr.reduce((acc, e) => acc + (Number(e.days) || 0), 0) : 0;

    const currentUrlopDays = sumDays(urlop);
    const currentZaleglyDays = sumDays(urlopZalegly);

    const totalZaleglyPula = Number(urlopPulaInput || yearlyZaleglyPula || 0);
    const totalZaleglyUsed = (urlopZaleglyOtherMonthsTotal || 0) + currentZaleglyDays;
    const remainingZaleglyPula = Math.max(totalZaleglyPula - totalZaleglyUsed, 0);

    const totalRegularUsed = (urlopOtherMonthsTotal || 0) + currentUrlopDays;
    const remainingRegularUrlop = Math.max(25 - totalRegularUsed, 0);

    const zaleglyText = formatLeaveText(urlopZalegly);
    const l4Text = formatRangeText(l4);
    const l4cdText = formatRangeText(l4cd);
    const vabText = formatRangeText(vab);
    const pappalediText = formatRangeText(pappaledi);

    // Green state for Column A
    const isHoursGreen = Boolean(mozliweGodziny || (Number(godzinyPrzepracowane) > 0));
    const isOvertimeGreen = Number(nadgodzinyWyplata) > 0;
    const isRedDaysGreen = Number(czerwoneDni) > 0;
    const isAtfGreen = Number(atfWykorzystane) > 0;
    const isL4Green = Boolean(l4Text);
    const isL4cdGreen = Boolean(l4cdText);
    const isVabGreen = Boolean(vabText);
    const isPappalediGreen = Boolean(pappalediText);
    const isMieszkanieGreen = Number(mieszkanie) > 0;

    const remainingAtf = Math.max(40 - (Number(atfOtherMonthsTotal) || 0) - (Number(atfWykorzystane) || 0), 0);

    const greenBg = '#92d050';
    const yellowBg = '#ffff00';
    const redColor = '#ff0000';

    let overtimeRateLabel = '+10kr/1h';
    if (nadgodzinyStawka) {
        const cleaned = String(nadgodzinyStawka).replace(/100%/gi, '').trim().replace(/^[,\s+]+/, '').trim();
        if (cleaned) {
            overtimeRateLabel = cleaned.includes('/1h') || cleaned.includes('/h') ? `+${cleaned.replace(/^\+/, '')}` : `+${cleaned.replace(/^\+/, '')}/1h`;
        }
    }

    const displayHours = (mozliweGodziny !== '' && mozliweGodziny !== undefined && mozliweGodziny !== null)
        ? formatNum(mozliweGodziny)
        : (godzinyPrzepracowane !== '' ? formatNum(godzinyPrzepracowane) : '0');

    return (
        <div
            ref={ref}
            className="bg-white text-black font-sans p-6 text-[15px] leading-snug max-w-[680px] mx-auto border border-gray-400 drop-shadow-md"
            style={{ width: '680px', boxSizing: 'border-box', fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}
        >
            <table className="w-full border-collapse text-[15px]">
                <tbody>
                    {/* Row 1: Header Month */}
                    <tr>
                        <td className="w-24 border-0"></td>
                        <td colSpan={2} className="border-0 px-2 pt-1 pb-0 font-bold text-lg text-black">
                            &lt;{formattedMonth} &gt;
                        </td>
                    </tr>

                    {/* Row 2: Employee Name */}
                    <tr>
                        <td className="w-24 border-0"></td>
                        <td colSpan={2} className="border-0 px-2 pt-0 pb-2.5 font-bold text-lg text-black">
                            {pracownikName}
                        </td>
                    </tr>

                    {/* Row 3: Mozliwe / Robocze godziny (168) + 100% */}
                    <tr className="border-b border-black">
                        <td
                            className="border border-black p-2.5 font-bold text-center w-24 text-lg"
                            style={{ backgroundColor: isHoursGreen ? greenBg : 'transparent' }}
                        >
                            {displayHours}
                        </td>
                        <td
                            className="border border-black p-2.5 font-bold text-lg"
                            style={{ color: isHoursGreen ? redColor : '#000000' }}
                        >
                            100%
                        </td>
                        <td className="border border-black p-2.5 w-20"></td>
                    </tr>

                    {/* Row 4: Nadgodziny */}
                    <tr className="border-b border-black">
                        <td
                            className="border border-black p-2.5 font-bold text-center w-24"
                            style={{ backgroundColor: isOvertimeGreen ? greenBg : 'transparent' }}
                        >
                            {Number(nadgodzinyWyplata) > 0 ? formatNum(nadgodzinyWyplata) : ''}
                        </td>
                        <td
                            className="border border-black p-2.5"
                            style={{ color: isOvertimeGreen ? redColor : '#000000' }}
                        >
                            nadgodziny ( kod, 1174 <strong>{overtimeRateLabel}</strong> )
                        </td>
                        <td className="border border-black p-2.5 w-20"></td>
                    </tr>

                    {/* Row 5: Czerwone dni */}
                    <tr className="border-b border-black">
                        <td
                            className="border border-black p-2.5 font-bold text-center w-24"
                            style={{ backgroundColor: isRedDaysGreen ? greenBg : 'transparent' }}
                        >
                            {Number(czerwoneDni) > 0 ? `${formatNum(czerwoneDni)}dni` : ''}
                        </td>
                        <td
                            className="border border-black p-2.5"
                            style={{ color: isRedDaysGreen ? redColor : '#000000' }}
                        >
                            czerwone dni
                        </td>
                        <td className="border border-black p-2.5 w-20"></td>
                    </tr>

                    {/* Row 6: Bank godzin */}
                    <tr className="border-b border-black">
                        <td className="border border-black p-2.5 w-24"></td>
                        <td className="border border-black p-2.5">
                            z bank godzin
                        </td>
                        <td
                            className="border border-black p-2.5 font-bold text-center w-20"
                            style={{ backgroundColor: yellowBg }}
                        >
                            {Number(nadgodzinyZPoprzedniego) > 0 ? formatNum(nadgodzinyZPoprzedniego) : ''}
                        </td>
                    </tr>

                    {/* Row 7: ATF */}
                    <tr className="border-b border-black">
                        <td
                            className="border border-black p-2.5 font-bold text-center w-24"
                            style={{ backgroundColor: isAtfGreen ? greenBg : 'transparent' }}
                        >
                            {isAtfGreen ? formatNum(atfWykorzystane) : ''}
                        </td>
                        <td
                            className="border border-black p-2.5"
                            style={{ color: isAtfGreen ? redColor : '#000000' }}
                        >
                            ATF
                        </td>
                        <td
                            className="border border-black p-2.5 font-bold text-center w-20"
                            style={{ backgroundColor: yellowBg }}
                        >
                            {(isAtfGreen || Number(atfOtherMonthsTotal) > 0) ? formatNum(remainingAtf) : ''}
                        </td>
                    </tr>

                    {/* Row 8: Urlop */}
                    <tr className="border-b border-black">
                        <td className="border border-black p-2.5 w-24"></td>
                        <td className="border border-black p-2.5">
                            urlop
                        </td>
                        <td
                            className="border border-black p-2.5 font-bold text-center w-20"
                            style={{ backgroundColor: yellowBg }}
                        >
                            {currentUrlopDays > 0 ? formatNum(currentUrlopDays) : (currentZaleglyDays > 0 ? formatNum(currentZaleglyDays) : '')}
                        </td>
                    </tr>

                    {/* Row 9: Urlop zalegly */}
                    <tr className="border-b border-black">
                        <td className="border border-black p-2.5 w-24"></td>
                        <td className="border border-black p-2.5">
                            Urlop zaległy ({' '}
                            <span style={{ color: '#0070c0', fontStyle: 'italic' }}>
                                {zaleglyText ? zaleglyText : 'wpisz ilość dni + data'}
                            </span>{' '}
                            )
                        </td>
                        <td
                            className="border border-black p-2.5 font-bold text-center w-20"
                            style={{ backgroundColor: yellowBg }}
                        ></td>
                    </tr>

                    {/* Row 10: L4 */}
                    <tr className="border-b border-black">
                        <td
                            className="border border-black p-2.5 font-bold text-center w-24"
                            style={{ backgroundColor: isL4Green ? greenBg : 'transparent' }}
                        ></td>
                        <td
                            className="border border-black p-2.5"
                            style={{ color: isL4Green ? redColor : '#000000' }}
                        >
                            L4/PC Husbyggen 14dni płaci PC{l4Text ? (
                                <> ( <span style={{ color: isL4Green ? redColor : '#0070c0', fontStyle: 'italic' }}>{l4Text}</span> )</>
                            ) : null}
                        </td>
                        <td className="border border-black p-2.5 w-20"></td>
                    </tr>

                    {/* Row 11: L4cd */}
                    <tr className="border-b border-black">
                        <td
                            className="border border-black p-2.5 font-bold text-center w-24"
                            style={{ backgroundColor: isL4cdGreen ? greenBg : 'transparent' }}
                        ></td>
                        <td
                            className="border border-black p-2.5"
                            style={{ color: isL4cdGreen ? redColor : '#000000' }}
                        >
                            L4c.d.{l4cdText ? (
                                <> ( <span style={{ color: isL4cdGreen ? redColor : '#0070c0', fontStyle: 'italic' }}>{l4cdText}</span> )</>
                            ) : null}
                        </td>
                        <td className="border border-black p-2.5 w-20"></td>
                    </tr>

                    {/* Row 12: VAB */}
                    <tr className="border-b border-black">
                        <td
                            className="border border-black p-2.5 font-bold text-center w-24"
                            style={{ backgroundColor: isVabGreen ? greenBg : 'transparent' }}
                        ></td>
                        <td
                            className="border border-black p-2.5"
                            style={{ color: isVabGreen ? redColor : '#000000' }}
                        >
                            VAB-{vabText ? (
                                <> ( <span style={{ color: isVabGreen ? redColor : '#0070c0', fontStyle: 'italic' }}>{vabText}</span> )</>
                            ) : null}
                        </td>
                        <td className="border border-black p-2.5 w-20"></td>
                    </tr>

                    {/* Row 13: Pappaledi */}
                    <tr className="border-b border-black">
                        <td
                            className="border border-black p-2.5 font-bold text-center w-24"
                            style={{ backgroundColor: isPappalediGreen ? greenBg : 'transparent' }}
                        ></td>
                        <td
                            className="border border-black p-2.5"
                            style={{ color: isPappalediGreen ? redColor : '#000000' }}
                        >
                            Pappaledi/ Tacierzynskie -{pappalediText ? (
                                <> ( <span style={{ color: isPappalediGreen ? redColor : '#0070c0', fontStyle: 'italic' }}>{pappalediText}</span> )</>
                            ) : null}
                        </td>
                        <td className="border border-black p-2.5 w-20"></td>
                    </tr>

                    {/* Row 14: Nadgodziny na kolejny miesiac */}
                    <tr className="border-b border-black">
                        <td className="border border-black p-2.5 w-24"></td>
                        <td className="border border-black p-2.5">
                            Nadgodziny przeniesione na kolejny miesiąc.
                        </td>
                        <td
                            className="border border-black p-2.5 font-bold text-center w-20"
                            style={{ backgroundColor: yellowBg }}
                        >
                            {Number(nadgodzinyNaKolejny) > 0 ? formatNum(nadgodzinyNaKolejny) : ''}
                        </td>
                    </tr>

                    {/* Row 15: Odjąć za mieszkanie */}
                    <tr className="border-b border-black">
                        <td
                            className="border border-black p-2.5 font-bold text-center w-24"
                            style={{ backgroundColor: isMieszkanieGreen ? greenBg : 'transparent' }}
                        >
                            {Number(mieszkanie) > 0 ? formatCurrency(mieszkanie) : ''}
                        </td>
                        <td
                            className="border border-black p-2.5 font-normal"
                            style={{ color: isMieszkanieGreen ? redColor : '#000000' }}
                        >
                            odjąć za mieszkanie
                        </td>
                        <td className="border border-black p-2.5 w-20"></td>
                    </tr>

                    {/* Row 17: Suma godzin */}
                    <tr className="border-b border-black">
                        <td className="border border-black p-2.5 font-bold text-center w-24 text-lg">
                            {godzinyPrzepracowane !== '' ? formatNum(godzinyPrzepracowane) : '0'}
                        </td>
                        <td colSpan={2} className="border border-black p-2.5 font-bold text-base">
                            Suma godzin przepracowanych w danym miesiącu.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
});

/**
 * Generate PDF for single or multiple sheets
 */
export const downloadRozliczeniePDF = async (sheetsData, filename = 'Rozliczenie_Miesieczne.pdf') => {
    if (!Array.isArray(sheetsData) || sheetsData.length === 0) return;

    // Create container in DOM for html2canvas to measure and render
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '750px';
    container.style.zIndex = '-9999';
    container.style.opacity = '1';
    container.style.visibility = 'visible';
    container.style.pointerEvents = 'none';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);

    try {
        // Enable internal PDF object stream compression (4th param = true)
        const pdf = new jsPDF('p', 'mm', 'a4', true);
        const pdfWidth = 210; // A4 portrait width in mm

        for (let i = 0; i < sheetsData.length; i++) {
            const data = sheetsData[i];

            const wrapper = document.createElement('div');
            wrapper.style.backgroundColor = '#ffffff';
            wrapper.style.padding = '10px';
            container.appendChild(wrapper);

            wrapper.innerHTML = createSheetHTML(data);

            const targetEl = wrapper.firstElementChild || wrapper;

            // Capture canvas using html2canvas with scale 1.5 for crisp text & low filesize
            const canvas = await html2canvas(targetEl, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1000
            });

            // Use JPEG encoding at 0.82 quality
            const imgData = canvas.toDataURL('image/jpeg', 0.82);

            const imgWidth = 185; // mm (dopasowanie szerokości do A4)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const xPos = (pdfWidth - imgWidth) / 2;
            const yPos = 12;

            if (i > 0) {
                pdf.addPage();
            }

            pdf.addImage(imgData, 'JPEG', xPos, yPos, imgWidth, imgHeight, undefined, 'FAST');
            container.removeChild(wrapper);
        }

        pdf.save(filename);
    } catch (err) {
        console.error('Błąd podczas generowania PDF:', err);
    } finally {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
};

/**
 * HTML String Generator matching RozliczenieSheet for html2canvas
 */
const createSheetHTML = (data) => {
    const {
        pracownikName = '',
        miesiacRok = '',
        godzinyPrzepracowane = 0,
        mozliweGodziny = '',
        nadgodzinyWyplata = 0,
        nadgodzinyStawka = '',
        czerwoneDni = 0,
        nadgodzinyZPoprzedniego = 0,
        atfWykorzystane = 0,
        atfOtherMonthsTotal = 0,
        urlopYearTotal = 0,
        urlopOtherMonthsTotal = 0,
        urlopZaleglyYearTotal = 0,
        urlopZaleglyOtherMonthsTotal = 0,
        yearlyZaleglyPula = 0,
        urlopPulaInput = 0,
        mieszkanie = 0,
        urlop = [],
        urlopZalegly = [],
        l4 = {},
        l4cd = {},
        vab = {},
        pappaledi = {},
        nadgodzinyNaKolejny = 0,
        email = '',
        nrKonta = '',
        kontoTyp = 'PL'
    } = data || {};

    const formattedMonth = getMonthNameMianownik(miesiacRok);

    const sumDays = (arr) => Array.isArray(arr) ? arr.reduce((acc, e) => acc + (Number(e.days) || 0), 0) : 0;

    const currentUrlopDays = sumDays(urlop);
    const currentZaleglyDays = sumDays(urlopZalegly);

    const zaleglyText = formatLeaveText(urlopZalegly);
    const l4Text = formatRangeText(l4);
    const l4cdText = formatRangeText(l4cd);
    const vabText = formatRangeText(vab);
    const pappalediText = formatRangeText(pappaledi);

    // Green state for Column A
    const isHoursGreen = Boolean(mozliweGodziny || (Number(godzinyPrzepracowane) > 0));
    const isOvertimeGreen = Number(nadgodzinyWyplata) > 0;
    const isRedDaysGreen = Number(czerwoneDni) > 0;
    const isAtfGreen = Number(atfWykorzystane) > 0;
    const isL4Green = Boolean(l4Text);
    const isL4cdGreen = Boolean(l4cdText);
    const isVabGreen = Boolean(vabText);
    const isPappalediGreen = Boolean(pappalediText);
    const isMieszkanieGreen = Number(mieszkanie) > 0;

    const remainingAtf = Math.max(40 - (Number(atfOtherMonthsTotal) || 0) - (Number(atfWykorzystane) || 0), 0);

    const greenBg = '#92d050';
    const yellowBg = '#ffff00';
    const redColor = '#ff0000';

    let overtimeRateLabel = '+10kr/1h';
    if (nadgodzinyStawka) {
        const cleaned = String(nadgodzinyStawka).replace(/100%/gi, '').trim().replace(/^[,\s+]+/, '').trim();
        if (cleaned) {
            overtimeRateLabel = cleaned.includes('/1h') || cleaned.includes('/h') ? `+${cleaned.replace(/^\+/, '')}` : `+${cleaned.replace(/^\+/, '')}/1h`;
        }
    }

    const displayHours = (mozliweGodziny !== '' && mozliweGodziny !== undefined && mozliweGodziny !== null)
        ? formatNum(mozliweGodziny)
        : (godzinyPrzepracowane !== '' ? formatNum(godzinyPrzepracowane) : '0');

    return `
        <div style="background:#ffffff; color:#000000; font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; padding: 24px; width: 660px; box-sizing: border-box;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14.5px;">
                <tbody>
                    <!-- Row 1: Header Month -->
                    <tr>
                        <td style="width: 100px; border: none;"></td>
                        <td colspan="2" style="border: none; padding: 2px 8px; font-weight: bold; font-size: 18px; color: #000000;">
                            &lt;${formattedMonth} &gt;
                        </td>
                    </tr>

                    <!-- Row 2: Employee Name -->
                    <tr>
                        <td style="width: 100px; border: none;"></td>
                        <td colspan="2" style="border: none; padding: 2px 8px 10px 8px; font-weight: bold; font-size: 18px; color: #000000;">
                            ${pracownikName}
                        </td>
                    </tr>

                    <!-- Row 3: Mozliwe / Robocze godziny (168) + 100% -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; text-align: center; width: 100px; font-size: 17px; background: ${isHoursGreen ? greenBg : 'transparent'};">
                            ${displayHours}
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; color: ${isHoursGreen ? redColor : '#000000'}; font-size: 17px;">
                            100%
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 85px;"></td>
                    </tr>

                    <!-- Row 4: Nadgodziny -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; text-align: center; width: 100px; background: ${isOvertimeGreen ? greenBg : 'transparent'};">
                            ${Number(nadgodzinyWyplata) > 0 ? formatNum(nadgodzinyWyplata) : ''}
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; color: ${isOvertimeGreen ? redColor : '#000000'};">
                            nadgodziny ( kod, 1174 <strong>${overtimeRateLabel}</strong> )
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 85px;"></td>
                    </tr>

                    <!-- Row 5: Czerwone dni -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; text-align: center; width: 100px; background: ${isRedDaysGreen ? greenBg : 'transparent'};">
                            ${Number(czerwoneDni) > 0 ? `${formatNum(czerwoneDni)}dni` : ''}
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; color: ${isRedDaysGreen ? redColor : '#000000'};">
                            czerwone dni
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 85px;"></td>
                    </tr>

                    <!-- Row 6: Bank godzin -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 100px;"></td>
                        <td style="border: 1px solid #000000; padding: 7px 9px;">
                            z bank godzin
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; text-align: center; width: 85px; background: ${yellowBg};">
                            ${Number(nadgodzinyZPoprzedniego) > 0 ? formatNum(nadgodzinyZPoprzedniego) : ''}
                        </td>
                    </tr>

                    <!-- Row 7: ATF -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; text-align: center; width: 100px; background: ${isAtfGreen ? greenBg : 'transparent'};">
                            ${isAtfGreen ? formatNum(atfWykorzystane) : ''}
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; color: ${isAtfGreen ? redColor : '#000000'};">
                            ATF
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; text-align: center; width: 85px; background: ${yellowBg};">
                            ${(isAtfGreen || Number(atfOtherMonthsTotal) > 0) ? formatNum(remainingAtf) : ''}
                        </td>
                    </tr>

                    <!-- Row 8: Urlop -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 100px;"></td>
                        <td style="border: 1px solid #000000; padding: 7px 9px;">
                            urlop
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; text-align: center; width: 85px; background: ${yellowBg};">
                            ${currentUrlopDays > 0 ? formatNum(currentUrlopDays) : (currentZaleglyDays > 0 ? formatNum(currentZaleglyDays) : '')}
                        </td>
                    </tr>

                    <!-- Row 9: Urlop zaległy -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 100px;"></td>
                        <td style="border: 1px solid #000000; padding: 7px 9px;">
                            Urlop zaległy ( <span style="color: #0070c0; font-style: italic;">${zaleglyText ? zaleglyText : 'wpisz ilość dni + data'}</span> )
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; text-align: center; width: 85px; background: ${yellowBg};"></td>
                    </tr>

                    <!-- Row 10: L4 -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 100px; background: ${isL4Green ? greenBg : 'transparent'};"></td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; color: ${isL4Green ? redColor : '#000000'};">
                            L4/PC Husbyggen 14dni płaci PC${l4Text ? ` ( <span style="color: ${isL4Green ? redColor : '#0070c0'}; font-style: italic;">${l4Text}</span> )` : ''}
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 85px;"></td>
                    </tr>

                    <!-- Row 11: L4cd -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 100px; background: ${isL4cdGreen ? greenBg : 'transparent'};"></td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; color: ${isL4cdGreen ? redColor : '#000000'};">
                            L4c.d.${l4cdText ? ` ( <span style="color: ${isL4cdGreen ? redColor : '#0070c0'}; font-style: italic;">${l4cdText}</span> )` : ''}
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 85px;"></td>
                    </tr>

                    <!-- Row 12: VAB -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 100px; background: ${isVabGreen ? greenBg : 'transparent'};"></td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; color: ${isVabGreen ? redColor : '#000000'};">
                            VAB-${vabText ? ` ( <span style="color: ${isVabGreen ? redColor : '#0070c0'}; font-style: italic;">${vabText}</span> )` : ''}
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 85px;"></td>
                    </tr>

                    <!-- Row 13: Pappaledi -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 100px; background: ${isPappalediGreen ? greenBg : 'transparent'};"></td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; color: ${isPappalediGreen ? redColor : '#000000'};">
                            Pappaledi/ Tacierzynskie -${pappalediText ? ` ( <span style="color: ${isPappalediGreen ? redColor : '#0070c0'}; font-style: italic;">${pappalediText}</span> )` : ''}
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 85px;"></td>
                    </tr>

                    <!-- Row 14: Nadgodziny na kolejny miesiac -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 100px;"></td>
                        <td style="border: 1px solid #000000; padding: 7px 9px;">
                            Nadgodziny przeniesione na kolejny miesiąc.
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; text-align: center; width: 85px; background: ${yellowBg};">
                            ${Number(nadgodzinyNaKolejny) > 0 ? formatNum(nadgodzinyNaKolejny) : ''}
                        </td>
                    </tr>

                    <!-- Row 15: Odjąć za mieszkanie -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; text-align: center; width: 100px; background: ${isMieszkanieGreen ? greenBg : 'transparent'};">
                            ${Number(mieszkanie) > 0 ? formatCurrency(mieszkanie) : ''}
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: normal; color: ${isMieszkanieGreen ? redColor : '#000000'};">
                            odjąć za mieszkanie
                        </td>
                        <td style="border: 1px solid #000000; padding: 7px 9px; width: 85px;"></td>
                    </tr>

                    <!-- Row 17: Suma godzin -->
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; text-align: center; width: 100px; font-size: 17px;">
                            ${godzinyPrzepracowane !== '' ? formatNum(godzinyPrzepracowane) : '0'}
                        </td>
                        <td colspan="2" style="border: 1px solid #000000; padding: 7px 9px; font-weight: bold; font-size: 15px;">
                            Suma godzin przepracowanych w danym miesiącu.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
};

