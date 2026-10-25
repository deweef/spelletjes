# Pizzabaas (`pizzabaas.html`, plaatjes in `pizza/`)

Plan en afspraken: `pizza/PLAN.md`.

Pizzabaas (`pizzabaas.html`, concept, idee van Pizza Tycoon maar met eigen naam en grappen): eigen pizzeria van bovenaf op een raster
van 15x15 vloertegels zoals in het oude spel (`W`, `H`, `T` = 48; rij 0-2 keuken met ovens en koks, deur onderaan `DEUR`). Tafeltje voor 2 = 4x2
tegels (stoel, tafel 2x2, stoel), tafel voor 4 = 4x4; poppetjes ongeveer een tegel groot (`MENS`). Oude opslag zonder `versie: 2` krijgt zijn
spullen terugbetaald en begint opnieuw met twee tafeltjes. Twee standen (`modus`): inrichten (spullen uit `SPUL`
kopen en neerzetten: tafeltje voor 2, tafel voor 4, plant, jukebox (2x2; oude opslag met een 1x1-jukebox krijgt een vrije plek of geld terug);
vasthouden en slepen = verplaatsen (`sleep`), tikken = menu met kleedje/kaarsje (`EXTRA`) en verkopen; extra ovens en obers in `PERSONEEL`) en open (een werkdag van `DAG` = 120 s, 17:00-22:00). Klantengroepjes (`groep`) zoeken een vrije
tafel (anders "vol", reputatie omlaag). Zit de hele tafel, dan bestellen ze samen (`bestel`) en bakt de keuken hun pizza's achter elkaar
(`wachtrij`, `BAKTIJD`). Pas als alle pizza's van de tafel op het uitgiftepunt staan (`klaar`, `tafelKlaar`) komen er loopjes (`ritten`)
van max. 2 borden, één per hand; bij 4 personen loopt een ober twee keer (of gaan er twee obers). Ze eten en betalen de pizzaprijs plus fooi
(`gezellig`: kleedje, kaarsje, planten dichtbij, jukebox). Geduld telt per tafel (`groep.t`, `GEDULD` + 7 s per extra persoon) tot een ober
de borden komt halen; te lang = de hele tafel boos weg. Reputatie `S.rep` bepaalt hoe vaak er
klanten komen. Aan het eind huur (`HUUR`) en loon, en een dagoverzicht (📊 Gisteren = `laatsteDag`). Uiterlijk zoals het origineel:
achtergrond vooraf getekend (`achter`: rood-geel-wit geblokte vloer, grijs-witte keuken, toonbank, bakstenen muur met deur), houten kader
(`RAND`), stoelen met gestreepte zitting (`stoel`), tafels uit `pizza/tafels.png` (`TAFELS`, Gemini, onderste rij van `pizza/tafels-gemini.jpg`: 0 marmer, 1 rood-wit geruit = met kleedje, 2 wit kleed met kaars, 3 wit met kaars en wijnfles; 2-3 nog niet gebruikt, bedoeld voor meubelstijlen; het kaarsje tekent het spel zelf), borden (`bord`), poppetjes van bovenaf met kijkrichting (`poppetje`, `kijk`).
Paneel rechts (liggend) of onder (staand): zwart schermpje `#lcd` (`balk`) en een 3x3 knoppenraster `#raster` (`tekenKnoppen`).
Per oven een kok (`maakOven`, `stapOven`): deeg opgooien aan de werkbank (`BANK`, `DEEG`), inschuiven, bakken, op het uitgiftepunt zetten
(`UITGIFTE`: stalen plaat met belletje op de toonbank, direct rechts van de laatste werkbank), daar haalt een ober hem op. Kok en ober zijn eigen Gemini-ontwerpen, plaatjes van 113x192 naast elkaar; welk plaatje wat is staat per vel in `KOK.vel` / `OBER.vel` (`figuur`). `pizza/kok.png` (15): 0-1 staan, 2-8 loopcyclus opzij met de neus naar rechts (gespiegeld = links; ook gebruikt voor lopen naar voren, want die cyclus is er nog niet), 9 deeg opgooien (van het oude vel, broek wit gemaakt), 10 op de rug, 11-14 lopen naar achteren; uit `pizza/kok2-gemini.jpg` (witte broek) + `pizza/kok-gemini.jpg`. `pizza/ober.png`: zelfde indeling, 9 = stolp optillen bij het opdienen (`serveer`); uit `pizza/ober2-gemini.jpg` + de stolp van `pizza/ober-gemini.jpg`. Sta- en rugplaatjes zijn verkleind tot de hoogte van de loopplaatjes (Gemini tekent die rijen niet even groot). Met borden: `pizza/ober-borden.png` (`OBER_BORD`, vakjes van 180 breed, uit `pizza/ober-borden-gemini.jpg`): 0 staan van voren, 1-7 lopen opzij, 8-11 lopen naar achteren, steeds één bord rechts; 12-19 met twee borden (uit `pizza/ober-borden2-gemini.jpg`: 12 staan, 13-19 opzij, maar 14/16/17 missen een bord en worden overgeslagen: `OBER_TWEE`); van achteren met twee borden tekent `tweedeBord` het tweede. Uitknippen met `extra/knip_figuren.py` (raken figuren elkaar, zoals bij de borden: per losse vorm knippen). Opslag per speler in `pizzabaas:<naam>`. `#tegel` = plaatje.
Pizza's (📖, `toonKaart`, `toonMaak`): `S.menu` = lijst { naam, prijs, stukjes: [{ i, x, y, r }] } (max `MAXMENU`; oude opslag krijgt een
Margherita). Ingrediënten in `ING` (smaak `f` = [vet, zoet, zout, pittig] per stukje, inkoop `k`, soort `s`: it/groen/vlees/vis/gek) met
plaatjes uit `pizza/ingredienten.png` (20 x 64x64 uit de Kenney food-kit, volgorde van `ING`). Soorten klanten in `SOORT` (wil, budget,
kans, uiterlijk); `oordeel(pizza, soort)` = 0-6 (`GEZICHT`), `kiesPizza` kiest per klant de lekkerste (onder 1 = weg, `ZEG.niks`).
Plan en volgende stappen: `pizza/PLAN.md`.
