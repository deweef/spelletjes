# Songfestival-hits: stand van zaken (met Marcel en Dana)

Techniek staat in CLAUDE.md. Niet op de startpagina zolang het een test is.

## Stand
- 30 kaartjes in de lijst (id 1-4 van de test, 5-30 uit Dana's lijst 2016-2025, 28 okt 2026). Scannen, afspelen, Laat zien,
  📷 Volgende kaartje werken. Dana moet jaar/land/winnaar nog nalopen (`dana-lijst.tsv` is wat uit de schermafbeeldingen
  is afgelezen; de versleutelde lijst in `geheim.js` is leidend).
- iPhone met Safari start nooit vanzelf (één tik op ▶ nodig). Dana's telefoon moet nog getest worden.
- Het wachtwoord van de printpagina weet Marcel; het staat nergens in de repo. De sleutel haal je terug met
  `SLOT.sleutel(wachtwoord)` (zie `slot.js`); gebruik altijd dezelfde sleutel, anders werken geprinte kaartjes niet meer.

## Volgende stap: de rest van Dana's lijst
- Dana's Spotify-afspeellijst "Hitster": https://open.spotify.com/playlist/3WpPVTz1jeCzLyCaIYqFWr
  De Spotify-tool ziet de lijst wel, maar geeft de nummers erin niet; open.spotify.com is vanuit de cloud geblokkeerd.
  Wat werkt: schermafbeeldingen van de lijst (telefoon) voor titels en artiesten, en voor de track-id's de links
  (Spotify-app op de laptop: een nummer aanklikken, Ctrl+A, Ctrl+C, plakken in de chat: alle links in één keer).
- Nog zonder Spotify-id (staan wel in `dana-lijst.tsv`, de tool verbergt ze om licentieredenen; de link uit Dana's lijst
  is nodig): RÓA (VÆB), Deslocado (NAPA), Hallucination (Sissal), Rim Tim Tagi Dim (Baby Lasagna), Unforgettable
  (Marcus & Martinus), The Code (Nemo), Queen of Kings (Alessandra), Burning Daylight (Mia Nicolai & Dion Cooper),
  Tattoo (Loreen), Trenulețul (Zdob și Zdub), Give That Wolf a Banana (Subwoolfer), De diepte (S10), I Don't Feel Hate
  (Jendrik), Arcade (Duncan Laurence), Zero Gravity (Kate Miller-Heidke), Soldi (Mahmood), Chameleon (Michela),
  I Can't Go On (Robin Bengtsson).
- Nog niet afgelezen: alles onder What's the Pressure (2016 en ouder), één titel met een D tussen Yodel It! en What's the
  Pressure, en wat er eventueel boven Wasted Love staat.
- Toevoegen gaat met `WW=<wachtwoord> node bijwerken.js geheim.js <nieuw.tsv> <ids.tsv>` (zie de kop van `bijwerken.js`;
  slaat liedjes zonder id over, zelfde sleutel, id's lopen door). Daarna testen (speler met `?k=<id>#<sleutel>`,
  printpagina met het wachtwoord) en pushen.
- Aantal kaartjes: nog kiezen (voorstel ±100). Extra punt voor het land: nog kiezen. Noot: 2020 is nooit gezongen
  (afgelast); die kaartjes hebben gewoon jaar 2020.
