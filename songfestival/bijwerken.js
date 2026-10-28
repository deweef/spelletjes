// Gebruik: WW=<wachtwoord> node bijwerken.js <geheim.js> <nieuw.tsv> <ids.tsv>
// nieuw.tsv: jaar, land, vlag, artiest, titel, won(1/0); ids.tsv: "titel<TAB>spotify-id" (titel precies als in nieuw.tsv).
const fs = require('fs'); const [pad, nieuwPad, idsPad] = process.argv.slice(2);
const src = fs.readFileSync(pad, 'utf8');
globalThis.GEHEIM = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
const SLOT = require(require('path').dirname(require('path').resolve(pad)) + '/slot.js');
(async () => {
  const K = await SLOT.sleutel(process.env.WW); const lijst = await SLOT.lijst(K);
  const ids = Object.fromEntries(fs.readFileSync(idsPad, 'utf8').trim().split('\n').map((r) => r.split('\t')));
  let id = Math.max(...lijst.map((l) => l.id)); const ontbreekt = [];
  for (const r of fs.readFileSync(nieuwPad, 'utf8').trim().split('\n')) {
    const [jaar, land, vlag, artiest, titel, won] = r.split('\t');
    if (lijst.some((l) => l.titel.toLowerCase() == titel.toLowerCase() && l.jaar == jaar)) { console.log('al aanwezig:', titel); continue; }
    if (!ids[titel]) { ontbreekt.push(titel); continue; }
    lijst.push({ id: ++id, jaar: +jaar, land, vlag, artiest, titel, spotify: ids[titel], won: won == '1' });
  }
  if (ontbreekt.length) console.log('GEEN ID (overgeslagen):', ontbreekt.join('; '));
  const uit = { aantal: lijst.length, lijst: await SLOT.dicht(K, lijst), sleutel: GEHEIM.sleutel };
  fs.writeFileSync(pad, '// De liedjes, versleuteld (zie slot.js). Niet met de hand aanpassen.\nconst GEHEIM = ' + JSON.stringify(uit) + ';\n');
  console.log('klaar:', lijst.length, 'liedjes, hoogste id', id);
})();
