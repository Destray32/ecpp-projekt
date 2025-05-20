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
    if (itm.pracownikId) acc[itm.grupaId].workers.push({ name:`${itm.imie} ${itm.nazwisko}`, m: itm.m_value });
    if (itm.pojazdId)    acc[itm.grupaId].vehicles.push({ name: itm.pojazd,              m: itm.m_value });
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
    yPos += 20;

    // tytuł grupy
    doc.setFont('OpenSansB','bold').setFontSize(18).setTextColor(0,0,0);
    doc.text(name, marginL, yPos);
    doc.setFont('OpenSans','normal');
    yPos += 20;

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

    if (byM[mKey]?.p.length) {
        safeWrap(`${mKey}, ${byM[mKey].p.join(', ')}`);
    }

    if (byM[sKey]?.c.length) {
        doc.setTextColor(0, 102, 204);
        safeWrap(`${sKey}, ${byM[sKey].c.join(', ')}`);
        doc.setTextColor(0, 0, 0);
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
