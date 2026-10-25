# Orkenstorm 3D (`orkenstorm3d/`)
Wat er hierna gebouwd wordt (namen per speler, tussenstukjes tussen levels, twee blokken op de
startpagina, level 5 en 6) staat in `orkenstorm3d/PLAN.md`. Lees dat eerst.

De pc-versie van Orkenstorm, in 3D. Level 1 (Het nieuwe dorp), 2 (De orks komen eraan), 3 (De gevangen
werkers), 4 (De Donkere Mijnen), 5 (Het Woud van Wilgendaal), 6 (De belegerde abdij), 7 (De toren van Morvan), 8 (Het Zwarte Moeras), 9 (De Tempel der Verdoemden), 10 (De twee orkensteden) en 11 (De Zwarte Rots) zijn speelbaar: alle levels uit
`orkenstorm.html` zitten erin (`BINNENKORT` is leeg; na level 11 zegt het eindscherm dat je het spel hebt uitgespeeld).
Een level gaat pas open als het vorige gewonnen is (`orkenstorm3d_lvl` in localStorage). Elk level in
`LEVELS` heeft een `voortgang(S)` voor de doeltekst in de bovenbalk.

Opbouw:
- `index.html`: de pagina, opmaak en menu's (titel, uitleg per level, einde, pauze).
- `js/data.js`: eenheden, gebouwen, moeilijkheden en levels (overgenomen uit `orkenstorm.html`).
- `js/spel.js`: de spelregels (paden, werkers, bouwen, trainen, vechten, golven, winnen/verliezen).
  Posities van mannetjes in pixels (32 per tegel), net als in 2D, zodat regels makkelijk over te nemen zijn.
- `js/modellen.js`: de 3D-modellen. Gebruikt de Kenney-modellen als die geladen zijn, anders de eigen
  blokjesmodellen (reserve). Gebouwen worden in elkaar gezet uit losse Kenney-stukken (`BOUW` in
  modellen.js: kasteel, boerderij, kazerne; plus `kenneyMijn`, steigers en pijlen).
- `js/kenney.js`: laadt de Kenney-modellen uit `assets/` (lijst `LIJST`) en maakt mannetjes met botten
  en animaties (idle, walk, attack-melee-right, interact-right, holding-left, emote-yes, die,
  wheelchair-sit, wheelchair-move-forward, ...). Spullen hangen aan de botten `arm-left`/`arm-right`/`head`/`torso`.
- `assets/<pakket>/`: alleen de Kenney-modellen die het spel gebruikt, met per pakket `Textures/colormap.png`.
- `js/geluid.js`: geluidjes en stemmen. Elk mannetje komt uit Nederland, Engeland, Duitsland, Italië of Frankrijk
  (om de beurt uit een geschudde zak, dus eerlijk verdeeld) en praat altijd zijn eigen taal.
- `js/main.js`: 3D-weergave, camera, muis/toetsen, bovenbalk en paneel.
- `js/tussen.js`: tussenstukjes na het winnen ("Verder met het verhaal"). Gegevens per level in data.js als
  `tussen: { uitgang, begin, eind, kaart }`. Een groepje eigen mannetjes loopt naar `uitgang`; onderweg
  krijgen een paar van hen een grap uit `GRAPPEN` (enkel, plassen, eekhoorn, en per land voor werkers),
  elke grap hooguit één keer en er komt altijd minstens één aan. Tekstwolkjes in de eigen taal, verteller
  in het Nederlands, knop Overslaan, daarna een tekstkaart en de uitleg van het volgende level. Mannetjes
  krijgen daarvoor `u.pose` (animatie), `u.tempo` (snelheid), `u.zigzag` (dronken) en `u.hidden` (weg).
  Extra velden: `spreker` (een werker vertelt eerst iets), `grappen` (deze grappen eerst; 7 s per grap, `STAP`, de lengte rekent zich zelf uit), `voorop` (deze soort gaat zeker mee, bv. de ridders in 5 → 6).
  `soort: 'overval'` (2 → 3) is anders: feest bij het kasteel, nacht (`api.nacht(f)`), orks komen (via
  `plaats` in spel.js) en sleuren de werkers mee. Tijdens een filmpje (`G.tussen`) vallen orks niet aan.
  Beginfilmpje: `intro: { van, naar, begin, orks, bouw, eind }` bij een level (nu level 1: aankomst, kasteel
  bouwen, grapje per land in `BOUWGRAP`). Speelt vanzelf alleen de eerste keer per speler
  (`orkenstorm3d_intro<level>`), daarna via de knop "Filmpje nog eens zien" in de uitleg. Tests die level 1
  starten zetten eerst `localStorage.orkenstorm3d_intro0 = '1'`.
