// Scorebord voor de spelletjes (Fladderfeest, Orkenstorm 3D, ...). Plak dit in Extensies > Apps Script van een
// Google Spreadsheet en implementeer het als web-app (Uitvoeren als: ik, Toegang: iedereen).
// Insturen: ?actie=opslaan&naam=..&onderdeel=..&modus=..&score=..
// Opvragen: zonder actie; met ?spel=ork3d alleen de lijsten van Orkenstorm 3D, anders die van Fladderfeest.
// Onderdelen met "tijd" in de naam zijn snelste tijden (laag is beter), de rest is hoog is beter.
// Leerhoek (deweef/leren, leerlog.js): POST ?actie=leer&naam=ben|dana&vak=..&min=..&wat=..&stand=.. schrijft een regel
// in tabblad 'Leerhoek'. Dat tabblad wordt nooit teruggegeven: alleen te zien door de spreadsheet zelf te openen.
// Scores-app (spelletjes/scores/): ?actie=ouder&sleutel=.. geeft alle scores en het leerlogboek, ?actie=wis&sleutel=..&rij=..
// &naam=..&score=.. wist een score. De eerste sleutel die ooit gebruikt wordt, wordt de vaste sleutel (Script-eigenschap
// OUDER_SLEUTEL; wis die eigenschap in Projectinstellingen om opnieuw te beginnen).
// Na het aanpassen: Implementeren > Implementaties beheren > potlood > Versie: Nieuwe versie (dan blijft de URL gelijk).

function blad() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let b = ss.getSheetByName('Scores');
  if (!b) { b = ss.insertSheet('Scores'); b.appendRow(['Datum', 'Naam', 'Onderdeel', 'Modus', 'Score']); b.setFrozenRows(1); }
  return b;
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.actie === 'ouder' || p.actie === 'wis') return ouder(p);
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
  if (!/^(ben|dana|ouder)$/.test(naam) || !/^[a-z0-9-]{1,30}$/.test(vak) || !(min >= 0 && min <= 300)) return;
  const tekst = (v) => String(v || '').replace(/[<>=]/g, '').slice(0, 200).replace(/^([+\-@])/, "'$1"); // nooit als formule lezen
  const lock = LockService.getScriptLock(); lock.waitLock(5000);
  try { leerBlad().appendRow([new Date(), { ben: 'Ben', dana: 'Dana', ouder: 'Ouder' }[naam], vak, min, tekst(p.wat), tekst(p.stand)]); }
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

// ---------- Scores-app voor de ouder: alles zien en rare scores wissen ----------
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function ouder(p) {
  const props = PropertiesService.getScriptProperties(), sleutel = String(p.sleutel || '');
  let goed = props.getProperty('OUDER_SLEUTEL'), nieuw = false;
  if (!goed && sleutel.length >= 6) { props.setProperty('OUDER_SLEUTEL', sleutel); goed = sleutel; nieuw = true; }
  if (!goed || sleutel !== goed) { Utilities.sleep(1000); return json({ fout: 'sleutel' }); }
  if (p.actie === 'wis') {
    const b = blad(), rij = Math.floor(Number(p.rij));
    const lock = LockService.getScriptLock(); lock.waitLock(5000);
    try {
      if (rij < 2 || rij > b.getLastRow()) return json({ fout: 'veranderd' });
      const r = b.getRange(rij, 1, 1, 5).getValues()[0];
      if (String(r[1]) !== String(p.naam) || String(r[4]) !== String(p.score)) return json({ fout: 'veranderd' });
      b.deleteRow(rij);
    } finally { lock.releaseLock(); }
  }
  const datum = (d) => (d instanceof Date ? d.toISOString() : String(d));
  const sc = blad().getDataRange().getValues().map((r, i) => [i + 1, datum(r[0]), r[1], r[2], r[3], r[4]]).slice(1).slice(-1000);
  const lb = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leerhoek');
  const lr = lb ? lb.getDataRange().getValues().slice(1).slice(-1500).map((r) => [datum(r[0]), r[1], r[2], r[3], r[4], r[5]]) : [];
  return json({ nieuw, scores: sc, leer: lr });
}
