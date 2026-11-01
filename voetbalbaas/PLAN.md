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

## Opdracht 2 – De managers (portretten, blij en boos)
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

## Opdracht 5 – Nieuwsplaatjes, vel 3
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

## Opdracht 6 – De velden per divisie
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
- ~~Kaartjesprijs zelf instellen~~ (gedaan).
- Beker naast de competitie (knock-out, tussendoor, extra geld).
- Online scorebord: hoogste divisie en aantal titels per speler.
- Training kiezen (conditie of kracht), jeugdspelers uit de eigen jeugd.
- Managers kiezen met portret (na Gemini-opdracht 2).
