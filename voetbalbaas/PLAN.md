# Voetbalbaas – plan en Gemini-opdrachten

Plaatjes komen in deze map (`voetbalbaas/`). Werkwijze zoals bij Pizzabaas (zie `uitleg/gemini-en-plaatjes.md`):
Marcel plakt **één opdracht per keer** in Gemini en zet het resultaat in de chat; Claude bewaart het origineel als
`voetbalbaas/<naam>-gemini.jpg`, knipt het uit (`extra/knip_figuren.py` of per vak) naar `voetbalbaas/<naam>.png` en noteert
in `uitleg/voetbalbaas.md` welk vakje wat is.

## Afspraken
- De **wedstrijd blijft pixelstijl** (kleine poppetjes in clubkleuren, zoals vroeger op de Commodore 64); die tekent het spel zelf.
- Gemini-plaatjes zijn voor **de schermen eromheen**: kantoor, manager, nieuws, velden per divisie.
- Alle plaatjes in **dezelfde stijl** (het stijlblok hieronder steeds meesturen). Geen tekst in de plaatjes (Gemini spelt
  slecht; het spel zet de tekst er zelf bij), geen echte clubs, logo's, merken of bekende voetballers.
- Shirts op de plaatjes zijn **effen oranje met een zwarte streep** of neutraal, want de speler kiest zelf de clubkleuren.
- Het spel werkt ook zonder plaatjes (dan gewoon de tekst), zodat we ze één voor één kunnen toevoegen.

