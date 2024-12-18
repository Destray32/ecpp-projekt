import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { notification } from 'antd';

const PDF_SprawozdaniePodsumowanie = (raport, startDate, endDate, Projekt) => {
    const doc = new jsPDF('landscape', 'pt', 'a4');
    doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    // Group data by ProjektID
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

    // Iterate over each project group
    projectIds.forEach((projectId, index) => {
        const { projectName, entries } = groupedByProject[projectId];

        // Setting up header and project name
        if (index > 0) {
            doc.addPage(); // Add a new page for the next project
        }
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        doc.text("Sprawozdanie z działalności - podsumowanie", 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        let okresYPosition = 40;
        let okresText = `Okres: ${startDate && endDate ? `${startDate} - ${endDate}` : '-'}`;
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
        doc.text(`Projekt: ${projectName}`, 40, okresYPosition);

        // Filter by date range if provided
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
            return; // Skip to the next project if no entries found
        }

        // Grouping employee data
        const groupedByEmployee = employeeEntries.reduce((acc, entry) => {
            const employee = entry.Pracownik;
            if (!acc[employee]) {
                acc[employee] = {
                    hours: 0,
                    kilometry: 0,
                    parking: 0,
                    diety: 0,
                    inneKoszty: 0,
                };
            }
            acc[employee].hours += parseFloat(entry.GodzinyPrzepracowane) || 0;
            acc[employee].kilometry += parseFloat(entry.Kilometry) || 0;
            acc[employee].diety += parseFloat(entry.Diety) || 0;
            acc[employee].inneKoszty += parseFloat(entry.Inne_koszty) || 0;
            return acc;
        }, {});

        const totalTime = Object.values(groupedByEmployee).reduce((acc, employeeData) => acc + employeeData.hours, 0);

        // Prepare table data
        const tableData = Object.keys(groupedByEmployee).map(employee => {
            const { hours, kilometry, parking, diety, inneKoszty } = groupedByEmployee[employee];
            return [
                employee,
                hours.toFixed(2),
                "104.50", 
                kilometry.toFixed(2),
                parking.toFixed(2),
                diety.toFixed(2),
                inneKoszty.toFixed(2)
            ];
        });

        tableData.push([
            'Suma: ', totalTime.toFixed(2), '', '', '', '', 'Suma: 0.00' 
        ]);

        doc.autoTable({
            startY: okresYPosition + 20,
            head: [['Pracownik', 'Czas', '1h=kr', 'Kilometry', 'Parking', 'Diety', 'Inne koszty']],
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
                0: { cellWidth: 150, halign: 'center', overflow: 'linebreak' },
                1: { cellWidth: 100, halign: 'center' },
                2: { cellWidth: 100, halign: 'center' },
                3: { cellWidth: 100, halign: 'center' },
                4: { cellWidth: 100, halign: 'center' },
                5: { cellWidth: 100, halign: 'center' },
                6: { cellWidth: 100, halign: 'center' }
            },
            margin: { horizontal: 10, top: 10, left: 30, right: 30 },
            tableWidth: 'auto',
        });
    });

    // Footer with page number
    const bottomYPosition = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(14, bottomYPosition, doc.internal.pageSize.getWidth() - 14, bottomYPosition);

    const pageNumber = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageNumber; i++) {
        doc.setPage(i);
        doc.text(`Strona ${i} z ${pageNumber}`, doc.internal.pageSize.getWidth() - 14, bottomYPosition + 15, { align: 'right' });
    }

    // Save the document
    doc.save("Sprawozdanie_z_dzialalnosci.pdf");
};

export default PDF_SprawozdaniePodsumowanie;
