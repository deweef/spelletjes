# Plan Orkenstorm 3D en de site (afgesproken met Marcel)

Doelgroep: gezin met tieners (14+); humor mag stout zijn (zie CLAUDE.md).

Volgorde van bouwen:

## 1. Naam en voortgang per speler (op de startpagina) — KLAAR
- Startpagina vraagt "Wie speelt er?": knoppen met bestaande namen + "Nieuwe speler".
- Naam en voortgang bewaard in localStorage, per naam (gedeelde laptop: ieder eigen voortgang).
- Elk spel kan de naam gebruiken (bv. "Goed gedaan, Sanne!"). Orkenstorm 3D bewaart gewonnen levels en
  moeilijkheid per naam.
- Beperking: per toestel; delen tussen toestellen (overzetcode of online opslag) is voor later.

## 2. Tussenstukjes tussen de levels — 1 → 2 t/m 10 → 11 KLAAR
- Na het winnen een filmpje van 20-30 seconden in de 3D-wereld van het gewonnen level, met knop "Overslaan".
- Nodig: tekstwolkjes boven mannetjes en een script dat mannetjes laat lopen en praten.
- Een groepje van de eigen mannetjes van de speler loopt naar de rand van de kaart. Onderweg grappige
  dingen, zodat er minder aankomen en het volgende level met de vaste beginsituatie start:
  - soldaat verstuikt zijn enkel ("Au, mijn enkel!") en hinkt terug
  - iemand moet plassen achter een boom ("Ga maar vast!") en komt niet terug (mag van Marcel)
  - iemand ziet een eekhoorn en rent erachteraan
  - Fransman eet zijn stokbrood op en krijgt buikpijn
  - Duitser wordt dronken van zijn bier en zwalkt zigzaggend terug ("Hik! Prost!")
  - Nederlander steekt een "kruidensigaretje" op, krijgt de slappe lach in een groen wolkje, eet van de
    vreetkick zijn hele kaasje op en loopt giechelend de verkeerde kant op
  - Engelsman gaat eerst thee drinken, Italiaan blijft bij zijn pizza
- Daarna een tekstkaart die naar het volgende level leidt. Ideeën per overgang:
  - intro level 1: de koning geeft je een stukje land — KLAAR (aankomst en kasteel bouwen)
  - 1 → 2: groep trekt het bos in, bouwt bij de rivier een kamp met kazerne en twee boerderijtjes
  - 2 → 3: feest, maar 's nachts overvallen orks Zonnedal en nemen alle werkers mee
  - 3 → 4: bevrijde werker vertelt over ridder Sir Lodewijk in de mijnen; klein groepje daalt af
  - 4 → 5: Sir Lodewijk neemt je mee naar zijn buitenpost aan de rand van het woud — KLAAR
  - 5 → 6: bode rent binnen: "De abdij wordt belegerd!"; alleen de ridders zijn snel genoeg
- Alleen eigen namen en teksten, niets uit Warcraft.

## 3. Startpagina: twee blokken — KLAAR
- "Spellen voor de telefoon" (2D) en "3D-spellen voor de pc".
- Op een telefoon staat het 2D-blok bovenaan, op een laptop het 3D-blok. Marcel past het aan als het niet bevalt.

## 3b. Uit de nieuwe 2D-versie — KLAAR: goud in de mijn, muur, smederij, houtzagerij, katapult, stenen brug.
   Nog over uit 2D: weg (vanaf level 8), magiërstoren/tovenaar (level 10), levels 7-11.

## 4. Level 5 "Het Woud van Wilgendaal" — KLAAR, met tussenstukje 4 → 5 en ridder, stal, orkentoren, orkenbaas.

## 5. Level 6 "De belegerde abdij" — KLAAR, met tussenstukje 5 → 6 (bode), abdij, rovers en roverkampen.

## 6. Level 7 "De toren van Morvan" — KLAAR, met tussenstukje 6 → 7, tovenaars (vuurregen, waterwezen), demonen, waterwezens, Morvan.

## 7. Level 8 "Het Zwarte Moeras" — KLAAR, met tussenstukje 7 → 8, moeras en wegen.

## 8. Level 9 "De Tempel der Verdoemden" — KLAAR, met tussenstukje 8 → 9, orkpriesters, graven en de tempel.

## 9. Level 10 "De twee orkensteden" — KLAAR, met tussenstukje 9 → 10, magiërstoren, palissaden en orkenkatapulten.

## 10. Level 11 "De Zwarte Rots" — KLAAR, met tussenstukje 10 → 11, lava, orkenheksen met gifwolken en Opperork Zwartvuist.
   Alle levels uit 2D zitten nu in 3D. Repareren zit erin. Upgrades en zee/buskruit/vliegers bewaren we voor deel 2.

## Nu
- Marcel speelt deel 1 uit en noteert kleine verbeterpunten. Al gedaan na zijn eerste feedback: tussenfilmpjes rustiger
  (7 s per grap, vertaling in de wolkjes, verteller in het Nederlands, overval eindigt pas als de orks weg zijn) en repareren.
