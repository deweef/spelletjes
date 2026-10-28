# Zoekplaatje: ideeën die nog open staan

- **Aftakking na level 20** (afgesproken met Marcel, okt 2026). Na level 20 splitst het pad:
  - **Gewone pad**: gewoon door met level 21, 22, ... 30.
  - **Bruegel-lijn**: B1 t/m B10, Bruegel-platen (publiek domein, net als de Nachtwacht "op onze manier" via Gemini),
    elk met een eigen spelvorm. B10 is de afsluiter.
  - Ze komen weer samen bij **level 31**: dat gaat open als je level 30 óf B10 af hebt. Je mag beide paden spelen.
  - In het menu heten ze "B1", "B2", ... (eigen nummering, los van 21-30); de `id` blijft een naam (bijv. `spreekwoorden`),
    zoals bij de andere levels. Open-regel: B1 na level 20 (`ruimte`), Bn na B(n-1), 21 na 20, 31 na 30 of B10.
    Bouwen: per level een veld `pad: 'B'` en `na: [ids]` in `LEVELS`, nummering en `isOpen` daarop aanpassen.
  - Gebouwd: B1, B2, B3 (gewoon zoeken; B3 = de moderne dingen zoeken). Voorstel voor de rest (nog niet vast):
    - B1 Nederlandse Spreekwoorden: zoek het spreekwoord ("met het hoofd tegen de muur lopen", "de kat de bel aanbinden").
    - B2 Kinderspelen: zoek het spelletje (hoepelen, bokspringen, tollen, haasje-over).
    - B3 Jagers in de sneeuw: wat hoort er niet bij? (snowboarder, sneeuwscooter, iemand met een telefoon, Sjaak op ski's).
    - B4 De boerenbruiloft: tellen (hoeveel taarten, kannen bier, lepels op hoeden).
    - B5 Strijd tussen Carnaval en Vasten: sorteren, is het van Carnaval of van de Vasten?
    - B6 Luilekkerland: op volgorde, eerst het voorgerecht ... tot het toetje (en wie ligt er als eerste te slapen).
    - B7 De toren van Babel: op volgorde van beneden naar boven.
    - B8 De boerendans: zoek de verschillen tussen twee bijna gelijke platen.
    - B9 De val van Icarus: piepkleine details, ver inzoomen (alleen een paar beentjes in het water).
    - B10 Afsluiter: één grote Bruegel-mix met figuren uit B1-B9 en alle spelvormen door elkaar.
  - Extra effecten per level (zoals de windvlagen bij de herfststorm), voorstel okt 2026:
    - B5 Carnaval en Vasten: confettikanon en een trommel die het beeld op de maat laat stuiteren.
    - B7 Toren van Babel: spraakverwarring, de namen bovenin staan in een andere taal (Engels, Duits, Frans, Fries, Limburgs) en wisselen af en toe.
    - B8 Boerendans: doedelzakmuziekje en het plaatje danst op de maat (heen en weer).
    - B9 Val van Icarus: de zon verblindt, een fel wit lichtvlak dat langzaam over het plaatje schuift (het omgekeerde van de zaklamp).
    - B10 Afsluiter: elk halve minuut een ander effect uit de reeks (storm, sneeuw, wazig, Babel, zon).
- **Sjaak-plaat**: één plaat met ±20 Sjaakjes, gaat open als je Sjaak in alle levels hebt betrapt; een Sjaak-teller in het menu.
  Afgesproken: een geheim level, los van 21-30 en B1-B10, dat pas in het menu verschijnt als Sjaak overal betrapt is.
- Orkest en strand hebben nog geen Sjaak (nieuwe Gemini-plaat of Sjaak erin plakken zoals de oldtimer bij het strand).
- We doen steeds 5 platen tegelijk. 23-25 en B4-B5 zijn gebouwd. Reserve-ideeën van Marcel: naai-atelier, autorace, dromen;
  woordenlijst om op te schieten: kapsalon, tandarts, bouwplaats, kringloop, bakkerij, dierenarts, sinterklaas, kerstmarkt, zwembad,
  bowling, festival, verhuisdag, meubelzaak, wasstraat, tuincentrum, trein, bioscoop, gevangenis (Sjaak in de cel), heksenhuis, ridderkasteel, dinomuseum.
- **Levelkaart** (idee Marcel, okt 2026, voorbeeld: kaart met een kronkelend zandpad en genummerde schijfjes zoals in boerderijspelletjes):
  het levelmenu als landkaart met een kronkelpad, aftakkingen naar het Bruegel-pad en het landenpad, per level een rond schijfje.
- **Afslag C: landen** (idee Marcel, afgesproken okt 2026): derde pad C1 t/m C10, gaat open na level 25 (`na: ['brommer']`), C10 opent
  level 36 (dus 36 krijgt `na: [<id van 35>, <id van C10>]`). Wie het Bruegel-pad neemt, moet voor de landen toch eerst 21 t/m 25 doen.
  Per level een land (Frankrijk met de Franse kaart als puzzel en Franse spullen, Griekenland met miniaturen van bekende gebouwen, ...),
  C10 als afsluiter: de wereldwonderen. C1 Frankrijk: plaat is er; effect-idee: elk gevonden voorwerp legt een puzzelstukje op de kaart van Frankrijk, het laatste stukje heeft Sjaak. Menu: na level 25 een tweede splitsing met het landenpad, net als bij 20.
- Level 26: de bouwplaat, een jongen op zijn kamer die kartonnen autootjes uitknipt en plakt (opdracht gegeven okt 2026). Effect-idee: een kartonnen autootje vouwt zich in een hoek in elkaar en rijdt aan het eind over het scherm (goedgekeurd).
- C2 Griekenland: plaat gemaakt; effect-idee "Opa!": elk gevonden voorwerp gooit een bord kapot, met scherven en een sirtaki die steeds sneller gaat (goedgekeurd).
- Levelkaart mooier maken: Gemini-vel met versiering (boompjes, huisjes, molen, schuur, ezel met schilderij, Eiffeltorentje) i.p.v. emoji.
- **Sinterklaasavond**: plaat is gemaakt (link in LEESMIJ), geparkeerd tot eind november/begin december; effect-idee: af en toe een plens pepernoten over het scherm.
- **Level 27 Sint-Maarten (11 november)**, plaat gemaakt: kinderen met lampions langs de deuren; effect-idee: het is avond, alleen het licht van de lampions (die rondlopen) en je eigen lampion laat iets zien.
- **C3 Italië (Venetië)**: effect-idee acqua alta, het water stijgt langzaam vanaf de onderkant, elk gevonden voorwerp laat het zakken.
- Meer levels: winterkermis, Orkenstorm-dorp.
- Gemini-prompt en alle links: zie `zoek/LEESMIJ.md`.
