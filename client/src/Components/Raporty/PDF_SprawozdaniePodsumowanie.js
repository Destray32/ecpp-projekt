import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { notification } from 'antd';
import axios from 'axios';
const baseUrl = process.env.REACT_APP_BASE_URL;

const PDF_SprawozdaniePodsumowanie = async (raport, startDate, endDate, Projekt, projectZleceniodawcaMapping, returnBytes = false) => {
    // --- Pobierz cennik z backendu ---
    let cennikData = [];
    try {
        const response = await axios.get(`${baseUrl}/api/cennik`, { withCredentials: true });
        cennikData = response.data;
    } catch (err) {
        notification.error({
            message: 'Błąd',
            description: 'Nie udało się pobrać danych cennika',
            placement: 'topRight',
        });
        return;
    }

    let backendProjectOrderMap = {};
    try {
        const projectsResponse = await axios.get(`${baseUrl}/api/czas/projekty`, { withCredentials: true });
        const backendProjects = projectsResponse?.data?.projekty || [];
        backendProjectOrderMap = Object.fromEntries(backendProjects.map((project, index) => [project.id, index]));
    } catch (err) {
        notification.error({
            message: 'Błąd',
            description: 'Nie udało się pobrać kolejności projektów',
            placement: 'topRight',
        });
        return;
    }

    const doc = new jsPDF('landscape', 'pt', 'a4');
    console.log(raport);
    doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    const parseDateOnly = (value) => {
        if (!value) return null;
        const [year, month, day] = value.split('-');
        if (!year || !month || !day) return null;
        const parsed = new Date(`${year}-${month}-${day}`);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const fetchMaterialsForProject = async (projectId) => {
        try {
            const response = await axios.get(`${baseUrl}/api/czas/materialy/${projectId}`, { withCredentials: true });
            return response?.data?.materialy || [];
        } catch (err) {
            notification.error({
                message: 'Błąd',
                description: 'Nie udało się pobrać faktur materiałowych',
                placement: 'topRight',
            });
            return [];
        }
    };

    // Grupowanie danych po ProjektID
    const groupedByProject = raport.reduce((acc, row) => {
        const projectId = row.ProjektID;
        if (!acc[projectId]) {
            acc[projectId] = {
                projectName: row.Projekt,
                entries: [],
            };
        }
        acc[projectId].entries.push(row);
        return acc;
    }, {});

    const projectIds = Object.keys(groupedByProject);

    if (projectIds.length === 0) {
        notification.info({
            message: 'Informacja',
            description: 'Brak danych dla wybranego projektu',
            placement: 'topRight',
        });
        return;
    }

    // Filtrowanie projektów, które mają godzin > 0 w danym okresie
    const filteredProjectIds = projectIds.filter(projectId => {
        const { entries } = groupedByProject[projectId];
        const entriesInDateRange = (startDate && endDate)
            ? entries.filter(entry => {
                const entryDate = new Date(entry.Data.split('.').reverse().join('-'));
                const start = new Date(startDate);
                const end = new Date(endDate);
                return entryDate >= start && entryDate <= end;
            })
            : entries;

        const totalHours = entriesInDateRange.reduce((sum, entry) => sum + (parseFloat(entry.GodzinyPrzepracowane) || 0), 0);
        return totalHours > 0;
    });

    if (filteredProjectIds.length === 0) {
        notification.info({
            message: 'Informacja',
            description: 'Brak danych z godzinami w wybranym okresie dla wybranego projektu',
            placement: 'topRight',
        });
        return;
    }

    filteredProjectIds.sort((a, b) => {
        const aOrder = Number.isFinite(Number(backendProjectOrderMap?.[a])) ? Number(backendProjectOrderMap[a]) : Number.MAX_SAFE_INTEGER;
        const bOrder = Number.isFinite(Number(backendProjectOrderMap?.[b])) ? Number(backendProjectOrderMap[b]) : Number.MAX_SAFE_INTEGER;

        if (aOrder !== bOrder) {
            return aOrder - bOrder;
        }

        return String(a).localeCompare(String(b), 'pl', { sensitivity: 'base' });
    });

    for (let i = 0; i < filteredProjectIds.length; i++) {
        const projectId = filteredProjectIds[i];
        const { projectName, entries } = groupedByProject[projectId];
        const materials = await fetchMaterialsForProject(projectId);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        const materialsInRange = (start && end)
            ? materials.filter(material => {
                const materialDate = parseDateOnly(material.Data);
                return materialDate && materialDate >= start && materialDate <= end;
            })
            : materials;
        const invoiceMaterialCost = materialsInRange
            .reduce((sum, material) => sum + (parseFloat(material.Koszty) || 0), 0);
        
        // Get zleceniodawca from mapping
        const zleceniodawca = projectZleceniodawcaMapping?.[projectId] || entries[0]?.Zleceniodawca || '';
        const kmMultiplier = parseFloat(
            cennikData.find(c => (c.Zleceniodawca || '') === zleceniodawca)?.Stawka
        ) || 0;

        // Filtrujemy wpisy po dacie
        let employeeEntries = [];
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            employeeEntries = entries.filter(entry => {
                const entryDate = new Date(entry.Data.split('.').reverse().join('-'));
                return entryDate >= start && entryDate <= end;
            });
        } else {
            employeeEntries = entries;
        }

        if (employeeEntries.length === 0) {
            notification.info({
                message: 'Informacja',
                description: `Brak danych dla wybranych pracowników w wybranym okresie dla projektu ${projectName}`,
                placement: 'topRight',
            });
            continue; // Przechodzimy do następnego projektu
        }

        // Grupowanie danych po pracowniku i sumowanie wartości
        const groupedByEmployee = employeeEntries.reduce((acc, entry) => {
            const employee = entry.Pracownik;
            if (!acc[employee]) {
                acc[employee] = {
                    h: 0,
                    m: 0,
                    kilometry: 0,
                    parking: 0,
                    diety: 0,
                    zleceniodawca: entry.Zleceniodawca,
                    pracownikId: entry.PracownikID
                };
            }
            // Obsługa formatu hh:mm, hh.mm, mm
            let godziny = entry.GodzinyPrzepracowane;
            let h = 0, m = 0;
            if (typeof godziny === 'string') {
                const str = godziny.replace(',', '.');
                if (str.includes(':')) {
                    const [hPart, mPart] = str.split(':');
                    h = parseInt(hPart, 10) || 0;
                    m = parseInt(mPart, 10) || 0;
                } else if (str.includes('.')) {
                    const [hPart, mPart] = str.split('.');
                    h = parseInt(hPart, 10) || 0;
                    m = parseInt(mPart, 10) || 0;
                } else if (str.length <= 2) {
                    m = parseInt(str, 10) || 0;
                } else {
                    h = parseInt(str, 10) || 0;
                }
            } else if (typeof godziny === 'number') {
                h = Math.floor(godziny);
                m = Math.round((godziny - h) * 60);
            }
            acc[employee].h += h;
            acc[employee].m += m;
            acc[employee].kilometry += parseFloat(entry.Kilometry) || 0;
            acc[employee].parking += parseFloat(entry.Parking) || 0;
            acc[employee].diety += parseFloat(entry.Diety) || 0;
            return acc;
        }, {});

        // Normalizacja minut do godzin dla każdego pracownika
        Object.values(groupedByEmployee).forEach(obj => {
            // nie normalizuj tutaj!
        });

        // Suma całości
        let totalH = 0, totalM = 0;
        let totalKm = 0, totalParking = 0, totalDiety = 0, totalSuma = 0;
        Object.values(groupedByEmployee).forEach(obj => {
            totalH += obj.h;
            totalM += obj.m;
        });
        // Normalizuj dopiero po zsumowaniu wszystkich minut
        totalH += Math.floor(totalM / 60);
        totalM = totalM % 60;

        const tableData = Object.keys(groupedByEmployee).map(employee => {
            const { h, m, kilometry, parking, diety, zleceniodawca, pracownikId } = groupedByEmployee[employee];
            // --- Pobierz stawkę godzinową z cennika po Zleceniodawca i idPracownik ---
            let entryCennik = cennikData.find(c =>
                c.idPracownik === pracownikId &&
                c.Zleceniodawca === zleceniodawca
            );
            const stawkaGodzinowa = parseFloat(entryCennik?.stawka_indywidualna ?? entryCennik?.stawka_globalna ?? 0) || 0;
            // Normalizuj tylko do wyświetlenia
            let normH = h + Math.floor(m / 60);
            let normM = m % 60;
            const kmCost = kilometry * kmMultiplier;
            const suma = ((h + (m / 60)) * stawkaGodzinowa) + kmCost + parking + diety;

            totalKm += kilometry;
            totalParking += parking;
            totalDiety += diety;
            totalSuma += suma;

            return [
                employee,
                `${normH}:${normM.toString().padStart(2, '0')}`,
                stawkaGodzinowa.toFixed(2),
                kilometry.toFixed(2),
                parking.toFixed(2),
                diety.toFixed(2),
                '',
                suma.toFixed(2)
            ];
        });

        const totalSumaZMaterialem = totalSuma + invoiceMaterialCost;
        const totalKmCost = totalKm * kmMultiplier;

        tableData.push([
            'Suma:',
            `${totalH}:${totalM.toString().padStart(2, '0')}`,
            '',
            `${totalKm.toFixed(2)} (${totalKmCost.toFixed(2)})`,
            totalParking.toFixed(2),
            totalDiety.toFixed(2),
            invoiceMaterialCost.toFixed(2),
            totalSumaZMaterialem.toFixed(2)
        ]);

        if (i > 0) {
            doc.addPage();
        }
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        doc.text("Sprawozdanie z działalności - podsumowanie", 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        let okresYPosition = 40;
        const okresText = `Okres: ${startDate && endDate ? `${startDate} - ${endDate}` : '-'}`;
        doc.text(okresText, 14, okresYPosition);

        const currentDate = new Date().toLocaleDateString('pl-PL');
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.text(currentDate, pageWidth - 14, 20, { align: 'right' });

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(14, okresYPosition + 3, pageWidth - 14, okresYPosition + 3);

        okresYPosition += 20;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Add zleceniodawca before project name
        if (zleceniodawca) {
            doc.text(`Projekt: ${zleceniodawca} / ${projectName}`, 40, okresYPosition);
        } else {
            doc.text(`Projekt: ${projectName}`, 40, okresYPosition);
        }

        // --- Ustaw startY na większą wartość, aby nie ucinało nagłówka ---
        const tableStartY = Math.max(okresYPosition + 20, 80);

        doc.autoTable({
            startY: tableStartY,
            head: [['Pracownik', 'Czas', '1h=kr', 'Kilometry', 'Parking', 'Diety', 'Materiał', 'Suma']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [238, 238, 223], textColor: [0, 0, 0], font: 'Roboto' },
            styles: {
                cellPadding: 2,
                fontSize: 11,
                halign: 'center',
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                font: 'Roboto'
            },
            columnStyles: {
                0: { cellWidth: 120, halign: 'center', overflow: 'linebreak' },
                1: { cellWidth: 70, halign: 'center' },
                2: { cellWidth: 70, halign: 'center' },
                3: { cellWidth: 65, halign: 'center' },
                4: { cellWidth: 65, halign: 'center' },
                5: { cellWidth: 65, halign: 'center' },
                6: { cellWidth: 75, halign: 'center' },
                7: { cellWidth: 75, halign: 'center' }
            },
            margin: { horizontal: 10, top: 10, left: 30, right: 30 },
            tableWidth: 'auto',
        });
    }

    // Stopka z numeracją stron
    const bottomYPosition = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(14, bottomYPosition, doc.internal.pageSize.getWidth() - 14, bottomYPosition);

    const pageNumber = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageNumber; i++) {
        doc.setPage(i);
        doc.text(`Strona ${i} z ${pageNumber}`, doc.internal.pageSize.getWidth() - 14, bottomYPosition + 15, { align: 'right' });
    }

    if (returnBytes) {
        return doc.output('arraybuffer');
    }
    // Zapis pliku PDF
    doc.save("Sprawozdanie_z_dzialalnosci.pdf");
};

export default PDF_SprawozdaniePodsumowanie;

