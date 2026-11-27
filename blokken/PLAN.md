# Noppenschuif: plan en afspraken

Idee van Marcel (27 november), naar het mobiele spel "Block Out! - Color Sort Puzzle" (reclame, zie `voorbeeld/`):
een bord vol gekleurde bouwsteentjes (blokken met noppen) van verschillende vormen. Langs de rand zitten uitgangen
in één kleur. Schuif een blok naar de uitgang van zijn kleur (hij past alleen als hij niet breder is dan de uitgang),
dan verdwijnt hij. Blokken schuiven alleen over lege vakjes en niet door elkaar heen. Het bord is klaar als het leeg is.
De voorbeelden zijn alleen ter inspiratie: geen merknamen (ook niet "LEGO"), geen levels overnemen.

## Afspraken (27 november)
- Naam: **Noppenschuif**, bestand `blokken.html` (één los bestand, zoals de andere 2D-spellen), concept op de startpagina.
- De steentjes met noppen blijven: dat vindt Marcel juist grappig. 1 vakje = 2×2 noppen.
- **Wereld 0: Opwarmen** (eerst): rustig beginnen. Level 1 = twee grote stenen naast elkaar voor de verkeerde deur
  (eentje opzij, dan kan de ander erlangs). Level 2 = drie stenen als mini-piramide: eerst een beetje schuiven,
  dan de eerste, de tweede en de laatste naar buiten. Daarna borden die langzaam groter en voller worden.
- **Wereld 1: Opruimdag** (volgende stap, thema A): de tienerkamer/zolder ligt vol steentjes, langs de rand staan de
  opbergbakken. Pa loopt op blote voeten: elke zet boven het minimum is een steentje waar hij op trapt ("AU!"),
  met grapjes tussen de levels. Elke wereld krijgt één nieuw speciaal steentje:
  kauwgomsteen (zit vast tot er 2 andere weg zijn), slot + sleutel, regenboogsteen (past in elke bak),
  verfpot (verft de buursteen), later de kat die over het bord loopt.
- Later misschien: havenwereld met uitgangen die van kleur wisselen (thema B).

## Regels in het spel
- Slepen met de vinger (of muis): de steen volgt de vinger vakje voor vakje over lege vakjes en stopt tegen andere stenen.
- Raakt een steen de uitgang van zijn kleur, past hij qua breedte en is de weg naar buiten vrij, dan zoeft hij eruit
  (ook midden in het slepen). Draaien kan niet.
- Eén keer slepen = één zet, ook met een bochtje. ↶ neemt een zet terug (ook een steen die al weg was), ⟲ begint opnieuw.
- Sterren: ⭐⭐⭐ = het minimum volgens de oplosser, ⭐⭐ = minimum + max(2, 30%), anders ⭐.
- Levels gaan op volgorde open. Beste aantal zetten per speler in `noppen_beste:<naam>` (JSON per level-id).

## Levels maken en controleren
- De spelregels en de oplosser staan in `blokken.html` in `<script id="motor">`, de levels in `<script id="levels">`.
  `blokken/motor-laden.js` haalt ze daaruit voor node, zodat er maar één versie van de code is.
- `node blokken/controleer.js`: lost elk level op en controleert of `min` klopt. **Draai dit na elke levelwijziging.**
- Oplosser: zoekt breedte-eerst het kleinste aantal zetten. Twee trucs maken hem snel: kan een steen meteen naar buiten,
  dan is dat altijd een beste zet (een leger bord maakt het alleen makkelijker); en stenen met dezelfde vorm en kleur
  zijn uitwisselbaar.
- `node blokken/levelmaker.js '{...}'` maakt kandidaten (JSON op stdout, plaatje op stderr). Twee methodes:
  - `"methode":"vol"` (beste): vult het bord met stenen op `leeg` vakjes na, kiest uitgangen en houdt alleen
    oplosbare levels. Lijkt het meest op de voorbeelden.
  - standaard: achteruit spelen (stenen door hun uitgang naar binnen schuiven en husselen): altijd oplosbaar, maar
    vaak een rommelig bord met veel gaten.
  - Opties: `w,h,kleuren,leeg,stukken,vormen,extraMin,extraMax,maxStaten,zaad,aantal`.
- Moeilijkheid = **extra zetten** (minimum min aantal stenen): hoe vaak je iets opzij moet schuiven. Plus bordgrootte,
  aantal kleuren, vormen en smalle uitgangen. Hoogstens 2 stenen mogen bij het begin meteen weg kunnen.
- Grote borden (6×6 en meer) worden traag voor de oplosser; dan `maxStaten` laag houden en vaker proberen.

## Stand van zaken
- Stap 1 (27 nov): bord, stenen met noppen, slepen, uitgangen, terug/opnieuw, sterren, Wereld 0 met 8 levels (3 tot 20 zetten).
- Volgende: Wereld 1 Opruimdag met Pa en de kauwgomsteen; plaatje voor de startpagina; geluid verder.
