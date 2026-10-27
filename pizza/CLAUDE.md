# Pizzabaas (`pizzabaas.html`, plaatjes in `pizza/`)

Plan en afspraken: `pizza/PLAN.md`.

Pizzabaas (`pizzabaas.html`, concept, idee van Pizza Tycoon maar met eigen naam en grappen): eigen pizzeria van bovenaf op een raster
van 13x13 vloertegels (was 15x15; opslag `versie: 4`: wat bij het verkleinen niet meer past wordt terugbetaald, `S.verbouwd` = melding) zoals in het oude spel (`W`, `H`, `T` = 48; rij 0-2 keuken met ovens en koks, deur onderaan `DEUR`). Tafels en stoelen (1x1) los, zoals in het
origineel; stijl per tafel/stoel `s.hout` (wisselen in het menu; nieuwe krijgen de laatst gekozen stijl `S.houtStoel`/`S.houtTafel`): houten caféstoel met rood kussen = tweede rij van `pizza/stoelen.png`, houten tafels `pizza/houten-tafels.png` (`HOUT`; met een kleed ligt het kleed erop); tafels (`TAFELSOORT`, de knop Tafel wisselt bij elke klik): `tafel` 2x2 (alle kleedjes), `lang` 2x4 en `langL` 4x2 (lange tafel, ↻ Draaien in het menu, kleedjes rood/wit: `SPUL.kleden`), `tafeltje` 1x1 (geen kleed); plaatjes `pizza/lange-tafels.png` (`LANG`, uit `pizza/lange-tafels-gemini.jpg`) (opslag `versie: 3`; versie 2 had vaste sets tafel2/tafel4, die `zetOm` omzet naar tafel + stoelen in een molentje): een stoel hoort bij de tafel waar hij tegenaan staat
(`kantVoor`, `indeling` → `stoelPlekken(tafel)` = { sx, sy, kant, stoel }, kant 0 boven/1 onder/2 links/3 rechts, `RICHTING`); groepjes van 1-6 zoeken een tafel met genoeg vrije stoelen;
de ober komt achter de stoel staan; tekenvolgorde: stoelen boven/naast, dan tafels en de rest, dan stoelen eronder; poppetjes ongeveer een tegel groot (`MENS`). Oude opslag zonder `versie: 2` krijgt zijn
spullen terugbetaald en begint opnieuw met twee tafeltjes. Twee standen (`modus`): inrichten (spullen uit `SPUL`
kopen en neerzetten: tafel, stoel, plant, jukebox (2x2; oude opslag met een 1x1-jukebox krijgt een vrije plek of geld terug);
vasthouden en slepen = verplaatsen (`sleep`), tikken = menu met kleedje (`KLEED`: 11 kleedjes als kleurknopjes, `s.kleed` = naam, oud `true` = 'rood' via `kleedVan`; €10, chic ✨ €20 en +1 gezellig; ronde = ronde tafel; plaatjes `pizza/kleden.png` (`KLEDEN`, vakjes 192x192)), kaarsje (`EXTRA`) en verkopen; extra ovens en obers in `PERSONEEL`) en open (een werkdag van `DAG` = 120 s, 17:00-22:00). Klantengroepjes (`groep`) zoeken een vrije
tafel (anders "vol", reputatie omlaag). Zit de hele tafel, dan bestellen ze samen (`bestel`) en bakt de keuken hun pizza's achter elkaar
(`wachtrij`, `BAKTIJD`). Pas als alle pizza's van de tafel op het uitgiftepunt staan (`klaar`, `tafelKlaar`) komen er loopjes (`ritten`)
van max. 2 borden, één per hand; bij 4 personen loopt een ober twee keer (of gaan er twee obers). Ze eten en betalen de pizzaprijs plus fooi
(`gezellig`: kleedje, kaarsje, planten dichtbij, jukebox). Geduld telt per tafel (`groep.t`, `GEDULD` + 7 s per extra persoon) tot een ober
de borden komt halen; te lang = de hele tafel boos weg. Obers en klanten lopen om tafels, stoelen, planten en de jukebox heen (`loopNaar` → `zoekPad`: A* op een raster van halve tegels, `bezet` (opnieuw bij openen), daarna strak getrokken; de koks lopen nog rechtdoor). Reputatie `S.rep` bepaalt hoe vaak er
klanten komen. Aan het eind huur (`HUUR`) en loon, en een dagoverzicht (📊 Gisteren = `laatsteDag`). Uiterlijk zoals het origineel:
achtergrond vooraf getekend (`achter`, `tekenAchter`: vloer naar keuze `S.vloer` (`VLOER`; tik in het inrichten op een leeg stuk vloer = `toonVloer`): zelf getekend rood-geel of rood-crème met spikkels, of herhaald plaatje uit `pizza/vloeren.png` (terracotta, kasseien, hout; uit `pizza/vloeren-gemini.jpg`, 288x288 = 6x6 tegels), keuken met kleine terracotta tegeltjes, toonbank, bakstenen muur met deur, deurmat BENVENUTI (`MAT`, daar mag niets staan; `repareer` verplaatst spullen die in oude opslag niet meer passen)), bakstenen muren links en rechts, houten kader
(`RAND`); meubels en ovens met een schaduw naar rechtsonder (`metSchaduw`, schaduwvel per plaatje via `schaduwVel`), figuren met een schaduw onder de voeten; kassageluid = la, belletje en muntjes (`kassa`, `klak`, `toon`), stoelen recht van bovenaf zoals in het origineel, door het spel getekend (`rechteStoel`: gestreepte zitting, of rood kussen bij `hout`; leuning = balk aan de kant van de tafel af; borden staan 1,15 tegel van de stoel richting tafel), vroeger schuin uit `pizza/stoelen.png` (`STOELEN`, `gemStoel`, niet meer gebruikt, uit `pizza/stoelen2-gemini.jpg`: 0 leuning boven = stoel boven de tafel, 1 van achteren = onder de tafel (na de tafel getekend), 2 leuning links, 3 leuning rechts; `stoel` = oude getekende stoel als het plaatje niet laadt), versiering (`VERSIERING`, de knop Plant wisselt bij elke klik net als Tafel: `GROEP`): plant, kapstok, wijnrekje, wijnkast (2x1), servieskast (2x1) uit `pizza/versiering.png` (`VERSIER`, vakjes 360, per soort `vak`/`b`/`hh`/`tw` in `SPUL`; staan op hun vakje en steken naar boven uit); telt mee voor gezellig (max. 3 in de buurt); planten uit `pizza/planten.png` (`PLANTEN`, soort `s.v`: 0 plantje, 1 palm, 2 citroenboompje, 3 cactus; nieuwe planten om de beurt, wisselen met 🔄 in het menu), jukebox recht van voren uit `pizza/jukebox.png` (`JUKEBOX`, uit `pizza/jukebox-gemini.jpg`), tafels uit `pizza/tafels.png` (`TAFELS`, Gemini, onderste rij van `pizza/tafels-gemini.jpg`: 0 marmer, 1 rood-wit geruit = met kleedje, 2 wit kleed met kaars, 3 wit met kaars en wijnfles; 2-3 nog niet gebruikt, bedoeld voor meubelstijlen; het kaarsje tekent het spel zelf), borden (`bord`), poppetjes van bovenaf met kijkrichting (`poppetje`, `kijk`).
Paneel rechts (liggend) of onder (staand): zwart schermpje `#lcd` (`balk`) en een 3x3 knoppenraster `#raster` (`tekenKnoppen`).
Ovens uit `pizza/ovens.png` (`OVENS`, Gemini: 0 uit (van de oven met vuur, vuur weggepoetst), 1 met vuur = bakken, 2 pizza op de schep = inschuiven). Max. 2 ovens (`OVEN_X`: links en rechts, de rechter gespiegeld; opslag met meer ovens krijgt geld terug), per oven een kok (`maakOven`, `stapOven`): 0 = Mario (`KOK`), 1 = Beppe, de bebaarde bakker (`BAKKER2`, `pizza/bakker2.png` uit `pizza/bakkers2-gemini.jpg`: 0 staan, 1-5 lopen, 6-10 deeg kneden; `vel.bijzonder` mag een lijst zijn = animatie). De kok werkt door terwijl de oven bakt (`stapOven`, kok.st vrij/deeg/oven/breng, `o.bak` = pizza in de oven, `BAKKEN`): deeg maken aan de werkbank (`BANK`, `DEEG`),
naar de oven; is daar een pizza klaar, dan eruit en de nieuwe erin, en de klare naar de uitgifte van die oven (`UITGIFTE(i)`: marmeren blad met
belletje naast de werkbank; `b.oven`); een ober loopt langs de uitgifte(s) waar zijn borden staan. Balans (getest, 25 okt, zaak met 8 tafels en
25 stoelen): 1 oven = keuken te traag, 2 ovens + 1 ober = ober te druk, 2 + 2 = goed. Dagoverzicht zegt waarom klanten boos weggingen
(`tel.boosKeuken` / `tel.boosOber`: waren hun pizza's al klaar?). Kok en ober zijn eigen Gemini-ontwerpen, plaatjes van 113x192 naast elkaar; welk plaatje wat is staat per vel in `KOK.vel` / `OBER.vel` (`figuur`). `pizza/kok.png` (15): 0-1 staan, 2-8 loopcyclus opzij met de neus naar rechts (gespiegeld = links; ook gebruikt voor lopen naar voren, want die cyclus is er nog niet), 9 deeg opgooien (van het oude vel, broek wit gemaakt), 10 op de rug, 11-14 lopen naar achteren; uit `pizza/kok2-gemini.jpg` (witte broek) + `pizza/kok-gemini.jpg`. `pizza/ober.png`: zelfde indeling, 9 = stolp optillen bij het opdienen (`serveer`); uit `pizza/ober2-gemini.jpg` + de stolp van `pizza/ober-gemini.jpg`. Sta- en rugplaatjes zijn verkleind tot de hoogte van de loopplaatjes (Gemini tekent die rijen niet even groot). Met borden: `pizza/ober-borden.png` (`OBER_BORD`, vakjes van 180 breed, uit `pizza/ober-borden-gemini.jpg`): 0 staan van voren, 1-7 lopen opzij, 8-11 lopen naar achteren, steeds één bord rechts; 12-19 met twee borden (uit `pizza/ober-borden2-gemini.jpg`: 12 staan, 13-19 opzij, maar 14/16/17 missen een bord en worden overgeslagen: `OBER_TWEE`); van achteren met twee borden tekent `tweedeBord` het tweede. Uitknippen met `extra/knip_figuren.py` (raken figuren elkaar, zoals bij de borden: per losse vorm knippen). Opslag per speler in `pizzabaas:<naam>`. `#tegel` = plaatje.
Pizza's (📖, `toonKaart`, `toonMaak`): `S.menu` = lijst { naam, prijs, stukjes: [{ i, x, y, r }] } (max `MAXMENU`; oude opslag krijgt een
Margherita). Ingrediënten in `ING` (smaak `f` = [vet, zoet, zout, pittig] per stukje, inkoop `k`, soort `s`: it/groen/vlees/vis/gek) met
plaatjes uit `pizza/ingredienten.png` (20 x 64x64 uit de Kenney food-kit, volgorde van `ING`). Soorten klanten in `SOORT` (wil, budget,
kans, uiterlijk); `oordeel(pizza, soort)` = 0-6 (`GEZICHT`), `kiesPizza` kiest per klant de lekkerste (onder 1 = weg, `ZEG.niks`).
Geld lenen (knop 🏦, `toonBank`): "kies de aanbieder" uit `AANBIEDER` (rente = totaal extra, dagen, `max()`, `weiger()`, kleine lettertjes):
Banca Fortuna (10%, 10 dagen, max hangt af van populariteit en omzet van gisteren `S.omzetGisteren`, niet de eerste 2 dagen en niet bij
achterstand), Oma Truus (€200, 0%, 3 dagen, één tegelijk), Ome Sjaak (tot €3000, 60%, 5 dagen). Leenovereenkomst met bedragknopjes, vinkje
"akkoord" en Ondertekenen. `S.leningen` = [{ van, rest, perDag, achter }]; elke avond `aflossen` (in het dagoverzicht); niet kunnen
betalen = achterstand: neven van Sjaak meteen, deurwaarder van de bank na 2 dagen: nemen 2-3 dure spullen mee (nooit tafels/stoelen).
Aflossen kan ook in één keer in het bankscherm. De jukebox zit nu bij de versiering-knop (Plant).
Vragen tijdens de werkdag (`VRAGEN`, ~40 stuks, elk { id, ik, wie, vraag, als?, kans?, a: [[antwoord, () => uitleg]] }): 2-4 per dag
op willekeurige momenten (`planVragen`, `vraagTijden`), dezelfde niet binnen 8 dagen (`S.gehad`); het spel staat stil (`pauze`) tot je
kiest (`toonVraag`, `#vraag`). Gevolgen voor vandaag in `vandaag` (`VANDAAG`: fooi, gezellig, aankomst, oberSnel, ovenUit, op, smaakMin),
voor morgen `S.morgen`, morgen dicht `S.dicht` (de dag erna toont het dagoverzicht "dicht"), hoe vies de zaak is `S.vuil` (keuring),
korting op een ingrediënt `S.korting`, kok naar huis `ovens[1].ziek`/`traag`. "Hoe moet dat eigenlijk?" = `PIZZA_UITLEG` + knop naar de
menukaart. 📖 Pizza's kan nu ook tijdens de werkdag. Een vraag kan een getekend portret hebben (`portret`: vak in `pizza/portretten.png`, 170x310 per vak: 0 agent, 1 belastinginspecteur; vellen `pizza/agent-gemini.jpg`, `pizza/inspecteur2-gemini.jpg` (bebaarde inspecteur met bril)). Een vraag met portret komt echt binnen (`laatBinnen`, `bezoeker`, `stapBezoeker`, `tekenBezoeker`): loopt van de deur naar het midden, dan de pop-up, na Verder weer naar buiten; plaatjes `pizza/bezoekers.png` (rij 0 agent uit `pizza/agent2-gemini.jpg`, 1 inspecteur uit `pizza/inspecteur2-gemini.jpg`; 0-3 van achteren, 4-7 van voren). Kan iemand niet betalen, dan tipt de agent/inspecteur de bank.
Kalender: `S.dag` 1 = maandag 2 november 2026 (`datum`, `weekdag`, `datumKort` op het schermpje, `datumLang` in het dagoverzicht).
Drukte per weekdag `DRUKTE` (ma 0,7 … za 1,5) × `feestdag()` (Pakjesavond, Kerst, Oud en Nieuw, Nieuwjaar, Valentijn: kaarsjes
tellen dubbel) via `vandaag.aankomst`; zondag meer opa/oma, vrijdag meer werkers/studenten (`kiesSoort`). Belasting: niet uitgelegd;
elke avond 15% van de winst erbij in `S.belasting` (`belastingAvond`); op de laatste dag van de maand komt de inspecteur (`INSPECTEUR`,
vraag met voorrang): betalen, of een dag uitstel met 10% (of 25%) boete in `S.aanslag`/`S.aanslagDag`; dan niet betaald = deurwaarder
neemt max. 3 spullen mee (geen tafels/stoelen) en de zaak is een dag verzegeld (`S.dicht`).
Klanten als Gemini-figuren (`KLANTEN` = `pizza/klanten.png`, per figuur een rij van 18 plaatjes van 113x192: 0-6 lopen opzij, 7-10 van
achteren, 11 staan, 12/13 zitten/eten voor, 14/15 achter, 16/17 opzij; `KLANTVEL(rij)`): rij 0 werker, 1 student, 2 villadame, 3 Afrikaanse
man, 4 Chinese dame, 5 Chinese toerist, 6 opa (`opa2`), 7 studente, 8 Afrikaanse vrouw, 9 zakenman, 10 oma (`oma2`); welke soort welke figuren krijgt staat in `FIGUREN` (`m.fig`).
Uitgeknipt per vak van de vaste Gemini-indeling (vellen `pizza/*-gemini.jpg` van 1408x768: onderste rij 7 profielstappen, midden: rug,
zitten voor/eten/achter/eten, onder rechts zitten opzij). Zittend (`tekenKlantFig`): kant 0 = van voren, 1 = rug, 2 = opzij, 3 = opzij
gespiegeld; wie boven of naast de tafel zit wordt vóór het tafelblad getekend (in `tekenSpul`, `voorTafel`), zodat de benen eronder verdwijnen.
Schilderij (`SPUL.schilderij`, bij de versiering-knop; `muur: true` = alleen tegen de linker- of rechtermuur, `aanDeMuur`): 6 schilderijen uit
`pizza/schilderijen.png` (`SCHILD`, `SCHILDERIJEN`, vakjes van 160, uit `pizza/schilderijen-gemini.jpg`; `s.v`, wisselen met 🔄). Hangt er een schilderij, dan kan de geheime vraag komen
(`VRAGEN` id 'gleufhoed'): antwoord C "Een échte Van Gogh" zet `S.achterkamer` (dag). Dan staat linksboven een sleuteltje (`#sleutel`) naar de
achterkamer (`toonAchterkamer`, `#achter`): bestelling van de man met de gleufhoed (`S.opdracht` = { v, prijs, tot }, `nieuweOpdracht`), schilderen
voor €40 (`DOEK`) = minispel `toonAtelier`: het origineel naast een doek van 6x7 (liggend 7x5) vakjes, 5 verfkleuren (k-means op het schilderij),
45 s; kwaliteit q = deel goede vakjes. Vervalsing droogt een nacht (`S.vervalsingen` = [{ v, q, dag }], `droog`); vraag 'koper' haalt hem op
(prijs × (0,25 + 0,75q), niet besteld = minder; C = dubbel vragen, gok); vraag 'rechercheur' (vaker als er vervalsingen liggen): laten kijken =
betrapt (`rechercheurVindt`: in beslag, €300 boete, morgen dicht, populariteit −10), pizza aanbieden = gok, Mr. Gladjanus (€150) = veilig.
Valsmunterij (in de achterkamer): drukpers opknappen (`PERS` €150, `S.pers`), bonnen drukken (`INKT` €20, `toonDrukken`: schuifje 3x in
het groen stoppen, q = gemiddelde) → `S.bonnen` = { q, tot: +3 dagen }: meer klanten (aankomst × 1 + 0,4q) en elke dag kans dat Luigi het
merkt → vraag 'luigiBoos' via `S.verplicht` (lijst vraag-id's die vandaag zeker komen, na 25% van de dag). Luigi komt binnen als bezoeker
(`rij: 2` in `pizza/bezoekers.png`, portret 2/3 in `pizza/portretten.png` = Luigi en boze Luigi, uit `pizza/luigi-gemini.jpg`; ook de
gewone vraag 'luigi'). Sabotage de dag erna (`S.sabotage`, `sabotageVandaag`): rat (`rat`, loopt rond, klanten gillen, tik om te vangen),
stinkbom (minder klanten), keuringsdienst getipt. Plaatjes pers/bonnen: `pizza/drukpers.png` (4 vakjes van 200, uit `pizza/drukpers-gemini.jpg`).
Vlekken en scherven (`vlekken`, `VLEK`: saus, scherven, kruimels, cola, poep; `nieuweVlek`, `tekenVlekken` op de vloer onder alles):
tijdens het eten valt er soms wat; tik erop tijdens het werk om op te ruimen (`vlekBij`); in de buurt van een tafel kost elke vlek een
sterretje gezellig (max. 2); over scherven lopen = "Au!" en populariteit omlaag; wat 's avonds blijft liggen maakt de zaak viezer
(`S.vuil` +0,5 per vlek, keuringsdienst). Dagoverzicht: opgeruimd / blijven liggen. Vragen 'glas' en 'poep' leggen er ook een neer.
Grote oven (knop 🧱 als er 2 ovens zijn, `GROTE_PRIJS`, `S.groot[i]`, `ruimte(i)` = 2): plaatjes `pizza/grote-oven.png` (`GROTE`, uit
`pizza/grote-oven-gemini.jpg`: 0 dicht, 1 gloeiend, 2 met pizza's). Een oven heeft `o.in` = [{ b, t }]; de kok heeft `k.hand` = lijst: bij een
grote oven maakt hij 2 deegjes, schuift ze samen in en brengt er 2 tegelijk weg (anders is hij zelf de bottleneck; getest: 1 grote oven
= bijna niemand boos, 1 gewone oven = 4-18 boos per dag in een zaak van 25 stoelen).
De stad (knop 🗺️ `#stadknop` linksboven, `toonStad`, `#stad`): kaart `pizza/stad-gemini.jpg` (1376x768) met klikbare plekken `PLEK` (x/y/b/h in
kaartpixels). Zonder manager alleen tijdens het inrichten. Bank: lenen aan het loket = 1% minder rente (`aanBalie`, `AANBIEDER.bank.rente` is een
getter); markt: 3 aanbiedingen per dag (`marktAanbod`, vast per dag) = halve prijs op een ingrediënt (`S.korting`); politie: aangifte tegen
Luigi na sabotage (`S.gesaboteerd`, `S.aangifte`; 60% = `S.luigiRust` 10 dagen geen sabotage); studentenhuis: flyers (€15, morgen meer klanten
en 2x zoveel studenten: `S.studentenMorgen` → `vandaag.studenten`); Luigi, Shoarma Ahmet, kunstuitleen, bouwplaats: alleen een tekstje;
drie panden te huur (`huur` per dag, `borg`, `buurt`) voor een tweede (en derde, vierde) pizzeria, zie hieronder.
Plan en volgende stappen: `pizza/PLAN.md`.
Paneel op de telefoon: de knoppen Tafel en Plant (versiering) en Obers openen een keuzelijstje met plaatje, naam en prijs (`toonKeuze` in `#menu`,
`dataset.knop`; staand boven de knop, liggend links ervan), want in staande stand staan er geen prijzen op de knoppen. Obers: aannemen
(max. 3) of ontslaan (min. 1). Koks en obers staan ook 's ochtends al in de zaak (`maakPersoneel` bij het laden, na elke dag en na kopen/ontslaan).
Inzoomen (`zoom` 1-3, `zetZoom`, `zoomMidden`): knop 🔍 (`#zoomknop`, 1 ↔ 1,8), knijpen met twee vingers (`vingers`, `knijp`), muiswiel; ingezoomd
schuif je met een vinger over de lege vloer (`schuif`; tikken zonder schuiven = nog steeds vloer kiezen) en tijdens het werk overal.
Ingrediënten komen uit de voorraad: de groothandel rekent 's avonds af (`tel.ing`, in `eindeDag`), dus het geld zakt niet meer tijdens de dag.
Dagoverzicht: Ingrediënten (groothandel) en Andere kosten apart.
Elk poppetje telt voor anderhalve klant (`TELT` = 1,5, `kl()`): pizzaprijs, fooi en inkoop × 1,5, en de aantallen in het dagoverzicht en op het
schermpje (PIZZA'S) zijn `kl(n)`. Zo kan de zaal kleiner (minder tafels, zoals het origineel) zonder dat de omzet instort. Keuken en deur
rekenen met `W` (`OVEN_X`, `BANK`, `UITGIFTE`, `DEUR`, `MAT`).
iPhone: knoppen en de melding staan onder het randje bovenin (`env(safe-area-inset-top)`, `veiligBoven` in `maat`).
De tweede ober (`o.dame`, obers[1]) is een Italiaanse mamma: `DAME` (`pizza/obera.png`, uit `pizza/obera-gemini.jpg`), `DAME_BORD`/`DAME_TWEE`
(`pizza/obera-borden.png`, uit `pizza/obera-borden-gemini.jpg`; indeling staat bij `DAME` in de code). Opzij met twee borden tekent
`tweedeBord` het tweede achter haar.
Gerrit Gleufhoed (de man met de gleufhoed, vragen 'gleufhoed' en 'koper'): bezoeker rij 3 in `pizza/bezoekers.png` en portret 4 in
`pizza/portretten.png` (uit `pizza/gerrit-gemini.jpg`; `gerrit1-gemini.jpg` = eerste, te realistische versie, niet gebruikt). Geef je het goede
antwoord ("Een échte Van Gogh"), dan krijgt de bezoeker `achter` en loopt hij na Verder niet naar buiten maar door het klapluik in het midden
van de toonbank (`LUIK_X`, `luikOpen`) en de keuken naar het geheime deurtje achterin (`deurOpen`; het deurtje is er pas met `S.achterkamer`),
daarna gaat de achterkamer open en staat de dag stil (`achterPauze`, tot je de achterkamer dichtdoet). Getekend in `tekenLuikEnDeur`.
De uitgiftes staan links en rechts van het luik (`UITGIFTE`), de obers wachten ernaast (niet ervoor).
De kok gaat de zaal in (`kokRust`, kok.st 'uit' → 'praat' → 'terug', `k.fase` luik/door/zaal/keuken): als hij niks te doen heeft, soms door het
luik naar een etende klant: "Is het lekker?" (`ZEG.kok`, antwoord naar `m.oordeel`: `ZEG.lekker/gaat/vies`, populariteit ±). Eén kok tegelijk.
Een leuke dame (`DAMES` = figuren 2, 4, 7, 8; 60% kans dat hij haar kiest) = 6-11 s kletsen met hartjes (`ZEG.dame`, `ZEG.charme`), zij geeft
€3 extra fooi (`m.chef`). Ligt een klare pizza langer dan `VERBRAND` (9 s) in de oven, dan brandt hij aan: opnieuw in de `wachtrij`, opnieuw
inkopen, zwarte rook (`o.rook`), `tel.aangebrand` in het dagoverzicht, en de kok rent terug (`k.schrik`, `k.haast`).
Zonder werk staan koks en obers niet steeds op dezelfde plek: de kok loopt wat rond in de keuken (`k.plek`), de ober staat de helft van de
tijd ergens in de zaak (`oberRust`, `ob.plek`).
Manager (`S.manager` = { wie, sinds, dagen, opslag }, `MANAGER`: kevin €20 / sandra €45 / bruno €90; aannemen via de knop Personeel (vroeger
Obers) vanaf `MAG_MANAGER` = populariteit ≥ 40, ≥ 3 pizza's, dag ≥ 7; ontslaan kan daar ook). Loon `MANLOON` in `eindeDag` (geld daarna < 0 =
de manager neemt ontslag). Figuur in de zaak: `man`, `stapManager`, `tekenManager`, plaatjes `pizza/managers.png` (rij 0 Kevin, 1 Sandra,
2 Bruno; vakjes 150x192; indeling bij `MANAGER` in de code). Met een manager kan 🗺️ ook tijdens het werk: dan loopt de dag door, en `isWeg()`.
Gewone vragen regelt de manager (`managerVraag`): met kans `belt` belt hij je (de vraag komt in de stad, `#vraag` z-index 9), anders kiest Kevin
een willekeurig antwoord (met gevolgen) en regelen Sandra/Bruno het zonder gevolgen. Vragen met een bezoeker (portret) wachten tot je terug
bent. Kevin belt ook om onzin (`ONZIN`). Sandra en Bruno ruimen vlekken op. Bruno: fooi × 1,12, en elke 5 dagen vraag 'opslag' (via
`S.verplicht`; nee = 40% kans dat hij vertrekt). Terug in de zaak: `toonWegLog` laat zien wat er gebeurde (`wegLog`). Dagen in dienst tellen
mee voor de tweede pizzeria (≥ 7).
Meer pizzeria's (`S.zaken`, `S.zaak`, `ZAAKVELD`, `BUURT`): per zaak eigen spullen, ovens, obers, grote ovens, vloer, populariteit, manager,
vuil, huur en buurt; van de zaak waar je bent staan die velden in S zelf (`bewaarZaak`, `wisselZaak`), de andere in `S.zaken[i]`. Geld, menu,
leningen, belasting en de achterkamer (alleen in de eerste zaak: sleutel en deurtje) zijn gedeeld. Huren in de stad (pand `huur1-3`): kan als de
manager van je huidige zaak ≥ 7 dagen in dienst is; borg €2000/€3000/€4500, huur €40/€70/€110 per dag. Wisselen in de stad, alleen 's ochtends
(knop "Naar deze zaak"). Buurt: andere klanten (`BUURT[..].soort` in `kiesSoort`) en drukte (`aankomst`). Een zaak waar je niet bent rekent
`simuleerZaak` 's avonds door (stoelen × populariteit × drukte, begrensd door ovens en obers; Kevin 80%); zonder manager dicht maar wel huur.
In het dagoverzicht per andere zaak een regel. Getest 27 okt: toeristen kwamen naar het plein, Sandra's zaak gaf op zaterdag 52 klanten.
Stoelsoorten (`STOELSOORT`, `s.stijl`, `stijlVan`; oud `s.hout` = kussen): blauw/groen gestreept, rood kussen, zwart leer, riet, krukje (rond,
zonder leuning); kiezen in het stoelmenu met kleurknopjes, nieuwe stoelen krijgen de laatst gekozen soort (`S.stoelStijl`). Staat er maar één
stoel aan een kant van een tafel, dan staat hij (en wie erop zit) recht voor het midden van die kant (`indeling().plekVan`, alleen getekend: de
stoel bezet nog steeds zijn eigen tegel). Stadskaart op de telefoon: 920 px breed in `#kaartrol` (schuiven met een vinger), begint in het midden.
Barrie de Bink (vraag 'barrie': komt in de eerste zaak als je de achterkamer hebt en Luigi je de laatste 5 dagen saboteerde; bezoeker rij 4 in
`pizza/bezoekers.png`, portret 5 in `pizza/portretten.png`, uit `pizza/barrie-gemini.jpg`; zijn derde rugplaatje was eigenlijk van voren en is
vervangen). Antwoord C ("Wraak is een gerecht…") = `S.barrie`, hij loopt net als Gerrit door het luik naar de achterkamer. Daar het klusjesbord
`KLUS` (stinkbom, ratten, nep-recensie, keuringsdienst tippen): kost geld, geeft `dagen` lang meer klanten (`S.klus`, `bonus` in openDeuren),
maar met kans `risico` gesnapt (€200 boete, populariteit −8) of ziet Luigi het (morgen sabotage). Elke klus verhoogt `S.ruzie` (0-100,
`ruzieTekst`); elke avond kans ruzie/300 dat Luigi zelf saboteert, ruzie −5. Vrede (`VREDE`): limoncello (5 dagen) of grappa (8 dagen) =
`S.luigiRust`, ruzie 0. Op de stadskaart zie je bij Luigi wat er aan de hand is.
Crypto (`S.crypto` = { koers, hist (20 dagen), bezit, nieuws }, `crypto()` maakt het aan): munten `MUNT` (Bitkaas rustig … DogePizza wild,
`vol`), elke avond `cryptoAvond` (willekeurige sprong, 30% kans op `CRYPTONIEUWS` met een grote klap; MozzaMunt kan herstarten na een
instorting). Erbij komen: Gerrit betaalt een vervalsing in 45% van de gevallen in crypto, en klant-vraag 'cryptoklant'; dan `kiesMunt` (via
`naVraag`, na Verder): je kiest de munt zonder de koers te zien. Laptop in de achterkamer (`cryptoBlok(false)`: koers, grafiekje `koersLijn`,
bezit, munten kopen voor €50). Euro's ervan maken: alleen bij Snelle Sjonnie in de stad (`PLEK.wissel`, `cryptoBlok(true)`, 10% commissie).
Het dagoverzicht toont het cryptonieuws als je munten hebt.
Minispel Toren van Pizza (`toonToren`, `#toren` z-index 10, canvas `#torendoek` 360x540; via de bouwplaats in de stad, knop "Pizza's stapelen"):
een pizza slingert (`hangX`, sneller en wijder naarmate de toren hoger wordt), tik = vallen (`torenTik`); landen naast de vorige maakt de
toren scheef; na elke pizza: rust alles boven laag j nog op pizza j-1 (zwaartepunt binnen 0,95 × straal)? Zo niet: omvallen (`T.om`).
Binnen 4 px = "Perfetto!" (precies erop). Pizza's zelf getekend (`tekenTorenPizza`). Record `S.torenBest`; online scorebord onderdeel
`pizzatoren`, modus `gewoon` (zelfde `BORD_URL` als Fladderfeest; alleen met naam en alleen een beter record, `pizzabaas_ingestuurd:<naam>`,
laatste lijst in `pizzabaas_bord`); de Scores-app kent het als "Pizzabaas / Toren van Pizza". Achtergrond `pizza/toren-achtergrond.jpg` (uit `pizza/toren-achtergrond-gemini.jpg`, schuift langzamer mee omhoog).
De Toren van Pizza als stadsproject (`S.toren` = { fase 0-4, bouwt: { tot }, open }, `torenBij`, `TORENFASE`: €500/€1000/€1500/€2000, 2-4 dagen
bouwen per stuk): op de bouwplaats meebetalen; op de stadskaart staat de toren (`.torenkaart`, `pizza/toren.png` = 4 vakjes van 300x400 uit
`pizza/toren-gemini.jpg`: fundering, een derde, twee derde, af). Na fase 4: "Lint doorknippen" = `toonToren(true)`, de openingswedstrijd:
populariteit + min(15, 3 + score) in alle zaken, `S.toren.open`. Daarna (`torenOpen`) twee keer zoveel toeristen en 10% meer klanten.
Bezorgdienst (`S.bezorg` = { sinds }, starten/stoppen via Personeel; scooter €300, bezorger €15 per dag, `BEZORG`): tijdens het werk
telefoontjes (`nieuweBestelling`, vaker bij hogere populariteit en drukte; Barrie's klus 'scooter' = Luigi's banden lek: ×1,6) met 1-4 pizza's
naar een adres (`STRATEN`). Ze staan in de `wachtrij` als { m: { pizza }, bezorg } (de keuken bakt ze tussen de tafels door; `weg` en `breng`
in `stapOven` kennen ze). De bezorger (`bezorger`, `stapBezorg`, voorlopig het studentfiguur met rode pet en pizzadozen, `tekenBezorger`)
haalt ze op, loopt de deur uit, is `ritT` weg (balkje linksboven: `tekenRit`), soms met een `VOORVAL` (lekke band, regen, verdwaald,
geflitst, punt opgegeten, verjaardag), en rekent af: prijs × TELT − €2,5, plus fooi; later dan `KOUD` (55 s) = half geld en populariteit −1.
Dagoverzicht: aantal bezorgd, koud, voorvallen; loon bezorger bij de lonen. Figuur `pizza/bezorger.png` (`BEZVEL`, uit `pizza/bezorger-gemini.jpg`, vakjes 170: 0-6 opzij met dozen, 7-10 van achteren, 11 staan) en
`pizza/scooter.png` (`SCOOTER`, rijdt over het balkje in `tekenRit`).
Einde van het spel: drie avonden achter elkaar rood (`S.rood`, waarschuwing in het dagoverzicht) = failliet (`toonFailliet`, met `eindStand`);
het doel = Pizzakoning (`toonKoning`, `S.koning`): 2 zaken, de Toren van Pizza open en € 10.000; daarna kun je doorspelen. Opnieuw beginnen
(`herstart`: nieuwe opslag, alleen `torenBest` blijft) kan altijd via 📊 Gisteren.
