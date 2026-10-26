# Keukenplanner (`keuken/index.html`)

Geen spel: een plattegrond van onze keuken waarin je standaard kastjes en apparaten kunt slepen.
Staat niet in `spellen.json` (dus niet op de startpagina); open via https://deweef.github.io/spelletjes/keuken/.

## Maten (uit de schets van Marcel, oktober 2026)
- Bovenaan de plattegrond = raamkant. Langs die muur: 10 cm muur, dan een kolf van 15 cm, dan 2,78 m binnenmaat.
  Totale breedte dus 3,03 m.
- Diepte (de andere zijde): 2,55 m. (Op de schets staat bij de onderste maat 2,63; Marcel zei 2,55.)
- Doorgang (boog, geen deur): 89 cm breed, 2,50 m hoog, onderin links, recht onder de kolf.
- Op de schets: "1 → 1,15 tot koelkast".
- Nog onzeker en in de app aan te passen via 📐 Afmetingen: hoe ver de kolf uitsteekt (nu 15 cm),
  waar het raam/de buitendeur precies zit (nu 40–160 cm vanaf links), waar de doorgang precies begint.

## Hoe het werkt
- Ontwerp in localStorage `keuken_plan`; 🔗 Delen maakt een link met het hele ontwerp in de `#`.
- Lagen: onder (onderkast/apparaat), hoog (koelkast, hoge kast), boven (hangt, gestippeld), vrij (tafel, stoel).
  Rood = botst. Bovenkasten botsen alleen met bovenkasten, hoge kasten en de kolf.
- Dikke streep = voorkant. Tegen een muur draait een kastje vanzelf met de rug naar de muur.
- Blauwe maten = afstand van het gekozen ding tot de muur of het eerstvolgende ding.
