# Koekjesschuiver 3D (`koekjesschuiver3d/`, concept)
De pc-versie van koekjesschuiver.html met echte 3D-natuurkunde, zodat koekjes op elkaar stapelen; minder en grotere
koekjes dan in 2D (rustiger). Alles in `js/spel.js`; `lib/` heeft three.js r160 en cannon-es 0.20 (MIT, npm
`cannon-es`). Zelfde spelregels en codes als 2D (0-3 koekjes, 10+k traktaties, 20+k koekjesfiguren, krachten,
badges); de schuif is een kinematisch blok onder een vaste achterwand, koekjes die over de voorrand vallen zijn
gewonnen, over de zijkant (na `ZIJ_EIND`) weg. Koekjes op hun kant (ook bovenop andere of op de schuif) krijgen na 0,5 s een gericht zetje dat ze plat kantelt, steeds harder als ze blijven staan (`omvalT`, `kantT`, `kantN`). Gewonnen figuren
springen omhoog (`springers`), het likkoekje extra groot met "Likkie-likkie!" hardop. Opslag in `koekjesschuiver3d`.
`#tegel` verbergt de knoppen voor het plaatje. Tafel smal en lang (`HB`, `VOOR`); de camera zoekt bij elk schermformaat
de dichtstbijzijnde stand waarbij de tafel tussen bovenbalk en krachtknoppen past (`pasAan`). Gewone koekjes en figuren
hebben een bolle, aflopende rand (`bolKoek`, alleen het beeld; de natuurkunde blijft een cilinder). Lange vinger, knappertje (vierkant met gaatjes), likkoekje (café noir),
speculaasje en krakeling hebben hun echte vorm (`VORMEN`, `vormGeo`: uitgesneden vorm met afgeronde rand, natuurkunde
een platte doos). Opslag per speler
(`koekjesschuiver3d:<naam>`). Munten (🪙): gouden koekje en gebakje 1, figuur 3, badge 10, dubbele figuren ruilen 5
(knop bij de badges). Winkel (`#winkel`): achtergronden in `THEMAS` (bakkerij gratis, mint met roze; halloween, kermis, strand,
winternacht met sneeuw, ruimte), elk met lucht, kastkleuren, tafeltint (`tafel`), lampjes (`lamp`) en een plaatje op de
achterwand (`zetThema`). Gewonnen koekjes vallen in een opvangbak (`BAK`, met natuurkunde) en verdwijnen na 2,5 s.
Hoofdscherm (`#menu`, `modus`: menu/vrij/wedstrijd/einde): Verder met je tafel (vrij spelen), Wedstrijd, Scorebord,
Winkel, Badges en je tafels (alleen de gekochte, `tekenMenu`). De natuurkunde staat stil in het menu. Natuurkunde in vaste stapjes van 1/60 s (`tijdOver`), zodat het op elk apparaat
gelijk werkt. Spraak (Likkie-likkie, ook in 2D) wordt gewekt bij de eerste klik of het loslaten van een tik (`stemWakker` op click/touchend, niet pointerdown: dat telt op een iPhone niet; `nlStem`); start de stem niet binnen 1,5 s, dan piept een zelfgemaakt stemmetje (`nepStem`); testknop 🔊 in het badgescherm (`#stemtest`). De terugknop gaat
altijd eerst naar het hoofdscherm, vanuit het hoofdscherm naar alle spellen. "Nieuwe tafel" (bij de badges) wist alleen
tafel, punten en gebakjes. Wedstrijd (`startWedstrijd`): nieuwe volle tafel, 50 koekjes, geen aanvulling en geen koekjes
terug bij winst; klaar als de koekjes op zijn en er 7 s niets valt (25 s als er nog een Koekjesregen/Bakplaat klaarstaat).
Je eigen tafel blijft intussen in de opslag (`bewaar` schrijft dan alleen munten, badges e.d.). Beste wedstrijd in
`wedBest`. Online scorebord (zelfde Apps Script, geen aanpassing nodig: de lijst zonder `spel` bevat alles behalve
ork3d): alleen `koek3d_wedstrijd`, modus `gewoon`, automatisch ingestuurd na een wedstrijd (met naam, alleen
verbeteringen). Tafel-items (`ITEMS`, code 100+i): vallen alleen op hun eigen tafel (kans `ITEM_KANS` = 1/25 per koekje, niet in een
wedstrijd), winnen geeft 25 punten, 5 munten, een grap en een effect (`doe`, animaties in `effecten`), en tafelbadges
`it_<id>` (eerste keer) en `it5_<id>` (5 keer), geteld in `itemsGewonnen`; tafelbadges staan apart in het badgescherm
(`#tafelbadges`) en tellen niet mee in de 15. Halloween: pompoen (vleermuizen jagen de koekjes naar voren) en spookje
(zweeft over de tafel en laat 5 halloweenkoekjes vallen, code 4, 5 punten). Strand: kwal (15 s glibberig: minder wrijving via `glibber`,
`cmTafel`/`cmKoek`, tafel glimt blauw), roze flamingo (volgende 10 koekjes roze, code 5, 3 punten, `rozeQ`), parasol (20 s
muurtjes), krab (loopt zijwaarts over de tafel en duwt koekjes naar voren). Kermis: suikerspin (regen van 10 roze
koekjes), badeendje (onder het eendje 10-100 bonuspunten), dartpijl (ballon knapt, alle koekjes springen op), biertje
(10 s dronken camera `wiebelT`/`camBasis` en dubbele punten), P-knuffel (roze knuffel met lief snoetje, speels houden; een
grote stuitert over de tafel, +10 munten). Schatkamer (tafel van 1000 munten): diamant (100 punten, 25 munten, fonkeling), zilveren
ring (8 gouden koekjes), parelketting (10 parelkoekjes, code 6, 4 punten), gouden armband (rolt over de tafel), klomp goud
(30 munten). Winternacht: sneeuwpop (20 s muurtjes en ijsblauwe tafel, `vries`), cadeautje (15 munten, een
gebakje of een zak kolen), rendier (trekt een slee over de tafel, `sleeRit`; geen rode neus, "dat is zijn neef"), kerstbal
(8 kerstkoekjes, code 7, 5 punten); Bakkerij: taart (25 punten extra en een deuntje), deegroller (rolt over de hele breedte, `rolOver`), muisje
(pikt 3 koekjes, laat 10 munten achter, `muisRoof`). Ruimte: ufo (straalt 3 koekjes naar de opvangbak, `ufoStraal`),
meteoriet (inslag, `inslag`), alien (12 s lage zwaartekracht, `laagT`). Snoepland (10.000 munten, gebakjes vaker): gummibeer (stuitert, `stuiter`), chocoladefontein (14 chocoladekoekjes),
lolly (draaikolk), zuurstok (veegt de voorkant leeg). Dino-eiland (25.000, koekjesfiguren vaker): T-rex (aardbeving),
dino-ei (babydino waggelt over de tafel), vulkaan (15 koekjes uit de lucht), fossiel (45 munten). Onderwaterwereld (50.000,
bubbels, items geven 10 munten): octopus (zet 5 koekjes in de bak, `grijp`), haai (hapt 4 koekjes weg, laat 20 munten achter),
schelp (10 parelkoekjes), duikboot (sonar-golven). Drakenburcht (tafel van 100.000 munten, oranje
vonken die opstijgen `vonken`, items vaker `ITEM_KANS_DRAAK` en meer gouden koekjes): drakenei (babydraakje laat 6 gouden
koekjes vallen), draak (vliegt over en spuwt vuur: alle gewone koekjes op tafel worden goud, `drakenvuur`), schatkist (50
munten), toverkristal (20 s driedubbele punten, `driesT`); sieraden glanzen met een eigen omgevingskaart (`glans`, alleen op die materialen). De badgeteller telt de
15 gewone plus 2 per item van de tafels die je hebt (`badgeTotaal`). Eigen badgenamen met `b1`/`b5`. Een nieuw item = regel in `ITEMS` met
`maak()` (3D-model, origin in het midden) en `doe()`. Plannen: tafels (ook kerst), extra krachten, badges met niveaus.
