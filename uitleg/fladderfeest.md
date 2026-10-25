# Fladderfeest (`fladderfeest.html`)

Fladderfeest (`fladderfeest.html`, in de stijl van Flappy Bird, met eigen naam en plaatjes): beginscherm met
de dieren in twee kolommen, elk een eigen wereld en record per speler (`fladderfeest_<figuur>:<naam>`). Patatmeeuw (strand) en
Fladderkip (boerderij, zwaar: valt snel, fladdert krachtig; legt een ei als ze af is) en Rockkraai
(rockfestival bij nacht, versterkers en truss met spots, plectrums, rockmuziek met vervormde gitaar en drums)
en Hommelbrom (bollenveld, licht, windvlagen vanaf 3 punten, reuzentulpen en molenwieken, nectar, draaiorgelwals
in 3/4 met `maat: 6`) en Roodborstje
(wintertuin met sneeuw, vogelhuisjes en ijspegels, besjes, speeldoosmuziek, iets ruimere gaten via `ruimer`), Piratenpapegaai
(piratenzee bij zonsondergang, masten met zeil en rumtonnen, goudstukken, accordeon in 6/8, krappere gaten) en
Jetpackpinguïn (Zuidpool met zuiderlicht, ijsbergen, visjes, synthmuziek; een tik geeft een korte raketduw via
`stuw`/`stuwKracht`) en Vuurdraak (drakenburcht bij nacht met vulkaan, kasteeltorens, edelstenen, doedelzakmuziek met bromtoon;
elke edelsteen = een vuurbal (`spuw`, `vuurballen`) die de volgende toren wegbrandt: het gat wordt 60 groter, `p.brand`) en Koekoek
(Zwarte Woud met bergen en dennen, koekoeksklokken op dennenstammen onder en klokgewichten boven, taartpuntjes, polka) en Spookuil
(spookbos bij volle maan, grafstenen onder en kale takken met spinnenweb boven, snoepjes, orgel in mineur `stijl: 'orgel'`) en
Discoflamingo (disco met spotlights en discobal, lichtgevende discozuilen, muzieknootjes, disco `stijl: 'disco'`) en Toekan
(jungle met waterval en palmen, tempelzuilen onder en lianen boven, banaantjes, samba `stijl: 'samba'`) en Vreemde Vogel (lapjesvogel
in het circus, circustrommels onder en tentdoek boven, ballonnetjes, circusmars met hoempa) zijn klaar.
Menu: bovenaan 🛍️ Winkel en 🏆 Scorebord, dan de Grote tocht en Met streken/Gewoon, daaronder de dieren in 3 kolommen
(past tot 15 dieren; een halve laatste rij staat in het midden).
Geheim dier Gouden Arend (`geheim: true`, laatste in `FIGUREN`): in het menu een kaartje met "?" tot je met alle andere
dieren goud (50) hebt; bergtoppen boven de wolken, onweerswolken boven, sterretjes, orkestmuziek (`stijl: 'orkest'`), sneller
(`snel: 1.12`) en de krapste gaten; streek: bliksem (`flits`, 50 beelden waarschuwing met een stippellijn, dan inslag).
De Grote tocht gaat langs `TOCHT` (alle dieren behalve het geheime); op het scorebord staat zijn tabblad pas als je hem zelf hebt. Kroontje (`kroon`) op een dier in het menu bij 100 punten.
Winkel (knop 🛍️ Winkel bovenaan in het menu, `winkelScherm`, dieren zonder bonus getekend via `dierAlleen`): elke gepikte bonus = 1 muntje in de spaarpot (`spaar`, ook
in de tocht per etappe); 20 muntjes cadeau om te beginnen. Per dier 4 spulletjes in `KLEDING` (de kraai 5, met een elektrische gitaar) (plek hoed/bril/lijf, prijs
20-80), eerst passen (`pasKleding`), dan kopen en aan-/uittrekken. Opslag per speler in `fladderfeest_kast:<naam>`
({ munten, gekocht, aan: { dier: { hoed, bril, lijf } } }). Getekend via `metKleren`/`aankleden` aan het eind van elke
dier-tekening, op de plekken uit `ANKER`; ingebouwde hoedjes en brillen (kraai, papegaai, pinguïn, koekoek) verdwijnen als
je zelf iets op die plek draagt (`draagt`). Een nieuw dier = ook een regel in `ANKER` en 4 regels in `KLEDING`. Volgorde in `FIGUREN` = van makkelijk naar
moeilijk (roodborstje, meeuw, hommel, kip, kraai, papegaai, pinguïn, draak, koekoek, uil, flamingo, toekan, vreemd; de geheime arend als laatste;
nog plek voor 1 dier in het menu); elk dier speel je vrij met 20, 25, ... 45
punten met het dier ervoor, nieuwere dieren (vanaf de draak) steeds met 30 (`nodig`/`open`; wie al een record heeft met een dier houdt het open).
Grote tocht (knop bovenaan, `tocht`): alle dieren achter elkaar vanaf het Roodborstje; finishvlag bij 20, 25, 30, ...
punten (`doelTocht`, pinguïn heeft geen finish), punten tellen op (`totaal`), elke 25 punten een extra vogeltje
(`geraakt`: leven eraf, 100 beelden onkwetsbaar), beste tocht in `fladderfeest_tocht:<naam>`; een finish telt ook als
record van dat dier en speelt het volgende vrij.
Met streken (links, standaard) / Gewoon (rechts) op het beginscherm (`streken`, onthouden in `fladderfeest_streken`): records per modus
(`fladderfeest_<dier>_streken:<naam>`, ook de tocht), vrijspelen telt beide modi. Streken vanaf 3 punten (`strekenStap`,
`tekenStreken`): roodborst sneeuwbui (`bui`), meeuw patatdieven en papegaai kanonskogels (`gevaren`, zonder waarschuwing; het kanon knalt
hoorbaar), papegaai ook een magneetpiraat op de tonnen die het goudstuk wegtrekt (`p.piraat`, `magneet`, `piraat`; duikt
in de ton als je over hem heen vliegt), hommel windvlagen (alleen met streken), kip schuivende hooibalen en kraai dansende versterkers (`p.amp`),
pinguïn brandstof (`brandstof`, flap kost 7, visjes +40, meter links), draak katapultstenen die in een boog omhoog komen (`steen`, `zw`), koekoek: bij de helft van de klokken springt een koekoekje omhoog het gat in (`p.klok`, eerst gaat het deurtje op een kier),
uil: spookjes die tussen twee palen op en neer zweven (`spook`, `amp`), flamingo: discoballen die aan een ketting onder de bovenste
zuil door het gat slingeren (`p.bal`, `discobalAanKetting`), toekan: kokosnoten die eerst wiebelen en dan uit de lianen
vallen (`p.noot`, gevaar `kokos` met `g.p`), vreemde vogel: de hik (`hik`: 25 beelden 'h…', dan 'HIK!' en een sprongetje). Moeilijkheid: gat en snelheid tot ~40 punten (`gat`,
`tempo`), na 50 punten nog heel langzaam wat krapper en sneller. Elk dier roept tijdens het spelen om de 8-16 seconden
iets met een geluidje en een tekstwolkje (`ROEP`, `roepT`, `roepBel`).
Een nieuw dier = regel in `FIGUREN`, deuntje in `MUZIEK`, wereld in `WERELDEN`, plaatje in `tekenDier()`. Elke wereld staat in `WERELDEN` (achtergrond,
grond, hindernis, bonus, wat er valt, het figuur). `fladderfeest.html#tegel` tekent het plaatje voor de startpagina.
Muziek: per figuur een eigen deuntje in `MUZIEK` (zelf gecomponeerd, Web Audio, geen bestanden), knopje
rechtsboven of toets M, onthouden in `fladderfeest_muziek`. Meeuw = zeemansliedje met hoempa; kip = boerendeuntje
met getokkel; kraai = rock (`stijl: 'rock'`); roodborstje = speeldoos; hommel = draaiorgelwals;
papegaai = accordeon; pinguïn = synth; draak = doedelzak (`stijl: 'doedelzak'`); koekoek = polka (`stijl: 'polka'`).
