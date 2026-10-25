# Pizzabaas: plan en afspraken (met Marcel)

Idee: Pizza Tycoon / Pizza Connection (1994), maar met eigen naam, plaatjes en grappen. Techniek staat in CLAUDE.md.

## Klaar
- Stap 1: zaak van 15x15 tegels inrichten (tafels, kleedjes, kaarsjes, planten, jukebox), klanten, koks, obers, werkdag, dagoverzicht.
- Uiterlijk zoals het origineel: geblokte vloer, houten kader, paneel met zwart schermpje en 3x3 knoppen.
- Kok en ober zijn eigen ontwerpen, gemaakt met Gemini (zie hieronder).
- Stap 2: pizza's samenstellen (knop 📖 Pizza's): menukaart met max. 6 pizza's (begint met een Margherita). Pizza maken = tik op
  ingrediënten (20 stuks, max. 14 stukjes, max. 4 van één soort), smaakmeter vet / zoet / zout / pittig, inkoop, prijs (€ 4-25)
  en winst, en per soort klant een gezichtje (🤢 tot 😍). Klanten komen per groepje van één soort (student 25%, villabewoner 10%,
  toerist 15%, werker 30%, opa/oma 20%; werkers met gele helm, toeristen met zonnehoed), kiezen de pizza die ze het lekkerst vinden,
  of lopen weg als er niks voor ze op de kaart staat. Lekker = meer fooi en populariteit. Ingrediënten worden betaald als de kok begint.
  Dagoverzicht: meest bestelde pizza, hoe het per soort smaakte, ingrediëntkosten.

## Ideeën voor later bij de pizza's
- Pizza's ook echt met hun ingrediënten tekenen op de borden en de toonbank (nu nog een algemene pizza).
- Andere buurten met een andere mix van klanten (zie stap 5), en per dag een "trend" (vandaag willen ze pittig!).
- Ingrediënten slim inkopen (voorraad, bederf, aanbiedingen bij de groothandel).

## Eerst (afgesproken na het testen van het pizza-samenstellen, 25 oktober)
Punten 1 t/m 5 zijn klaar (25 oktober): uitgiftepunt naast de ovens, tafel bestelt en wacht samen, ober draagt twee borden,
tafels slepen, jukebox 2x2. Punten 6 en 7 wachten op nieuwe Gemini-vellen van Marcel.
1. ~~Pizza's klaarzetten naast de ovens (één uitgiftepunt bij de ovens), niet helemaal rechts op de toonbank (`TOONBANK`).~~
2. ~~Een tafel bestelt samen; de keuken bakt de pizza's voor die tafel achter elkaar; geduld telt per tafel.~~
3. ~~De ober wacht tot de bestelling voor de hele tafel klaar is en draagt er twee tegelijk (één per hand); bij vier personen loopt hij twee keer.~~
4. ~~Tafels verplaatsen door te slepen (vasthouden en schuiven); het menuutje blijft voor kleedje, kaarsje en verkopen.~~
5. ~~Jukebox 2x2 tegels in plaats van 1x1.~~
6. De kok "moonwalkt": de loopplaatjes zijn schuin van voren en bijna gelijk. Nieuw Gemini-vel nodig (ook voor de ober):
   "Een vel met spelfiguurtjes voor een computerspel in pixelart, één en hetzelfde figuurtje (deze kok), steeds precies dezelfde
   kleren en grootte. Rij 1: loopcyclus precies van opzij (profiel, neus naar rechts), 6 plaatjes: hak neer, doorzakken, been
   passeert, omhoog, andere hak neer, doorzakken. Rij 2: loopcyclus recht naar de kijker toe, 4 plaatjes. Rij 3: loopcyclus recht
   van achteren, 4 plaatjes. Alle voeten op dezelfde hoogte. Effen felgroene achtergrond, geen schaduwen, geen tekst."
7. Meubelstijlen (later, met Gemini-meubelvellen van bovenaf op groen): plastic klapstoeltjes (studenten), houten bistrotafel met
   geruit kleed (toeristen), wit damast met kroonluchter (villabewoners), fijne stoelen met kussens (opa en oma).
- **Nog open: plaatjes van het origineel.** Screenshots van Pizza Tycoon komen in `pizza/voorbeeld/` (Marcel plakt ze in de chat,
  als ze niet ergens uit een algemene games-map te halen zijn), zodat het uiterlijk er dichter bij kan en we kunnen nakijken welke
  tafels, stoelen en kleedjes het origineel had (ook als voorbeeld voor de Gemini-meubelvellen van punt 7).

