// Scorebord voor de spelletjes (Fladderfeest, Orkenstorm 3D, ...). Plak dit in Extensies > Apps Script van een
// Google Spreadsheet en implementeer het als web-app (Uitvoeren als: ik, Toegang: iedereen).
// Insturen: ?actie=opslaan&naam=..&onderdeel=..&modus=..&score=..
// Opvragen: zonder actie; met ?spel=ork3d alleen de lijsten van Orkenstorm 3D, anders die van Fladderfeest.
// Onderdelen met "tijd" in de naam zijn snelste tijden (laag is beter), de rest is hoog is beter.
// Leerhoek (deweef/leren, leerlog.js): POST ?actie=leer&naam=ben|dana&vak=..&min=..&wat=..&stand=.. schrijft een regel
// in tabblad 'Leerhoek'. Dat tabblad wordt nooit teruggegeven: alleen te zien door de spreadsheet zelf te openen.
// Na het aanpassen: Implementeren > Implementaties beheren > potlood > Versie: Nieuwe versie (dan blijft de URL gelijk).

function blad() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let b = ss.getSheetByName('Scores');
  if (!b) { b = ss.insertSheet('Scores'); b.appendRow(['Datum', 'Naam', 'Onderdeel', 'Modus', 'Score']); b.setFrozenRows(1); }
  return b;
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.actie === 'opslaan') {
    const naam = String(p.naam || '').replace(/[<>]/g, '').trim().slice(0, 16);
    const onderdeel = String(p.onderdeel || ''), modus = String(p.modus || '');
    const score = Math.floor(Number(p.score));
    if (naam && /^[a-z0-9_]{1,40}$/.test(onderdeel) && /^[a-z]{1,16}$/.test(modus) && score > 0 && score < 1000000) {
      const lock = LockService.getScriptLock(); lock.waitLock(5000);
      try { blad().appendRow([new Date(), naam, onderdeel, modus, score]); } finally { lock.releaseLock(); }
    }
  }
  return lijsten(p.spel || '');
}

// per onderdeel en modus de top 10, met per naam alleen de beste score
function lijsten(spel) {
  const rijen = blad().getDataRange().getValues().slice(1);
  const groepen = {};
  for (const [, naam, onderdeel, modus, score] of rijen) {
    const o = String(onderdeel);
    const vanOrk = o.indexOf('ork3d_') === 0;
    if ((spel === 'ork3d') !== vanOrk) continue;
    const sleutel = o + '_' + modus, laag = o.indexOf('tijd') >= 0, s = Number(score);
    const g = groepen[sleutel] || (groepen[sleutel] = { laag, beste: {} });
    const oud = g.beste[naam];
    if (oud === undefined || (laag ? s < oud : s > oud)) g.beste[naam] = s;
  }
  const uit = {};
  for (const sleutel in groepen) {
    const g = groepen[sleutel];
    uit[sleutel] = Object.entries(g.beste).sort((a, b) => (g.laag ? a[1] - b[1] : b[1] - a[1])).slice(0, 10).map(([naam, score]) => ({ naam, score }));
  }
  return ContentService.createTextOutput(JSON.stringify(uit)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- Leerhoek: geheim logboek van wat Ben en Dana oefenen ----------
function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.actie === 'leer') leerRegel(p);
  return ContentService.createTextOutput('ok');
}

function leerRegel(p) {
  const naam = String(p.naam || ''), vak = String(p.vak || ''), min = Math.round(Number(p.min) * 10) / 10;
  if (!/^(ben|dana)$/.test(naam) || !/^[a-z0-9-]{1,30}$/.test(vak) || !(min >= 0 && min <= 300)) return;
  const tekst = (v) => String(v || '').replace(/[<>=]/g, '').slice(0, 200).replace(/^([+\-@])/, "'$1"); // nooit als formule lezen
  const lock = LockService.getScriptLock(); lock.waitLock(5000);
  try { leerBlad().appendRow([new Date(), naam === 'ben' ? 'Ben' : 'Dana', vak, min, tekst(p.wat), tekst(p.stand)]); }
  finally { lock.releaseLock(); }
}

function leerBlad() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let b = ss.getSheetByName('Leerhoek');
  if (!b) {
    b = ss.insertSheet('Leerhoek');
    b.appendRow(['Datum', 'Naam', 'Vak', 'Minuten', 'Wat gedaan', 'Stand']); b.setFrozenRows(1);
    b.getRange('A:A').setNumberFormat('dd-mm-yyyy hh:mm');
    const o = ss.insertSheet('Leerhoek overzicht');
    o.getRange('A1').setValue('Afgelopen 7 dagen');
    o.getRange('A2').setFormula('=IFERROR(QUERY(Leerhoek!A2:F,"select B, C, sum(D), count(D), max(A) where A >= date \'"&TEXT(TODAY()-7,"yyyy-mm-dd")&"\' group by B, C order by B, sum(D) desc label sum(D) \'Minuten\', count(D) \'Keren\', max(A) \'Laatst\'",0),"nog niets")');
    o.getRange('H1').setValue('Alles');
    o.getRange('H2').setFormula('=IFERROR(QUERY(Leerhoek!A2:F,"select B, C, sum(D), count(D), max(A) group by B, C order by B, sum(D) desc label sum(D) \'Minuten\', count(D) \'Keren\', max(A) \'Laatst\'",0),"nog niets")');
  }
  return b;
}
