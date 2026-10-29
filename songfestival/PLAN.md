# Songfestival-hits: stand van zaken (met Marcel en Dana)

Techniek staat in CLAUDE.md. Niet op de startpagina zolang het een test is.

## Stand
- Dana's hele lijst zit erin: 248 kaartjes (1956-2025), id 1-248; 28/29 okt 2026. Per jaar 3 liedjes (tot 1990) tot 6
  (2025); 69 winnaars. Scannen, afspelen, Laat zien, 📷 Volgende kaartje werken. Dana moet jaar/land/winnaar nog nalopen
  (printpagina openen met het wachtwoord). Marcel heeft een PDF van alle kaartjes (21 vellen) in de chat gekregen.
- Niet opgenomen (grijs in Spotify, niet afspeelbaar in NL): Running Scared (Ell & Nikki, 2011) en Draumur um Nínu
  (IJsland 1991). Die twee id's plus Dana's uitgave van Zitti e buoni staan nog versleuteld in `GEHEIM.wachtrij`
  (`SLOT.open(K, GEHEIM.wachtrij)` geeft [{pos, spotify}]). Niets leesbaars over de liedjes in de repo zetten: de site is openbaar.

## Volgende stappen
- Dana laten nakijken: jaar/land/winnaar van alle kaartjes; "Du bist" van Tie Break (id 97, 2004) was volgens mij alleen de
  Duitse voorronde; Joegoslavië heeft de vlag van Kroatië (Riva, Tereza Kesovija) of Servië (Aska) gekregen.
- Het spel op de startpagina zetten (`spellen.json`, plaatje 640x400, `"concept": true` zolang het test is) en de spelregels
  op het beginscherm: hoe speel je met tijdlijn en kaartjes, extra punt voor land/artiest (nog kiezen).
- Nieuwe liedjes toevoegen gaat met `WW=<wachtwoord> node bijwerken.js geheim.js <nieuw.tsv> <ids.tsv>` (uitleg in de kop van
  `bijwerken.js`; zelfde sleutel, id's lopen door, bestaande liedjes krijgen hooguit een ander spotify-id). Dana's lijst
  uitlezen: Spotify op de laptop, nummer aanklikken, Ctrl+A, Ctrl+C geeft alle links; schermafbeeldingen (20 per stuk, genummerd)
  geven titel/artiest. De Spotify-tool kan geen afspeellijst lezen, geen id terugvertalen en verbergt veel songfestivalliedjes.
  Daarna testen (speler met `?k=<id>#<sleutel>`, printpagina met het wachtwoord, Playwright) en pushen. PDF: Playwright
  `page.pdf` van kaartjes.html na het wachtwoord (A4, geen marges); in de chat sturen, niet in de repo.
- Noot: 2020 is nooit gezongen (afgelast); die kaartjes hebben gewoon jaar 2020. 1969 had vier winnaars (alle vier erin).
