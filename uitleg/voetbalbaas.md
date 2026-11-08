# Voetbalbaas (`voetbalbaas.html`)

Eigen voetbalmanager in de stijl van de oude managerspellen uit de jaren 80 (zoals Football Manager van Kevin Toms),
maar geen kopie: eigen clubs, regels en beeld. Retro C64-kleuren (blauw), Courier-lettertype, alles in één HTML-bestand.

## Spelverloop
- Eigen club maken (`clubMaken`): naam + kleur shirt (`k1`) en streep (`k2`) uit `KLEUREN` of de kleurkiezer; neemt de plek van een
  willekeurige club in de Kelderklasse in. Vanuit het kantoor (🎨 Clubnaam en kleuren) kan het later nog aangepast worden.
- Manager (`S.manager`, `MANAGERS`, `managerKiezen`): na het kiezen van een club; later via 🧢 Andere manager in het kantoor.
  Plaatjes `voetbalbaas/managers.jpg` (8 vakjes van 240x270, groen vervangen door #4c3fa8; uit `voetbalbaas/managers-gemini.jpg`):
  0 Harrie de Snor, 1 Coach Mieke, 2 DJ Jordy, 3 Opa Bertus blij, 4-7 dezelfde boos. Klein in het kantoor (boos na een nederlaag),
  groot na de wedstrijd met een uitspraak (per manager 13 `blij`, 13 `boos`, 8 `gelijk`, deels van Gemini; bewaard in `S.laatste.quote`).
- Velden per divisie: `voetbalbaas/velden.jpg` (4 vakjes van 640x350, uit `voetbalbaas/velden-gemini.jpg`; 0 Kelderklasse modderveld,
  1 Derde klasse sportpark, 2 Tweede klasse stadionnetje, 3 Ereklasse groot stadion; `veldFoto(div)`). Over het wedstrijdveld tot je
  op START drukt, en op het scherm Einde seizoen bij promotie/degradatie.
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
- Nieuwsplaatjes: `voetbalbaas/nieuws.jpg` (strook van vakjes 480x260, uit `voetbalbaas/nieuws1-gemini.jpg`): 0 kantine/tap 🍺, 1 kater 🥴,
  2 plassen in het bos 🌲, 3 koeien op het veld 🐄; uit `voetbalbaas/nieuws2-gemini.jpg`: 4 lekkende douche 🚿, 5 snackbar-reclamebord 📣,
  6 spandoek 🎉, 7 'sigaretje' achter de dug-out 🌿;
  uit `voetbalbaas/nieuws3-gemini.jpg`: 8 clubloterij 🎟 (sleutel zonder het onzichtbare FE0F-teken), 9 extra training 💪, 10 rode kaart 🟥, 11 blessure 🩹;
  uit `voetbalbaas/nieuws4-gemini.jpg`: 12 nieuwe speler tekent ✍, 13 afscheid achter de bar 👋, 14 pijntje 🤕, 15 Gouden Frikandel 🌭. `NIEUWSFOTO` koppelt het eerste teken van een bericht aan een vakje; `melding(b,klein)`
  toont het groot na de wedstrijd en klein in het kantoor. Nieuwe vakjes achteraan in de strook bijzetten (en `1600%` in `.nieuwsfoto` en `100/15` in `melding` aanpassen).
- Willekeurig nieuws (`gebeurtenis`): kantine, kater, plassen in het bos, 'sigaretje' achter de dug-out, koeien op het veld enz.
- Einde seizoen (`seizoenKlaar`): spelers worden ouder (jong = beter, oud = minder, 35+ stopt soms), clubs wisselen van divisie.

## Beker: De Gouden Bierpul
- `S.beker` = {ronde 0-4, eruit, gehad (al gelote clubs), tegen, thuis, gespeeldWeek}; nieuw elk seizoen in `nieuwSeizoen` (oude opslag
  zonder `S.beker`: pas vanaf het volgende seizoen een beker). 4 rondes (`BEKERRONDE`), gespeeld vóór de competitiewedstrijd van week
  3, 6, 9 en 12 (`BEKERWEKEN`, `bekerNu`). `bekerLoting`: tegenstander uit divisie ±1 (achtste finale), daarna steeds hogere divisies
  (halve finale 1 hoger, finale 2 hoger). Finale altijd 'thuis' maar zonder thuisvoordeel, in het grote stadion.
- `speelBeker`: zelfde rekenregels; gelijk = `strafschoppen` (5 elk, dan sudden death; keeper telt mee), animatie `strafRij` na het eindsignaal.
  Geld: kaartjes bij thuis (meer publiek dan normaal), finale vast deel `15000 × BEKERFACTOR`, prijzengeld per gewonnen ronde
  `BEKERPRIJS × BEKERFACTOR` (Kelderklasse 3.000 / 6.000 / 12.000 / 30.000). Geen salaris/sponsor (die horen bij de competitieweek), wel
  vermoeidheid en blessures (`naAfloop(berichten,false)`: blessures tellen niet af).
- Plaatjes `voetbalbaas/beker.jpg` (4 vakjes van 480x260, uit `voetbalbaas/beker-gemini.jpg`, `bekerFoto(i)`): 0 beker in de vitrine
  (erelijst, aankondiging finale), 1 loting (aankondiging andere rondes), 2 strafschoppen (na een wedstrijd met strafschoppen), 3 bekerfeest.
- Uitspraken `BEKERPRAAT` per manager: door (5), eruit (5), straf (3, door na strafschoppen), finale (3). Met Gemini bedacht, grove woorden eruit.
- Gewonnen = `S.bekers` (lijst seizoenen), te zien in de erelijst. Kantoor: melding + knop "🍺 Speel de achtste finale" enz.

## Terugknop en beeld
- Terugknop linksboven = een stap terug (`terugNaar`, standaard gezet in `teken`): scherm → kantoor → beginscherm → startpagina
  (die laatste stap vraagt eerst "Je verlaat Voetbalbaas… Ja/Nee", `vraagVerlaten`).
  Tijdens een wedstrijd naar het beginscherm (Verder = terug in de wedstrijd/rust).
- Het veld tussen de kansen toont onze echte opstelling (`tekenStil`) tegen hun 4-4-2. Bij een kans (`aantalInBeeld`): wij met
  aanvallers + 1 (2-4 poppetjes) tegen 2 verdedigers; zij met 3 tegen onze verdedigers − 2 (1-4).

## Rust en wissels
- Een wedstrijd gaat in twee helften (`startWedstrijd`, `helft`, `afmaken`): bij het begin wordt alleen de eerste helft uitgerekend en
  bewaard in `S.lopend` {beker, teg, thuis, tv, hunL, ev1, pijn, wissels, bijRust}. Herladen = terug in de rust (`kantoor` → `wedstrijd`).
- In de rust (`rust()` in `wedstrijd`): max. 3 wissels (tik veldspeler, dan bankspeler), tactiek wisselen, balkjes. Soms (30%) heeft een
  veldspeler een pijntje (`lo.pijn`): in de tweede helft half zo goed (`lijnen(ids,pijn)`); blijft hij erin, dan daarna 2 weken geblesseerd.
- `afmaken` rekent de tweede helft uit met de nieuwe opstelling/tactiek en geeft het door aan `weekAfmaken` (competitie) of `bekerAfmaken`.
  "Naar de uitslag" in de eerste helft = zonder wissels doorspelen.

## Eigenschappen en topscorers
- `p.eig` (`EIG`, `geefEig`: 35% van de nieuwe spelers, passend bij de positie): ⚡ snel (scoort vaker, +15% bij counter),
  🧱 muur (V, +20%), Ⓒ kapitein (team +4%), 🥚 glas (+2 kracht, blessurekans 9% i.p.v. 3,5%), 🍺 kater/Feestbeest (vaker kater
  in `gebeurtenis`, 20% goedkoper), 🔥 joker/Supersub (+30% als hij in de rust invalt, `lo.inv`), 🧤 killer (K, beter bij strafschoppen).
  Uitleg in een uitklapper (`eigUitleg`) bij opstelling en transfers. Oude opslag kreeg eenmalig eigenschappen (`S.eigVerdeeld`, zonder de +2).
- Topscorers: `S.goals` (per naam, dit seizoen; competitie + beker), `p.goals` (carrière). In het standscherm de top 5.
  Einde seizoen: clubtopscorer krijgt de Gouden Frikandel (kracht +1), staat in de erelijst (`e.top`).

## Managerpunten en scorebord
- `S.punten` (carrière) en `S.prijzen` (titels + bekers); `seizoenPunten(div,plek,promo)` = (9 − plek) × 10 × (5 − div), kampioen
  + 100 × (5 − div), promotie + 50; beker + 50 × (5 − div). Oude opslag wordt bij het openen uit de erelijst nagerekend.
- `insturen()` (na het seizoen, na bekerwinst en bij het openen): onderdelen `voetbal_punten` / `voetbal_prijzen`, modus `carriere`,
  alleen met een gekozen naam en alleen als het meer is dan `voetbalbaas_ingestuurd:<naam>`. `scorebord(terug)`: knop op het beginscherm
  en in de erelijst; laatste lijst in `voetbalbaas_bord`. De Scores-app (`scores/`) toont het als spel "Voetbalbaas".

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
  Wij vallen altijd naar rechts aan, de tegenstander naar links. Knoppen START, Sneller, Naar de uitslag; om 45' de rust (zie hierboven).

## Opslag
`voetbalbaas:<naam>` (oude sleutel `voetbalbaas` als beginwaarde).

## Plaatjes en plannen
Zie `voetbalbaas/PLAN.md` (Gemini-opdrachten: kantoor, managers, nieuwsplaatjes, velden per divisie). De wedstrijd blijft pixelstijl.