- Online scorebord (zelfde Google Spreadsheet en Apps Script als Fladderfeest, `extra/scorebord.gs`, `BORD_URL` in
  main.js; opvragen met `?spel=ork3d`): `ork3d_ver_<moeilijkheid>` = verst gekomen ((level-1)*100 + procent, of level*100
  bij winst; `procent(S)` per level in data.js, beste waarde in `G.beste`) en `ork3d_tijd_l<n>_<moeilijkheid>` (kleine letters: het script accepteert alleen a-z, 0-9 en _) = snelste
  overwinning in seconden (`G.t / 60`, filmpjes en pauze tellen niet). Insturen gaat automatisch op het eindscherm (`autoInsturen`, alleen met naam en alleen verbeteringen, `orkenstorm3d_ingestuurd:<naam>`), 🏆 Scorebord in het
  titelmenu (`#bord`).
- `lib/`: three.js r160 (`three.module.js`) en `OrbitControls.js`, lokaal (geen CDN) zodat het offline
  werkt. Blijf bij deze versie; nieuwe three-onderdelen ook uit r160 halen (npm: `three@0.160.0`).
- Kleuren: r160 doet het kleurbeheer zelf (sRGB). Geef kleuren gewoon als hex op; alleen
  canvas-texturen krijgen `texture.colorSpace = THREE.SRGBColorSpace`.

Landen (eigen aan de 3D-versie, zie `LAND` in `js/data.js`): werkers houden iets uit hun land vast en
kunnen iets extra's:
- Nederlander, kaasje: zuinig, brengt 2 goud extra mee per vracht.
- Engelsman, kopje thee: hakt sneller hout, maar houdt af en toe theepauze.
- Duitser, pul: grondig, bouwt sneller.
- Italiaan, pizza: deelt pizza uit en geneest gewonde mannetjes vlakbij.
- Fransman, stokbrood: is maar kort in de goudmijn.
Af en toe (1 op 6) rijdt een mannetje in een rolstoel; dat is alleen voor de lol. Idee voor later: de
genezer op krukken (`aid-crutch` uit mini-characters).

Spelregels: neem ze over uit `orkenstorm.html`: werkers hakken hout en halen goud, boerderijen geven
voedsel, kasteel/kazerne/stal trainen eenheden met een wachtrij, torens schieten, orks vallen in golven
aan, moeilijkheid Makkelijk/Normaal/Moeilijk, de levels en hun doelen, wolken over onontdekt gebied.
Stemmen zijn wel anders dan in 2D: daar Nederlands/Engels/Duits, hier ook Italiaans en Frans (zie hierboven).
Nieuwe mannetjes verschijnen op het vrijste vakje naast het gebouw, en mannetjes die niets doen schuiven
uit elkaar (`vrijePlek` en `uitElkaar` in `spel.js`).

Besturing:
- Laptop eerst (dit is de pc-versie), maar het moet op een telefoon niet crashen.
- Linkermuis: kiezen en opdrachten geven. Ctrl/Shift-klik: meer kiezen of weer weghalen. Shift + slepen:
  rechthoek om mannetjes trekken. Knoppen in het paneel: Alle werkers, Alle soldaten, Meer kiezen
  (voor aanraken), Loslaten, en per soort ✕ om ze uit de keuze te halen. Links slepen: camera draaien.
  Rechts slepen: schuiven. Scrollen: zoomen. Pijltjes/WASD: schuiven.
- Het laden van de Kenney-modellen gaat in groepjes van 6 met tot 3 pogingen per bestand (`laad` in kenney.js).
- Toetsen: P = pauze, Escape = selectie loslaten. Rechts klikken tijdens bouwen = stoppen met bouwen.
- Bouwen met de muis gebeurt precies waar de schaduw staat (ook als de camera nog naschuift).
- Aanraakscherm tijdens het bouwen: vinger op de schaduw = schaduw verslepen (`neer.sleep`, de camera staat dan stil),
  loslaten bouwt nog niet; bouwen met ✔ Bouw hier (`#bouwbalk`, `bouwHier` in spel.js, grijs als het daar niet kan) of een
  tik op de schaduw; ✕ = stoppen. Muurstukken op een aanraakscherm ook met schaduw; daarna schuift de schaduw een vakje
  verder in dezelfde richting (`G.vorigeMuur`, `G.muurRichting`). Met de muis blijft het één klik per muurstuk.
