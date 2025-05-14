import jsPDF from 'jspdf';
import 'jspdf-autotable';

import openSansBold from '../../fonts/open-sans/OpenSans-Bold.ttf';
import openSansReg from '../../fonts/open-sans/OpenSans-Regular.ttf';

const getWeekNumber = (date) => {
    const currentDate = new Date(date);
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((currentDate - startOfYear) / (1000 * 60 * 60 * 24));
    return Math.ceil((daysSinceStart + ((startOfYear.getDay() + 1) % 7)) / 7);
};

const wrapText = (doc, text, maxWidth, startX, startY, fontSize = 14) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    let y = startY;
    lines.forEach(line => {
        doc.text(line, startX, y);
        y += fontSize + 2;
    });
    return y;
};

const PDF_Drukujgrupe = (data, startDate, endDate) => {
    const doc = new jsPDF('portrait', 'pt', 'a4');

    doc.addFont(openSansBold, 'OpenSansB', 'bold');
    doc.addFont(openSansReg, 'OpenSans', 'normal');

    const year = new Date(startDate).getFullYear();
    const weekNumber = getWeekNumber(startDate);
    const marginLeft = 20;
    const maxWidth = doc.internal.pageSize.width - 2 * marginLeft;

    doc.setFont('OpenSans', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.setLanguage("pl");

    doc.text(`${year}`, marginLeft, 40);
    doc.text(`V-${weekNumber}`, marginLeft, 60);

    const groups = data.reduce((acc, item) => {
        if (!acc[item.grupaId]) {
            acc[item.grupaId] = { workers: [], vehicles: [], urlopy: [] };
        }

        if (item.pracownikId) {
            acc[item.grupaId].workers.push({
                name: `${item.imie} ${item.nazwisko}`,
                m_value: item.m_value
            });
        }

        if (item.pojazdId) {
            acc[item.grupaId].vehicles.push({
                name: item.pojazd,
                m_value: item.m_value ?? ''
            });
        }

        if (item.urlop) {
            acc[item.grupaId].urlopy.push(item.urlop);
        }

        return acc;
    }, {});

    const groupOrder = ['NCW Plåt', 'NCC'];

    const uniqueGroups = Object.entries(groups).map(([grupaId, group]) => {
        const item = data.find(item => item.grupaId == grupaId);
        return {
            grupaId,
            Zleceniodawca: item ? item.Zleceniodawca : ''
        };
    });

    uniqueGroups.sort((a, b) => {
        const aIndex = groupOrder.indexOf(a.Zleceniodawca);
        const bIndex = groupOrder.indexOf(b.Zleceniodawca);
        if (aIndex !== -1 && bIndex === -1) return -1;
        if (aIndex === -1 && bIndex !== -1) return 1;
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        return a.Zleceniodawca.localeCompare(b.Zleceniodawca);
    });

    let finalY = 80;

    uniqueGroups.forEach(({ grupaId, Zleceniodawca }) => {
        const group = groups[grupaId];

        doc.setLineWidth(0.5);
        doc.line(marginLeft, finalY, doc.internal.pageSize.width - marginLeft, finalY);
        finalY += 20;

        doc.setFontSize(18);
        doc.setFont("OpenSansB", 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(Zleceniodawca, marginLeft, finalY);
        doc.setFont("OpenSans", 'normal');
        finalY += 20;
        const unassignedVehicles = group.vehicles
                    .filter(vehicle =>
                        vehicle.m_value === null ||
                        vehicle.m_value === '' ||
                        typeof vehicle.m_value === 'undefined'
                    )
                    .map(vehicle => vehicle.name);
                    
        const workersByMValue = {};
        group.workers.forEach(worker => {
            if (!workersByMValue[worker.m_value]) {
                workersByMValue[worker.m_value] = [];
            }
            workersByMValue[worker.m_value].push(worker.name);
        });

        const vehiclesByMValue = {};
        group.vehicles.forEach(vehicle => {
            const mVal = vehicle.m_value;
            if (!mVal) {
                unassignedVehicles.push(vehicle.name); 
            } else {
                if (!vehiclesByMValue[mVal]) {
                    vehiclesByMValue[mVal] = [];
                }
                vehiclesByMValue[mVal].push(vehicle.name);
            }
        });

        const sortedMValues = Object.keys(workersByMValue).sort();
    
        const usedMValues = new Set();

        sortedMValues.forEach(mValue => {
            const workersList = workersByMValue[mValue].join(', ');
            if (workersList) {
                finalY = wrapText(doc, `${mValue}, ${workersList}`, maxWidth, marginLeft, finalY);
            }

            const vehiclesList = vehiclesByMValue[mValue]?.join(', ');
            if (vehiclesList) {
                doc.setFontSize(14);
                doc.setTextColor(0, 102, 204);
                finalY = wrapText(doc, `${mValue}, ${vehiclesList}`, maxWidth, marginLeft, finalY);
                doc.setTextColor(0, 0, 0);
                usedMValues.add(mValue);
            }
        });

                // 1. Samochody przypisane do m_value, ale nie pokryte z pracownikami
        const remainingVehicles = Object.entries(vehiclesByMValue)
            .filter(([mValue]) =>
                mValue && !usedMValues.has(mValue)
            );

        remainingVehicles.forEach(([mValue, vehicles]) => {
            doc.setFontSize(14);
            doc.setTextColor(0, 102, 204);
            finalY = wrapText(doc, `${mValue}, ${vehicles.join(', ')}`, maxWidth, marginLeft, finalY);
            doc.setTextColor(0, 0, 0);
        });


        if (unassignedVehicles.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(0, 102, 204);
            finalY = wrapText(doc, unassignedVehicles.join(', '), maxWidth, marginLeft, finalY);
            doc.setTextColor(0, 0, 0);
        }


        if (group.urlopy.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(255, 0, 0);
            finalY = wrapText(doc, `Urlopy: ${group.urlopy.join(', ')}`, maxWidth, marginLeft, finalY);
            doc.setTextColor(0, 0, 0);
        }

        finalY += 20;
    });

    doc.save(`Plan_Grupy_${weekNumber}.pdf`);
};

export default PDF_Drukujgrupe;
