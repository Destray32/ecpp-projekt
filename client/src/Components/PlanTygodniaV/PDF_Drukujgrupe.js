import jsPDF from 'jspdf';
import 'jspdf-autotable';

const getWeekNumber = (date) => {
    const currentDate = new Date(date);
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const daysSinceStart = Math.floor((currentDate - startOfYear) / (1000 * 60 * 60 * 24));
    return Math.ceil((daysSinceStart + ((startOfYear.getDay() + 1) % 7)) / 7);
};

const PDF_Drukujgrupe = (data, startDate, endDate) => {
    const doc = new jsPDF('portrait', 'pt', 'a4');
    
    // Add only the regular Roboto font
    doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');

    const year = new Date(startDate).getFullYear();
    const weekNumber = getWeekNumber(startDate); 
    const marginLeft = 20;

    // Set font to Roboto
    doc.setFont("Roboto", "normal");
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    
    // Enable Unicode encoding
    doc.setLanguage("pl");
    
    doc.text(`${year}`, marginLeft, 40);
    doc.text(`V-${weekNumber}`, marginLeft, 60);

    const groups = data.reduce((acc, item) => {
        if (!acc[item.grupaId]) {
            acc[item.grupaId] = { workers: [], vehicles: [] };
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
                m_value: item.m_value
            });
        }

        return acc;
    }, {});

    const groupOrder = ['NCW Plat', 'Pogab']; 
    const lastGroups = ['do dyspozycji', 'urlopy'];
    const customSort = (a, b) => {
        const aName = data.find(item => item.grupaId == a).Zleceniodawca;
        const bName = data.find(item => item.grupaId == b).Zleceniodawca;

        if (groupOrder.includes(aName) && !groupOrder.includes(bName)) return -1;
        if (!groupOrder.includes(aName) && groupOrder.includes(bName)) return 1;

        if (lastGroups.includes(aName) && !lastGroups.includes(bName)) return 1;
        if (!lastGroups.includes(aName) && lastGroups.includes(bName)) return -1;

        return aName.localeCompare(bName);
    };

    const sortedGroupIds = Object.keys(groups).sort(customSort);

    let finalY = 80;
    sortedGroupIds.forEach((groupId) => {
        const group = groups[groupId];
        const zleceniodawcaName = data.find(item => item.grupaId == groupId).Zleceniodawca;

        doc.setLineWidth(0.5);
        doc.line(marginLeft, finalY, doc.internal.pageSize.width - marginLeft, finalY);
        finalY += 20;

        // Use larger font size instead of bold for headers
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text(zleceniodawcaName, marginLeft, finalY);
        finalY += 20;

        const workersByMValue = {};
        group.workers.forEach(worker => {
            if (!workersByMValue[worker.m_value]) {
                workersByMValue[worker.m_value] = [];
            }
            workersByMValue[worker.m_value].push(worker.name);
        });

        Object.keys(workersByMValue).sort().forEach(mValue => {
            const workersList = workersByMValue[mValue].join(', ');
            if (workersList) {
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text(`${mValue}, ${workersList}`, marginLeft, finalY);
                finalY += 15;
            }
        });

        const vehiclesByMValue = {};
        group.vehicles.forEach(vehicle => {
            if (!vehiclesByMValue[vehicle.m_value]) {
                vehiclesByMValue[vehicle.m_value] = [];
            }
            vehiclesByMValue[vehicle.m_value].push(vehicle.name);
        });

        Object.keys(vehiclesByMValue).sort().forEach(mValue => {
            const vehiclesList = vehiclesByMValue[mValue].join(', ');
            if (vehiclesList) {
                doc.setFontSize(14);
                doc.setTextColor(0, 102, 204);
                doc.text(`${mValue}, ${vehiclesList}`, marginLeft, finalY);
                finalY += 15;
            }
        });

        finalY += 20;
    });

    doc.save(`Plan_Grupy_${weekNumber}.pdf`);
};

export default PDF_Drukujgrupe;