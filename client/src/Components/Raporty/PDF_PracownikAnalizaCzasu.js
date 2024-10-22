import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { notification } from 'antd';

const convertDateFormat = (dateString) => {
    const parts = dateString.split('.');
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
};

const PDF_PracownikAnalizaCzasu = (raport, startDate, endDate, pracownik) => {
    const doc = new jsPDF('landscape', 'pt', 'a4');
    doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Pracownik Analiza czasu - działalność", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    const okresYPosition = 40; 
    doc.text(`Okres: ${startDate} - ${endDate}`, 14, okresYPosition);

    const currentDate = new Date().toLocaleDateString('pl-PL');
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(currentDate, pageWidth - 14, 20, { align: 'right' });

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(14, okresYPosition + 3, pageWidth - 14, okresYPosition + 3);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const employeeData = raport
        .filter(entry => {
            const entryDate = convertDateFormat(entry.Data);
            return entry.PracownikID === pracownik && entryDate >= start && entryDate <= end;
        })
        .reduce((acc, entry) => {
            if (!acc[entry.Pracownik]) {
                acc[entry.Pracownik] = [];
            }
            acc[entry.Pracownik].push(entry);
            return acc;
        }, {});

    let yPosition = 60;

    if (Object.keys(employeeData).length === 0) {
        notification.info({
            message: 'Informacja',
            description: 'Brak danych dla wybranego pracownika w wybranym okresie',
            placement: 'topRight',
        });
        return;
    }

    Object.entries(employeeData).forEach(([employee, entries]) => {
        doc.setFontSize(14);
        doc.text(employee, 14, yPosition);
        yPosition += 10;

        const tableData = entries.reduce((acc, entry) => {
            const existingProject = acc.find(row => row[0] === entry.Projekt);
            if (existingProject) {
                existingProject[1] += parseFloat(entry.GodzinyPrzepracowane);
            } else {
                acc.push([entry.Projekt, parseFloat(entry.GodzinyPrzepracowane)]);
            }
            return acc;
        }, []);

        tableData.sort((a, b) => b[1] - a[1]);

        const totalHours = tableData.reduce((sum, row) => sum + row[1], 0);
        tableData.push(["Razem ", totalHours.toFixed(2)]);

        doc.autoTable({
            startY: yPosition,
            head: [['Projekty', 'Godziny']],
            body: tableData,
            theme: 'grid',
            headStyles: { 
                fillColor: [238, 238, 223, 255], 
                textColor: [0, 0, 0], 
                lineColor: [0, 0, 0], 
                font: 'Roboto'
            },
            styles: { 
                cellPadding: 3,
                fontSize: 11,
                halign: 'center',
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                font: 'Roboto'
            },
            columnStyles: {
                0: { cellWidth: 200, halign: 'left', overflow: 'linebreak' },
                1: { cellWidth: 60, halign: 'right' }
            },
            margin: { horizontal: 10, top: 10 },
            tableWidth: 'auto', 
            didDrawCell: (data) => {
                if (data.section === 'body' && data.row.index === tableData.length - 1) {
                    doc.setFont("Roboto");
                }
            }
        });
        
        yPosition = doc.lastAutoTable.finalY + 10;

        if (yPosition > doc.internal.pageSize.height - 20) {
            doc.addPage();
            yPosition = 20; 
        }
    });

    const bottomYPosition = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(14, bottomYPosition, pageWidth - 14, bottomYPosition);

    const pageNumber = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageNumber; i++) {
        doc.setPage(i);
        doc.text(`Strona ${i} z ${pageNumber}`, pageWidth - 14, bottomYPosition + 15, { align: 'right' });
    }

    doc.save("Pracownik_Analiza_Czasu.pdf");
};

export default PDF_PracownikAnalizaCzasu;
