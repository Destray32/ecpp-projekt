// src/Components/Raporty/PDF_PracownikAnalizaCzasu.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { notification } from 'antd';

const convertDateFormat = (dateString) => {
  const [datePart] = dateString.split(' ');
  const [d, m, y] = datePart.split('.');
  return new Date(`${y}-${m}-${d}`);
};

const PDF_PracownikAnalizaCzasu = (raport, startDate, endDate, pracownik) => {
  // lista unikalnych ID
  const allIds = Array.from(new Set(raport.map(r => r.PracownikID)));
  const targetIds = pracownik ? [pracownik] : allIds;

  const doc = new jsPDF('landscape', 'pt', 'a4');
  doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.setFont('Roboto');

  targetIds.forEach((id, idx) => {
    if (idx > 0) doc.addPage();

    // dane konkretnego pracownika
    const entries = raport.filter(e =>
      e.PracownikID === id &&
      (() => {
        const dt = convertDateFormat(e.Data);
        return dt >= new Date(startDate) && dt <= new Date(endDate);
      })()
    );
    if (!entries.length) {
      if (pracownik || idx === 0) {
        notification.info({
          message: 'Informacja',
          description: `Brak danych dla pracownika ID=${id}`,
          placement: 'topRight',
        });
      }
      return;
    }

    const nameSurname = entries[0].Pracownik;

    // nagłówek
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text("Pracownik Analiza czasu - działalność", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Pracownik: ${nameSurname}`, 14, 40);
    doc.text(`Okres: ${startDate} - ${endDate}`, 14, 56);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(new Date().toLocaleDateString('pl-PL'), pageWidth - 14, 20, { align: 'right' });
    doc.setDrawColor(0,0,0);
    doc.setLineWidth(0.5);
    doc.line(14, 60, pageWidth - 14, 60);

    // tabela godzin
    const byProj = entries.reduce((acc, e) => {
      acc[e.Projekt] = (acc[e.Projekt] || 0) + parseFloat(e.GodzinyPrzepracowane);
      return acc;
    }, {});
    const tableData = Object.entries(byProj)
      .map(([proj, hrs]) => [proj, hrs.toFixed(2)])
      .sort((a,b) => parseFloat(b[1]) - parseFloat(a[1]));
    const total = tableData.reduce((s, r) => s + parseFloat(r[1]), 0);
    tableData.push(["Razem", total.toFixed(2)]);

    doc.autoTable({
      startY: 80,
      head: [['Projekt','Godziny']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor:[238,238,223], textColor:[0,0,0], font:'Roboto' },
      styles: { cellPadding:4, fontSize:11, halign:'center', font:'Roboto' },
      columnStyles: { 0:{halign:'left'}, 1:{halign:'right'} },
      margin: { left:14, right:14 }
    });

    // stopka
    const bottom = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(0,0,0);
    doc.line(14, bottom, pageWidth - 14, bottom);
    const pages = doc.internal.getNumberOfPages();
    for (let p=1; p<=pages; p++){
      doc.setPage(p);
      doc.text(`Strona ${p} z ${pages}`, pageWidth - 14, bottom + 15, { align:'right' });
    }
  });

  const fileName = pracownik
    ? "Pracownik_Analiza_Czasu.pdf"
    : "Pracownicy_Analiza_Czasu.pdf";
  doc.save(fileName);
};

export default PDF_PracownikAnalizaCzasu;