## Stijlblok (bij elke opdracht meesturen)
> Stijl: vrolijke cartoonstijl voor een spelletje, dikke donkere omlijning, warme heldere kleuren, een tikje retro
> jaren-80-sfeer (trainingspakken, snorren, oude tv's), grappig maar niet grof. Geen tekst, geen letters, geen cijfers,
> geen logo's of merknamen in het plaatje.

## Opdracht 1 – Het kantoor van de baas (achtergrond kantoorscherm) – KLAAR (`kantoor.jpg`)
> Maak een liggende illustratie (16:9) van het rommelige kantoortje van de trainer van een klein Nederlands amateurvoetbalclubje,
> recht van voren gezien, alsof je in de deuropening staat. In het midden een oud houten bureau met daarop een ouderwetse
> beige computer met een dik bolle beeldbuis (jaren 80), een overvolle asbak vol gummetjes en potloden, een koffiemok,
> stapels papier en een fluitje aan een koord. Achter het bureau een lege bureaustoel (er zit niemand). Aan de muur een
> krijtbord met kruisjes en pijltjes van een opstelling, een wandklok, een vergeelde teamfoto in een lijstje (gezichten
> klein en vaag), een clubsjaal en een prikbord met briefjes. In de hoek een krat bier, een ballennet met voetballen en
> een droog hangplantje. Door het raam zie je een stukje voetbalveld met een hek en een kantine-keet. Middagzon, gezellig
> rommelig. [stijlblok]

## Opdracht 2 – De managers (portretten, blij en boos) – KLAAR (`managers.jpg`)
> Maak een vel met 8 portretjes (borstbeeld, recht van voren, kijkt naar de kijker) in een net raster van 4 naast elkaar
> en 2 rijen onder elkaar. Elk portretje even groot, met ruimte ertussen, niets overlapt. Effen felgroene achtergrond
> (#00FF00), geen schaduwen, geen vloer. Bovenste rij: vier verschillende voetbaltrainers die **blij** zijn (dikke lach,
> duim omhoog of vuist in de lucht). Onderste rij: **precies dezelfde vier** in dezelfde volgorde, met dezelfde kleren en
> kapsels, maar nu **boos of wanhopig** (rood hoofd, handen in het haar, wijst boos). De vier trainers:
> 1. een gezette man van een jaar of 50 met een grote snor en een glimmend fout trainingspak (paars met turquoise);
> 2. een stoere vrouw van een jaar of 40 met een paardenstaart, een klembord en een fluitje om haar nek;
> 3. een jonge gast van een jaar of 25 met een pet achterstevoren, een hoodie en een koptelefoon om zijn nek;
> 4. een oude baas van een jaar of 65 met een lange regenjas, een sjaal en een hoedje, die een beetje mopperig kijkt.
> [stijlblok]

*Gebruik:* je kiest bij het begin je manager (komt bij `Eigen club maken`); na een overwinning staat hij blij op het
uitslagscherm, na een nederlaag boos.

## Opdracht 3 – Nieuwsplaatjes, vel 1 – KLAAR (`nieuws.jpg`, vakjes 0-3; Gemini maakte ze liggend, dat is prima)
> Maak een vel met 4 vierkante plaatjes in een raster van 2 naast elkaar en 2 onder elkaar, elk precies even groot, met een
> dunne witte rand eromheen en ruimte ertussen. Elk plaatje is een klein grappig krantenplaatje over een amateurvoetbalclub.
> De spelers dragen effen oranje shirts met een zwarte streep in het midden.
> 1. (linksboven) De clubkantine: een barman tapt met twee handen tegelijk bier, het schuim loopt over, voetballers in
>    trainingspak proosten aan de bar.
> 2. (rechtsboven) Een voetballer op de bank in de kleedkamer met een enorme kater: ijszak op zijn hoofd, groen gezicht,
>    sterretjes rond zijn hoofd, een teamgenoot fluit hard op een fluitje vlak naast zijn oor.
> 3. (linksonder) In het bos achter het voetbalveld: een voetballer staat (van achteren gezien!) stiekem tegen een boom
>    te plassen en struikelt tegelijk over een boomwortel; een eekhoorn kijkt geschrokken toe. Niets bloots te zien.
> 4. (rechtsonder) Drie koeien staan midden op het voetbalveld en eten gras bij de middenstip; een boze scheidsrechter
>    zwaait met een rode kaart naar een koe, een boer komt aanrennen.
> [stijlblok]

## Opdracht 4 – Nieuwsplaatjes, vel 2 – KLAAR (vakjes 4-7 in `nieuws.jpg`)
> Zelfde opzet als het vorige vel (4 vierkante plaatjes, 2x2, even groot, dunne witte rand, oranje shirts met zwarte streep):
> 1. (linksboven) Een lekkende douche in een oude kleedkamer: water spuit alle kanten op, een loodgieter met een grote
>    moersleutel en een bouwvakkersdecolleté ligt eronder, voetballers met een handdoek om kijken toe.
> 2. (rechtsboven) Een vrolijke snackbareigenaar met een schort zet een groot reclamebord met een frikandel en een
>    patatzak langs het voetbalveld (geen tekst op het bord, alleen de plaatjes van de snacks).
> 3. (linksonder) Supporters op een kleine houten tribune houden een enorm zelfgemaakt spandoek omhoog met een getekend
>    hart en een voetbal erop (geen letters), er wordt gejuicht, iemand zwaait met een sjaal.
> 4. (rechtsonder) Achter de dug-out: een voetballer blaast betrapt een grote wolk rook uit, met een heel onschuldige
>    blik; de scheidsrechter staat achter hem met zijn armen over elkaar en één opgetrokken wenkbrauw.
> [stijlblok]

## Opdracht 5 – Nieuwsplaatjes, vel 3 – KLAAR (vakjes 8-11 in `nieuws.jpg`)
> Zelfde opzet (4 vierkante plaatjes, 2x2, even groot, dunne witte rand, oranje shirts met zwarte streep):
> 1. (linksboven) De clubloterij: een opgewonden voorzitter in pak houdt een krat bier omhoog als hoofdprijs, een
>    blije oma heeft het winnende lootje, er dwarrelen confetti.
> 2. (rechtsboven) Een voetballer traint in z'n eentje in de regen op een leeg veld 's avonds onder een lantaarnpaal:
>    sprintjes met een autoband aan een touw achter zich aan, vastberaden blik.
> 3. (linksonder) Een scheidsrechter steekt dramatisch een rode kaart in de lucht, de voetballer valt theatraal op zijn
>    knieën met zijn handen in de lucht.
> 4. (rechtsonder) Een geblesseerde voetballer op een brancard, met een dik ingepakt been, wordt door twee hijgende
>    oude verzorgers met een tasje en een spons weggedragen.
> [stijlblok]

## Opdracht 6 – De velden per divisie – KLAAR (`velden.jpg`)
> Maak een vel met 4 liggende plaatjes (16:9) in een raster van 2 naast elkaar en 2 onder elkaar, elk precies even groot,
> met een dunne witte rand en ruimte ertussen. Steeds een voetbalveld schuin van boven gezien, zonder spelers:
> 1. (linksboven) Een modderig dorpsveldje met kale plekken en plassen, een hek van gaas, een koeienwei ernaast, een
>    houten kantine-keet en een scheef doel zonder net. Grijze lucht.
> 2. (rechtsboven) Een net sportparkje met een klein overdekt houten tribunetje, lichtmasten en een kantine met terras.
> 3. (linksonder) Een klein stadion met tribunes aan alle vier de kanten, rode stoeltjes, een scorebord zonder cijfers.
> 4. (rechtsonder) Een groot modern stadion vol juichend publiek, vuurwerk en vlaggen, schijnwerpers aan, avond.
> [stijlblok]

*Gebruik:* bovenaan het kantoorscherm, bij de volgende wedstrijd (thuis = jouw veld, hangt af van je divisie), en groot
op het scherm "Einde seizoen" bij promotie.

## Volgorde
1 (kantoor) en 3 (nieuws vel 1) eerst: daar zie je het meeste verschil. Daarna 2 (managers), 4, 5 en 6.

## Open ideeën (spel)
- ~~Moeilijkheidsgraad~~ (gedaan: makkelijk / normaal / moeilijk).
- ~~Kaartjesprijs zelf instellen~~ (gedaan).
- ~~Beker~~ (gedaan: De Gouden Bierpul).
- ~~Online scorebord~~ (gedaan: managerpunten en prijzen).
- ~~Wissels en tactiek in de rust~~ (gedaan, met pijntjes).
- ~~Spelers met een eigenschap~~ (gedaan: 7 eigenschappen).
- ~~Topscorerslijst~~ (gedaan: Gouden Frikandel).
- ~~Concept-label weg~~ (gedaan, 8 nov).
- ~~Training~~ (gedaan: schema, extra training, uithouding, ontwikkeling).
- Jeugdspelers uit de eigen jeugd.
- ~~Spelersprofiel met opgebouwd poppetje~~ (gedaan).
- Idee: de opgebouwde poppetjes ook groot bij de opstelling (veld met de 11) of in de wedstrijd.
- ~~Managers kiezen met portret~~ (gedaan).

## Opdracht 7 – De beker (plaatjes) – KLAAR (`beker.jpg`)
> Maak een vel met 4 liggende plaatjes in een raster van 2 naast elkaar en 2 onder elkaar, elk precies even groot, met een dunne
> witte rand eromheen en ruimte ertussen, in precies dezelfde stijl als de vorige vellen (die stuur ik mee). Het gaat om een grappige
> amateurvoetbalbeker waarvan de prijs een enorme gouden bierpul is (een bierpul met twee oren, op een houten voetstuk). De spelers
> dragen dezelfde oranje shirts met een zwarte streep.
> 1. (linksboven) De beker zelf: de glimmende gouden bierpul op een fluwelen kussentje in een vitrinekast in de kantine, met lichtstralen
>    en glinsteringen eromheen, een paar bewonderende gezichten tegen het glas gedrukt.
> 2. (rechtsboven) De loting: een plechtige voorzitter met een strikje haalt een balletje uit een grote glazen bierpul vol balletjes,
>    naast hem een zenuwachtige trainer met zijn handen gevouwen; een fotograaf met flitser.
> 3. (linksonder) Strafschoppen: een keeper in een geel shirt duikt spectaculair naar een hoek, de bal vliegt net langs zijn vingers,
>    op de achtergrond spelers met de armen om elkaar heen op de middenlijn, nagelbijtend.
> 4. (rechtsonder) Het bekerfeest: de spelers tillen de gouden bierpul hoog op in de kleedkamer, schuim spat eruit, confetti, de
>    trainer wordt op de schouders gedragen.
> Geen tekst, geen letters, geen cijfers, geen logo's of merknamen in het plaatje.

*Gebruik:* 0 trofee in de erelijst en bij de finale, 1 loting bij de bekermelding in het kantoor, 2 strafschoppen na een wedstrijd met
strafschoppen, 3 feest bij BEKERWINNAAR.

## Opdracht 8 – Uitspraken van de managers voor de beker (tekst, geen plaatje) – KLAAR (`BEKERPRAAT`; STRAF zelf bedacht, Gemini gaf ze niet)
> Ik maak een voetbalmanagerspelletje voor mijn gezin (tieners, Nederlands, vrolijk, mag een beetje stout met knipogen naar bier en
> kater, maar niet grof). Er zijn vier trainers:
> 1. Harrie de Snor: gezette vijftiger, grote snor, fout paars trainingspak, houdt van frikandellen en de kantine.
> 2. Coach Mieke: strenge maar eerlijke veertiger met klembord en fluitje, alles volgens schema.
> 3. DJ Jordy: jonge gast van 25, pet achterstevoren, praat in jongerentaal (bro, sheesh, W, L, cringe), altijd muziek.
> 4. Opa Bertus: mopperige 65-plusser met regenjas en hoedje, vergelijkt alles met vroeger.
> De beker heet "De Gouden Bierpul". Verzin per trainer korte uitspraken (maximaal 15 woorden) voor deze situaties:
> - DOOR: we zijn door naar de volgende bekerronde (5 per trainer)
> - ERUIT: we zijn uitgeschakeld in de beker (5 per trainer)
> - STRAF: we wonnen na strafschoppen (3 per trainer)
> - FINALE: we hebben de beker gewonnen! (3 per trainer)
> Geef het precies in deze vorm, één uitspraak per regel, zonder nummering:
> HARRIE DOOR: …
> HARRIE ERUIT: …
> (enzovoort voor MIEKE, JORDY en BERTUS)

## Opdracht 9 – Nieuwsplaatjes, vel 4 – KLAAR (vakjes 12-15 in `nieuws.jpg`)
> Maak een vel met 4 liggende plaatjes in een raster van 2 naast elkaar en 2 onder elkaar, elk precies even groot, met een dunne
> witte rand eromheen en ruimte ertussen, in precies dezelfde stijl als de vorige vellen (die stuur ik mee). Elk plaatje is een klein
> grappig krantenplaatje over een amateurvoetbalclub. De spelers dragen dezelfde oranje shirts met een zwarte streep.
> 1. (linksboven) Een nieuwe speler zet trots zijn handtekening onder een contract op de bar van de kantine, de voorzitter met
>    strikje schudt hem enthousiast de hand, iemand houdt een oranje shirt omhoog, flitslicht van een fotograaf.
> 2. (rechtsboven) Afscheid: een oudere voetballer met grijze slapen en een buikje staat in zijn oude clubshirt achter de bar en tapt
>    een biertje, met een ontroerde traan; aan de muur hangt zijn ingelijste shirt, teamgenoten applaudisseren.
> 3. (linksonder) Een voetballer houdt met een pijnlijk gezicht de achterkant van zijn bovenbeen vast op het veld, een oude
>    verzorger rent erheen met een tasje, een spons en een spuitbus koelspray.
> 4. (rechtsonder) De topscorer van de club staat op een krat bier als podium en houdt een gouden trofee in de vorm van een
>    frikandel omhoog, confetti, teamgenoten juichen.
> Geen tekst, geen letters, geen cijfers, geen logo's of merknamen in het plaatje.

*Gebruik:* bij de berichten ✍️ (nieuwe speler getekend), 👋 (speler stopt of is verkocht), 🤕 (doorgespeeld met een pijntje) en 🌭
(clubtopscorer) — vakjes 12-15 in `nieuws.jpg`.

## Opdracht 10 – Hoofden van speelsters (twee keer) – KLAAR (`hoofden-v.webp`)
> Maak een vel met 18 hoofden van voetbalsters (alleen hoofd en hals, recht van voren, kijkt naar de kijker) in een net raster van
> 6 naast elkaar en 3 rijen onder elkaar. Alle hoofden even groot en op dezelfde hoogte, met ruimte ertussen, niets overlapt. Effen
> felgroene achtergrond (#00FF00), geen schaduwen, geen kleding. Precies dezelfde tekenstijl als het voorbeeldvel met mannenhoofden dat
> ik meestuur. Maak ze allemaal heel verschillend: jong en wat ouder (18 tot 35), verschillende huidskleuren, kapsels (paardenstaart,
> vlechten, knotje, kort koppie, krullen, afro met haarband, gekleurde lokken, opgeschoren zijkant), sommigen met sproeten, een
> haarband, een pleister of oorknopjes, en verschillende uitdrukkingen (stoer, lachend, vastberaden, verbaasd, chagrijnig). Grappig
> maar niet gemeen. Geen tekst.
> (Tweede vel: "achttien heel andere voetbalsters dan op het vorige vel".)

*Inbouwen:* zelfde knipwerk als de mannen (`hoofden-v.webp`, 36 vakjes), huidskleuren meten, `kopNr` naar het eigen vel laten wijzen.
Later eventueel nieuwsplaatjes met speelsters (kater, bos, rode kaart, blessure, tekenen, afscheid, topscorer).
