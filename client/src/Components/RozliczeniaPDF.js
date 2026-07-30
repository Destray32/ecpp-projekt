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
    return `${monthMianownik[monthIdx] || ''} ${year}`;
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

const formatLeaveText = (leaveArray, labelPrefix) => {
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
        urlop = [],
        urlopZalegly = [],
        l4 = {},
        l4cd = {},
        vab = {},
        pappaledi = {},
        nadgodzinyNaKolejny = 0,
        email = ''
    } = data;

    const formattedMonth = getMonthNameMianownik(miesiacRok);
    const prevMonthDopelniacz = getPrevMonthDopelniacz(miesiacRok);

    const sumDays = (arr) => Array.isArray(arr) ? arr.reduce((acc, e) => acc + (Number(e.days) || 0), 0) : 0;

    const currentUrlopDays = sumDays(urlop);
    const currentZaleglyDays = sumDays(urlopZalegly);

    const totalZaleglyPula = Number(urlopPulaInput || yearlyZaleglyPula || 0);
    const totalZaleglyUsed = (urlopZaleglyOtherMonthsTotal || 0) + currentZaleglyDays;
    const remainingZaleglyPula = Math.max(totalZaleglyPula - totalZaleglyUsed, 0);

    const totalRegularUsed = (urlopOtherMonthsTotal || 0) + currentUrlopDays;
    const remainingRegularUrlop = Math.max(25 - totalRegularUsed, 0);

    const totalAtfUsed = (atfOtherMonthsTotal || 0) + (Number(atfWykorzystane) || 0);
    const remainingAtf = Math.max(40 - totalAtfUsed, 0);

    const urlopText = formatLeaveText(urlop);
    const zaleglyText = formatLeaveText(urlopZalegly);
    const l4Text = formatRangeText(l4);
    const l4cdText = formatRangeText(l4cd);
    const vabText = formatRangeText(vab);
    const pappalediText = formatRangeText(pappaledi);

    const isHoursGreen = Number(godzinyPrzepracowane) > 0;
    const isOvertimeGreen = Number(nadgodzinyWyplata) > 0;
    const isRedDaysGreen = Number(czerwoneDni) > 0;
    const isAtfGreen = Number(atfWykorzystane) > 0;
    const isUrlopGreen = currentUrlopDays > 0;
    const isZaleglyGreen = currentZaleglyDays > 0;
    const isL4Green = Boolean(l4Text);
    const isL4cdGreen = Boolean(l4cdText);
    const isVabGreen = Boolean(vabText);
    const isPappalediGreen = Boolean(pappalediText);

    return (
        <div
            ref={ref}
            className="bg-white text-black font-sans p-6 text-sm leading-snug max-w-[650px] mx-auto border border-gray-400 drop-shadow-md"
            style={{ width: '650px', boxSizing: 'border-box' }}
        >
            {/* Header Month */}
            <div className="text-center font-bold text-base mb-2">
                &lt; {formattedMonth} &gt;
            </div>

            {/* Employee Name */}
            <div className="font-bold italic text-lg text-blue-700 mb-3 border-b pb-1">
                {pracownikName}
            </div>

            {/* Excel Table Layout */}
            <table className="w-full border-collapse border border-black text-sm">
                <tbody>
                    {/* Row 3: Przepracowane godziny */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black p-2 font-bold text-center w-24 text-base ${isHoursGreen ? 'bg-[#92d050]' : ''}`}>
                            {godzinyPrzepracowane !== '' ? String(godzinyPrzepracowane).replace('.', ',') : '0'}
                        </td>
                        <td colSpan={2} className="p-2 font-bold text-red-600">
                            {nadgodzinyStawka || ''}
                        </td>
                    </tr>

                    {/* Row 4: Nadgodziny do wypłaty */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black p-2 font-bold text-center ${isOvertimeGreen ? 'bg-[#92d050]' : ''}`}>
                            {Number(nadgodzinyWyplata) > 0 ? String(nadgodzinyWyplata).replace('.', ',') : ''}
                        </td>
                        <td colSpan={2} className="p-2 font-bold">
                            nadgodziny ( do wypłaty )
                        </td>
                    </tr>

                    {/* Row 5: Czerwone dni */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black p-2 font-bold text-center ${isRedDaysGreen ? 'bg-[#92d050]' : ''}`}>
                            {Number(czerwoneDni) > 0 ? `${czerwoneDni}dni` : ''}
                        </td>
                        <td colSpan={2} className="p-2">
                            czerwone dni
                        </td>
                    </tr>

                    {/* Row 6: Bank godzin z poprzedniego miesiąca */}
                    <tr className="border-b border-black">
                        <td className="border-r border-black p-2 bg-[#00b0f0] w-24"></td>
                        <td className="border-r border-black p-2">
                            z bank godzin <span className="text-red-600 font-bold">z {prevMonthDopelniacz || 'poprzedniego miesiąca'}</span>
                        </td>
                        <td className="p-2 font-bold text-center bg-[#ffff00] w-20">
                            {nadgodzinyZPoprzedniego || 0}
                        </td>
                    </tr>

                    {/* Row 7: ATF */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black p-2 font-bold text-center ${isAtfGreen ? 'bg-[#92d050]' : ''}`}>
                            {Number(atfWykorzystane) > 0 ? atfWykorzystane : ''}
                        </td>
                        <td className="border-r border-black p-2">
                            ATF 40h
                        </td>
                        <td className="p-2 font-bold text-center bg-[#ffff00]">
                            {remainingAtf}/40
                        </td>
                    </tr>

                    {/* Row 8: Urlop zwykły */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black p-2 font-bold text-center ${isUrlopGreen ? 'bg-[#92d050]' : ''}`}>
                            {currentUrlopDays > 0 ? `${currentUrlopDays}dni` : ''}
                        </td>
                        <td className="border-r border-black p-2">
                            urlop {urlopText ? `( ${urlopText} )` : '( wpisz ilość dni + data )'}
                        </td>
                        <td className="p-2 font-bold text-center bg-[#ffff00]">
                            {remainingRegularUrlop}
                        </td>
                    </tr>

                    {/* Row 9: Urlop zaległy */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black p-2 font-bold text-center ${isZaleglyGreen ? 'bg-[#92d050]' : ''}`}>
                            {currentZaleglyDays > 0 ? `${currentZaleglyDays}dni` : ''}
                        </td>
                        <td className="border-r border-black p-2 font-bold italic text-blue-800">
                            Urlop zaległy {zaleglyText ? `( ${zaleglyText} )` : ''}
                        </td>
                        <td className="p-2 font-bold text-center bg-[#ffff00]">
                            {remainingZaleglyPula}
                        </td>
                    </tr>

                    {/* Row 10: L4 */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black p-2 font-bold text-center ${isL4Green ? 'bg-[#92d050]' : ''}`}></td>
                        <td colSpan={2} className="p-2">
                            L4/PC Husbyggen 14dni płaci PC {l4Text ? `( ${l4Text} )` : '( data )'}
                        </td>
                    </tr>

                    {/* Row 11: L4cd */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black p-2 font-bold text-center ${isL4cdGreen ? 'bg-[#92d050]' : ''}`}></td>
                        <td colSpan={2} className="p-2">
                            L4c.d. {l4cdText ? `( ${l4cdText} )` : '( data )'}
                        </td>
                    </tr>

                    {/* Row 12: VAB */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black p-2 font-bold text-center ${isVabGreen ? 'bg-[#92d050]' : ''}`}></td>
                        <td colSpan={2} className="p-2">
                            VAB- {vabText ? `( ${vabText} )` : '( data )'}
                        </td>
                    </tr>

                    {/* Row 13: Pappaledi */}
                    <tr className="border-b border-black">
                        <td className={`border-r border-black p-2 font-bold text-center ${isPappalediGreen ? 'bg-[#92d050]' : ''}`}></td>
                        <td colSpan={2} className="p-2">
                            Pappaledi/ Tacierzyńskie - {pappalediText ? `( ${pappalediText} )` : '( data )'}
                        </td>
                    </tr>

                    {/* Row 14: Nadgodziny przeniesione na kolejny miesiąc */}
                    <tr className="border-b border-black">
                        <td colSpan={2} className="p-2 font-semibold">
                            Nadgodziny przeniesione na kolejny miesiąc.
                        </td>
                        <td className="p-2 font-bold text-center bg-[#ffff00]">
                            {nadgodzinyNaKolejny || 0}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Row 15: Separator */}
            <div className="text-center font-mono my-2 text-xs text-gray-600 tracking-widest">
                ***************************************************
            </div>

            {/* Row 16: Summary Total */}
            <div className="font-bold text-sm text-center mb-2">
                {String(godzinyPrzepracowane).replace('.', ',')} Suma godzin przepracowanych w danym miesiącu.
            </div>

            {/* Row 17: Email */}
            {email && (
                <div className="text-center text-xs text-red-600 font-semibold">
                    {email}
                </div>
            )}
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

            // Use JPEG encoding at 0.82 quality (reduces size per page from ~3MB PNG to ~80KB JPEG)
            const imgData = canvas.toDataURL('image/jpeg', 0.82);

            const imgWidth = 180; // mm
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
        urlop = [],
        urlopZalegly = [],
        l4 = {},
        l4cd = {},
        vab = {},
        pappaledi = {},
        nadgodzinyNaKolejny = 0,
        email = ''
    } = data || {};

    const formattedMonth = getMonthNameMianownik(miesiacRok);
    const prevMonthDopelniacz = getPrevMonthDopelniacz(miesiacRok);

    const sumDays = (arr) => Array.isArray(arr) ? arr.reduce((acc, e) => acc + (Number(e.days) || 0), 0) : 0;

    const currentUrlopDays = sumDays(urlop);
    const currentZaleglyDays = sumDays(urlopZalegly);

    const totalZaleglyPula = Number(urlopPulaInput || yearlyZaleglyPula || 0);
    const totalZaleglyUsed = (urlopZaleglyOtherMonthsTotal || 0) + currentZaleglyDays;
    const remainingZaleglyPula = Math.max(totalZaleglyPula - totalZaleglyUsed, 0);

    const totalRegularUsed = (urlopOtherMonthsTotal || 0) + currentUrlopDays;
    const remainingRegularUrlop = Math.max(25 - totalRegularUsed, 0);

    const totalAtfUsed = (atfOtherMonthsTotal || 0) + (Number(atfWykorzystane) || 0);
    const remainingAtf = Math.max(40 - totalAtfUsed, 0);

    const urlopText = formatLeaveText(urlop);
    const zaleglyText = formatLeaveText(urlopZalegly);
    const l4Text = formatRangeText(l4);
    const l4cdText = formatRangeText(l4cd);
    const vabText = formatRangeText(vab);
    const pappalediText = formatRangeText(pappaledi);

    const isHoursGreen = Number(godzinyPrzepracowane) > 0;
    const isOvertimeGreen = Number(nadgodzinyWyplata) > 0;
    const isRedDaysGreen = Number(czerwoneDni) > 0;
    const isAtfGreen = Number(atfWykorzystane) > 0;
    const isUrlopGreen = currentUrlopDays > 0;
    const isZaleglyGreen = currentZaleglyDays > 0;
    const isL4Green = Boolean(l4Text);
    const isL4cdGreen = Boolean(l4cdText);
    const isVabGreen = Boolean(vabText);
    const isPappalediGreen = Boolean(pappalediText);

    const greenBg = '#92d050';
    const blueBg = '#00b0f0';
    const yellowBg = '#ffff00';

    return `
        <div style="background:#ffffff; color:#000000; font-family: Arial, sans-serif; padding: 24px; width: 620px; box-sizing: border-box; border: 1px solid #999999;">
            <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 8px;">
                &lt; ${formattedMonth} &gt;
            </div>

            <div style="font-weight: bold; font-style: italic; font-size: 18px; color: #1e88e5; margin-bottom: 12px; border-bottom: 1px solid #cccccc; padding-bottom: 4px;">
                ${pracownikName}
            </div>

            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000000; font-size: 13px;">
                <tbody>
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border-right: 1px solid #000000; padding: 8px; font-weight: bold; text-align: center; width: 90px; font-size: 15px; background: ${isHoursGreen ? greenBg : 'transparent'};">
                            ${godzinyPrzepracowane !== '' ? String(godzinyPrzepracowane).replace('.', ',') : '0'}
                        </td>
                        <td colspan="2" style="padding: 8px; font-weight: bold; color: #d32f2f; font-size: 14px;">
                            ${nadgodzinyStawka || ''}
                        </td>
                    </tr>

                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border-right: 1px solid #000000; padding: 8px; font-weight: bold; text-align: center; background: ${isOvertimeGreen ? greenBg : 'transparent'};">
                            ${Number(nadgodzinyWyplata) > 0 ? String(nadgodzinyWyplata).replace('.', ',') : ''}
                        </td>
                        <td colspan="2" style="padding: 8px; font-weight: bold;">
                            nadgodziny ( do wypłaty )
                        </td>
                    </tr>

                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border-right: 1px solid #000000; padding: 8px; font-weight: bold; text-align: center; background: ${isRedDaysGreen ? greenBg : 'transparent'};">
                            ${Number(czerwoneDni) > 0 ? `${czerwoneDni}dni` : ''}
                        </td>
                        <td colspan="2" style="padding: 8px;">
                            czerwone dni
                        </td>
                    </tr>

                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border-right: 1px solid #000000; padding: 8px; background: ${blueBg}; width: 90px;"></td>
                        <td style="border-right: 1px solid #000000; padding: 8px;">
                            z bank godzin <span style="color: #d32f2f; font-weight: bold;">z ${prevMonthDopelniacz || 'poprzedniego miesiąca'}</span>
                        </td>
                        <td style="padding: 8px; font-weight: bold; text-align: center; background: ${yellowBg}; width: 70px;">
                            ${nadgodzinyZPoprzedniego || 0}
                        </td>
                    </tr>

                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border-right: 1px solid #000000; padding: 8px; font-weight: bold; text-align: center; background: ${isAtfGreen ? greenBg : 'transparent'};">
                            ${Number(atfWykorzystane) > 0 ? atfWykorzystane : ''}
                        </td>
                        <td style="border-right: 1px solid #000000; padding: 8px;">
                            ATF 40h
                        </td>
                        <td style="padding: 8px; font-weight: bold; text-align: center; background: ${yellowBg};">
                            ${remainingAtf}/40
                        </td>
                    </tr>

                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border-right: 1px solid #000000; padding: 8px; font-weight: bold; text-align: center; background: ${isUrlopGreen ? greenBg : 'transparent'};">
                            ${currentUrlopDays > 0 ? `${currentUrlopDays}dni` : ''}
                        </td>
                        <td style="border-right: 1px solid #000000; padding: 8px;">
                            urlop ${urlopText ? `( ${urlopText} )` : '( wpisz ilość dni + data )'}
                        </td>
                        <td style="padding: 8px; font-weight: bold; text-align: center; background: ${yellowBg};">
                            ${remainingRegularUrlop}
                        </td>
                    </tr>

                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border-right: 1px solid #000000; padding: 8px; font-weight: bold; text-align: center; background: ${isZaleglyGreen ? greenBg : 'transparent'};">
                            ${currentZaleglyDays > 0 ? `${currentZaleglyDays}dni` : ''}
                        </td>
                        <td style="border-right: 1px solid #000000; padding: 8px; font-weight: bold; font-style: italic; color: #1565c0;">
                            Urlop zaległy ${zaleglyText ? `( ${zaleglyText} )` : ''}
                        </td>
                        <td style="padding: 8px; font-weight: bold; text-align: center; background: ${yellowBg};">
                            ${remainingZaleglyPula}
                        </td>
                    </tr>

                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border-right: 1px solid #000000; padding: 8px; font-weight: bold; text-align: center; background: ${isL4Green ? greenBg : 'transparent'};"></td>
                        <td colspan="2" style="padding: 8px;">
                            L4/PC Husbyggen 14dni płaci PC ${l4Text ? `( ${l4Text} )` : '( data )'}
                        </td>
                    </tr>

                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border-right: 1px solid #000000; padding: 8px; font-weight: bold; text-align: center; background: ${isL4cdGreen ? greenBg : 'transparent'};"></td>
                        <td colspan="2" style="padding: 8px;">
                            L4c.d. ${l4cdText ? `( ${l4cdText} )` : '( data )'}
                        </td>
                    </tr>

                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border-right: 1px solid #000000; padding: 8px; font-weight: bold; text-align: center; background: ${isVabGreen ? greenBg : 'transparent'};"></td>
                        <td colspan="2" style="padding: 8px;">
                            VAB- ${vabText ? `( ${vabText} )` : '( data )'}
                        </td>
                    </tr>

                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="border-right: 1px solid #000000; padding: 8px; font-weight: bold; text-align: center; background: ${isPappalediGreen ? greenBg : 'transparent'};"></td>
                        <td colspan="2" style="padding: 8px;">
                            Pappaledi/ Tacierzyńskie - ${pappalediText ? `( ${pappalediText} )` : '( data )'}
                        </td>
                    </tr>

                    <tr style="border-bottom: 1px solid #000000;">
                        <td colspan="2" style="padding: 8px; font-weight: bold;">
                            Nadgodziny przeniesione na kolejny miesiąc.
                        </td>
                        <td style="padding: 8px; font-weight: bold; text-align: center; background: ${yellowBg};">
                            ${nadgodzinyNaKolejny || 0}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style="text-align: center; font-family: monospace; margin: 8px 0; font-size: 11px; color: #555555;">
                ***************************************************
            </div>

            <div style="font-weight: bold; font-size: 14px; text-align: center; margin-bottom: 6px;">
                ${String(godzinyPrzepracowane).replace('.', ',')} Suma godzin przepracowanych w danym miesiącu.
            </div>

            ${email ? `<div style="text-align: center; font-size: 12px; color: #d32f2f; font-weight: bold;">${email}</div>` : ''}
        </div>
    `;
};
