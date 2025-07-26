// src/Components/Raporty/PDF_AnalizaSwiadczenPracowniczych.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { notification } from 'antd';

import axios from 'axios';
const baseUrl = process.env.REACT_APP_BASE_URL;


const PDF_AnalizaSwiadczenPracowniczych = async (raport, startDate, endDate, pracownik) => {
  let cennikData = [];
  try {
    const response = await axios.get(`${baseUrl}/api/cennik`, { withCredentials: true });
    cennikData = response.data;
    // console.log('Pobrano dane cennika:', cennikData);
  } catch (err) {
    notification.error({
      message: 'Błąd',
      description: 'Nie udało się pobrać danych cennika',
      placement: 'topRight',
    });
    return;
  }

  // Funkcja pomocnicza do pobierania stawek
  function getStawki(pracownikId, grupaUrlopowaId) {
    const entry = cennikData.find(e => e.idPracownik === pracownikId && e.idGrupa_urlopowa === grupaUrlopowaId);
    const stawkaGodzinowa = entry?.stawka_indywidualna ?? entry?.stawka_globalna ?? 0;
    const stawkaZa1km = entry?.Stawka ?? 0;
    return { stawkaGodzinowa, stawkaZa1km };
  }

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
    doc.setLineWidth(0.5);
    doc.line(14,60, pageWidth - 14,60);

    // Grupowanie i sumowanie danych
    // Jeśli masz stawki indywidualne/globalne, pobierz je tutaj
    // Przykład: const stawkaIndywidualna = ...
    let totalHours = 0, totalKm = 0, totalParking = 0, totalDiety = 0, totalKoszty = 0, totalSum = 0;
    const tableData = entries.map(e => {
      // Pobierz stawki dla danego wpisu
      let grupaUrlopowaId = e.idGrupa_urlopowa;
      if (!grupaUrlopowaId) {
        // Spróbuj znaleźć idGrupa_urlopowa po Zleceniodawcy
        const found = cennikData.find(c => c.Zleceniodawca === e.Zleceniodawca && c.idPracownik === e.PracownikID);
        grupaUrlopowaId = found?.idGrupa_urlopowa;
      }

      // Pobierz stawki
      const stawki = getStawki(e.PracownikID, grupaUrlopowaId);
      const stawkaGodzinowa = parseFloat(stawki.stawkaGodzinowa) || 0;
      const stawkaKm = parseFloat(stawki.stawkaZa1km) || 0;

      // Oblicz wartości
      const godziny = parseFloat(e.GodzinyPrzepracowane) || 0;
      const km = parseFloat(e.Kilometry) || 0;
      const parking = parseFloat(e.Parking) || 0;
      const diety = parseFloat(e.Diety) || 0;
      const koszty = parseFloat(e.Inne_koszty) || 0;
      const suma = (godziny * stawkaGodzinowa) + (km * stawkaKm) + parking + diety + koszty;

      // Sumuj wartości
      totalHours += godziny;
      totalKm += km;
      totalParking += parking;
      totalDiety += diety;
      totalKoszty += koszty;
      totalSum += suma;

      return [
        `${nameSurname} (${id})`,
        godziny.toFixed(2),
        stawkaGodzinowa.toFixed(2),
        km.toFixed(2),
        parking.toFixed(2),
        diety.toFixed(2),
        koszty.toFixed(2),
        suma.toFixed(2)
      ];
    });

    // Suma
    tableData.push([
      'Suma:',
      totalHours.toFixed(2),
      '',
      totalKm.toFixed(2),
      totalParking.toFixed(2),
      totalDiety.toFixed(2),
      totalKoszty.toFixed(2),
      totalSum.toFixed(2)
    ]);

    doc.autoTable({
      startY: 80,
      head: [['Pracownik','Godziny','1h=kr','Kilometry','Parking','Diety','Inne koszty','Suma']],
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
        1: { cellWidth: 80, halign: 'center' },
        2: { cellWidth: 80, halign: 'center' },
        3: { cellWidth: 80, halign: 'center' },
        4: { cellWidth: 80, halign: 'center' },
        5: { cellWidth: 80, halign: 'center' },
        6: { cellWidth: 80, halign: 'center' },
        7: { cellWidth: 80, halign: 'center' }
      },
      margin: { horizontal: 10, top: 10, left: 30, right: 30 },
      tableWidth: 'auto',
    });

    // stopka
    const bottom = doc.internal.pageSize.getHeight() - 30;
    doc.setDrawColor(0,0,0);
    doc.setLineWidth(0.5);
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
