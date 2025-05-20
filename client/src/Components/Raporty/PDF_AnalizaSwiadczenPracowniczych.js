// src/Components/Raporty/PDF_AnalizaSwiadczenPracowniczych.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { notification } from 'antd';

const PDF_AnalizaSwiadczenPracowniczych = (raport, startDate, endDate, pracownik) => {
  const allIds = Array.from(new Set(raport.map(r => r.PracownikID)));
  const targetIds = pracownik ? [pracownik] : allIds;

  const doc = new jsPDF('landscape','pt','a4');
  doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf','Roboto','normal');
  doc.setFont('Roboto');

  targetIds.forEach((id, idx) => {
    if (idx > 0) doc.addPage();

    const entries = raport.filter(e =>
      e.PracownikID === id &&
      (() => {
        const [d,m,y] = e.Data.split('.');
        const dt = new Date(`${y}-${m}-${d}`);
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
    doc.setTextColor(0,102,204);
    doc.text("Analiza świadczeń pracowniczych",14,20);
    doc.setFontSize(12);
    doc.setTextColor(50,50,50);
    doc.text(`Pracownik: ${nameSurname}`,14,40);
    const fmt = d => {
      const dt = new Date(d);
      return [dt.getDate(), dt.getMonth()+1, dt.getFullYear()]
        .map(n=>String(n).padStart(2,'0')).join('-');
    };
    doc.text(`Okres: ${fmt(startDate)} - ${fmt(endDate)}`,14,56);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(new Date().toLocaleDateString('pl-PL'), pageWidth - 14,20, { align:'right' });
    doc.setDrawColor(0,0,0);
    doc.line(14,60, pageWidth - 14,60);

    // obliczenia
    const totals = entries.reduce((a,e) => {
      a.hours += +e.GodzinyPrzepracowane;
      a.diety += +e.Diety || 0;
      a.koszty += +e.Inne_koszty || 0;
      return a;
    }, { hours:0, diety:0, koszty:0 });
    totals.sum = totals.hours * 104.50;

    const body = [[
      `${nameSurname} (${id})`,
      totals.hours.toFixed(2),
      "104.50",
      totals.diety.toFixed(2),
      totals.koszty.toFixed(2),
      totals.sum.toFixed(2)
    ]];

    doc.autoTable({
      startY: 80,
      head: [['Pracownik','Godziny','1h=kr','Diety','Inne koszty','Suma']],
      body,
      theme: 'grid',
      headStyles: { fillColor:[238,238,223], textColor:[0,0,0], font:'Roboto' },
      styles: { cellPadding:3, fontSize:11, halign:'center', font:'Roboto' },
      columnStyles: {
        0:{halign:'left'},
        1:{halign:'center'},
        2:{halign:'center'},
        3:{halign:'center'},
        4:{halign:'center'},
        5:{halign:'center'}
      },
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
    ? "Analiza_świadczeń_pracowniczych.pdf"
    : "Analiza_świadczeń_Pracowniczych_WSZYSCY.pdf";
  doc.save(fileName);
};

export default PDF_AnalizaSwiadczenPracowniczych;
