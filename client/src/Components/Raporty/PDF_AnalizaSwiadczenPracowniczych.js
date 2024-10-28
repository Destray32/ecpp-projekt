import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { notification } from 'antd';

const PDF_AnalizaSwiadczenPracowniczych = (raport, startDate, endDate, pracownik) => {
    const doc = new jsPDF('landscape', 'pt', 'a4');
    doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
    };

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Analiza świadczeń pracowniczych", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    const okresYPosition = 40; 
    doc.text(`Okres: ${formattedStartDate} - ${formattedEndDate}`, 14, okresYPosition);

    const currentDate = new Date().toLocaleDateString('pl-PL');
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(currentDate, pageWidth - 14, 20, { align: 'right' });

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(14, okresYPosition + 3, pageWidth - 14, okresYPosition + 3);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const employeeEntries = raport.filter(entry => {
        const entryDate = new Date(entry.Data.split('.').reverse().join('-'));
        return entry.PracownikID === pracownik && entryDate >= start && entryDate <= end;
    });

    if (employeeEntries.length === 0) {
        notification.info({
            message: 'Informacja ',
            description: 'Brak danych dla wybranego pracownika w wybranym okresie',
            placement: 'topRight',
        });
        return;
    }

    const totalData = employeeEntries.reduce((acc, entry) => {
        acc.totalHours += parseFloat(entry.GodzinyPrzepracowane);
        acc.totalDiety += parseFloat(entry.Diety) || 0;
        acc.totalInneKoszty += parseFloat(entry.Inne_koszty) || 0;
        acc.totalSum = acc.totalHours * 104.50;
        return acc;
    }, { totalHours: 0, totalDiety: 0, totalInneKoszty: 0, totalSum: 0 });

    const tableData = [
        [
            `${employeeEntries[0].Pracownik} (${pracownik})`,
            totalData.totalHours.toFixed(2),
            "104.50",
            totalData.totalDiety.toFixed(2),
            totalData.totalInneKoszty.toFixed(2),
            totalData.totalSum.toFixed(2)
        ]
    ];

    doc.autoTable({
        startY: 60,
        head: [['Pracownik', 'Godziny', '1h=kr', 'Diety', 'Inne koszty', 'Suma']],
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
            0: { cellWidth: 172, halign: 'center', overflow: 'linebreak' },
            1: { cellWidth: 130, halign: 'center' },
            2: { cellWidth: 130, halign: 'center' },
            3: { cellWidth: 130, halign: 'center' },
            4: { cellWidth: 130, halign: 'center' },
            5: { cellWidth: 130, halign: 'center' }
        },
        
        margin: { horizontal: 10, top: 10, left: 30, right: 30 },
        tableWidth: 'auto',
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

    doc.save("Analiza_świadczeń_pracowniczych.pdf");
};

export default PDF_AnalizaSwiadczenPracowniczych;
