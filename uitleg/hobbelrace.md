# Hobbelrace (`hobbelrace.html`, concept)

Eigen spel in het genre van Hill Climb Racing (wens van Marcel), met eigen naam, auto en uiterlijk: een geel open
autootje met een bestuurder met rode helm, door de Hollandse polder met molentjes.

## Spelen
- Gas rechts, rem links (halve scherm aantikken, meerdere vingers tegelijk mag; of pijltjes / A en D).
- In de lucht kantel je met gas (neus omhoog) en rem (neus omlaag). Veel gas geven op de grond maakt een wheelie.
- Hoofd raakt de grond = af ("Au! Op je kop in de klei."). Benzine op en stil (of 4 s niet verder) = af.
- Benzineblikken ⛽ vullen de tank; munten 🪙 (5, vanaf 600 m 10, vanaf 1500 m 25).
- Afstandsbordjes om de 50 m en een rood vlaggetje bij je record.
- Garage: motor, banden (grip), vering, benzinetank, elk 10 niveaus; prijs `120*(niveau+1)^1.65`.
- Opslag per speler: `hobbel_munten:<naam>`, `hobbel_record:<naam>`, `hobbel_upg:<naam>`; geluid `hobbel_geluid`.
- Terugknop: tijdens het rijden of in de garage eerst naar het menu, vanuit het menu naar de startpagina.

## Techniek
- Eigen natuurkunde in meters (y omhoog), 240 stapjes per seconde (`stap`): carrosserie als vast lichaam, twee wielen
  aan veren zonder rustlengte (`k`, `c`), wielen botsen met de grond (lijnstukjes van 0,5 m) met grip (`grip`),
  motorkoppel op beide wielen (4x4) met tegenkoppel op de carrosserie (wheelie), carrosseriepunten (`AUTO.vorm`)
  botsen ook. Een wiel telt als "raakt de grond" met 3 cm speling (anders flikkert het contact).
- De weg (`hoogteBij`) is vaste ruis met een zaadje: elke rit dezelfde weg, zodat je hem kunt leren. Eerst 12 m vlak,
  daarna steeds hogere bulten.
- `window.__test = { G, update, stap, knop, start, AUTO, hoogte, upg }`.
- Getest met een simpele computer-bestuurder: zonder upgrades ongeveer 640 m (benzine op), met alles op 5 en slim
  rijden ruim 2 km. Altijd vol gas met een sterke motor = snel op je kop.

## Ideeën voor later
- Familiescorebord (verste afstand), zoals Pixelpikkers en Fladderfeest.
- Meer auto's (tractor, bakfiets, monstertruck) en meer werelden (strand, sneeuw, maan).
