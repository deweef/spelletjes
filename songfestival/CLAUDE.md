# Songfestival-hits (`songfestival/`)

Stand en volgende stap: `songfestival/PLAN.md`.

Songfestival-hits (`songfestival/`, op de startpagina als concept sinds 29 okt 2026; tegel `songfestival.jpg` is met PIL getekend, mag met Gemini mooier): zelfgeprinte kaartjes in Hitster-stijl (die naam niet op de site
gebruiken, is een merk). De liedjes zijn geheim: `geheim.js` = `GEHEIM` met de lijst versleuteld (AES-GCM, `slot.js`) met een vaste
sleutel die in elke QR-code achter het # staat (`?k=<id>#<sleutel>`), plus diezelfde sleutel versleuteld met het wachtwoord (PBKDF2) voor de
printpagina. Het wachtwoord staat nergens in de repo; Marcel weet het. Lijst aanpassen: in `kaartjes.html` openen met het wachtwoord,
of in Node met `SLOT.sleutel(ww)` + `SLOT.lijst(K)`; daarna opnieuw versleutelen met DEZELFDE sleutel (anders werken geprinte kaartjes niet
meer); `bijwerken.js` doet dat voor nieuwe liedjes uit een tsv (uitleg in de kop); `GEHEIM.wachtrij` = nog niet gekoppelde track-id's uit Dana's lijst, ook versleuteld: lijst-items { id, jaar, land, vlag, artiest, titel, spotify (track-id), won }, id's nooit hergebruiken.
`index.html` = speler: grote ▶ (Spotify Embed IFrame API: controller pas maken als het liedje bekend is, `loadUri` pas na zijn `ready`, anders loopt hij vast; daarna `play()` zodra Spotify meldt dat het liedje geladen is (`playback_update` met `duration`) plus pogingen na 1, 2,5 en 4,5 s; na 1,5 s knippert de ▶ al (`tik`). Een iPhone met Safari laat nooit vanzelf starten (geluid in een iframe van een andere site pas na een tik daar), dus daar blijft het één tik), de Spotify-speler onder een afdekking behalve zijn
play-knopje, "Laat zien" toont het antwoord, onderaan 📷 Volgende kaartje = scanner in de pagina (camera via getUserMedia, `lib/jsQR.js`,
Apache-2.0). `kaartjes.html` = A4 printvellen (6,5 cm, 12 per vel; QR met `lib/qrcode.js`, MIT; achterkanten per rij gespiegeld voor
dubbelzijdig printen). Spotify-id's zoeken met de Spotify-tool; YouTube en Wikipedia zijn vanuit de cloud niet bereikbaar.
