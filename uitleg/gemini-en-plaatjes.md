# Plaatjes maken met Gemini (voor alle spellen)

Werkwijze die bij Zoekplaatje en Pizzabaas goed werkte. Claude schrijft de opdracht, Marcel plakt hem in Gemini en zet het
resultaat terug in de chat (of de link, bij Zoekplaatje).

## Opdrachten schrijven
- **Eén opdracht per keer**: Gemini doet het slechter met twee opdrachten tegelijk.
- **Figuren voor een spel** (sprites): "een vel met spelfiguurtjes … één en hetzelfde figuurtje, steeds precies dezelfde
  kleren en grootte … in een net raster, elk figuurtje even groot met ruimte ertussen, niets overlapt … alle voeten op
  dezelfde hoogte … effen felgroene achtergrond (#00FF00), geen schaduwen, geen vloer, geen tekst".
- **Houdingen precies beschrijven**: welke kant hij op kijkt ("precies van opzij, neus naar rechts", "recht naar de kijker
  toe", "recht van achteren") en per plaatje wat de benen doen. Anders tekent Gemini schuin-van-voren-plaatjes die bijna gelijk
  zijn, en dan "moonwalkt" het figuur in het spel.
- **Vervolgvel van een bestaand figuur**: laat Marcel het oude vel als plaatje meesturen ("precies deze kok"), dan blijft het
  dezelfde figuur.
- **Stijl van een voorbeeld**: stuur een voorbeeldplaatje mee (bv. `pizza/voorbeeld/origineel-1-zaak.jpg`) en beschrijf het
  perspectief (recht van boven, of iets schuin met een korte schaduw naar rechtsonder).
- Gemini maakt vaak meer of minder plaatjes dan gevraagd: geen probleem zolang de houdingen duidelijk verschillen.
- Geen echte merken, logo's of beschermde figuren (Lucky Luke, Mercedes-ster, Warcraft-namen). Schilderijen van lang
  geleden (Rembrandt, Van Gogh, Bruegel) mogen wel.
- Zoekplaatje heeft een eigen vaste prompt in `zoek/LEESMIJ.md`.

## Uitknippen en inbouwen
- `python3 extra/knip_figuren.py <vel.jpg> <uit.png> [--hoogte 192] [--rijen y1-y2,...] [--max-x ...]` haalt het groen weg,
  knipt de figuren los, maakt rijen even groot en zet alles op één rij van even grote vakjes (plus een controleplaatje).
  Kijk het controleplaatje altijd na en noteer in de uitleg van het spel welk plaatje welke houding is.
- Bewaar het originele Gemini-vel naast het resultaat (bv. `pizza/kok-gemini.jpg` en `pizza/kok.png`).

## Plaatjes bewaren
- Plaatjes die Marcel in een chat plakt, ziet een volgend gesprek niet. Zet alles wat later nog nodig is (Gemini-vellen,
  screenshots van het origineel, voorbeelden) in de map van het spel, bv. `pizza/voorbeeld/`.
- Kwijt geraakt? Een gesprek kan oude gesprekken van Marcel inzien (tool `list_sessions` en `list_events` van
  claude-code-remote) en daar geplakte plaatjes terugvinden. Dat kost veel ruimte: liever meteen in de repo zetten.
- Grote originele foto's van de familie nooit onversleuteld in de repo (de site is openbaar).
