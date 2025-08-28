import jsPDF from 'jspdf';
import 'jspdf-autotable';

import openSansBold from '../../fonts/open-sans/OpenSans-Bold.ttf';
import openSansReg  from '../../fonts/open-sans/OpenSans-Regular.ttf';

const getWeekNumber = (date) => {
  const d         = new Date(date);
  const startYear = new Date(d.getFullYear(), 0, 1);
  const days      = Math.floor((d - startYear) / (1000 * 60 * 60 * 24));
  return Math.ceil((days + ((startYear.getDay() + 1) % 7)) / 7);
};

const PDF_Drukujgrupe = (data, startDate, endDate) => {
  const doc      = new jsPDF('portrait','pt','a4');
  const pageH    = doc.internal.pageSize.height - 40;
  const marginL  = 20;
  const maxW     = doc.internal.pageSize.width - marginL*2;
  const topY     = 60;                    
  let   yPos     = 80;
  let   separatorDrawn = false;

  doc.addFont(openSansBold,'OpenSansB','bold');
  doc.addFont(openSansReg, 'OpenSans','normal');

  // helper do łamania tekstu z kontrolą strony
  const safeWrap = (text, fontSize = 14) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxW);
    for (const line of lines) {
      if (yPos > pageH) {
        doc.addPage();
        yPos = topY;
      }
      doc.text(line, marginL, yPos);
      yPos += fontSize + 2;
    }
  };

  // nagłówek (rok i tydzień)
  const year = new Date(startDate).getFullYear();
  const wn   = getWeekNumber(startDate);
  doc.setFont('OpenSans','normal').setFontSize(14).setTextColor(0,102,204).setLanguage('pl');
  doc.text(`${year}`,    marginL, 40);
  doc.text(`V-${wn}`,     marginL, 60);

  // grupowanie danych
  const groups = data.reduce((acc, itm) => {
    if (!acc[itm.grupaId]) acc[itm.grupaId] = { workers: [], vehicles: [] };
    if (itm.pracownikId) acc[itm.grupaId].workers.push({ name:`${itm.imie} ${itm.nazwisko}`, m: itm.m_value, opis: itm.Opis });
    if (itm.pojazdId)    acc[itm.grupaId].vehicles.push({ name: itm.pojazd, m: itm.m_value });
    return acc;
  }, {});

  // porządek sekcji
  const unique = Object.entries(groups).map(([id, grp]) => {
    const rec = data.find(d=>d.grupaId==id) || {};
    return { id, name: rec.Zleceniodawca||'' };
  });
  const fixed  = ['NCW Plåt','NCC'];
  const others = unique.map(u=>u.name)
                       .filter(n=>!fixed.includes(n) && !['Do dyspozycji','Urlopy','Urlop tacierzyński / L4'].includes(n))
                       .sort();
  const order  = [...fixed, ...others, 'Do dyspozycji','Urlopy','Urlop tacierzyński / L4'];
  unique.sort((a,b)=>order.indexOf(a.name) - order.indexOf(b.name));

  // czy w ogóle są Urlopy?
  const hasUrlopy = unique.some(g=>g.name==='Urlopy');

  // render każdej grupy
  for (const {id, name} of unique) {
    const grp = groups[id];

    // Szacowanie wysokości grupy bez podwójnej deklaracji
    let groupHeight = 120;
    let mCount = 0;
    const tempByM = {};
    grp.workers.forEach(w => {
      const k = w.m || '';
      (tempByM[k] = tempByM[k] || { p: [], c: [] }).p.push(w.name);
    });
    grp.vehicles.forEach(v => {
      const raw = v.m;
      const k = raw ? raw.replace(/^M/, 'S') : '';
      (tempByM[k] = tempByM[k] || { p: [], c: [] }).c.push(v.name);
    });
    Object.keys(tempByM)
      .filter(k => k && /^M\d+$/.test(k))
      .forEach(() => { mCount++; });
    groupHeight += mCount * 48;
    if (yPos + groupHeight > pageH) {
      doc.addPage();
      yPos = topY;
    }

    // separator przed sekcją Urlopy / tacierzyński
    if (!separatorDrawn && (name==='Urlopy' || (!hasUrlopy && name==='Urlop tacierzyński / L4'))) {
      if (yPos > pageH) { doc.addPage(); yPos = topY; }
      yPos += 20;
      doc.setLineWidth(3);
      doc.line(marginL, yPos, doc.internal.pageSize.width-marginL, yPos);
      doc.setDrawColor(0,0,0);
      separatorDrawn = true;
    }

    // przed każdą grupą linia oddzielająca
    if (yPos > pageH) { doc.addPage(); yPos = topY; }
    doc.setLineWidth(0.5)
       .line(marginL, yPos, doc.internal.pageSize.width-marginL, yPos);
    yPos += 20; // Większy odstęp po każdej grupie, by rejestracje nie zlewały się z kolejną sekcją

    // tytuł grupy
    doc.setFont('OpenSansB','bold').setFontSize(18).setTextColor(0,0,0);
    doc.text(name, marginL, yPos);
    doc.setFont('OpenSans','normal');
    yPos += 10;

    // pogrupuj pracowników i pojazdy (zmiana M→S)
    const byM = {};
    grp.workers.forEach(w => {
    const k = w.m || '';
    (byM[k] = byM[k] || { p: [], c: [] }).p.push(w.name);
    });
    grp.vehicles.forEach(v => {
    const raw = v.m;
    const k = raw ? raw.replace(/^M/, 'S') : '';
    // Zamieniamy M→S, żeby pojazdy trzymać pod tym samym numerem co pracownicy
    (byM[k] = byM[k] || { p: [], c: [] }).c.push(v.name);
    });

    // osobno zapisz puste (bez klucza)
    const emptyVehicles = byM['']?.c || [];

    // wypisz dane w kolejności: M1→S1, M2→S2, ..., reszta
    const sortedKeys = Object.keys(byM)
    .filter(k => k && /^M\d+$/.test(k))
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))); // sortuj M1 < M2 < M3

    for (const mKey of sortedKeys) {
      const sKey = mKey.replace(/^M/, 'S');


      // Pracownicy z opisem w jednej linii, opisy na czerwono
      if (byM[mKey]?.p.length) {
        yPos += 8;
        doc.setFont('OpenSansB','bold').setFontSize(14).setTextColor(0,0,0);
        doc.text(`${mKey}:`, marginL, yPos, { baseline: 'top' });
        let x = marginL + doc.getTextWidth(`${mKey}: `);
  // Usunięto etykietę 'Pracownicy:'
        byM[mKey].p.forEach((name, idx) => {
          const worker = grp.workers.find(w => w.name === name && w.m === mKey);
          // Przygotuj tekst osoby (imię nazwisko + ewentualnie opis na czerwono)
          let osobaText = name;
          let opisText = '';
          if (worker && worker.opis && worker.opis.trim() !== '') {
            opisText = ` (${worker.opis})`;
          }
          let osobaWidth = doc.getTextWidth(osobaText);
          let opisWidth = opisText ? doc.getTextWidth(opisText) : 0;
          let commaWidth = (idx < byM[mKey].p.length - 1) ? doc.getTextWidth(', ') : 0;
          // Jeśli nie mieści się w wierszu, łam linię
          if (x + osobaWidth + opisWidth + commaWidth > maxW) {
            yPos += 16;
            if (yPos > pageH) { doc.addPage(); yPos = topY; }
            x = marginL + doc.getTextWidth(`${mKey}: Pracownicy: `);
          }
          doc.setFont('OpenSans','normal').setFontSize(14).setTextColor(0,0,0);
          doc.text(osobaText, x, yPos, { baseline: 'top' });
          x += osobaWidth;
          if (opisText) {
            doc.setFont('OpenSans','normal').setFontSize(14).setTextColor(255,0,0);
            doc.text(opisText, x, yPos, { baseline: 'top' });
            x += opisWidth;
            doc.setTextColor(0,0,0);
          }
          if (idx < byM[mKey].p.length - 1) {
            doc.text(', ', x, yPos, { baseline: 'top' });
            x += commaWidth;
          }
        });
  yPos += 30; // Większy odstęp po sekcji pracowników
      }

      // Pojazdy
      if (byM[sKey]?.c.length) {
  yPos += 12; // Większy odstęp przed sekcją pojazdów
        let x = marginL + doc.getTextWidth(`${sKey}: `);
        doc.setFont('OpenSansB','bold').setFontSize(14).setTextColor(0,102,204);
        doc.text(`${sKey}:`, marginL, yPos, { baseline: 'top' });
        doc.setFont('OpenSans','normal').setFontSize(14).setTextColor(0,102,204);
        doc.text('Pojazdy:', x, yPos, { baseline: 'top' });
        x += doc.getTextWidth('Pojazdy: ');
        byM[sKey].c.forEach((name, idx) => {
          let pojazdWidth = doc.getTextWidth(name);
          let commaWidth = (idx < byM[sKey].c.length - 1) ? doc.getTextWidth(', ') : 0;
          if (x + pojazdWidth + commaWidth > maxW) {
            yPos += 16;
            if (yPos > pageH) { doc.addPage(); yPos = topY; }
            x = marginL + doc.getTextWidth(`${sKey}: Pojazdy: `);
          }
          doc.text(name, x, yPos, { baseline: 'top' });
          x += pojazdWidth;
          if (idx < byM[sKey].c.length - 1) {
            doc.text(', ', x, yPos, { baseline: 'top' });
            x += commaWidth;
          }
        });
        doc.setTextColor(0,0,0);
        yPos += 16;
      }
    }

    // na koniec pojazdy bez klucza
    if (emptyVehicles.length) {
    doc.setTextColor(0, 102, 204);
    safeWrap(emptyVehicles.join(', '));
    doc.setTextColor(0, 0, 0);
    }

    yPos += 20;
  }

  doc.save(`Plan_Grupy_${wn}.pdf`);
};

export default PDF_Drukujgrupe;