- Gebouwen waar vanaf de camera een mannetje achter staat, worden half doorzichtig (`doorzichtig` in main.js, eigen kopie
  van de materialen per gebouw); keuzeringen hebben `depthTest: false` en zijn dus altijd zichtbaar.
- De muur is smal: castle `wall-narrow-corner` als paal in het midden met een half `wall-narrow` naar elke buurmuur
  (`muurVorm` in modellen.js, opnieuw opgebouwd als de buren veranderen; het blijft wel een heel vakje dat je blokkeert).

## Kenney-modellen in Orkenstorm
De Kenney-pakketten (CC0) staan als zip in de centrale map `bronnen/` (zie `bronnen/LEESMIJ.md` voor welk
pakket bij welk spel hoort; zips die in de hoofdmap geüpload worden, daarheen verplaatsen). kenney.nl is
vanuit de cloudomgeving niet bereikbaar. Gebruik de bestanden uit `Models/GLB format/` en kopieer alleen
wat het spel echt gebruikt naar `orkenstorm3d/assets/<pakket>/`, samen met `Textures/colormap.png` van dat
pakket (elk pakket heeft een eigen colormap met dezelfde naam). Zet nieuwe modellen ook in `LIJST` in
`js/kenney.js`.
- Stijl: houd het bij de vrolijke, effen gekleurde pakketten (castle-kit, mini-forest, mini-dungeon,
  survival-kit, ...). De retro-fantasy-kit heeft fotoachtige stenen en donkere daken en past daar niet bij.
- Al gebruikt: mannetjes (dungeon: mens, ork; forest: boogschutter), wapens, bijl (survival), rolstoel
  (characters), bomen (forest, castle), kasteel (castle-kit), boerderij (forest: schuurtje, akkers, hek),
  kazerne (castle-kit toren, houten muur, ballista, banier; forest tent en schietschijf), goudmijn
  (dungeon rotsen, stut, kist, munt; survival rotsen), steigers (dungeon wood-support), pijlen (forest),
  wachttoren (castle-kit zeshoekige toren), orkenhut (survival tentdoek, kampvuur, palissade),
  bruggen (castle-kit bridge-straight, met een pijler in het midden; het wegdek ligt gelijk met de oever),
  wachttoren met boogschutter onder een dak op palen, muur (castle wall), smederij (forest schuurtje,
  survival aambeeld, tonnen, schoorsteen), houtzagerij (forest schuurtje, survival slijpsteen, planken,
  boomstammen), katapult (castle siege-catapult; een voertuig zonder botten, `voertuig: true`).
- Muur, smederij, houtzagerij en katapult (vanaf level 2, net als 2D): muurstukken plaats je achter elkaar
  tot Escape; orks zonder weg slaan de dichtstbijzijnde muur kapot; de katapult (kazerne) vraagt eerst een
  smederij én houtzagerij, schiet stenen met spatschade (gebouwen x1.8) en zoekt zelf vijandelijke gebouwen.
- Goudmijnen: bordje met het resterende goud (rood knipperend als bijna leeg), werkers lopen vanzelf naar de
  volgende mijn, `mineCap` per level.
- Het uitlegvakje rechtsonder laat klikken door (`pointer-events: none`).
- Gevangenis (level 3): dungeon wood-structure met castle metal-gate als tralies; de gevangen werkers zijn
  echte Kenney-mannetjes in het model (hun mixers staan in `model.userData.mixers`).
- De Donkere Mijnen (level 4, `dungeon: 1`): dungeon wall op `#`/`t`, graveyard lantern-candle met
  PointLight op fakkels `t`, dungeon stairs op de uitgang `E`, tonnen en banieren als versiering, donkere
  rook in plaats van wolken, warm schemerlicht (`bouwKerker` in main.js). Skelet = graveyard
  character-skeleton; genezer = mens op krukken (characters aid-crutch) met witte kap; Sir Lodewijk =
  mens met gouden helm en rode pluim (`held`, zit gevangen met de animatie `sit` tot je bij hem bent).
  Genezer en Sir Lodewijk rijden nooit in een rolstoel. Sir Lodewijk hoeft naast de trap te staan om te winnen.
