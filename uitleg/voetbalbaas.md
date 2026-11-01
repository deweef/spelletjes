# Voetbalbaas (`voetbalbaas.html`, concept)

Eigen voetbalmanager in de stijl van de oude managerspellen uit de jaren 80 (zoals Football Manager van Kevin Toms),
maar geen kopie: eigen clubs, regels en beeld. Retro C64-kleuren (blauw), Courier-lettertype, alles in één HTML-bestand.

## Spelverloop
- Eigen club maken (`clubMaken`): naam + kleur shirt (`k1`) en streep (`k2`) uit `KLEUREN` of de kleurkiezer; neemt de plek van een
  willekeurige club in de Kelderklasse in. Vanuit het kantoor (🎨 Clubnaam en kleuren) kan het later nog aangepast worden.
- Beginscherm: of kies een van de 8 clubs uit de Kelderklasse (grappige verzonnen namen in `CLUBS`, 32 clubs, 8 per divisie).
- 4 divisies (`DIVNAAM`): Kelderklasse (4), Derde klasse, Tweede klasse, Ereklasse (1). Seizoen = 14 weken (dubbele competitie).
  Nummer 1 en 2 promoveren, nummer 7 en 8 degraderen. Prijzengeld per plek (`PRIJS`).
- Kantoor (`kantoor`): bank, plaats, volgende tegenstander (sterren), knoppen Opstelling, Transfers, Stand, Erelijst.
- Opstelling: precies 11 spelers en 1 keeper; balkjes vergelijken aanval/middenveld/verdediging met de tegenstander.
- Spelers: positie K/V/M/A, kracht 1-20, leeftijd, conditie (spelen = moe, rusten = herstel), blessure, schorsing.
- Transfers: elke week 4 spelers te koop (`nieuweMarkt`), eigen spelers verkopen voor 80% van `waarde`. Selectie 13-20.
- Kaartjes en geld (`geldScherm`): kaartjesprijs `S.prijs` met −/+ (normaal `KAARTJE`); publiek = `verwachtPubliek` (vraag = 1,6 − 0,6 × prijs/normaal);
  meer publiek = meer thuisvoordeel (`thuisvoordeel`). Toont het gemiddelde per week (sponsor + halve thuiswedstrijd − salarissen).
  Bij promotie/degradatie schuift de prijs mee. Getest: normale prijs ≈ +€25.000 per seizoen in de Kelderklasse.
- Geld: sponsor per week, kaartjes bij thuiswedstrijden, salaris per speler (`salaris` = kracht² × 5). Onder -€25.000 = ontslagen.
- Willekeurig nieuws (`gebeurtenis`): kantine, kater, plassen in het bos, 'sigaretje' achter de dug-out, koeien op het veld enz.
- Einde seizoen (`seizoenKlaar`): spelers worden ouder (jong = beter, oud = minder, 35+ stopt soms), clubs wisselen van divisie.

## Wedstrijd
- `simuleer`: 8-11 kansen; wie de kans krijgt hangt af van het middenveld (+15% thuisvoordeel), de kans op een goal van
  aanval tegen verdediging+keeper. Uitkomsten: goal, redding, naast, lat. Andere wedstrijden gaan met dezelfde formule
  (tegenstanders hebben alleen een `niveau`, omgerekend als 4-4-2).
- De uitslag wordt bewaard vóór de animatie (herladen helpt dus niet om een nederlaag over te doen).
- Animatie (`maakActie`/`speelActie`): drie aanvallers, twee verdedigers en een keeper; camera zoomt in op de helft van de kans.
  Wij vallen altijd naar rechts aan, de tegenstander naar links. Knoppen START, Sneller, Naar de uitslag.

## Opslag
`voetbalbaas:<naam>` (oude sleutel `voetbalbaas` als beginwaarde).

## Plaatjes en plannen
Zie `voetbalbaas/PLAN.md` (Gemini-opdrachten: kantoor, managers, nieuwsplaatjes, velden per divisie). De wedstrijd blijft pixelstijl.
