# Pizzabaas (`pizzabaas.html`, plaatjes in `pizza/`)

Plan en afspraken: `pizza/PLAN.md`.

Pizzabaas (`pizzabaas.html`, concept, idee van Pizza Tycoon maar met eigen naam en grappen): eigen pizzeria van bovenaf op een raster
van 15x15 vloertegels zoals in het oude spel (`W`, `H`, `T` = 48; rij 0-2 keuken met ovens en koks, deur onderaan `DEUR`). Tafeltje voor 2 = 4x2
tegels (stoel, tafel 2x2, stoel), tafel voor 4 = 4x4; poppetjes ongeveer een tegel groot (`MENS`). Oude opslag zonder `versie: 2` krijgt zijn
spullen terugbetaald en begint opnieuw met twee tafeltjes. Twee standen (`modus`): inrichten (spullen uit `SPUL`
kopen en neerzetten: tafeltje voor 2, tafel voor 4, plant, jukebox; tik op een tafel = menu met kleedje/kaarsje (`EXTRA`), verplaatsen,
verkopen; extra ovens en obers in `PERSONEEL`) en open (een werkdag van `DAG` = 120 s, 17:00-22:00). Klantengroepjes zoeken een vrije
tafel (anders "vol", reputatie omlaag), bestellen, de oven bakt (`BAKTIJD`), een ober brengt de pizza, ze eten en betalen `PRIJS` plus fooi
(`gezellig`: kleedje, kaarsje, planten dichtbij, jukebox); te lang wachten (`GEDULD`) = boos weg. Reputatie `S.rep` bepaalt hoe vaak er
klanten komen. Aan het eind huur (`HUUR`) en loon, en een dagoverzicht (📊 Gisteren = `laatsteDag`). Uiterlijk zoals het origineel:
achtergrond vooraf getekend (`achter`: rood-geel-wit geblokte vloer, grijs-witte keuken, toonbank, bakstenen muur met deur), houten kader
(`RAND`), stoelen met gestreepte zitting (`stoel`), grijze tafels, borden (`bord`), poppetjes van bovenaf met kijkrichting (`poppetje`, `kijk`).
Paneel rechts (liggend) of onder (staand): zwart schermpje `#lcd` (`balk`) en een 3x3 knoppenraster `#raster` (`tekenKnoppen`).
Per oven een kok (`maakOven`, `stapOven`): deeg opgooien aan de werkbank (`BANK`, `DEEG`), inschuiven, bakken, naar de toonbank brengen
(`TOONBANK`), daar haalt een ober hem op. Kok en ober zijn eigen Gemini-ontwerpen: `pizza/kok.png` en `pizza/ober.png` (13 plaatjes van 113x192: 0-1 staan, 2-3 lopen naar links (gespiegeld = rechts), 4 schuin, 5 deeg opgooien / stolp optillen bij het opdienen (`serveer`), 6 op de rug, 7-12 lopen naar achteren; uitgeknipt uit `pizza/*-gemini.jpg` met groen als achtergrond, de rugrij geschaald naar dezelfde lengte; `figuur`). Kenney food-kit heeft plaatjes van ingrediënten (`Previews/*.png`, 64x64) voor stap 2. Opslag per speler in `pizzabaas:<naam>`. `#tegel` = plaatje.
Plan: 2 pizza's verzinnen met smaken per buurt, 3 dubieuze klanten en pakketjes-ritjes (geen echte wapens of drugs), 4 sabotage door
Luigi van de overkant, 5 meer buurten en filialen.
