// Scorebord voor Fladderfeest. Plak dit in Extensies > Apps Script van een Google Spreadsheet
// en implementeer het als web-app (Uitvoeren als: ik, Toegang: iedereen).
// Het spel stuurt scores met ?actie=opslaan&naam=..&onderdeel=..&modus=..&score=.. en vraagt de lijsten op zonder actie.

const ONDERDELEN = ['tocht', 'roodborst', 'meeuw', 'hommel', 'kip', 'kraai', 'papegaai', 'pinguin'];
const MODI = ['gewoon', 'streken'];

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
    const score = Math.floor(Number(p.score));
    if (naam && ONDERDELEN.includes(p.onderdeel) && MODI.includes(p.modus) && score > 0 && score < 5000) {
      const lock = LockService.getScriptLock(); lock.waitLock(5000);
      try { blad().appendRow([new Date(), naam, p.onderdeel, p.modus, score]); } finally { lock.releaseLock(); }
    }
  }
  return lijsten();
}

// per onderdeel en modus de top 10, met per naam alleen de beste score
function lijsten() {
  const rijen = blad().getDataRange().getValues().slice(1);
  const uit = {};
  for (const o of ONDERDELEN) for (const m of MODI) {
    const beste = {};
    for (const [, naam, oo, mm, score] of rijen) if (oo === o && mm === m && (!beste[naam] || score > beste[naam])) beste[naam] = Number(score);
    uit[o + '_' + m] = Object.entries(beste).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([naam, score]) => ({ naam, score }));
  }
  return ContentService.createTextOutput(JSON.stringify(uit)).setMimeType(ContentService.MimeType.JSON);
}