## Volgende stappen (in deze volgorde)
1. ~~Pizza's samenstellen~~ (klaar, zie hierboven).
2. **Klanten als eigen figuren** (net als kok en ober), met Gemini; de zittende houdingen staan al op de vellen.
3. **De achterkamer** (geen wapens, geen drugs):
   - Ingang: koop een schilderij voor aan de muur. Een man met gleufhoed: "Wat een mooi schilderij… wie is de schilder?"
     Antwoord "een échte Van Gogh" opent de achterkamer.
   - Atelier: beroemde schilderijen namaken (Mona Lisa, Meisje met de parel, De Schreeuw, Zonnebloemen: publiek domein) als
     minispelletje; hoe beter, hoe meer een dubieuze koper betaalt.
   - Risico: kunstrechercheur komt pizza eten en snuffelen; betrapt = boete, een dag dicht, populariteit omlaag; advocaat "Mr. Gladjanus".
   - Valsmunterij: valse kortingsbonnen van Luigi van de overkant drukken (zijn klanten lopen naar jou over).
   - Crypto: klant "ik heb alleen Chinese yuan bij me" of "kan ik met crypto betalen?". Verzonnen munten: Bitkaas, Ethertje,
     MozzaMunt, DogePizza; koers schommelt per dag (+40% / −60%), portemonnee met grafiekje in het paneel; yuan = saai maar veilig.
4. **Luigi van de overkant**: sabotage (ratten, keuringsdienst, stinkbom), daarna schoonmaken/repareren voor je weer open kunt.
5. Meer buurten en een tweede filiaal.

## Figuren maken met Gemini
- Vel met één figuur in vaste houdingen op een effen **felgroene** achtergrond, zonder schaduw en tekst. Rijen: voorkant (staan,
  lopen, iets bijzonders), achterkant (staan, lopen), zitten. Zie `pizza/kok-gemini.jpg` en `pizza/ober-gemini.jpg`.
- Uitknippen in Python (PIL): groen = (g>140, g>r+60, g>b+60) doorzichtig, groenige randpixels ontgroenen, per rij de
  figuren op kolommen splitsen, de rugrij schalen naar dezelfde lengte als de voorkant, op één rij zetten van 113x192 per plaatje.
- Prompt die werkte: "Een vel met spelfiguurtjes voor een computerspel … één en hetzelfde figuurtje, steeds precies dezelfde
  kleren … effen felgroene achtergrond, geen schaduwen, geen tekst".

### Gemini-opdrachten (Claude schrijft ze, Marcel plakt ze in Gemini en zet het plaatje terug in de chat)
Altijd het oude vel (`pizza/kok-gemini.jpg` / `pizza/ober-gemini.jpg`) meesturen, zodat het hetzelfde figuurtje blijft.

**A. Kok, loopvel** (tegen het moonwalken):
"Maak een nieuw vel met spelfiguurtjes van precies deze kok (zelfde pixelart-stijl, kleren, snor, muts en grootte als op het
plaatje). Zet ze in een net raster: 3 rijen, elk figuurtje even groot en met ruimte ertussen, niets overlapt.
Rij 1: 6 plaatjes, lopen precies van opzij (profiel, neus naar rechts): hak neer, doorzakken, been passeert, omhoog, andere hak
neer, doorzakken. Benen en armen duidelijk verschillend per plaatje.
Rij 2: 4 plaatjes, recht naar de kijker toe lopen (linkerbeen voor, staan, rechterbeen voor, staan).
Rij 3: 4 plaatjes, recht van achteren weglopen (zelfde ritme).
Alle voeten op dezelfde hoogte. Effen felgroene achtergrond (#00FF00), geen schaduwen, geen vloer, geen tekst."

**B. Ober, loopvel**: hetzelfde als A, maar "precies deze ober" en het ober-vel meesturen.

**C. Ober met twee borden**:
"Maak een vel met precies deze ober (zelfde stijl en grootte). Hij draagt in elke hand een wit bord met een pizza, armen
gebogen naar voren. 3 rijen in een net raster, niets overlapt: rij 1: 6 plaatjes lopen van opzij (neus naar rechts);
rij 2: 4 plaatjes lopen naar de kijker toe; rij 3: 4 plaatjes van achteren. Daarna nog 2 losse plaatjes: één bord neerzetten
op een tafel (voorovergebogen), en staan met de borden. Alle voeten op dezelfde hoogte. Effen felgroene achtergrond (#00FF00),
geen schaduwen, geen tekst."

**D. Meubels, recht van boven** (zoals een plattegrond; de vloer in het spel is ook recht van boven):
"Pixelart voor een pizzeria-spel, alles recht van bovenaf gezien (bovenaanzicht, zoals een plattegrond), in een net raster van
4 kolommen, elk ding in een eigen vierkant vak, niets overlapt. Rij 1: vierkante tafel zonder kleed, dezelfde tafel met
rood-wit geruit kleed, dezelfde met wit kleed en kaarsje, dezelfde met wijnfles en kaars. Rij 2: houten stoel van boven
(leuning aan de bovenkant), dezelfde stoel met rood kussen, plastic klapstoeltje, chique stoel met fluweel. Rij 3: plant in
terracotta pot, grote palm in pot, jukebox (felle kleuren, lampjes), wit bord met pizza. Effen felgroene achtergrond (#00FF00),
geen schaduwen, geen tekst."
(Stoel = 1x1 tegel, tafel = 2x2 tegels, jukebox = 2x2.)
