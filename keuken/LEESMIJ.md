# Keukenplanner (`keuken/index.html`)

Geen spel: een plattegrond van onze keuken waarin je standaard kastjes en apparaten kunt slepen.
Staat niet in `spellen.json` (dus niet op de startpagina); open via https://deweef.github.io/spelletjes/keuken/.

## Maten (uit de schets van Marcel, oktober 2026)
- Bovenaan de plattegrond = de muur tegenover de doorgang (nu aanrecht met spoelbak). Vanaf het raam: 10 cm kozijn,
  15 cm kolf, dan 2,78 m. Totale breedte dus 3,03 m.
- Links zitten het raam en de buitendeur (zie de foto's van Marcel, oktober 2026). Rechts nu het fornuis/de oven.
- Diepte (de andere zijde): 2,55 m. (Op de schets staat bij de onderste maat 2,63; Marcel zei 2,55.)
- Doorgang (boog, geen deur): 89 cm breed, 2,50 m hoog, onderin links, recht onder de kolf.
- Op de schets: "1 → 1,15 tot koelkast".
- Nog onzeker en in de app aan te passen via 📐 Afmetingen: waar het raam met de buitendeur precies zit en hoe breed (nu linkermuur, 20–160 cm vanaf boven), waar de doorgang precies begint.

## Hoe het werkt
- Ontwerp in localStorage `keuken_plan`; 🔗 Delen maakt een link met het hele ontwerp in de `#`.
- Lagen: onder (onderkast/apparaat), hoog (koelkast, hoge kast), boven (hangt, gestippeld), vrij (tafel, stoel).
  Rood = botst. Bovenkasten botsen alleen met bovenkasten, hoge kasten en de kolf.
- Dikke streep = voorkant. Tegen een muur draait een kastje vanzelf met de rug naar de muur.
- Blauwe maten = afstand van het gekozen ding tot de muur of het eerstvolgende ding.

## De kolf
De kolf is de houten ombouw van ongeveer 15 cm naast het raam (waar nu het plantje op staat), aan het eind van het
aanrecht bij de vaatwasser. Met het kozijn van 10 cm erbij is hij 25 cm diep vanaf de linkermuur. Nu is hij ongeveer
60 lang (zo diep als het aanrecht). Op de bovenmuur zit géén kolf: daar kan het aanrecht tot de muur.

## Plan Anja (oktober 2026)
- Het kozijn met raam en buitendeur op de linkermuur gaat eruit. Er komt een raam zoals het huidige rechterraam
  (met bovenlicht), ook op de plek waar nu de deur zit. Geen buitendeur meer.
- De kolf wordt langs het hele raam doorgetrokken tot de andere kant, langs waar nu de deur is. Het witte muurtje aan
  die kant (bij de radiator) wordt iets korter zodat het blad erlangs past. In de app nu 170 lang (gegokt).
- Vóór de kolf komen elementen van 60, dus het blad wordt 75 diep (15 kolf + 60), tot het raam.
- Onder het raam het fornuis (altijd 90 breed), daarnaast 60 werkblad in de hoek bij de bovenmuur.
- Bovenmuur: alles schuift 60 naar rechts, dus de spoelbak/kraan ook. Boven de spoelbak geen kastjes maar rekjes.
- Rechtermuur: het gasfornuis gaat weg. Rechts (bij de doorgang) blijft de koelkastkolom zoals nu: onderkastje,
  koelkast, kastje. Links daarvan een vrieskolom: onderkastje, vrieskast, kastje.
- Boven het fornuis zit een raam, dus geen afzuigkap tegen de muur.
- In de app: 📋 Voorbeelden → "Keuken nu (geschat)" en "Plan Anja". Kastbreedtes van de huidige keuken zijn
  geschat vanaf foto's. Bij echte maten: `VOORBEELDEN` in `index.html` bijwerken.
