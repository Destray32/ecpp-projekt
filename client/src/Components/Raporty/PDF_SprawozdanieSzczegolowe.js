import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PDF_SzczegoloweDzialalnosciPracownikow = (data, startDate, endDate, Projekt) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    
    doc.setFont('OpenSans-Regular');
    console.log(data);
    
    let filteredData = Projekt ? data.filter(row => row.ProjektID === Projekt) : data;

    if (startDate && endDate) {
        filteredData = filteredData.filter(row => row.Data >= startDate && row.Data <= endDate);
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Sprawozdanie z działalności - szczegółowe", 40, 40);

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Okres: ${startDate || 'brak'} - ${endDate || 'brak'}`, 40, 60);

    doc.line(40, 70, doc.internal.pageSize.getWidth() - 40, 70);
    let yPosition = 90;

    if (filteredData.length === 0) {
        doc.text("Brak danych do wyświetlenia.", 40, yPosition);
        doc.save(`Sprawozdanie_z_dzialalnosci_szczegolowe_${Projekt || 'wszystkie'}.pdf`);
        return;
    }

    const projectGroups = filteredData.reduce((acc, row) => {
        if (!acc[row.ProjektID]) acc[row.ProjektID] = [];
        acc[row.ProjektID].push(row);
        return acc;
    }, {});

    for (const [projectId, projectData] of Object.entries(projectGroups)) {
        const projectName = projectData[0].Projekt;
        doc.setFontSize(10);
        doc.text(`Projekt: ${projectName}`, 40, yPosition);
        yPosition += 10;
        
        const employeeGroups = projectData.reduce((acc, row) => {
            if (!acc[row.Pracownik]) acc[row.Pracownik] = [];
            acc[row.Pracownik].push(row);
            return acc;
        }, {});

        let totalProjectHours = 0;

        const tableData = Object.entries(employeeGroups).flatMap(([employeeName, employeeData]) => {
            employeeData.sort((a, b) => {
                return new Date(a.Data.split('.').reverse().join('-')) - new Date(b.Data.split('.').reverse().join('-'));
            });
            const rows = employeeData.map((row, index) => {
                const hoursWorked = parseFloat(row.GodzinyPrzepracowane) || 0;
                return [index === 0 ? employeeName : '', row.Data, hoursWorked.toFixed(2), row.Komentarz];
            });

            const totalHours = employeeData.reduce((sum, row) => sum + (parseFloat(row.GodzinyPrzepracowane) || 0), 0);
            totalProjectHours += totalHours;
            rows.push(["Razem:", '', totalHours.toFixed(2), '']);
            return rows;
        });

        const options = {
            startY: yPosition + 20,
            head: [['Pracownik', 'Data', 'Czas', 'Komentarz']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [238, 238, 223], textColor: [0, 0, 0], font: 'OpenSans-Regular', fontStyle: 'normal'},
            styles: { fontSize: 10, cellPadding: 2, font: 'OpenSans-Regular', fontStyle: 'normal' },
            columnStyles: {
             0: { cellWidth: 100 },
             1: { cellWidth: 70 },
             2: { cellWidth: 50, halign: 'right' },
             3: { cellWidth: 150, cellPadding: 2, overflow: 'linebreak' }
             },
            margin: { left: 40, right: 40 },
            didParseCell: (data) => {
                if (data.row.raw[0] === "Razem:") {
                    data.cell.styles.font = 'Helvetica';
                    data.cell.styles.fontStyle = 'Bold';
                }
            },
            pageBreak: 'auto'
        };

        doc.autoTable(options);
        yPosition = doc.autoTable.previous.finalY + 10;
        doc.setFontSize(15);
        doc.setFont('Helvetica', 'Bold'); 
        doc.text(`Total dla projektu: ${totalProjectHours.toFixed(2)} h`, 40, yPosition + 10);
        yPosition += 20;
    }

    doc.save(`Sprawozdanie_z_dzialalnosci_szczegolowe_${Projekt || 'wszystkie'}.pdf`);
};

export default PDF_SzczegoloweDzialalnosciPracownikow;
