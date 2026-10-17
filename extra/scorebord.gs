// Scorebord voor de spelletjes (Fladderfeest, Orkenstorm 3D, ...). Plak dit in Extensies > Apps Script van een
// Google Spreadsheet en implementeer het als web-app (Uitvoeren als: ik, Toegang: iedereen).
// Insturen: ?actie=opslaan&naam=..&onderdeel=..&modus=..&score=..
// Opvragen: zonder actie; met ?spel=ork3d alleen de lijsten van Orkenstorm 3D, anders die van Fladderfeest.
// Onderdelen met "tijd" in de naam zijn snelste tijden (laag is beter), de rest is hoog is beter.

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
