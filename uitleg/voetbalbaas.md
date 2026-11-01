# Voetbalbaas (`voetbalbaas.html`, concept)

Eigen voetbalmanager in de stijl van de oude managerspellen uit de jaren 80 (zoals Football Manager van Kevin Toms),
maar geen kopie: eigen clubs, regels en beeld. Retro C64-kleuren (blauw), Courier-lettertype, alles in één HTML-bestand.

## Spelverloop
- Eigen club maken (`clubMaken`): naam + kleur shirt (`k1`) en streep (`k2`) uit `KLEUREN` of de kleurkiezer; neemt de plek van een
  willekeurige club in de Kelderklasse in. Vanuit het kantoor (🎨 Clubnaam en kleuren) kan het later nog aangepast worden.
- Beginscherm: of kies een van de 8 clubs uit de Kelderklasse (grappige verzonnen namen in `CLUBS`, 32 clubs, 8 per divisie).
- 4 divisies (`DIVNAAM`): Kelderklasse (4), Derde klasse, Tweede klasse, Ereklasse (1). Seizoen = 14 weken (dubbele competitie).
  Nummer 1 en 2 promoveren, nummer 7 en 8 degraderen. Prijzengeld per plek (`PRIJS`).
- Kantoor (`kantoor`): bovenaan `voetbalbaas/kantoor.jpg` (1100 breed, uit `voetbalbaas/kantoor-gemini.jpg`) met tikplekken `KANTOOR`
  (raam = spelen, krijtbord = opstelling, computer = transfers, prikbord = stand, bekers = erelijst, krat = geld); laadt het plaatje niet, dan verdwijnt het.
  Daaronder bank, plaats, volgende tegenstander (sterren), knoppen Opstelling, Transfers, Stand, Erelijst.
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
- `sterkte(l,n)`: qA = gemiddelde kracht van de aanvallers (+ kwart middenveld), nA = aantal; qD = verdediging (+ kwart middenveld,
  keeper telt 25% mee), nD = aantal; M = middenveld. `simuleer`: 8-11 kansen; wie de kans krijgt hangt af van M^1,5 (thuisvoordeel
  `thuisvoordeel()`), goalkans = 0,3 × (qA/qD)^1,3 × √(nA/3) / (nD/5)^1,5. Dus **onze aanval tegen hun verdediging**, meer aanvallers =
  meer goals, meer verdedigers = minder tegengoals. Tegenstanders spelen 4-4-2 op hun `niveau` (`tegenPloeg`).
- Tactiek `S.tactiek` (`TACTIEK`, knoppen in de opstelling): normaal; counter (65% van de kansen, maar goalkans ×(1 + 0,9 × balbezit
  tegenstander) en tegenstander ×0,9: goed tegen sterkere ploegen); aanvallen (130% kansen, maar tegenstander ×1,3).
  Getest (4000 wedstrijden, alle spelers kracht 6): tegen een sterkere ploeg (8) haalt 5-4-1 counter 0,57 punt per wedstrijd,
  4-4-2 0,44 en 3-4-3 0,25; tegen een zwakkere ploeg maakt het weinig uit.
- Schema (`nieuwSeizoen`): thuis/uit gaat om en om (wie het minst thuis speelde, speelt thuis), nooit meer dan 2 keer achter elkaar.
- De uitslag wordt bewaard vóór de animatie (herladen helpt dus niet om een nederlaag over te doen).
- Animatie (`maakActie`/`speelActie`): drie aanvallers, twee verdedigers en een keeper; camera zoomt in op de helft van de kans.
  Wij vallen altijd naar rechts aan, de tegenstander naar links. Knoppen START, Sneller, Naar de uitslag.

## Opslag
`voetbalbaas:<naam>` (oude sleutel `voetbalbaas` als beginwaarde).

## Plaatjes en plannen
Zie `voetbalbaas/PLAN.md` (Gemini-opdrachten: kantoor, managers, nieuwsplaatjes, velden per divisie). De wedstrijd blijft pixelstijl.