- Deel 2 (later, eigen verhaal): zee met haven, scheepswerf, vis als grondstof, schepen, buskruit (kanontoren, springstof),
  vliegers, en uitgebreide upgrades (kasteel → burcht → vesting, smid in 3 stappen). Zie CLAUDE.md.

# Deel 2: Over zee (afgesproken met Marcel, in aanbouw)

Afgesproken op 28 oktober: 9 levels (12 t/m 20), vis als derde grondstof, de sloper, en de namen hieronder. Evenknie: Warcraft II (scheepswerf, olie, schepen, buskruit,
griffioenen, stadhuis → burcht → kasteel; de mensen-campagne daar heeft 14 missies). We nemen alleen de spelregels als
inspiratie en maken ons eigen verhaal, met eigen namen: de site is openbaar en deel 1 houdt zich daar ook aan.

## Uitgangspunten
- Deel 2 is een eigen keuze in het titelmenu ("Deel 2: Over zee") en gaat pas open als level 11 gewonnen is.
  Levels heten 12 t/m 20, zodat `orkenstorm3d_lvl` en het scorebord (`ork3d_ver_*`, `ork3d_tijd_l<n>_*`) gewoon doortellen.
- 9 levels (geen 14): elk nieuw onderdeel krijgt één of twee levels om te leren, het laatste level brengt alles samen.
  Deel 1 kostte per level een kaart, modellen en een tussenstukje; 9 is te doen, 14 niet.
- Alles uit deel 1 blijft werken (landen, rolstoel, tussenstukjes, repareren, scorebord). Nieuwe spelregels in `spel.js`,
  nieuwe eenheden en gebouwen in `data.js`, modellen uit de bestaande pakketten plus pirate-kit (staat al in `bronnen/`:
  schepen, kanonnen, kratten, palmbomen, steiger).

## Nieuwe onderdelen (in de volgorde waarin de speler ze krijgt)
1. **Zee en kust.** Watertegel `w` (diep, alleen schepen), `k` = ondiep/strand (lopen mag, bouwen niet; schepen niet).
   Een haven moet met één kant aan het water staan. Golfjes en schuim langs de kust in 3D.
2. **Haven** (3x3, 120 goud / 80 hout) en **vis** als derde grondstof. De haven bouwt **vissersbootjes** (werkers op zee):
   die varen naar een visplek (`v` in de kaart, zichtbaar als springende visjes, raakt net als een mijn op) en brengen vis
   naar de haven. Vis is nodig voor schepen en voor de nieuwe eenheden; een haven geeft ook 4 voedsel.
   Landen op zee: de Nederlander vist het best (haring!), de Italiaan eet er onderweg zelf wat van.
3. **Scheepswerf** (3x3, 200 goud / 150 hout, aan het water, vraagt een houtzagerij): **veerboot** (vervoert 6 mannetjes, 100 g /
   80 h / 50 vis), **kogge** (oorlogsschip met kanon, 250 g / 120 h / 80 vis; vanaf level 15, vraagt buskruit) en de
   **orkengalei** als vijand. Mannetjes aan boord: kiezen, op de veerboot klikken (ze lopen erheen en stappen in), dan de
   veerboot op een strand klikken: iedereen stapt uit. Schepen vechten alleen tegen schepen en gebouwen aan de kust.
4. **Buskruit.** **Kruithuis** (2x2, 150 g / 100 h, vraagt een smederij). Daarna: **kanontoren** (toren-upgrade, schiet met
   spatschade, vooral tegen schepen en gebouwen) en de **sloper** (kazerne; mannetje met een vaatje, rent naar een
   vijandelijk gebouw, grote knal, hij is zelf ook weg; en een rookwolkje als hij struikelt). Buskruit is ook wat de orks
   willen stelen (verhaal, zie level 16).
5. **Vliegers.** **Vliegernest** (3x3, 250 g / 150 h, alleen op bergtegels `^`): de **reuzenvogel** met een ruiter (vliegt over
   alles heen, valt van boven aan; alleen boogschutters, torens en orkenschutters kunnen hem raken). Vijand: de
   **orkenvleermuis** (kleine vliegende ork, komt in zwermen). Vliegen in 3D: eigen hoogte, geen padzoeken (rechte lijn).
   Modellen: blokjesvogel zelf maken (zoals het paard), vleugels in main.js laten klappen.
6. **Upgrades.** Kasteel → **burcht** (300 g / 200 h: meer levens, 2 pijlwerpers op de torens, werkers brengen 1 goud extra)
   → **vesting** (600 g / 400 h: nog meer levens, ridders +25% levens, opent het vliegernest). Smederij in 3 stappen:
   zwaarden (+2 schade), harnassen (+15 levens), **staal** (+4 schade, ook pijlen en kanonnen). Knop in het paneel van het
   gebouw, de werkers hoeven er niet voor te lopen, wel een wachttijd met balkje. Het model krijgt er per stap iets bij
   (banieren, hogere torens, een extra schoorsteen).

## Verhaal en levels (eigen verhaal, zie "Open vragen" voor de keuzes)
Na de val van Zwartvuist is er rust. Dan verschijnen er zwarte zeilen aan de kust: de orks zijn de zee opgegaan en halen
versterking uit het Donkere Land aan de overkant. Jouw kasteel ligt op een paar dagen van zee; het koninkrijk heeft geen vloot.

