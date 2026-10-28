# Pizzabaas (`pizzabaas.html`, plaatjes in `pizza/`)

Plan en afspraken: `pizza/PLAN.md`.

Pizzabaas (`pizzabaas.html`, concept, idee van Pizza Tycoon maar met eigen naam en grappen): eigen pizzeria van bovenaf op een raster
van 13x13 vloertegels (was 15x15; opslag `versie: 4`: wat bij het verkleinen niet meer past wordt terugbetaald, `S.verbouwd` = melding) zoals in het oude spel (`W`, `H`, `T` = 48; rij 0-2 keuken met ovens en koks, deur onderaan `DEUR`). Tafels en stoelen (1x1) los, zoals in het
origineel; stijl per tafel/stoel `s.hout` (wisselen in het menu; nieuwe krijgen de laatst gekozen stijl `S.houtStoel`/`S.houtTafel`): houten caféstoel met rood kussen = tweede rij van `pizza/stoelen.png`, houten tafels `pizza/houten-tafels.png` (`HOUT`; met een kleed ligt het kleed erop); tafels (`TAFELSOORT`, de knop Tafel wisselt bij elke klik): `tafel` 2x2 (alle kleedjes), `lang` 2x4 en `langL` 4x2 (lange tafel, ↻ Draaien in het menu, kleedjes rood/wit: `SPUL.kleden`), `tafeltje` 1x1 (sinds 27 okt ook alle kleedjes: het kleed uit `pizza/kleden.png`, kleiner); plaatjes `pizza/lange-tafels.png` (`LANG`, uit `pizza/lange-tafels-gemini.jpg`) (opslag `versie: 3`; versie 2 had vaste sets tafel2/tafel4, die `zetOm` omzet naar tafel + stoelen in een molentje): een stoel hoort bij de tafel waar hij tegenaan staat
(`kantVoor`, `indeling` → `stoelPlekken(tafel)` = { sx, sy, kant, stoel }, kant 0 boven/1 onder/2 links/3 rechts, `RICHTING`); groepjes van 1-6 zoeken een tafel met genoeg vrije stoelen;
de ober komt achter de stoel staan; tekenvolgorde: stoelen boven/naast, dan tafels en de rest, dan stoelen eronder; poppetjes ongeveer een tegel groot (`MENS`). Oude opslag zonder `versie: 2` krijgt zijn
spullen terugbetaald en begint opnieuw met twee tafeltjes. Twee standen (`modus`): inrichten (spullen uit `SPUL`
kopen en neerzetten: tafel, stoel, plant, jukebox (2x2; oude opslag met een 1x1-jukebox krijgt een vrije plek of geld terug);
vasthouden en slepen = verplaatsen (`sleep`), tikken = menu met kleedje (`KLEED`: 11 kleedjes als kleurknopjes, `s.kleed` = naam, oud `true` = 'rood' via `kleedVan`; €10, chic ✨ €20 en +1 gezellig; ronde = ronde tafel; plaatjes `pizza/kleden.png` (`KLEDEN`, vakjes 192x192)), kaarsje (`EXTRA`) en verkopen; extra ovens en obers in `PERSONEEL`) en open (een werkdag van `DAG` = 100 s, 17:00-22:00). Klantengroepjes (`groep`) zoeken een vrije
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
manager van je huidige zaak ≥ 7 dagen in dienst is; borg €3500/€5500/€8000, huur €40/€70/€110 per dag. Wisselen in de stad, alleen 's ochtends
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
bezit). Bankrekening `S.bankSaldo`: bij de bank in de stad contant storten en opnemen; op de laptop kopen (van de bank) en verkopen (naar de bank)
met `PROVISIE` 3% (wisselen = verkopen + kopen = twee keer provisie). Crypto meteen contant: bij Snelle Sjonnie (`PLEK.wissel`, `cryptoBlok(true)`, 10%).
Failliet en Pizzakoning tellen het bankgeld mee.
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
geflitst, punt opgegeten, verjaardag, start niet; samen ~1 op 7 ritten; `pech` = lekke band en starten: met het onderhoudsabonnement `S.bezorg.abo` (€8/dag, via Personeel) 85% minder en ritten 10% sneller), en rekent af: prijs × TELT − €2,5, plus fooi; later dan `KOUD` (55 s) = half geld en populariteit −1.
Dagoverzicht: aantal bezorgd, koud, voorvallen; loon bezorger bij de lonen. Figuur `pizza/bezorger.png` (`BEZVEL`, uit `pizza/bezorger-gemini.jpg`, vakjes 170: 0-6 opzij met dozen, 7-10 van achteren, 11 staan) en
`pizza/scooter.png` (`SCOOTER`, rijdt over het balkje in `tekenRit`).
Einde van het spel: drie avonden achter elkaar rood (`S.rood`, waarschuwing in het dagoverzicht) = failliet (`toonFailliet`, met `eindStand`);
het doel = Pizzakoning (`toonKoning`, `S.koning`): 4 zaken (alle panden), de Toren van Pizza open en € 25.000 (contant + bank); daarna kun je doorspelen. Opnieuw beginnen
(`herstart`: nieuwe opslag, alleen `torenBest` blijft) kan altijd via 📊 Gisteren.
Tekenvolgorde (27 okt): spullen en mensen in één lijst van achter naar voor (`spulItems` + `alles` in `teken`, sleutel = onderkant; stoel onder
de tafel net na de tafel, zittende klant `zitY` net na zijn stoel), zodat wie achter een tafel loopt niet over de tafel of de hoofden getekend
wordt. Lopen (`zoekPad`, `loopNaar`): geen weg = naar de dichtstbijzijnde bereikbare cel (`dichtst`), niet meer rechtdoor; `bereik` (in
`maakBezet`) = vrije cellen die je vanaf de deur haalt (geen ingesloten hokjes); `vrijBij` = dichtstbijzijnde bereikbare vrije plek (voor
wachtplekken, de uitgifte, achter een stoel); staat iemand in een hokje of in een spul, dan eerst daaruit; een oude route wordt opnieuw
gezocht als iemand intussen ergens anders was (`padPos`) of als de weg naar het volgende tussenpunt dicht is (`lijnVrij`). Klanten lopen naar
de echte stoel en schuiven bij het zitten naar de getekende plek. Getest: in een drukke dag bijna niemand meer binnen een tafel.
Schilderij hangt aan de zijmuur (smal en schuin getekend in `tekenSchilderij`), niet meer plat op de vloer.
Pizza's (27 okt): bodem `pizza/bodem.png` (uit `pizza/bodem-gemini.jpg`, met gesmolten kaas) en per stukje een groepje beleg uit
`pizza/beleg.png` (20 vakjes van 128, volgorde van `ING`, uit `pizza/beleg-gemini.jpg`; ook voor de knopjes `.ing`). In de zaak staat de echte
pizza op het bord en op de uitgifte (`kleinePizza` = 96 px plaatje per pizza, `pizzaFoto`). Achterkamer: één schilderij per dag; na het
schilderen of drukken ga je terug naar de pizzeria.
Achterkamer één keer per dag (`S.achterDag`): het sleuteltje linksboven werkt daarna niet meer (half doorzichtig, melding "morgen weer");
als Gerrit of Barrie je meeneemt telt dat ook als het bezoek van die dag. Onderin de achterkamer: de laptop (crypto) en Barrie's klusjes.
Vragen (27 okt): nu 92 (26 uit een lijst van Gemini, uitgezocht en aangepast; hulpjes `morgenKl`, `kokTraag`, `oberTempo`, `ietsOp`), o.a. kokjarig, tiktok, vegan, blinddate, haring, wielrenners, snurk, goochelaar, supermarkt, patat, schoolreis, kat,
wachtwoord, aanzoek, bierfiets, nonna; meer praatwolkjes in `ZEG` en `LEKKER`. Gerrit komt ook zomaar langs ('gerritlangs', tip: bestelling
+€50). Gravin Gloria van Glitterstein ('gravin', kunstverzamelaar, roze bontjas, hondje Fifi): als er een droge vervalsing ligt, biedt ze het
dubbele van Gerrit, maar alleen bij q ≥ 0,7; anders "NEP!" (populariteit −4 en de kunstrechercheur komt: `S.verplicht`). Bezoeker rij 5 in `pizza/bezoekers.png`, portret 6 (uit `pizza/gravin-gemini.jpg`).
Vaste figuren (`FIGUUR`, na `VRAGEN`): elk ±5 vragen die hun `wie`, `rij` en `portret` krijgen: Opa Henk (rij 6, portret 7), Kimberley de
influencer (7/8), Kees van de markt (8/9), Wethouder Wim (9/10), Zuster Zoë (10/11); plaatjes uit `pizza/henk|kimberley|kees|wim|zoe-gemini.jpg`
(knippen: zelfde indeling als Gerrit: boven 4 rug, onder 4 voren, rechts portret). Zoë's griepprik = `S.griepvrij` (30 dagen geen zieke ober/Beppe).
Nu 106 vragen.
Achterkamer per zaak (`achterOpen()`: zaak 1 = `S.achterkamer` via Gerrit, andere zaken = `S.kamer`; `kamer` en `achterDag` staan in `ZAAKVELD`).
Overal de laptop en Barrie (vraag 'barrie' kan in elke zaak met een achterkamer). Zaak 1: atelier (Gerrit, gravin), en de drukpers alleen als
die al gekocht was; studentenbuurt: drukpers (open via vraag 'printer', antwoord C); plein: gokhal (vraag 'gokker': raad zwart/rood/groen,
`gokRaad`, goed = open, groen = +€100). Villawijk: wijnkelder (vraag 'kelder', antwoord C). Gokhal (`toonGokhal`, `tekenGokhal`, `draaiWiel`,
`klaarWiel`, Europese roulette `WIEL`, `FICHE` = €10): fiches kopen met contant of met al je munten van één crypto (−5%), inzet 1/2/5/10 op
rood/zwart/even/oneven (×2) of groen (×36), drie rondes, daarna fiches automatisch terug in de kassa; 4% kans op een inval per draai
(fiches weg, €100 boete, populariteit −3). In die zaak vragen 'gokwinst' en 'gokverlies'. Vraag 'pepperoni' (pepperoni-roulette) overal.
Stadskaart: eigen zaken tonen hun populariteit (⭐). Eetwedstrijd bij het studentenhuis (`toonEet`, `EET`, scherm `#eet`; één keer per dag
`S.eetDag`, €10 inleg): 20 s tikken op je pizza (5 happen = 1 punt, na elke 6 punten eerst 🥤 slurpen) tegen Vreetzak Vincent (~1,6 punt/s, soms
een boer); winnen = €60, populariteit +2, morgen meer studenten. Record `S.eetBest`, scorebord-onderdeel `eetwedstrijd` (`stuurRecord`, `bordLijst`).
Getest: 6 tikken/s = gelijkspel, 8/s = winst.
Wijnkelder "Château Kraanwater" (villawijk): bestelling `S.wijnOrder` (naam, jaar, fles, 3 van de 5 versieringen `WIJNDECO`), te zien in de
achterkamer (`wijnBlok`); namaken in `toonWijn` uit je hoofd (fles, versieringen, jaar), 6 flessen voor €18 (`WIJNBATCH`), q = 0,6 versieringen
+ 0,25 jaar + 0,15 fles. `S.wijn` = { n, q, naam, jaar }: tijdens de dag kopen villabewoners (en soms anderen) bij het eten een fles voor
€20 + €70q (`tel.wijn` in het dagoverzicht). Sommelier Sébastien (vraag 'sommelier', bezoeker rij 11, portret 12, uit `pizza/sommelier-gemini.jpg`)
proeft als er flessen liggen: q < 0,8 = betrapt (flessen weg, €150 boete, populariteit −5). Plaatjes `pizza/wijn.png` (13 vakjes van 160, uit
`pizza/wijn-gemini.jpg`, volgorde staat bij `WIJNNAAM` in de code; `wijnDing`).
Doelen (knop 🎯 `#doelknop` linksboven, `DOELEN`, `controleerDoelen` na elke `tekenKnoppen`, `toonDoelen` in het `#einde`-scherm): 17 doelen van
"tafel met 4 stoelen" tot "Pizzakoning", alleen de gewone kant (de schimmige wereld zoek je zelf uit); `S.doelen` = { id: dag }, per doel wat geld.
Lijst toont de gehaalde, de volgende 3, de rest op slot. `S.stad` (stad bezocht), `S.besteDag` (meeste klanten op één dag). Een doel-melding
blijft 4,5 s staan (`doelMeldTot` in `meld`).
Stoel-knop opent ook een keuzelijstje (6 stoelsoorten, `S.stoelStijl`). Aanraken (telefoon): de tweede tik mag tot 1 vakje naast het voorbeeld
vallen en zet hem dan neer op de plek van het voorbeeld (op de iPhone ging het neerzetten anders vaak mis).
Stoel tussen twee tafels: `stoelTafels(x, y)` = alle tafels ernaast, `s.bij` = 'x,y' van de gekozen tafel (knop "↔ Bij de andere tafel" in het
stoelmenu; `kantVoor(x, y, bij)`). Vlekken vallen op de dichtstbijzijnde vrije vloer (`vrijBij` in `nieuweVlek`), niet meer onder een stoel.
Groepjes (`nieuweGroep`): eerst de kleinste vrije tafel waar iedereen aan past; lukt dat niet, dan verdelen ze zich over meer vrije tafels (elk
een eigen `groep`, "Dan zitten we wel apart!"), maar de helft van de groepjes (`samen`) wil per se bij elkaar en gaat anders weg; pas als er te weinig vrije stoelen zijn: vol. Een tafel is nog steeds van één groepje.
Pizza-acrobatiek op de markt (`toonAcro`, `ACRO`, scherm `#acrob`, één keer per dag `S.acroDag`): Mario gooit deeg op, tik als het vallend in de
vanghoogte is (binnen 14 px = perfect, combo); per vangst geld (meer naarmate je langer volhoudt), elke 5 vangsten een kunstje +€5; 3 levens.
≥ 10 keer = populariteit +1 en morgen wat meer klanten. Record `S.acroBest`, scorebord `acrobatiek`. Keuzelijstjes hebben een tip onderaan
(`toonKeuze(…, voet)`): kleedje/kaarsje = tik op een tafel, stoel veranderen = tik op die stoel.
Oud-pizzeria: stoelsoort `hout` (kale houten stoel met planken, bij de houten tafel) en kleed op de punt (`s.punt`, knop in het tafelmenu, niet
voor ronde kleedjes `KLEED[..].rond`): eerst de kale tafel (hout of marmer), dan het kleed 45° gedraaid en kleiner erop.
Tempo en tegenvallers (27 okt): maandag is de zaak dicht (`eindeDag` slaat hem over; `laatsteVanDeMaand` = laatste wérkdag, dus de inspecteur
komt op tijd); populariteit stijgt steeds moeilijker (`repRem` in `rep`: 40 → 75%, 60 → 50%, 80 → 25%, 100 → 15% van de normale stijging; dalen gaat gewoon). Tegenvallers met meer kans bij veel
geld: 'ovenkapot', 'energie', 'lekkage', 'huisbaas' (verhoogt `S.huur`, max. eens per 14 dagen). Luigi-ultimatum (`luigiUltimatum`, drie kwaden: € 150, keuringsdienst of een bord in je raam; via `S.verplicht` als `S.ruzie` ≥ 45). Jaloerse Luigi (`luigiJaloers`, via
`S.verplicht` in `eindeDag` bij > €1000). Vaste bezoeken in `openDeuren`: Gerrit 1-2 dagen na het ophangen van een schilderij (`S.gerritNa`, daarna om
de 4 dagen tot het goede antwoord), Luigi op dag 5 (`S.luigiKwam`). Getest 30 dagen: populariteit 30-58, Gerrit en Luigi komen langs.
Te vrijgevig (`S.lief`): een antwoord dat geld kost en populariteit, gezelligheid of fooi oplevert telt +1 (in `toonVraag`); elke avond −0,3.
Vanaf 3: kans op 'profiteurs' (willen gratis eten), 'personeelBoos' (ober en Mario willen ook wat) of 'boekhouder', via `S.verplicht`.
Zo is het klantvriendelijkste antwoord niet altijd het beste.
Manager-vragen (`zelf: true` = die regelt de manager niet als je weg bent; `wie` mag een functie zijn): 'manOpslag' (na 4 dagen bij > €600:
+€15, +€5, of nee = kans op ontslag of mopperen `S.manager.mopper`, dan ruimt hij/zij niet op), 'manVrij' (morgen vrij: `S.manVrij`,
`manAanwezig()`; dan niet de stad in tijdens het werk), 'manLuigi' (na 12 dagen: Luigi biedt €25 meer; laten spioneren = gok). Bruno houdt zijn eigen 'opslag'.
Diner voor de sterrenchef (vraag 'sterrenchef', vanaf populariteit 45, eens per 12 dagen `S.chefDag`; `toonDiner` in het `#achter`-scherm, `pauze`):
3 gangen (`DINER`; hoofdgerecht = willekeurige `CHEFSMAAK`), per gang een pizza van de kaart (`chefOordeel`: afstand tot het smaakdoel, variatie,
groente bij het voorgerecht, geen gek/vlees waar het niet hoort) + wijn (`DINERWIJN`: wit, rood, zoet; champagne half goed). Totaal 0-21:
≥ 18 = 3 sterren, ≥ 13,5 = 2, ≥ 9 = 1. Populariteit −5/+2/+5/+9 in al je zaken en €0/30/80/150; ingrediënten €30. `S.chefSterren` = beste.
Tempo: na 21:30 (90% van `DAG`) geen nieuwe klanten of telefoontjes; na sluitingstijd loopt de tijd 3x zo snel; knop ⏩ (`#snelknop`, `snel`) = 2x.
Ranglijst: `zaakWaarde()` = kas + bank + crypto + de helft van spullen, extra ovens en borg van de panden − leningen en aanslag. In het
dagoverzicht met twee lijsten (`#dagbord`, `#dagbord2`): onderdeel `pizzawaarde` (record `S.waardeBest`) en `pizzamaand` (waarde na 30 dagen,
`S.maandWaarde`, de eerlijke wedstrijd). Scores-app kent ze. Een manager die al in een andere zaak werkt, staat niet in het lijstje.
Telefoonbestellingen stoppen om 21:00 (80% van `DAG`), zodat de scooter niet na sluitingstijd nog rijdt.
Andere zaak: vraag `belZaak` (alleen als een andere zaak een manager heeft, `andereZaak()`): de manager belt met een probleem uit `BELPROB`
(Luigi alleen bij zaak 1). Zelf gaan: zonder manager hier een zzp'er (€ 90) of de deur even dicht (`volgendeKlant += DAG * 0.12`, rep −1);
laten oplossen = kans Sandra 50%, Bruno 40%, Kevin 20%, mislukt = `z.pech = S.dag` (die zaak 60% van de klanten in `simuleerZaak`) en rep −6.
Het menu geldt voor de hele keten. Geen plek (vol) kost maar 0,2 populariteit per groepje (was 1: een nieuwe zaak met 4 stoelen zakte naar 0).
Manager in de tweede, derde… zaak: meteen (`MAG_MANAGER`: populariteit 40 alleen in de eerste zaak). `belZaak` kiest elke dag een willekeurige
andere zaak met manager (`belZ`), en de vraag komt hooguit eens per 8 dagen. Doelen voor later in het spel: manager2, zes, vijftig, rep80, chef,
maand, derde, spaar (vóór Pizzakoning). Gerrit en de achterkamer via het schilderij horen alleen bij zaak 1; Gerrit wacht tot je daar weer staat.
Belasting, boekhouder en inspecteur gaan over de hele keten en komen waar je die dag staat.
Dag korter: `DAG = 100` (was 120). Belasting elke twee weken: `belastingDag()` = de 15e (of de 14e als de 15e een maandag is) en de laatste
werkdag van de maand; de boekhouder komt op de 9e-13e of vanaf de 24e, één keer per helft (`periode()`, bewaard in `S.bhMaand`).
Luigi (luigiJaloers, luigiUltimatum, sabotage) doet nu bij elke zaak mee ("helemaal hierheen gefietst").
Vragen kunnen een eigen rusttijd hebben (`rust: () => dagen`, standaard 8); `belZaak` = 8 / aantal andere zaken met manager (minimaal 2).
Nieuwe vragen: `bedorven` (ingrediënt uit het menu, `bedorven`; dure markt / toch gebruiken / zonder), goede doelen `voetbalclub`, `voedselbank`,
`sponsorloop` (`sponsor: true` = telt niet mee voor `S.lief`, te vrijgevig). Reclamebord bij de bouwplaats: € 150 (`RECLAME`), 7 dagen
`S.reclame.tot`, rep +3 en 15% meer klanten in alle zaken (ook in `simuleerZaak`).
Luigi is ook jaloers zonder uitlachen: een avond met meer dan € 300 winst geeft ruzie erbij (`totaal / 120`, max 8), het reclamebord +10 en de
vraag `luigiBord` de dag erna (via `S.verplicht`). Sabotage blijft kans `S.ruzie / 300` per avond.
Op de pof: `S.pof = [{ wie, bedrag, dag }]` (`opDePof`, vragen portemonnee A en gokverlies A); elke ochtend `pofBetalen` (kans 22%, gokker 8%,
+25% na de herinneringsbrief `S.pofBrief`); in het dagoverzicht "Nog op de pof". Vraag `debiteuren` (boekhouder, vanaf € 40 en iets ouder dan
6 dagen): brief / incasso (60% terug, rep −2) / doorstrepen (`S.lief` +1).
Voorraad per zaak (knop 📦 Voorraad, `toonVoorraad`; ZAAKVELD `voorraad`, `verbruik`): in stukjes, een pizza gebruikt deeg + zijn stukjes × TELT
op het moment van bestellen (`gebruik`, ook bezorgingen; aangebrand = nog eens). Kosten bij het inkopen (`inkopen`): 's ochtends via
`S.inkoopVandaag` (komt bij het openen in `tel.inkoop`/`tel.kosten`), overdag via `ge` voor dubbele prijs (markt). De oude inkoop bij het bakken
(`tel.ing`) is weg. `kanMaken`/`kiesPizza.uitv`: op = andere pizza of weg (`tel.uitverkocht`, rep −0,3). 's Nachts bederft 10% (`eindeVoorraad`,
`tel.bedorven`). `voorstel()` = gisteren × 1,25 (× 1,6 als er iets op was, `S.opGeweest`) of een schatting, min wat er ligt. `S.autoBestel`
(standaard aan, `autoAan()`): Mario bestelt bij het openen vanzelf het voorstel, zodat het voor beginners niet moeilijker wordt; vanaf de tweede zaak niet meer (afspraak met Marcel: dan moet je zelf inkopen). `S.korting` (markt) = halve
prijs bij het inkopen. Na het wisselen van zaak is `S.voorraad` null: die wordt gratis gevuld (de manager kocht in, betaald in `simuleerZaak`;
Kevin vergeet dat soms: 60% van de klanten). De knop Open staat nu over de hele breedte (10 knoppen).
Portretten 13-18 in `pizza/portretten.png` (nu 19 vakjes; css-breedte 1615px), uit `pizza/figuren2-gemini.jpg`: 13 boekhouder, 14 de twee
kleerkasten (incasso), 15 voetbaltrainer, 16 vrijwilliger voedselbank, 17 meisje met hond, 18 knalrode Luigi (vraag `luigiBord`). Nieuw veld
`foto` = alleen het portret, de figuur loopt niet binnen (er is geen bezoekersrij voor); `naFoto` = ander portret bij het antwoord.
Reclamebord-plaatje `pizza/reclamebord.png` (uit `pizza/reclamebord-gemini.jpg`) bij de bouwplaats, grijs als het niet hangt.
iPhone: `touch-action: manipulation` = geen zoom bij dubbeltikken. Neerzetten stoppen: nog eens op dezelfde knop (Tafel/Stoel/Plant).
Atelier: 60 s, en onder het origineel het doel als blokjes in de verfkleuren ("met je ogen half dicht"): vroeger moest je raden hoe het
verkleinde schilderij eruitzag, daardoor haalde je bijna nooit de 70% voor de gravin.
Crypto bijgesteld (28 okt, Marcel kreeg €50 MozzaMunt in één nacht → €2000): de koersstap is nu gemiddeld nul (`− vol²/2`, en −0,4%),
een herstart van MozzaMunt maakt de oude munten waardeloos (`bezit = 0`; vroeger sprong hij van de bodem naar 30% van de start), en elke
nacht kans op een hack (2% + waarde/40.000, max 10%): één munt in je wallet weg; de bank is veilig. Gesimuleerd (400 × €100, 7 dagen):
gemiddeld €80-110 terug, de helft houdt minder dan €40 (MozzaMunt/DogePizza), af en toe een uitschieter tot ~€3000.
Achterkamer (afspraak Marcel 28 okt): geen sleutelknop meer (`#sleutel` altijd verborgen). In `openDeuren` kiest `kamerBezoek()` of er vandaag
iemand voor de achterkamer komt (via `S.verplicht`; dan `vandaag.sleutel`: de sleutel hangt aan het haakje, `tekenHaakje`: in zaak 1 naast het
schilderij, anders naast het deurtje). Zaak 1: droge vervalsing = 75% koper (Gerrit) of gravin, anders 40% 'gerritlangs'; andere zaken 40%
'kamerStudent' / 'kamerGokker' / 'kamerHeer' (zonder figuur: `naVraag = naarAchter`); met `S.barrie` 20% 'barrieLangs'. Deze vragen komen alleen
nog via kamerBezoek (`als: () => false`). Het goede antwoord = de bezoeker pakt de sleutel (`bezoeker.achter`, `naarAchter()`, `vandaag.sleutelWeg`).
Binnen: één schilderij / één keer gokken (`S.gokDag`) / drukken / wijn; daarna "Terug naar de achterkamer" (laptop, Barrie), weg met "Deur dicht".
Crypto (28 okt, Marcel): wildere koersen (vol 0,16/0,3/0,45/0,6), bewaarkosten 2% per nacht (`BEWAAR`, staat op de laptop), per munt 2% kans per
nacht op een hack. Doel 'bank' (geld op de bank). Bank in de stad: rode banner "lenen ~~10%~~ 9%!".
28 okt (2): borden staan aan de rand van de tafel recht voor de klant (0,92 van de stoel, binnen het tafelblad), niet meer op elkaar in het midden.
Roulette 3 keer per bezoek (`S.gokKeer`). Drukpers klapt bij elke druk (animate). Nieuwe pizza (`p.sinds`, `isNieuw` = eerste 4 dagen): klanten
kiezen hem vaker (+1,2 in `kiesPizza`), en `voorstel()` rekent 8 × TELT extra per nieuwe pizza; melding in het voorraadscherm. Bijna op (voor nog
±3 pizza's): één melding per ingrediënt per dag (`gewaarschuwd`). In de stad met een manager: 30% van de vraagmomenten belt de manager met een
probleem uit `BELPROB` (`belHier`): terugkomen (stad dicht), laten oplossen (Sandra 50% / Bruno 40% / Kevin 20%, mislukt = aankomst × 0,75 en
rep −3) of deur even dicht.
Vervolgvragen (28 okt): elk probleem in `BELPROB` heeft een `v` = { ik, wie, vraag, a }: kies je "Ik kom eraan" (belZaak A/B, belHier A), dan staat
die persoon er na Verder (`belVervolg` via `naVraag`; `daar(p)` = "Als je aankomt, staat … je al op te wachten"); `belRep` werkt op die zaak (`belDoel`).
Kunstuitleen (Mevrouw Van Lijstje, `PLEK.kunst`): elke week een ander meesterwerk te leen (`kunstVanDeWeek`, € 120 `KUNSTHUUR`, `S.kunstHuur` =
{ v, tot }, alleen met een schilderij aan de muur: dat toont dan het geleende): gezellig +0,5, fooi ×1,1, en +10% in het atelier als je juist dat
schilderij namaakt. Met de achterkamer: "verloren gewaand meesterwerk" (`lijstjeWens`, `S.lijstje` = { v, prijs, tot }): een droge vervalsing van
dat schilderij verkopen, ≥ 60% = prijs × q, anders populariteit −3 en de rechercheur.
Rondleiding (`RONDE`, `rondleiding(n)`, `#ronde`): op het welkomscherm "Mario laat je alles zien" of "Overslaan"; 9 stappen met een gat in een donker
scherm rond de knop (tik op het lichte vak of Verder; Overslaan); opnieuw via de knop onder de doelen.
Zitten opzij, nieuwe stijl (28 okt): oma (rij 10) en werker (rij 0, uit `pizza/werker-opzij-gemini.jpg`) vakjes 16/17 uit `pizza/oma-opzij-gemini.jpg` (echt profiel; plaatjes 1 en 2 van de 4, op 172 px
hoog, onderkant op 188). Voorbeeldplaatjes voor Gemini: `pizza/voorbeeld/figuur-1..11.png` (staan, zitten, lopen; nummer = rij + 1) en
`pizza/voorbeeld-figuren.png`. De opdracht staat in `pizza/PLAN.md`.
Luigi (bezoeker rij 2): vakjes 4-7 = lopen naar voren, uit `pizza/luigi-voor-gemini.jpg` (28 okt; uitgeknipt met flood fill vanaf de rand, want
zijn pak is zelf groen). Daarvoor stonden daar plaatjes van opzij lopen en gleed hij zijwaarts naar de deur.
Oma loopt van opzij (klanten rij 10, vakjes 0-6) met plaatjes uit de poppetjes-generator (`extra/poppetjes_generator.py`, onderdelenvel
`pizza/oma-onderdelen-gemini.jpg`; uitvoer `lopen-opzij.png`, 166 px hoog, voeten op 187). Andere vellen van oma: `oma-onderdelen-zit-gemini.jpg`
(zittende rok, bovenbenen, schouderkapje, armen met pizza en glas), `oma-onderdelen-voor-gemini.jpg` en `-achter-` (de benen daarop zijn per
ongeluk van opzij getekend: de benen komen van `oma-onderdelen-benen-gemini.jpg`, 1/2 voor, 3/4 achter). Oma loopt nu in alle richtingen met
generatorplaatjes: opzij 0-6, achter 7-10, voor 18-21 (`pizza/klanten.png` is 22 vakjes breed; `VOORLOOP` in de code zegt welke rijen 18-21 hebben).
Looppaden (28 okt, Ben zette de hele zaak vol): een stoel telt alleen als er een vrij vakje naast ligt dat je vanaf de deur bereikt
(`stoelBereik`, op `bereik` uit `maakBezet`); `nieuweGroep` kiest alleen zulke stoelen. In het inrichten een rood kruisje op stoelen waar niemand
bij kan (`bereikSleutel`: na verschuiven opnieuw rekenen), en bij het openen een melding. Vroeger liepen obers en klanten dan dwars door de meubels.
Ook: bezoekers lopen naar `vrijBij` van het midden en van het luik (niet meer door de meubels), obers en manager kiezen een rustplek die bereikbaar is
(`vakBereik`), en staat de hele rij onder de toonbank vol (`toonbankVrij()` = false), dan telt geen enkele stoel: de ober kan niet weg (melding).
Trend van de dag (`TREND`: pittig, zoet, groen, vlees, kaas, gek; elk met `ok(pizza)`): in `eindeDag` 60% kans op een trend voor morgen
(`S.trendMorgen`, in het dagoverzicht met welke pizza's van je kaart passen); bij het openen `vandaag.trend` + melding. Passende pizza: +0,5 oordeel
en +1 in de keuze (`trendOk` in `kiesPizza`); `voorstel()` koopt er extra voor in.
Eigen kruiden (versiering, vakjes 4-8 van `pizza/versiering.png`, uit `pizza/kruiden-gemini.jpg`): basilicum, rozemarijn, oregano (€25),
eigen pepers (€40, `oogst`: elke ochtend 12 pepers gratis in de voorraad), olijfboompje (€70, alleen gezellig). Kruiden moeten 2 dagen groeien
(`s.sinds`, `gegroeid`, kleiner getekend); daarna elke pizza +0,2 oordeel per bak (`kruidBonus`, max 3 bakken).
Tekstronde 28 okt (helper las ~1100 teksten na): 20 fouten verbeterd (lidwoorden bij ingrediënten, uitdrukkingen, Lafite, "heeft ontslag
genomen" …); vraag 'ring' alleen met 2 ovens (Beppe); `daar()` zegt bij "(aan de telefoon)" dat de telefoon gaat.
