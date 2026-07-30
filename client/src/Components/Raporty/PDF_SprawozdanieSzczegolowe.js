import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PDF_SzczegoloweDzialalnosciPracownikow = async (data, startDate, endDate, Projekt, zleceniodawcaMapping, returnBytes = false) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    
    doc.setFont('OpenSans-Regular');
    
    let filteredData = Projekt ? data.filter(row => row.ProjektID === Projekt) : data;

    if (startDate && endDate) {
        filteredData = filteredData.filter(row => {
            const datePart = row.Data.split(' ')[0];
            const [day, month, year] = datePart.split('.');
            const rowDate = new Date(`${year}-${month}-${day}`); 
            
            return rowDate >= new Date(startDate) && rowDate <= new Date(endDate);
        });
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

    // Track which project we're processing
    let projectCounter = 0;
    const projectCount = Object.keys(projectGroups).length;

    for (const [projectId, projectData] of Object.entries(projectGroups)) {
        // Add a new page for each project except the first one
        if (projectCounter > 0) {
            doc.addPage();
            
            // Reset position and add header for the new page
            yPosition = 40;
            // doc.setFontSize(14);
            // doc.setTextColor(0, 102, 204);
            // doc.text("Sprawozdanie z działalności - szczegółowe", 40, yPosition);
            yPosition += 20;
            
            doc.setFontSize(12);
            doc.setTextColor(50, 50, 50);
            doc.text(`Okres: ${startDate || 'brak'} - ${endDate || 'brak'}`, 40, yPosition);
            yPosition += 10;
            
            doc.line(40, yPosition, doc.internal.pageSize.getWidth() - 40, yPosition);
            yPosition += 20;
        }
        
        projectCounter++;
        
        const projectName = projectData[0].Projekt;
        const zleceniodawca = zleceniodawcaMapping[projectId] || '';

        doc.setFontSize(10);

        // dodawanie zleceniodawcy i nazwy projektu
        if (zleceniodawca) {
            doc.text(`${zleceniodawca} / ${projectName}`, 40, yPosition);
        } else {
            doc.text(`${projectName}`, 40, yPosition);
        }
        yPosition += 10;
        
        const employeeGroups = projectData.reduce((acc, row) => {
            if (!acc[row.Pracownik]) acc[row.Pracownik] = [];
            acc[row.Pracownik].push(row);
            return acc;
        }, {});

        let totalProjectHours = 0, totalProjectMinutes = 0;
        // Dla każdego pracownika tworzona jest oddzielna tabela
        for (const [employeeName, employeeData] of Object.entries(employeeGroups)) {
            // Sortowanie danych dla danego pracownika
            employeeData.sort((a, b) => {
                return new Date(a.Data.split('.').reverse().join('-')) - new Date(b.Data.split('.').reverse().join('-'));
            });
            
            // Budowanie wierszy z nazwą pracownika w pierwszej kolumnie
            let empH = 0, empM = 0;
            const rows = employeeData.map((row, index) => {
                let godziny = row.GodzinyPrzepracowane;
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
                empH += h;
                empM += m;
                // Imię i nazwisko tylko w pierwszym wierszu dla tego pracownika
                const employeeNameCell = index === 0 ? employeeName : '';
                return [employeeNameCell, row.Data, `${h}:${m.toString().padStart(2, '0')}`, row.Komentarz];
            });
            // --- nie normalizuj empH/empM tutaj ---
            totalProjectHours += empH;
            totalProjectMinutes += empM;
            // Normalizacja tylko do wyświetlenia sumy dla pracownika
            let normEmpH = empH + Math.floor(empM / 60);
            let normEmpM = empM % 60;
            rows.push(["Razem:", "", `${normEmpH}:${normEmpM.toString().padStart(2, '0')}`, ""]);
            
            const options = {
                startY: yPosition + 20,
                head: [['Pracownik', 'Data', 'Czas', 'Komentarz']],
                body: rows,
                theme: 'grid',
                headStyles: { fillColor: [238, 238, 223], textColor: [0, 0, 0], font: 'OpenSans-Regular', fontStyle: 'normal'},
                styles: { fontSize: 10, cellPadding: 2, font: 'OpenSans-Regular', fontStyle: 'normal' },
                columnStyles: {
                    0: { cellWidth: 80 },
                    1: { cellWidth: 70 },
                    2: { cellWidth: 50, halign: 'right' },
                    3: { cellWidth: 'auto', cellPadding: 2, overflow: 'linebreak' }
                },
                margin: { left: 40, right: 40 },
                didParseCell: (data) => {
                    if (data.row.raw[0] === "Razem:") {
                        data.cell.styles.font = 'Helvetica';
                        data.cell.styles.fontStyle = 'Bold';
                    }
                    if (data.column.index === 0 && data.row.index > 0 && data.row.raw[0] === '') {
                        data.cell.styles.fillColor = [248, 248, 248]; // jasniejsze tło dla pustych komórek
                    }
                },
                pageBreak: 'auto'
            };

            doc.autoTable(options);
            yPosition = doc.autoTable.previous.finalY + 20;
        }
        // Normalizacja sumy projektu
        totalProjectHours += Math.floor(totalProjectMinutes / 60);
        totalProjectMinutes = totalProjectMinutes % 60;
        doc.setFontSize(15);
        doc.setFont('Helvetica', 'Bold'); 
        doc.text(`Total dla projektu: ${totalProjectHours}:${totalProjectMinutes.toString().padStart(2, '0')} h`, 40, yPosition);
        yPosition += 40;
    }

    if (returnBytes) {
        return doc.output('arraybuffer');
    }
    doc.save(`Sprawozdanie_z_dzialalnosci_szczegolowe_${Projekt || 'wszystkie'}.pdf`);
};

export default PDF_SzczegoloweDzialalnosciPracownikow;