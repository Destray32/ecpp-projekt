import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { font } from "../../fonts/OpenSans-Regular-normal";

const PDF_SzczegoloweDjsonalnosciPracownikow = (data, startDate, endDate, Projekt) => {
    const doc = new jsPDF('p', 'pt', 'a4');

    // Filter data based on ProjektID if Projekt is provided
    const filteredData = Projekt ? data.filter(row => row.ProjektID === Projekt) : data;

    doc.setFont("OpenSans-Regular", "normal");
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Sprawozdanie z działalności - szczegółowe", 40, 40);

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Okres: ${startDate} - ${endDate}`, 40, 60);

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(40, 70, doc.internal.pageSize.getWidth() - 40, 70);

    let yPosition = 90;

    // Handle cases where filteredData might be empty
    if (filteredData.length === 0) {
        doc.text("Brak danych do wyświetlenia.", 40, yPosition);
        doc.save(`Sprawozdanie_z_dzialalnosci_szczegolowe_${Projekt || 'wszystkie'}.pdf`);
        return;
    }

    // Group data by project
    const projectGroups = filteredData.reduce((acc, row) => {
        if (!acc[row.ProjektID]) {
            acc[row.ProjektID] = [];
        }
        acc[row.ProjektID].push(row);
        return acc;
    }, {});

    // Loop through each project group and create a table
    for (const [projectId, projectData] of Object.entries(projectGroups)) {
        const projectName = projectData[0].Projekt;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Projekt: ${projectName}`, 40, yPosition);
        yPosition += 10;

        // Group data by employee
        const employeeGroups = projectData.reduce((acc, row) => {
            if (!acc[row.Pracownik]) {
                acc[row.Pracownik] = [];
            }
            acc[row.Pracownik].push(row);
            return acc;
        }, {});

        const tableData = Object.entries(employeeGroups).flatMap(([employeeName, employeeData]) => {
            const rows = employeeData.map((row, index) => {
                const hoursWorked = parseFloat(row.GodzinyPrzepracowane);
                const formattedHours = !isNaN(hoursWorked) ? hoursWorked.toFixed(2) : '0.00';

                return [
                    index === 0 ? employeeName : '',
                    row.Data,
                    formattedHours,
                    row.Komentarz
                ];
            });

            const totalHours = employeeData.reduce((sum, row) => {
                const hoursWorked = parseFloat(row.GodzinyPrzepracowane);
                return sum + (!isNaN(hoursWorked) ? hoursWorked : 0);
            }, 0);

            rows.push([`Razem:`, '', totalHours.toFixed(2), '']);
            return rows;
        });

        doc.autoTable({
            startY: yPosition + 20,
            head: [['Pracownik', 'Data', 'Czas', 'Komentarz']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [238, 238, 223],
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
            },
            styles: {
                cellPadding: 2,
                fontSize: 10,
                lineColor: [0, 0, 0],
                lineWidth: 0.1
            },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 70 },
                2: { cellWidth: 50, halign: 'right' },
                3: { cellWidth: 'auto' }
            },
            margin: { left: 40, right: 40 },
            didParseCell: (data) => {
                if (data.section === 'body') {
                    const row = data.row.raw;
                    if (row[2] && !row[3]) {
                        data.cell.styles.fontStyle = 'bold'; // Bold for the total row
                    }
                }
            }
        });

        // Update yPosition for next table
        yPosition = doc.autoTable.previous.finalY + 20; // Adjust space after the table
    }

    doc.save(`Sprawozdanie_z_dzialalnosci_szczegolowe_${Projekt || 'wszystkie'}.pdf`);
};

export default PDF_SzczegoloweDjsonalnosciPracownikow;