- Het Woud van Wilgendaal (level 5, kaart 36x40): ridder = mens met zilveren helm en blauwe pluim op een
  zelfgemaakt blokjespaard (`maakPaard`/`opPaard` in modellen.js, er zit geen paard in de Kenney-pakketten;
  de ruiter speelt `wheelchair-sit`, de paardenbenen galopperen in main.js). Rijdt nooit in een rolstoel.
  Stal = forest schuurtje, graveyard hooibalen, hek, emmer en een paard. Orkentoren = forest building-structure
  en building-platform met ladder en een speerwerper bovenop; schiet net als de wachttoren (`otowers`).
  Orkenbaas = grote ork met hoornhelm. Orkenhutten hebben hier meer levens (`hutHp`).
- Tussenstukje 4 → 5: Sir Lodewijk bedankt de groep (`held: 1`), grappen `schat` (schatkist) en `krukken`
  (genezer raakt achter), `vertrek` = pas later weglopen omdat de trap vlakbij is, `zonder` = geen plassen
  of eekhoorn onder de grond.
- De belegerde abdij (level 6, kaart 32x36, rivier van noord naar zuid met bruggen die van west naar oost lopen: `dwars` in main.js):
  `siege: 1`, `keep: 'abdij'` (valt de abdij, dan verloren), `camAt` (camera begint bij de ridders). Rovers met `'raid'` in `o` belegeren
  de abdij (`u.siege`); zijn ze weg, dan `G.saved` (400 goud en 100 hout, golven beginnen) en traint de abdij soldaten en genezers. Daarvoor
  knippert er "Help ons!" boven de abdij (`m.help`). Winnen: alle drie roverkampen (`camps`, BLD `roverkamp`) en alle rovers weg.
  Golven komen ook uit roverkampen (`waves.units`). Abdij = graveyard crypt-large met dak en kruis, castle-toren met puntdak, grafkruisjes,
  bankje en een zwaaiende monnik (`monnik`, bruine kap). Rover = mens met donkerrode kap, zwart maskertje, mes en buitzak; roverschutter =
  boogschutter met kap en maskertje. Roverkamp = forest tentjes, kampvuur, gestolen kisten en een zwarte vlag. Tussenstukje 5 → 6: een bode.
- De toren van Morvan (level 7, `dungeon: 1`, `tower: 1`, kaart 30x34): drie verdiepingen onder elkaar op één kaart (`floors` = bovenste
  rij van verdieping 1, 2, 3; `verdieping(o)` in spel.js). Mannetjes zien en vechten alleen op hun eigen verdieping (`zelfde`). Op een trap
  omhoog (`U`, `stairs: [{ from, to, naar }]`) sta je meteen op de volgende verdieping (`trap(u)`), de camera gaat mee (`G.trapSprong`);
  boven elke trap een geel ↑-pijltje (`trapPijlen`, pas te zien als ontdekt). Paarse sfeer (`toren` in main.js), hooguit 8 fakkellampen.
  Tovenaar (`magier`): mens met blauwe punthoed en staf, vuurballen (`fire`, fx `vuur`), toverkracht `u.mana` (0-100, +1 per 20 beelden);
  paneelknoppen 🔥 Vuurregen (80, daarna een plek kiezen, `G.cast`, `G.regens`, fx `meteoor`, max 9 vakjes ver) en 💧 Waterwezen (60,
  `watergeest` vecht 45 s mee, `u.ttl`). Vijanden: demon (`demoon`, rode ork met hoorntjes en fladderende vleugels), waterwezen (`water`,
  graveyard ghost, doorzichtig blauw, zweeft), Morvan (graveyard vampire, groot, paarse punthoed en staf; roept elke 15 s 2 demonen op
  als je dichtbij bent). Winnen: Morvan verslagen; verliezen: je hele groep weg. Kleur van een Kenney-figuur: `tint(model, kleur, doorzicht)`.
  Tussenstukje 6 → 7: een soldaat vertelt wat de monniken weten.
- Het Zwarte Moeras (level 8, `moeras: 1`, kaart 36x40): moerastegels `m` (half zo snel: x0.55 in `moveAlong`), wegtegels `r` (x1.45).
  Gebouw `weg` (5 goud): net als de muur stukje voor stukje (`reeks` in `klik`), alleen op `.`, `m` of `s`; andere gebouwen niet op `m`
  (`canPlace`). Een weg in aanbouw (planken, `MODEL.weg`, geen steigers) blokkeert niet en wordt niet aangevallen; klaar = de tegel wordt `r`
  en het gebouw verdwijnt (`G.mapVersie++`, de grond wordt opnieuw getekend). Moeras in 3D: donkere olijfgrond met plasjes, lisdodden
  (InstancedMesh), troebel groen water, grauwe nevel. Winnen: alle hutten, orkentorens en orks weg. Tussenstukje 7 → 8 (in de toren, `zonder`
  plassen/eekhoorn): een soldaat leest in de boeken van Morvan.