| Lvl | Naam | Nieuw | Doel | Tussenstukje erna |
|---|---|---|---|---|
| 12 | Het vissersdorp Zeewijk | zee, haven, vis | Bouw aan de kust een haven en vang 300 vis; de dorpelingen helpen (werkers) | de burgemeester van Zeewijk vertelt over zwarte zeilen; een werker verslikt zich in een haring |
| 13 | Zwarte zeilen | orkengalei, strand-aanvallen | Orks landen 's nachts uit galeien: hou het dorp 15 minuten (golven van zee) | veerboten nodig: "Wij moeten óók de zee op" |
| 14 | Het eiland Meeuwenrots | scheepswerf, veerboot | Bouw een scheepswerf, zet een leger over naar het eiland en maak het orkenkamp daar weg | op het eiland staat een verlaten dwergensmidse: een oude dwerg, Bram IJzerbaard, kent buskruit |
| 15 | De smidse van IJzerbaard | kruithuis, kanontoren, sloper | Bescherm de smidse (keep) tegen vleermuizen en galeien; bouw de eerste kanontoren | Bram laat een vaatje proeven; de Duitser denkt dat het bier is |
| 16 | De kogge Zeearend | kogge, zeeslag | Bouw 3 koggen en jaag de orkenvloot uit de baai (alle galeien weg); je thuishaven mag niet vallen | eerste echte zeeslag gewonnen; de Fransman is zeeziek |
| 17 | De bergen van Grauwkam | vliegernest, reuzenvogel | Zoek het nest in de bergen (`^`), tem 2 reuzenvogels (werkers brengen vis als lokaas), versla de orkenvleermuizen | de eerste vlucht: de Engelsman neemt zijn thee mee omhoog |
| 18 | Burcht en vesting | upgrades (burcht, vesting, smederij) | Lang opbouwlevel: bouw op tot vesting en sla 8 golven af (land, zee én lucht) | de koning stuurt een brief: "Nu naar de overkant" |
| 19 | De overtocht | alles, geen basis | Alleen een vloot (veerboten, koggen, vogels): land op de kust van het Donkere Land en zet een bruggenhoofd op (haven + kasteel bouwen onder vuur) | het bruggenhoofd staat; een verkenner ziet de Zwarte Poort |
| 20 | De Zwarte Poort | eindbaas | Vernietig de Zwarte Poort (reusachtig gebouw, 3000 levens, roept vleermuizen en galeien op) en versla de **Schaduwork Nachtklauw** (eindbaas, vliegt soms weg naar een andere plek) | aftiteling: het hele gezelschap terug op de boot, iedereen met zijn eigen grap; einde deel 2 |

Moeilijkheid: zoals deel 1 (Makkelijk/Normaal/Moeilijk). Lengte per level 15-30 minuten, zoals deel 1.

## Tussenstukjes
Zelfde opzet als deel 1 (`tussen.js`): een groepje loopt weg, grappen onderweg. Nieuw: lopen naar een **boot** in plaats van
de rand van de kaart (de boot vaart dan weg), en grappen op zee (zeeziek, haring, de Duitser en het buskruitvaatje, de
Engelsman met thee op de vogel, de Nederlander die op een eiland "wilde kruiden" vindt). Elke grap hooguit één keer, zoals nu.

## Bouwvolgorde
1. Zee, kust, haven, vis en vissersbootjes + level 12 — KLAAR (met tussenstukje 11 → 12; het tussenstukje 12 → 13 komt met level 13).
2. Orkengalei en aanvallen vanaf zee + level 13 — KLAAR (met tussenstukje 12 → 13).
3. Scheepswerf en veerboot (instappen/uitstappen) + level 14.
4. Buskruit: kruithuis, kanontoren, sloper + level 15.
5. Kogge en zeeslag + level 16.
6. Vliegernest, reuzenvogel, orkenvleermuis + level 17.
7. Upgrades + level 18.
8. Levels 19 en 20, eindbaas, aftiteling.
Per stap: bouwen, testen in de browser, op `main` zetten, familie laten meespelen (`"concept": true` blijft staan tot deel 2 af is?
Liever: deel 2 in het titelmenu markeren als "in de maak", zodat deel 1 gewoon speelbaar blijft).

## Beslissingen van Marcel (28 oktober)
1. 9 levels (12 t/m 20).
2. Vis als derde grondstof: ja.
3. De sloper (mannetje met een vaatje dat zichzelf opblaast): ja.
4. Namen akkoord: Zeewijk, Meeuwenrots, Bram IJzerbaard, Grauwkam, het Donkere Land, de Zwarte Poort, Schaduwork Nachtklauw.
5. Gestart met stap 1.

## Nu (deel 2)
- Level 12 en 13 zijn speelbaar; Marcel test ze en noteert verbeterpunten (is 15 minuten standhouden te lang of te zwaar?).
  Volgende stap: scheepswerf en veerboot (instappen en uitstappen) + level 14, het eiland Meeuwenrots, met tussenstukje 13 → 14.
