# Pizzabaas: plan en afspraken (met Marcel)

Idee: Pizza Tycoon / Pizza Connection (1994), maar met eigen naam, plaatjes en grappen. Techniek staat in CLAUDE.md.

## Klaar
- Stap 1: zaak van 15x15 tegels inrichten (tafels, kleedjes, kaarsjes, planten, jukebox), klanten, koks, obers, werkdag, dagoverzicht.
- Uiterlijk zoals het origineel: geblokte vloer, houten kader, paneel met zwart schermpje en 3x3 knoppen.
- Kok en ober zijn eigen ontwerpen, gemaakt met Gemini (zie hieronder).

## Eerst (afgesproken na het testen van het pizza-samenstellen, 25 oktober)
1. Pizza's klaarzetten naast de ovens (één uitgiftepunt bij de ovens), niet helemaal rechts op de toonbank (`TOONBANK`).
2. Een tafel bestelt samen; de keuken bakt de pizza's voor die tafel achter elkaar; geduld telt per tafel.
3. De ober wacht tot de bestelling voor de hele tafel klaar is en draagt er twee tegelijk (één per hand); bij vier personen loopt hij twee keer.
4. Tafels verplaatsen door te slepen (vasthouden en schuiven); het menuutje blijft voor kleedje, kaarsje en verkopen.
5. Jukebox 2x2 tegels in plaats van 1x1.
6. De kok "moonwalkt": de loopplaatjes zijn schuin van voren en bijna gelijk. Nieuw Gemini-vel nodig (ook voor de ober):
   "Een vel met spelfiguurtjes voor een computerspel in pixelart, één en hetzelfde figuurtje (deze kok), steeds precies dezelfde
   kleren en grootte. Rij 1: loopcyclus precies van opzij (profiel, neus naar rechts), 6 plaatjes: hak neer, doorzakken, been
   passeert, omhoog, andere hak neer, doorzakken. Rij 2: loopcyclus recht naar de kijker toe, 4 plaatjes. Rij 3: loopcyclus recht
   van achteren, 4 plaatjes. Alle voeten op dezelfde hoogte. Effen felgroene achtergrond, geen schaduwen, geen tekst."
7. Meubelstijlen (later, met Gemini-meubelvellen van bovenaf op groen): plastic klapstoeltjes (studenten), houten bistrotafel met
   geruit kleed (toeristen), wit damast met kroonluchter (villabewoners), fijne stoelen met kussens (opa en oma).
- Screenshots van het origineel komen in `pizza/voorbeeld/` (Marcel), zodat het uiterlijk er dichter bij kan.

## Volgende stappen (in deze volgorde)
1. **Pizza's samenstellen** (gebouwd in commit c7df2f7 van de eerste Pizzabaas-sessie; staat online zodra die is overgezet) (knop 📖 Pizza's, nu "binnenkort"), zoals Pizza Connection: ingrediënten op een bodem leggen,
   schermpje met vet / zoet / zout / pittig, elke soort klant (student, villabewoner, toerist, werker, opa/oma) vindt er wat
   anders van. Ingrediëntplaatjes: Kenney food-kit `Previews/*.png` (64x64) uit `bronnen/kenney_food-kit.zip`
   (tomato-slice, mushroom-half, paprika-slice, cheese-cut, sausage-half, onion-half, pineapple, fish, bacon, egg-half, ...).
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
