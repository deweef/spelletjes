# Keukenplanner (`keuken/index.html`)

Geen spel: een plattegrond van onze keuken waarin je standaard kastjes en apparaten kunt slepen.
Staat niet in `spellen.json` (dus niet op de startpagina); open via https://deweef.github.io/spelletjes/keuken/.

## Maten (uit de schets van Marcel, oktober 2026)
- Bovenaan de plattegrond = de muur tegenover de doorgang (nu aanrecht met spoelbak). Langs die muur vanaf de linkerhoek:
  10 cm muur, dan een kolf van 15 cm (de tegels met luchtballonnen), dan 2,78 m binnenmaat. Totale breedte dus 3,03 m.
- Links zitten het raam en de buitendeur (zie de foto's van Marcel, oktober 2026). Rechts nu het fornuis/de oven.
- Diepte (de andere zijde): 2,55 m. (Op de schets staat bij de onderste maat 2,63; Marcel zei 2,55.)
- Doorgang (boog, geen deur): 89 cm breed, 2,50 m hoog, onderin links, recht onder de kolf.
- Op de schets: "1 → 1,15 tot koelkast".
- Nog onzeker en in de app aan te passen via 📐 Afmetingen: hoe ver de kolf uitsteekt (nu 15 cm),
  waar het raam met de buitendeur precies zit en hoe breed (nu linkermuur, 20–160 cm vanaf boven), waar de doorgang precies begint.

## Hoe het werkt
- Ontwerp in localStorage `keuken_plan`; 🔗 Delen maakt een link met het hele ontwerp in de `#`.
- Lagen: onder (onderkast/apparaat), hoog (koelkast, hoge kast), boven (hangt, gestippeld), vrij (tafel, stoel).
  Rood = botst. Bovenkasten botsen alleen met bovenkasten, hoge kasten en de kolf.
- Dikke streep = voorkant. Tegen een muur draait een kastje vanzelf met de rug naar de muur.
- Blauwe maten = afstand van het gekozen ding tot de muur of het eerstvolgende ding.

## Plan Anja (oktober 2026)
- Het kozijn met raam en buitendeur op de linkermuur gaat eruit. Er komt een raam zoals het huidige rechterraam
  (met bovenlicht), ook op de plek waar nu de deur zit. Geen buitendeur meer.
- Onder dat raam het fornuis (altijd 90 breed), daarnaast 60 werkblad (in de plattegrond richting de hoek bij de kolf).
- De spoelbak/kraan op de bovenmuur gaat 60 cm naar rechts.
- In de app: 📋 Voorbeelden → "Keuken nu (geschat)" en "Plan Anja". De kastmaten van de huidige keuken zijn
  geschat vanaf foto's: vaatwasser 60, spoelbak 80, ladekast 60, hoekkast 78 op de bovenmuur, oven + kookplaat
  op de rechtermuur. Bij echte maten: `VOORBEELDEN` in `index.html` bijwerken.
- Let op: boven het fornuis zit dan een raam, dus geen afzuigkap tegen de muur.