- De Tempel der Verdoemden (level 9, `army: 1`, `graves: 1`, kaart 32x34): geen gebouwen en geen grondstoffen, alleen een vast leger (ridders,
  soldaten, boogschutters, genezer, 2 tovenaars, katapult; knop Hele groep). Vijandelijke gebouwen staan in `ob` (BLD `tempel`, 1400 levens:
  graveyard crypt-small met dak, zuilen, obelisk, altaar en vuurmanden met groene vlammen, `kenneyTempel`). Graven `g` in de kaart
  (`maakGraf2`: aardehoop + grafsteen); elke 9 s laat elke orkpriester (`orkpriester`: ork met zwarte kap, groene oogjes, schedelstaf,
  vuurballen) 2 skeletten opstaan uit het dichtstbijzijnde graf als je leger binnen 13 vakjes is (max 20 skeletten; het graf schudt,
  `G.graafOpen`). Winnen: tempel weg, priesters weg en geen vijanden meer; verliezen: hele leger weg. Onweerslucht. Tussenstukje 8 → 9: een gevangen ork praat.
- De twee orkensteden (level 10, kaart 40x44): twee steden achter de rivier met palissaden (BLD `orkmuur` in `ob`, survival fence-fortified,
  gedraaid naar de buren, schuin bij diagonale stukken; je mannetjes slaan er vanzelf een gat in als er geen weg is). Magiërstoren (BLD
  `magiertoren`, 150/100: castle zeshoekige toren met paars dak, gloeiende bol en sterretjes) traint tovenaars (`magier` 120/20). Golven met
  `waves.units` en `cat: 1`: elke derde golf een orkenkatapult (`orkkatapult`, rood getinte castle-katapult met orkenvlag, schiet op gebouwen).
  Winnen: alle hutten, torens en orks weg. Tussenstukje 9 → 10.
- De Zwarte Rots (level 11, `heksen: 1`, kaart 40x44): zwarte rots `b` (lopen mag, bouwen niet) en lava `L` (blokkeert; gloeiend vlak dat
  pulseert, `lavaMesh`, plus wat oranje lampjes), rode lucht en donkere rookwolken. Orkenheksen (`orkheks`: groen getinte ork met groene
  punthoed en gifstaf, vuurballen) roepen elke 13 s een demon en elke 10 s een gifwolk op je mannetjes binnen 7 vakjes (`G.gif`, 3 s, 4 schade
  per halve seconde, groene bollen in `syncGif`). Opperork Zwartvuist (`zwartvuist`, 750 levens: grote ork met gouden hoornkroon, rode cape,
  reuzenbijl). Palissade rond zijn vesting (`ob`). Winnen: Zwartvuist verslagen en alle hutten weg. Tussenstukje 10 → 11.
- Repareren: werkers kiezen en op een beschadigd eigen gebouw klikken (`teDoen` in spel.js: niet af óf beschadigd). Half zo snel als
  bouwen, kost samen 40% van de bouwprijs (`HERSTEL`, betaald per stukje; kasteel en abdij zonder prijs: max/4 goud, max/8 hout).
  Geen geld meer = de werker stopt. Status "repareert", tip in het paneel bij een beschadigd gebouw.
- Plan deel 2 (nog niet bouwen, eerst deel 1 uitspelen): over zee met haven, scheepswerf, vis als grondstof, schepen, buskruit
  (kanontoren, springstof), vliegers, en uitgebreide upgrades (kasteel → burcht → vesting, smid in 3 stappen). Eigen namen gebruiken.
- Level 5 heet in 2D "Het Woud van Elwynn"; Elwynn is een Warcraft-naam. In 3D heet het "Het Woud van Wilgendaal".
  Gebruik eigen namen en teksten, geen namen of verhaalteksten uit Warcraft (auteurs- en merkrecht).
- Blocky Characters en animated-characters-protagonists: moderne figuurtjes, passen niet.
- "Modellen: Kenney.nl" staat op het titelscherm.
