# Pizzabaas: plan en afspraken (met Marcel)

Idee: Pizza Tycoon / Pizza Connection (1994), maar met eigen naam, plaatjes en grappen. Techniek staat in CLAUDE.md.

## Klaar
- Stap 1: zaak van 15x15 tegels inrichten (tafels, kleedjes, kaarsjes, planten, jukebox), klanten, koks, obers, werkdag, dagoverzicht.
- Uiterlijk zoals het origineel: geblokte vloer, houten kader, paneel met zwart schermpje en 3x3 knoppen.
- Kok en ober zijn eigen ontwerpen, gemaakt met Gemini (zie hieronder).

## Volgende stappen (in deze volgorde)
1. **Pizza's samenstellen** (knop 📖 Pizza's, nu "binnenkort"), zoals Pizza Connection: ingrediënten op een bodem leggen,
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
