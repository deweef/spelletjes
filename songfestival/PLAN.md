# Songfestival-hits: stand van zaken (met Marcel en Dana)

Techniek staat in CLAUDE.md. Niet op de startpagina zolang het een test is.

## Stand
- 100 kaartjes in de lijst (id 1-4 van de test, 5-100 uit Dana's lijst 2003-2025; 28/29 okt 2026). Scannen, afspelen, Laat zien,
  📷 Volgende kaartje werken. Dana moet jaar/land/winnaar nog nalopen (printpagina openen met het wachtwoord).
- Marcel heeft op 29 okt alle 250 links van Dana's lijst geplakt (Spotify op de laptop, Ctrl+A/Ctrl+C). De 151 nog niet
  gekoppelde track-id's staan versleuteld in `GEHEIM.wachtrij` (`SLOT.open(K, GEHEIM.wachtrij)` geeft [{pos, spotify}];
  pos = positie in Dana's lijst, nieuwste bovenaan). Niets leesbaars over de liedjes in de repo zetten: de site is openbaar.

## Volgende stap: de rest van Dana's lijst
- Dana's Spotify-afspeellijst "Hitster": https://open.spotify.com/playlist/3WpPVTz1jeCzLyCaIYqFWr (250 nummers).
  De Spotify-tool ziet de lijst wel maar geeft de nummers erin niet, kan een track-id niet terugvertalen naar een titel, en
  verbergt veel songfestivalliedjes om licentieredenen; open.spotify.com is vanuit de cloud geblokkeerd. De id's zijn er dus al
  (wachtrij), alleen titel/artiest/jaar ontbreken nog. Marcel stuurt schermafbeeldingen van de Spotify-app op de laptop
  (genummerd, 20 per afbeelding); nummers 1-100 zijn verwerkt, 101-250 (2003 en ouder) komen nog. Het nummer in de
  afbeelding = de positie in de wachtrij. Pos 22 is Dana's uitgave van Zitti e buoni (staat al in de lijst als id 3; mag
  blijven). Pos 67 (Running Scared, Ell & Nikki, 2011) staat grijs in Spotify (niet afspeelbaar in NL) en is overgeslagen.
- Voor Dana om na te kijken: pos 97 "Du bist" van Tie Break (2004) was volgens mij alleen de Duitse voorronde, geen echt
  songfestivalnummer; staat er nu als Duitsland 2004 in (id 97).
- Koppelen: titels aflezen in volgorde, aan de wachtrij-posities hangen, jaar/land/vlag/won invullen en toevoegen met
  `WW=<wachtwoord> node bijwerken.js geheim.js <nieuw.tsv> <ids.tsv>` (uitleg in de kop van `bijwerken.js`; zelfde sleutel,
  id's lopen door, bestaande liedjes krijgen hooguit een ander spotify-id). Daarna de gekoppelde id's uit de wachtrij halen,
  testen (speler met `?k=<id>#<sleutel>`, printpagina met het wachtwoord, Playwright) en pushen. Een PDF maken kan met
  Playwright `page.pdf` van kaartjes.html na het wachtwoord (A4, geen marges): die in de chat sturen, niet in de repo.
- Aantal kaartjes: nog kiezen (voorstel ±100, Dana's lijst heeft er 250). Extra punt voor het land: nog kiezen.
  Noot: 2020 is nooit gezongen (afgelast); die kaartjes hebben gewoon jaar 2020.
