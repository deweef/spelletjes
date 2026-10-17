// Koekjesschuiver 3D: dezelfde spelregels als koekjesschuiver.html, maar met echte 3D-natuurkunde (cannon-es),
// zodat koekjes op elkaar stapelen. Minder, grotere koekjes dan in 2D: rustiger en elk koekje telt meer.
// Eenheden: 1 = een flinke koekjesbreedte/2. De tafel loopt van x = -HB tot HB, de voorrand ligt op z = VOOR.

import * as THREE from 'three';
import * as CANNON from 'cannon';

const $ = (id) => document.getElementById(id);
// smal en lang (zoals een echte kast): de zijkanten zijn vanaf ZIJ_EIND open, daar vallen koekjes weg
const HB = 2.4, VOOR = 3.2, ZIJ_EIND = 1.3, KR = 0.45, KH = 0.13;
const MUUR_VOOR = -2.3; // voorkant van de vaste achterwand boven de schuif
const BAK = { y: -1.1, diep: 1.3 }; // opvangbak voor de gewonnen koekjes
const SCHUIF = { midden: -2.75, slag: 1.2, w: 1.6, half: 2, hoog: 0.7 }; // schuif heen en weer
const VAL_Z = -1.85, VAL_Y = 1.25; // waar een koekje wordt losgelaten

// ---------- koekjes, traktaties en figuren (zelfde codes als in 2D) ----------
// codes: 0 gewoon, 1 roze, 2 chocolade, 3 goud, 10+k traktatie k, 20+k koekjesfiguur k
const TREATS = [
  { n: 'Cupcake', p: 'Muurtjes', d: '30 sec. niets van de zijkant' },
  { n: 'Taartpunt', p: 'Koekjesregen', d: '12 gratis koekjes' },
  { n: 'Zwart-wit', p: 'Schudden', d: 'alles schuift naar voren' },
  { n: 'Macaron', p: 'Goudkoorts', d: '8 gouden koekjes' },
  { n: 'Petit four', p: 'Bakplaat', d: '+20 koekjes' }];
const KAR = [
  { n: 'Lange vinger', roep: 'Lange vinger!' }, { n: 'Kaakje', roep: 'Kaakje!' }, { n: 'Likkoekje', roep: 'Likkie-likkie!', spring: 1 },
  { n: 'Stroopwafel', roep: 'Stroopwafel!' }, { n: 'Speculaasje', roep: 'Speculaasje!' }, { n: 'Bitterkoekje', roep: 'Bitterkoekje!' },
  { n: 'Krakeling', roep: 'Krakeling!' }, { n: 'Gevulde koek', roep: 'Gevulde koek!' }];
const BADGES = [
  ...KAR.map((k, i) => ({ id: 'kar' + i, n: k.n, d: 'Vind de ' + k.n.toLowerCase() })),
  { id: 'eerste', n: 'Eerste hapje', d: 'Win je eerste koekje' },
  { id: 'honderd', n: 'Koekjesmonster', d: 'Win 100 koekjes' },
  { id: 'vijfhonderd', n: 'Bakkersbaas', d: 'Win 500 koekjes' },
  { id: 'goud', n: 'Goudzoeker', d: 'Win 5 gouden koekjes' },
  { id: 'set', n: 'Gebakjes-chef', d: 'Verzamel 3 dezelfde gebakjes' },
  { id: 'krachten', n: 'Taartenkoning', d: 'Gebruik alle 5 de krachten' },
  { id: 'meester', n: 'Koekie-meester', d: 'Vind alle 8 koekjesfiguren' }];
// tafel-items (code 100+i): vallen alleen op hun eigen tafel, niet in een wedstrijd; winnen geeft een effect en tafelbadges
// (eerste keer, en 5 keer). maak() geeft het 3D-model, doe() het effect, weg = tekstje als hij over de zijkant valt.
const ITEMS = [
  { id: 'pompoen', thema: 'halloween', n: 'Pompoen', r: 0.42, h: 0.5, grap: 'Boe! Vleermuizen jagen de koekjes naar voren!', weg: 'De pompoen rolt de nacht in…', maak: () => maakPompoen(), doe: () => vleermuizen() },
  { id: 'kwal', thema: 'strand', n: 'Kwal', b1: 'Gekwald', b5: 'Kwallenkoning', r: 0.38, h: 0.42, grap: 'Au! Wie legt hier nou een kwal neer? Alles is glibberig!', weg: 'De kwal glibbert terug de zee in', maak: () => maakKwal(), doe: () => glibber(15) },
  { id: 'flamingo', thema: 'strand', n: 'Roze flamingo', r: 0.34, h: 0.8, grap: 'Staat ze nou op één poot… of is ze gewoon moe? De volgende 10 koekjes zijn roze: 3 punten!', weg: 'De flamingo fladdert weg op één poot', maak: () => maakFlamingo(), doe: () => { rozeQ += 10; } },
  { id: 'parasol', thema: 'strand', n: 'Parasol', r: 0.45, h: 0.55, grap: 'Effe chillen in de schaduw: 20 seconden valt er niets van de zijkant.', weg: 'De parasol waait weg. Typisch Nederlands strandweer.', maak: () => maakParasol(), doe: () => { wallT = Math.max(wallT, 20); zetMuurtjes(true); } },
  { id: 'krab', thema: 'strand', n: 'Krab', r: 0.36, h: 0.26, grap: 'Knip knip! Opzij, opzij, opzij!', weg: 'De krab loopt zijwaarts weg. Hoe anders?', maak: () => maakKrab(), doe: () => krabWandeling() },
  { id: 'suikerspin', thema: 'kermis', n: 'Suikerspin', b5: 'Plakvingers', r: 0.34, h: 0.7, grap: 'Plakkerige vingers gegarandeerd! Het regent roze koekjes.', weg: 'De suikerspin is opgegeten. Door de vloer.', maak: () => maakSuikerspin(), doe: () => { for (let i = 0; i < 10; i++) setTimeout(() => laatVallen((Math.random() - 0.5) * (HB * 2 - 1.2), true, 1), i * 110); } },
  { id: 'eend', thema: 'kermis', n: 'Badeendje', b5: 'Eendjesvisser', r: 0.3, h: 0.42, grap: 'Kwak! Bij het eendjesvissen wint iedereen wat.', weg: 'Kwak… het eendje zwemt weg', maak: () => maakEend(), doe: () => eendPrijs() },
  { id: 'pijl', thema: 'kermis', n: 'Dartpijl', b5: 'Scherpschutter', r: 0.32, h: 0.14, grap: 'Pang! Ballon kapot, alle koekjes springen op!', weg: 'Mis! De pijl vliegt de kraam uit', maak: () => maakPijl(), doe: () => { for (const c of koekjes) if (c.body.position.y > -0.3) { c.body.wakeUp(); c.body.velocity.y += 3 + Math.random() * 2; c.body.velocity.z += 0.8 + Math.random(); } snd(120, 0.15, 'square', 0.08, 60); ruisKnal(); } },
  { id: 'bier', thema: 'kermis', n: 'Biertje', b1: 'Proost!', b5: 'Vaste klant', r: 0.24, h: 0.5, grap: 'Hik! Staat die tafel nou scheef? 10 seconden dubbele punten!', weg: 'Zonde van het bier…', maak: () => maakBier(), doe: () => { wiebelT = 10; } },
  { id: 'pknuffel', thema: 'kermis', n: 'P-knuffel', b1: 'Hoofdprijs!', b5: 'Knuffelkoning', r: 0.34, h: 0.62, grap: 'Hij is zacht, hij is roze en iedereen wil hem hebben! Boing boing!', weg: 'Nee! De P-knuffel! Iemand anders heeft hem nu…', maak: () => maakPKnuffel(), doe: () => knuffelSprong() },
  { id: 'diamant', thema: 'schatkamer', n: 'Diamant', b1: 'Diamantjager', b5: 'Diamanten voor altijd', r: 0.3, h: 0.42, grap: 'Een echte diamant! 100 punten en 25 munten. Niet doorvertellen aan de buren.', weg: 'Nee! De diamant valt tussen de planken. Weg is weg.', maak: () => maakDiamant(), doe: () => { score += 75; verdien(20, innerWidth / 2, innerHeight * 0.3); flonker(); } },
  { id: 'ring', thema: 'schatkamer', n: 'Zilveren ring', b5: 'Ringendrager', r: 0.3, h: 0.14, grap: 'Wil je met me trouwen? Ja? Dan krijg je 8 gouden koekjes!', weg: 'De ring rolt weg. Die verloving gaat dus niet door.', maak: () => maakRing(), doe: () => { goldQ += 8; } },
  { id: 'ketting', thema: 'schatkamer', n: 'Parelketting', b5: 'Parelduiker', r: 0.4, h: 0.12, grap: 'Oeps, het touwtje knapt! Overal parels: 4 punten per stuk.', weg: 'De parelketting glijdt van de tafel. Oma wordt boos.', maak: () => maakKetting(), doe: () => { for (let i = 0; i < 10; i++) setTimeout(() => laatVallen((Math.random() - 0.5) * (HB * 2 - 1.2), true, 6), i * 90); } },
  { id: 'armband', thema: 'schatkamer', n: 'Gouden armband', b5: 'Bling bling', r: 0.34, h: 0.14, grap: 'Bling bling! Een reuzenarmband rolt over de tafel.', weg: 'De armband rolt de kamer uit. Bling… blong.', maak: () => maakArmband(), doe: () => armbandRol() },
  { id: 'goudklomp', thema: 'schatkamer', n: 'Klomp goud', b1: 'Goudzoeker', b5: 'Goudkoorts', r: 0.34, h: 0.3, grap: 'Een klomp goud! Je bent rijk! Nou ja… 30 munten rijk.', weg: 'De klomp goud ploft van de tafel. Te zwaar om op te rapen.', maak: () => maakGoudklomp(), doe: () => verdien(25, innerWidth / 2, innerHeight * 0.3) },
  { id: 'sneeuwpop', thema: 'winter', n: 'Sneeuwpop', b5: 'Sneeuwpoppenbouwer', r: 0.3, h: 0.72, grap: 'Brrr! De zijkanten zijn bevroren: 20 seconden valt er niets af.', weg: 'De sneeuwpop smelt van de tafel. Zonde van de wortel.', maak: () => maakSneeuwpop(), doe: () => { wallT = Math.max(wallT, 20); zetMuurtjes(true); vries(20); } },
  { id: 'cadeau', thema: 'winter', n: 'Cadeautje', b5: 'Cadeautjesjager', r: 0.3, h: 0.4, grap: 'Een cadeautje! Even uitpakken…', weg: 'Het cadeautje valt van de tafel. Retour afzender.', maak: () => maakCadeau(), doe: () => cadeauUitpakken() },
  { id: 'rendier', thema: 'winter', n: 'Rendier', b5: 'Arrensleeër', r: 0.34, h: 0.5, grap: 'Nee, niet die met de rode neus. Dat is zijn neef. Hij trekt wel een slee!', weg: 'Het rendier galoppeert terug naar het noorden.', maak: () => maakRendier(), doe: () => sleeRit() },
  { id: 'kerstbal', thema: 'winter', n: 'Kerstbal', b5: 'Kerstboomversierder', r: 0.26, h: 0.42, grap: 'Glinster! Het regent kerstkoekjes: 5 punten per stuk.', weg: 'Pats! Kerstbal kapot. Wie ruimt dit op?', maak: () => maakKerstbal(), doe: () => { flonker(); for (let i = 0; i < 8; i++) setTimeout(() => laatVallen((Math.random() - 0.5) * (HB * 2 - 1.2), true, 7), i * 100); } },
  { id: 'taart', thema: 'bakkerij', n: 'Taart', b1: 'Jarig!', b5: 'Taartenbakker', r: 0.4, h: 0.42, grap: 'Lang zal ze leven! Kaarsjes uitblazen: 25 punten extra.', weg: 'De taart valt op de grond. Vijf-secondenregel!', maak: () => maakTaart(), doe: () => { score += 25; [392, 392, 440, 392, 523, 494].forEach((f, i) => snd(f, 0.28, 'triangle', 0.05, 0, i * 0.3)); tekenHud(); } },
  { id: 'deegroller', thema: 'bakkerij', n: 'Deegroller', b5: 'Deegrolkampioen', r: 0.4, h: 0.16, grap: 'Platwalsen maar! Een reuzendeegroller duwt alles naar voren.', weg: 'De deegroller rolt van de tafel. Bonk.', maak: () => maakDeegroller(), doe: () => rolOver(maakDeegroller(), 2.4) },
  { id: 'muis', thema: 'bakkerij', n: 'Muisje', b1: 'Piep!', b5: 'Muizenvanger', r: 0.26, h: 0.24, grap: 'Piep! Lekker! Het muisje pikt 3 koekjes… maar laat 10 munten achter als bedankje.', weg: 'Het muisje rent weg. Snel, zet een val!', maak: () => maakMuis(), doe: () => muisRoof() },
  { id: 'ufo', thema: 'ruimte', n: 'Ufo', b1: 'Ontvoerd!', b5: 'Ufoloog', r: 0.38, h: 0.24, grap: 'Bliep bloep! De ufo straalt 3 koekjes op… en zet ze in jouw bak.', weg: 'De ufo zoeft weg naar een andere melkweg.', maak: () => maakUfo(), doe: () => ufoStraal() },
  { id: 'meteoriet', thema: 'ruimte', n: 'Meteoriet', b5: 'Sterrenkijker', r: 0.32, h: 0.34, grap: 'BOEM! Een meteorietinslag! De koekjes vliegen alle kanten op.', weg: 'De meteoriet ploft in de opvangbak van de buren.', maak: () => maakMeteoriet(), doe: () => inslag() },
  { id: 'alien', thema: 'ruimte', n: 'Alien', b1: 'Hallo aardbewoner', b5: 'Buitenaards', r: 0.3, h: 0.5, grap: 'Neem mij mee naar jullie leider… of naar de koekjestrommel. 12 seconden bijna geen zwaartekracht!', weg: 'De alien beamt zichzelf terug naar huis.', maak: () => maakAlien(), doe: () => { laagT = 12; world.gravity.set(0, -6, 0); for (const c of koekjes) c.body.wakeUp(); snd(300, 1.2, 'sine', 0.04, 900); } },
  { id: 'drakenei', thema: 'draak', n: 'Drakenei', b5: 'Drakenfluisteraar', r: 0.26, h: 0.42, grap: 'Krak! Een babydraakje! Het spuugt 6 gouden koekjes.', weg: 'Het drakenei rolt de lava in. Gebakken ei.', maak: () => maakDrakenei(), doe: () => babyDraak() },
  { id: 'draakje', thema: 'draak', n: 'Draak', b1: 'Drakentemmer', b5: 'Drakenkoning', r: 0.36, h: 0.45, grap: 'De grote draak spuwt vuur… en alle koekjes op de tafel worden goud!', weg: 'De draak vliegt boos weg. Oeps.', maak: () => maakDraakje(), doe: () => drakenvuur() },
  { id: 'schatkist', thema: 'draak', n: 'Schatkist', b5: 'Schatgraver', r: 0.36, h: 0.4, grap: 'De schatkist springt open: 50 munten!', weg: 'De schatkist zakt weg in de lava. Nooit meer gezien.', maak: () => maakSchatkist(), doe: () => { verdien(45, innerWidth / 2, innerHeight * 0.3); flonker(); } },
  { id: 'kristal', thema: 'draak', n: 'Toverkristal', b5: 'Tovenaar', r: 0.24, h: 0.5, grap: 'Het kristal gloeit: 20 seconden driedubbele punten!', weg: 'Het kristal valt in duizend stukjes. Ongeluk? Nee, gewoon pech.', maak: () => maakKristal(), doe: () => { driesT = 20; snd(880, 0.8, 'sine', 0.04, 1760); } },
  { id: 'gummibeer', thema: 'snoep', n: 'Gummibeer', b5: 'Gummibeerbaas', r: 0.26, h: 0.42, grap: 'Boing! Een reuzengummibeer stuitert over de tafel.', weg: 'De gummibeer stuitert de kamer uit.', maak: () => maakGummibeer(), doe: () => stuiter(maakGummibeer(), 3) },
  { id: 'fontein', thema: 'snoep', n: 'Chocoladefontein', b5: 'Chocoholic', r: 0.3, h: 0.5, grap: 'Een chocoladefontein! Het regent chocoladekoekjes.', weg: 'Chocola over de vloer. Wie gaat dat oplikken?', maak: () => maakFontein(), doe: () => { for (let i = 0; i < 14; i++) setTimeout(() => laatVallen((Math.random() - 0.5) * (HB * 2 - 1.2), true, 2), i * 90); } },
  { id: 'lolly', thema: 'snoep', n: 'Lolly', b5: 'Hypnotiseur', r: 0.34, h: 0.14, grap: 'Kijk diep in de lolly… je wordt heel slaperig… en alle koekjes draaien rond!', weg: 'De lolly rolt weg. Plakkerig.', maak: () => maakLolly(), doe: () => draaikolk() },
  { id: 'zuurstok', thema: 'snoep', n: 'Zuurstok', b5: 'Zuurstokzwaaier', r: 0.36, h: 0.14, grap: 'Zoef! Een reuzenzuurstok veegt de voorkant leeg.', weg: 'Krak. Zuurstok gebroken.', maak: () => maakZuurstok(), doe: () => zuurstokVeeg() },
  { id: 'trex', thema: 'dino', n: 'T-rex', b1: 'ROAR!', b5: 'Dinotemmer', r: 0.3, h: 0.5, grap: 'ROOOAR! De T-rex stampt en de hele tafel trilt!', weg: 'De T-rex valt om. Te korte armpjes om zich vast te houden.', maak: () => maakTrex(), doe: () => aardbeving() },
  { id: 'dinoei', thema: 'dino', n: 'Dino-ei', b5: 'Eierbroeder', r: 0.24, h: 0.4, grap: 'Krak! Een babydino: "Mama?" Hij waggelt over de tafel.', weg: 'Het dino-ei rolt weg. Omelet!', maak: () => maakDinoEi(), doe: () => babyDino() },
  { id: 'vulkaan', thema: 'dino', n: 'Vulkaan', b5: 'Vulkanoloog', r: 0.38, h: 0.38, grap: 'Uitbarsting! Er regenen koekjes uit de lucht.', weg: 'De vulkaan dooft uit. Pfff.', maak: () => maakVulkaan(), doe: () => uitbarsting() },
  { id: 'fossiel', thema: 'dino', n: 'Fossiel', b1: 'Botje!', b5: 'Paleontoloog', r: 0.34, h: 0.14, grap: 'Een echt fossiel! Het museum betaalt 40 munten.', weg: 'Het fossiel valt in stukken. Weer 65 miljoen jaar wachten.', maak: () => maakFossiel(), doe: () => verdien(40, innerWidth / 2, innerHeight * 0.3) },
  { id: 'octopus', thema: 'zee', n: 'Octopus', b5: 'Achtarmige vriend', r: 0.32, h: 0.4, grap: 'Acht armen, acht keer helpen: de octopus zet 5 koekjes in je bak.', weg: 'De octopus spuit inkt en is weg.', maak: () => maakOctopus(), doe: () => grijp(5, maakOctopus()) },
  { id: 'haai', thema: 'zee', n: 'Haai', b1: 'Tanden!', b5: 'Haaienfluisteraar', r: 0.36, h: 0.36, grap: 'Dun-dun… dun-dun… HAP! De haai eet 4 koekjes, maar laat een tand achter: 20 munten.', weg: 'De haai zwemt verder. Gelukkig.', maak: () => maakHaai(), doe: () => haaiHap() },
  { id: 'schelp', thema: 'zee', n: 'Schelp', b5: 'Parelvisser', r: 0.34, h: 0.24, grap: 'De schelp gaat open: parels! 4 punten per stuk.', weg: 'De schelp klapt dicht en zinkt.', maak: () => maakSchelp(), doe: () => { for (let i = 0; i < 10; i++) setTimeout(() => laatVallen((Math.random() - 0.5) * (HB * 2 - 1.2), true, 6), i * 90); } },
  { id: 'duikboot', thema: 'zee', n: 'Duikboot', b5: 'Kapitein', r: 0.32, h: 0.36, grap: 'Ping… ping… De sonar van de duikboot duwt alle koekjes naar voren!', weg: 'De duikboot duikt weg naar de diepte.', maak: () => maakDuikboot(), doe: () => sonar() },
  { id: 'spook', thema: 'halloween', n: 'Spookje', r: 0.36, h: 0.62, grap: 'Boehoe… ik bedoel: snoep!', weg: 'Het spookje zweeft er stiekem vandoor', maak: () => maakSpook(), doe: () => spookVlucht() },
];
const ITEM_KANS = 1 / 25, ITEM_KANS_DRAAK = 1 / 12; // op de Drakenburcht vallen er vaker items
// aantal badges dat je nu kunt halen: de 15 gewone plus 2 per item van de tafels die je hebt
const badgeTotaal = () => BADGES.length + 2 * ITEMS.filter((it) => gekocht.includes(it.thema) || badges.includes('it_' + it.id)).length;
const badgeNaam = (it, vijf) => (vijf ? it.b5 || it.n + '-meester' : it.b1 || it.n);
const ALLE_BADGES = [...BADGES, ...ITEMS.flatMap((it) => [{ id: 'it_' + it.id, n: badgeNaam(it) }, { id: 'it5_' + it.id, n: badgeNaam(it, true) }])];
const item = (c) => ITEMS[c - 100];
const straal = (c) => (c >= 100 ? item(c).r : c < 10 ? KR : c < 20 ? 0.5 : 0.52);
const dikte = (c) => (c >= 100 ? item(c).h : c < 10 ? KH : c == 13 ? 0.24 : c < 20 ? 0.2 : 0.16);

// ---------- geluid ----------
let ac = null;
function unlock() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state != 'running') ac.resume(); } catch (e) {} stemWakker(); }
// spraak: telefoons laten pas praten als de stem een keer tijdens een tik is 'gewekt' (stil zinnetje), en Nederlandse stemmen laden later
let stemOk = false, nlStem = null;
function zoekStem() { try { nlStem = speechSynthesis.getVoices().find((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith('nl')) || nlStem; } catch (e) {} }
try { zoekStem(); speechSynthesis.addEventListener('voiceschanged', zoekStem); } catch (e) {}
function stemWakker() { if (stemOk) return; try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); stemOk = true; zoekStem(); } catch (e) {} }
['pointerdown', 'keydown'].forEach((t) => document.addEventListener(t, unlock, { passive: true }));
function snd(f, d, type = 'sine', v = 0.08, slide = 0, delay = 0) {
  if (!ac) return;
  try {
    const o = ac.createOscillator(), g = ac.createGain(), n = ac.currentTime + delay;
    o.type = type; o.frequency.setValueAtTime(f, n); if (slide) o.frequency.exponentialRampToValueAtTime(slide, n + d);
    g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(0.001, n + d); o.connect(g).connect(ac.destination); o.start(n); o.stop(n + d + 0.02);
  } catch (e) {}
}
const sWin = (g) => { snd(880, 0.12, 'triangle', 0.06); snd(1320, 0.18, 'triangle', 0.05, 0, 0.07); if (g) { snd(1760, 0.3, 'sine', 0.07, 0, 0.15); snd(2093, 0.4, 'sine', 0.06, 0, 0.25); } };
const sPrize = () => [784, 988, 1175, 1568].forEach((f, i) => snd(f, 0.25, 'triangle', 0.06, 0, i * 0.08));
const sPower = () => [523, 659, 784, 1047, 1319].forEach((f, i) => snd(f, 0.3, 'square', 0.035, 0, i * 0.06));
const sRoep = () => [392, 523, 392, 659, 784].forEach((f, i) => snd(f, 0.16, 'square', 0.04, 0, i * 0.11));
const sBadge = () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => snd(f, 0.2, 'triangle', 0.06, 0, i * 0.08));
const sTik = (v) => snd(500 + Math.random() * 300, 0.05, 'triangle', Math.min(0.05, v), 260);
function likkie() {
  setTimeout(() => [880, 1175, 880, 1175].forEach((f, i) => snd(f, 0.1, 'triangle', 0.05, 0, i * 0.09)), 300);
  try { const u = new SpeechSynthesisUtterance('Likkie-likkie!'); u.lang = 'nl-NL'; u.pitch = 1.9; u.rate = 1.15; u.volume = 1; zoekStem(); if (nlStem) u.voice = nlStem; if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel(); speechSynthesis.resume(); setTimeout(() => speechSynthesis.speak(u), 60); } catch (e) {}
}

// ---------- 3D-weergave ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('wereld').appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#4a1218');
scene.fog = new THREE.Fog('#4a1218', 18, 34);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
const v3 = new THREE.Vector3();
const TEGEL = location.hash == '#tegel'; // voor het plaatje op de startpagina
// camera zo dichtbij als kan, met de tafel tussen de bovenbalk en de krachtknoppen
function pasAan() {
  const w = innerWidth, h = innerHeight, asp = w / h;
  renderer.setSize(w, h); camera.aspect = asp; camera.updateProjectionMatrix();
  if (TEGEL) { camera.position.set(0, 9.5, 8.5); camera.lookAt(0, 0, 0.6); return; }
  const boven = ($('balk').getBoundingClientRect().bottom || 60) + 4, onder = h - ($('krachten').getBoundingClientRect().top || h - 70) + 4;
  const ymax = 1 - 2 * boven / h, ymin = -1 + 2 * onder / h, hoek = asp < 1 ? 1.12 : 0.9;
  const pt = [];
  for (const s of [-1, 1]) pt.push([s * (HB + 0.2), BAK.y + 0.2, VOOR + BAK.diep - 0.1], [s * (HB + 0.2), 2.2, MUUR_VOOR]);
  for (let d = 5; d < 45; d += 0.2) {
    let beste = null;
    for (let tz = -3; tz <= 3; tz += 0.1) {
      camera.position.set(0, d * Math.sin(hoek), tz + d * Math.cos(hoek)); camera.lookAt(0, 0, tz); camera.updateMatrixWorld();
      let x = 0, y1 = -9, y0 = 9;
      for (const [a, b, c] of pt) { v3.set(a, b, c).project(camera); x = Math.max(x, Math.abs(v3.x)); y1 = Math.max(y1, v3.y); y0 = Math.min(y0, v3.y); }
      if (x < 0.97 && y1 < ymax && y0 > ymin) { const mis = Math.abs((y1 + y0) - (ymax + ymin)); if (!beste || mis < beste.mis) beste = { mis, tz }; }
    }
    if (beste) { camera.position.set(0, d * Math.sin(hoek), beste.tz + d * Math.cos(hoek)); camera.lookAt(0, 0, beste.tz); return; }
  }
}
addEventListener('resize', () => { pasAan(); tekenLucht(); });
scene.add(new THREE.HemisphereLight('#fff4e0', '#5a1a20', 1.15));
const zon = new THREE.DirectionalLight('#ffffff', 1.6);
zon.position.set(4, 12, 7); zon.castShadow = true; zon.shadow.mapSize.set(2048, 2048);
Object.assign(zon.shadow.camera, { left: -6, right: 6, top: 7, bottom: -7, near: 1, far: 30 });
scene.add(zon);

function canvasTex(teken, w = 256, h = 256) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; teken(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const rnd = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
// bovenkant van een koekje, traktatie of figuur
function bovenTex(code) {
  return canvasTex((g, w) => {
    const r = rnd(7 + code * 13), c = w / 2;
    const rondje = (kl, rr = c * 0.96) => { g.fillStyle = kl; g.beginPath(); g.arc(c, c, rr, 0, 7); g.fill(); };
    const spikkels = (kl, n, s) => { g.fillStyle = kl; for (let i = 0; i < n; i++) { const a = r() * 7, d = r() * c * 0.78; g.beginPath(); g.ellipse(c + Math.cos(a) * d, c + Math.sin(a) * d, s * (0.7 + r() * 0.6), s * (0.5 + r() * 0.5), r() * 3, 0, 7); g.fill(); } };
    const zacht = (binnen, buiten) => { const gr = g.createRadialGradient(c, c, c * 0.55, c, c, c); gr.addColorStop(0, binnen); gr.addColorStop(1, buiten); rondje(gr, c); }; // gebakken rand, loopt zacht af
    if (code == 0) { zacht('#e8b469', '#c98a40'); spikkels('#4a2a14', 14, 12); }
    else if (code == 1) { zacht('#e8b469', '#c98a40'); rondje('#f6a3c0', c * 0.74); for (let i = 0; i < 26; i++) { g.fillStyle = ['#fff', '#7fd0f0', '#ffe14d', '#9ae07a'][i % 4]; const a = r() * 7, d = r() * c * 0.7; g.save(); g.translate(c + Math.cos(a) * d, c + Math.sin(a) * d); g.rotate(r() * 3); g.fillRect(-9, -3, 18, 6); g.restore(); } }
    else if (code == 2) { zacht('#6b4028', '#4e2c1a'); spikkels('#f4ead6', 13, 11); }
    else if (code == 4) { zacht('#ff9a3a', '#c8601a'); g.fillStyle = '#3a1a10'; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(c + sx * c * 0.42, c - c * 0.05); g.lineTo(c + sx * c * 0.15, c - c * 0.05); g.lineTo(c + sx * c * 0.28, c - c * 0.38); g.fill(); } g.beginPath(); g.moveTo(c - c * 0.5, c + c * 0.15); for (let i = 0; i <= 8; i++) g.lineTo(c - c * 0.5 + i * c * 0.125, c + c * (i % 2 ? 0.3 : 0.45)); g.lineTo(c + c * 0.5, c + c * 0.15); g.quadraticCurveTo(c, c + c * 0.3, c - c * 0.5, c + c * 0.15); g.fill(); spikkels('#9a4aff', 10, 5); }
    else if (code == 7) { zacht('#b06a30', '#7a4018'); g.strokeStyle = '#fff8ee'; g.lineWidth = 9; g.lineJoin = 'round'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? c * 0.28 : c * 0.62; g.lineTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr); } g.closePath(); g.stroke(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 0.4; g.fillStyle = ['#e8303a', '#3ac860', '#ffd84a'][i % 3]; g.beginPath(); g.arc(c + Math.cos(a) * c * 0.8, c + Math.sin(a) * c * 0.8, 9, 0, 7); g.fill(); } }
    else if (code == 6) { const gr = g.createRadialGradient(c * 0.7, c * 0.6, c * 0.05, c, c, c); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, '#f4eef8'); gr.addColorStop(0.8, '#e0d4ec'); gr.addColorStop(1, '#c8b8d8'); rondje(gr, c); g.globalAlpha = 0.25; for (const [k, a] of [['#ffb0e0', 0], ['#b0e8ff', 2], ['#d0ffb0', 4]]) { g.fillStyle = k; g.beginPath(); g.arc(c + Math.cos(a) * c * 0.35, c + Math.sin(a) * c * 0.35, c * 0.4, 0, 7); g.fill(); } g.globalAlpha = 1; }
    else if (code == 5) { zacht('#ff9ac8', '#e0609a'); g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3, d = c * 0.45, x = c + Math.cos(a) * d, y = c + Math.sin(a) * d; g.beginPath(); g.moveTo(x, y + 6); g.bezierCurveTo(x - 14, y - 6, x - 6, y - 16, x, y - 7); g.bezierCurveTo(x + 6, y - 16, x + 14, y - 6, x, y + 6); g.fill(); } rondje('#ff5a9a', c * 0.16); }
    else if (code == 3) { zacht('#ffd84a', '#d89a18'); g.fillStyle = '#fff4b0'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? c * 0.25 : c * 0.55; g.lineTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr); } g.fill(); }
    else if (code == 10) { rondje('#f2a0c0'); g.strokeStyle = '#ffd0e0'; g.lineWidth = 16; g.beginPath(); for (let a = 0; a < 18; a += 0.2) g.lineTo(c + Math.cos(a) * a * 6, c + Math.sin(a) * a * 6); g.stroke(); rondje('#e8203a', c * 0.2); }
    else if (code == 11) { rondje('#f6e7c8'); g.fillStyle = '#7a2a5a'; g.beginPath(); g.moveTo(c, c); g.arc(c, c, c * 0.9, -2.2, -0.9); g.fill(); spikkels('#fff', 8, 10); }
    else if (code == 12) { rondje('#f6f0e2'); g.fillStyle = '#2a1a12'; g.beginPath(); g.arc(c, c, c * 0.96, Math.PI / 2, Math.PI * 1.5); g.fill(); }
    else if (code == 13) { rondje('#8ad8c0'); rondje('#b8f0e0', c * 0.7); }
    else if (code == 14) { g.fillStyle = '#fbf3e6'; g.fillRect(0, 0, w, w); g.strokeStyle = '#e8b0c0'; g.lineWidth = 10; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, i * w / 4); g.lineTo(w, i * w / 4); g.stroke(); } rondje('#e8203a', c * 0.16); }
    else if (VORMEN[code]) { // vormkoekjes: het hele plaatje vullen (de vorm snijdt het uit)
      const k = code - 20, kl = (a, b2) => { const gr = g.createRadialGradient(c, c, c * 0.3, c, c, c * 1.3); gr.addColorStop(0, a); gr.addColorStop(1, b2); g.fillStyle = gr; g.fillRect(0, 0, w, w); };
      if (k == 0) { kl('#f0c890', '#c8904a'); spikkels('#fffaf0', 70, 3.5); spikkels('#f8e8c8', 40, 2.5); } // lange vinger met suiker
      if (k == 2) { kl('#c08848', '#8a5a2a'); g.fillStyle = '#a8703c'; g.fillRect(w * 0.07, w * 0.09, w * 0.86, w * 0.82); // café noir: glazuur
        const gl = g.createLinearGradient(0, 0, w, w); gl.addColorStop(0, 'rgba(255,240,220,.35)'); gl.addColorStop(0.4, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(w * 0.07, w * 0.09, w * 0.86, w * 0.82);
        g.fillStyle = 'rgba(90,50,20,.35)'; g.font = `bold ${w * 0.1}px Georgia`; g.textAlign = 'center'; g.fillText('Likkie', c, c + w * 0.04); }
      if (k == 4) { kl('#c07a3a', '#8a5020'); g.strokeStyle = '#6a3a12'; g.lineWidth = 7; g.lineCap = 'round'; // speculaas met molentje
        g.strokeRect(w * 0.12, w * 0.14, w * 0.76, w * 0.72); g.beginPath(); g.moveTo(c, c + 50); g.lineTo(c, c - 10); g.moveTo(c - 45, c - 50); g.lineTo(c + 45, c + 30); g.moveTo(c + 45, c - 50); g.lineTo(c - 45, c + 30); g.stroke();
        g.beginPath(); g.moveTo(c - 25, c + 70); g.lineTo(c - 15, c + 20); g.lineTo(c + 15, c + 20); g.lineTo(c + 25, c + 70); g.stroke(); }
      if (k == 6) { kl('#e8962a', '#b0601a'); spikkels('#fff4c8', 90, 5); spikkels('#ffd27a', 60, 4); } // krakeling met kristalsuiker
    }
    else { // koekjesfiguren
      const k = code - 20;
      rondje(['#e8c27a', '#e6c48a', '#4a2a18', '#c88a3e', '#b8743a', '#d8a868', '#d89a4a', '#d8a050'][k]);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.strokeStyle = 'rgba(90,40,10,.6)'; g.lineWidth = 8;
      if (k == 0) { g.fillStyle = '#f2dca0'; g.beginPath(); g.ellipse(c, c, c * 0.85, c * 0.32, 0, 0, 7); g.fill(); spikkels('#fff8e8', 30, 4); }
      if (k == 1) { g.fillStyle = '#f4e0b0'; g.fillRect(c * 0.35, c * 0.35, c * 1.3, c * 1.3); g.fillStyle = '#c8a060'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(c * (0.65 + i * 0.35), c * (0.65 + j * 0.35), 6, 0, 7); g.fill(); } }
      if (k == 2) { rondje('#5a3420', c * 0.82); g.fillStyle = '#ff8ab0'; g.beginPath(); g.moveTo(c, c * 1.4); g.bezierCurveTo(c * 0.3, c * 0.9, c * 0.6, c * 0.4, c, c * 0.8); g.bezierCurveTo(c * 1.4, c * 0.4, c * 1.7, c * 0.9, c, c * 1.4); g.fill(); }
      if (k == 3) { g.strokeStyle = '#a06a2a'; g.lineWidth = 7; for (let i = -6; i < 7; i++) { g.beginPath(); g.moveTo(c + i * 26 - 100, 0); g.lineTo(c + i * 26 + 100, w); g.stroke(); g.beginPath(); g.moveTo(c + i * 26 + 100, 0); g.lineTo(c + i * 26 - 100, w); g.stroke(); } }
      if (k == 4) { g.strokeStyle = '#7a4a1a'; g.lineWidth = 9; g.beginPath(); g.moveTo(c, c * 1.5); g.lineTo(c, c * 0.7); g.moveTo(c - 40, c * 0.6); g.lineTo(c + 40, c * 1.1); g.moveTo(c + 40, c * 0.6); g.lineTo(c - 40, c * 1.1); g.stroke(); }
      if (k == 5) { spikkels('#a8784a', 18, 14); rondje('#f4e8d0', c * 0.2); }
      if (k == 6) { g.strokeStyle = '#f2d090'; g.lineWidth = 22; g.beginPath(); g.ellipse(c - 34, c, 46, 60, -0.3, 0, 7); g.stroke(); g.beginPath(); g.ellipse(c + 34, c, 46, 60, 0.3, 0, 7); g.stroke(); spikkels('#fff', 20, 4); }
      if (k == 7) { rondje('#e8c070', c * 0.75); rondje('#f6f0e0', c * 0.22); }
    }
  });
}
const SIDE = { 7: '#7a4018', 6: '#d8cce4', 5: '#e0609a', 4: '#c8601a', 0: '#c8843a', 1: '#c8843a', 2: '#4a2a18', 3: '#d89a18', 10: '#f0e0d0', 11: '#e8d0a0', 12: '#cfc4b0', 13: '#f0e8d8', 14: '#fbf3e6' };
const koekMat = {};
function materialen(code) {
  if (!koekMat[code]) {
    const zij = new THREE.MeshStandardMaterial({ color: SIDE[code] || '#b87a3a', roughness: 0.75, metalness: code == 3 ? 0.4 : 0 });
    const boven = new THREE.MeshStandardMaterial({ map: bovenTex(code), roughness: 0.7, metalness: code == 3 ? 0.35 : 0 });
    koekMat[code] = [zij, boven, boven]; // ook onderop het plaatje: omgevallen koekjes zien er dan ook als koekje uit
  }
  return koekMat[code];
}
const geoCache = {};
// gewone koekjes en figuren hebben een bolle, aflopende rand (geen opstaand randje); het plaatje ligt er van boven op
function bolKoek(r, h) {
  const p = [[0, 1], [0.62, 1], [0.8, 0.9], [0.92, 0.68], [0.985, 0.36], [1, 0]];
  const pts = [...p, ...p.slice(0, -1).reverse().map(([a, b]) => [a, -b])].reverse().map(([a, b]) => new THREE.Vector2(a * r, b * h / 2));
  const g = new THREE.LatheGeometry(pts, 40), pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 + pos.getX(i) / (2 * r), 0.5 - pos.getZ(i) / (2 * r));
  return g;
}
// koekjesfiguren met een eigen vorm (bovenaanzicht, in eenheden; b x d = breedte x diepte voor de natuurkunde-doos)
const VORMEN = {
  20: { b: 1.15, d: 0.36, vorm: (p) => { const r = 0.18, l = 0.575 - r; p.moveTo(-l, -r); p.lineTo(l, -r); p.absarc(l, 0, r, -Math.PI / 2, Math.PI / 2); p.lineTo(-l, r); p.absarc(-l, 0, r, Math.PI / 2, Math.PI * 1.5); } }, // lange vinger
  22: { b: 0.98, d: 0.66, vorm: (p) => rondRecht(p, 0.49, 0.33, 0.07) }, // likkoekje (café noir)
  24: { b: 0.98, d: 0.62, vorm: (p) => rondRecht(p, 0.49, 0.31, 0.05) }, // speculaasje
  26: { b: 1.05, d: 0.78, vorm: (p) => { // krakeling: twee lussen bovenaan, smaller naar onderen, drie gaten
    p.moveTo(0, -0.39); p.bezierCurveTo(-0.2, -0.36, -0.5, -0.25, -0.52, 0.02); p.bezierCurveTo(-0.53, 0.3, -0.3, 0.42, -0.14, 0.36);
    p.bezierCurveTo(-0.06, 0.33, -0.02, 0.27, 0, 0.24); p.bezierCurveTo(0.02, 0.27, 0.06, 0.33, 0.14, 0.36); p.bezierCurveTo(0.3, 0.42, 0.53, 0.3, 0.52, 0.02); p.bezierCurveTo(0.5, -0.25, 0.2, -0.36, 0, -0.39);
    for (const [x, y, rx, ry] of [[-0.25, 0.06, 0.13, 0.11], [0.25, 0.06, 0.13, 0.11], [0, -0.19, 0.08, 0.07]]) { const h = new THREE.Path(); h.absellipse(x, y, rx, ry, 0, Math.PI * 2, true); p.holes.push(h); } } },
};
function rondRecht(p, w, d, r) { p.moveTo(-w + r, -d); p.lineTo(w - r, -d); p.quadraticCurveTo(w, -d, w, -d + r); p.lineTo(w, d - r); p.quadraticCurveTo(w, d, w - r, d); p.lineTo(-w + r, d); p.quadraticCurveTo(-w, d, -w, d - r); p.lineTo(-w, -d + r); p.quadraticCurveTo(-w, -d, -w + r, -d); }
function vormGeo(code) {
  const v = VORMEN[code], sh = new THREE.Shape(); v.vorm(sh);
  const h = dikte(code), g = new THREE.ExtrudeGeometry(sh, { depth: h * 0.5, bevelEnabled: true, bevelThickness: h * 0.25, bevelSize: 0.04, bevelSegments: 3, curveSegments: 24 });
  g.translate(0, 0, -h * 0.25); g.rotateX(-Math.PI / 2); // plat op tafel, bovenkant omhoog
  const pos = g.attributes.position, uv = g.attributes.uv; // plaatje van boven: van de vorm naar het hele canvas
  for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 + pos.getX(i) / (v.b + 0.08), 0.5 - pos.getZ(i) / (v.d + 0.08));
  g.computeVertexNormals(); return g;
}
const koekGeo = (code) => {
  if (VORMEN[code]) return geoCache['v' + code] || (geoCache['v' + code] = vormGeo(code));
  const bol = code < 10 || code >= 20, k = straal(code) + '_' + dikte(code) + (code == 11 ? 'd' : '') + (bol ? 'b' : '');
  return geoCache[k] || (geoCache[k] = bol ? bolKoek(straal(code), dikte(code) * 1.25) : new THREE.CylinderGeometry(straal(code), straal(code), dikte(code), code == 11 ? 3 : 32));
};

// ---------- achtergronden (te koop in de winkel) ----------
// lucht: achtergrond op het scherm; kast/donker: kleuren van de kast; bord: plaatje op de achterwand; sneeuw: vallende sneeuw
const sterren = (g, w, h, n, tot = 0.7) => { const r = rnd(5); for (let i = 0; i < n; i++) { g.fillStyle = `rgba(255,255,240,${0.4 + r() * 0.6})`; g.beginPath(); g.arc(r() * w, r() * h * tot, 0.6 + r() * 1.6, 0, 7); g.fill(); } };
const verloop = (g, w, h, kl) => { const gr = g.createLinearGradient(0, 0, 0, h); kl.forEach((k, i) => gr.addColorStop(i / (kl.length - 1), k)); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
const bol = (g, x, y, r, kl) => { g.fillStyle = kl; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
const THEMAS = [
  { id: 'bakkerij', n: 'Bakkerij', prijs: 0, kast: '#25a18e', donker: '#16594f', vloer: '#7a4a2a', mist: '#c9925e',
    lucht(g, w, h) { verloop(g, w, h, ['#f6dcb4', '#e2b483', '#c9925e']);
      const t = Math.max(w, h) / 14; g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2;
      for (let y = h * 0.3; y < h; y += t) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      for (let x = 0; x < w; x += t) { g.beginPath(); g.moveTo(x, h * 0.3); g.lineTo(x, h); g.stroke(); }
      for (const x of [0.2, 0.8]) { g.strokeStyle = '#3a2418'; g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h * 0.12); g.stroke(); bol(g, w * x, h * 0.15, w * 0.11, 'rgba(255,230,150,.25)'); g.fillStyle = '#2e5a4a'; g.beginPath(); g.arc(w * x, h * 0.15, w * 0.06, Math.PI, 0); g.fill(); bol(g, w * x, h * 0.15, w * 0.02, '#fff2b0'); } },
    bord(g, w, h) { verloop(g, w, h, ['#2fb8a2', '#16594f']);
      for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#fff4dc' : '#f27aa8'; g.beginPath(); g.moveTo(i * w / 12, 0); g.lineTo((i + 1) * w / 12, 0); g.lineTo((i + 1) * w / 12, h * 0.16); g.arc((i + 0.5) * w / 12, h * 0.16, w / 24, 0, Math.PI); g.fill(); }
      g.fillStyle = '#3a1a14'; g.beginPath(); g.moveTo(w * 0.22, h * 0.9); g.lineTo(w * 0.22, h * 0.5); g.arc(w / 2, h * 0.5, w * 0.28, Math.PI, 0); g.lineTo(w * 0.78, h * 0.9); g.fill();
      const gl = g.createRadialGradient(w / 2, h * 0.8, 10, w / 2, h * 0.8, w * 0.3); gl.addColorStop(0, '#ffcf5a'); gl.addColorStop(1, '#c8401a'); g.fillStyle = gl;
      g.beginPath(); g.moveTo(w * 0.28, h * 0.9); g.lineTo(w * 0.28, h * 0.55); g.arc(w / 2, h * 0.55, w * 0.22, Math.PI, 0); g.lineTo(w * 0.72, h * 0.9); g.fill();
      for (let i = 0; i < 3; i++) { bol(g, w * (0.37 + i * 0.13), h * 0.78, w * 0.055, '#c98a40'); bol(g, w * (0.37 + i * 0.13), h * 0.78, w * 0.04, '#e8b469'); }
      g.fillStyle = '#e8b830'; g.fillRect(w * 0.18, h * 0.9, w * 0.64, h * 0.06); } },
  { id: 'halloween', n: 'Halloween', prijs: 40, kast: '#e8731a', donker: '#2a1238', vloer: '#1a0f20', mist: '#2a1238', tafel: '#c4b0e8', lamp: '#ffa53a',
    lucht(g, w, h) { verloop(g, w, h, ['#0e0618', '#2a1238', '#4a1f3a']); sterren(g, w, h, 50, 0.5);
      const m = Math.min(w, h); bol(g, w * 0.72, h * 0.18, m * 0.13, '#fff1c0'); bol(g, w * 0.76, h * 0.16, m * 0.03, 'rgba(200,180,120,.5)');
      g.fillStyle = '#120818'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 12) g.lineTo(x, h * 0.7 + Math.sin(x / 55) * h * 0.03); g.lineTo(w, h); g.fill();
      const hx = w * 0.25, hy = h * 0.72; g.fillRect(hx - 40, hy - 60, 80, 60); g.beginPath(); g.moveTo(hx - 50, hy - 60); g.lineTo(hx, hy - 105); g.lineTo(hx + 50, hy - 60); g.fill(); g.fillRect(hx + 22, hy - 120, 10, 40); // spookhuis
      g.fillStyle = '#ffd24a'; g.fillRect(hx - 25, hy - 45, 12, 12); g.fillRect(hx + 13, hy - 45, 12, 12);
      const vleermuis = (x, y, s) => { g.fillStyle = '#05020a'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - s, y - s * 0.8, x - s * 2, y - s * 0.2); g.quadraticCurveTo(x - s * 1.2, y, x - s, y + s * 0.4); g.quadraticCurveTo(x - s * 0.5, y + s * 0.1, x, y + s * 0.5); g.quadraticCurveTo(x + s * 0.5, y + s * 0.1, x + s, y + s * 0.4); g.quadraticCurveTo(x + s * 1.2, y, x + s * 2, y - s * 0.2); g.quadraticCurveTo(x + s, y - s * 0.8, x, y); g.fill(); };
      vleermuis(w * 0.66, h * 0.17, 9); vleermuis(w * 0.45, h * 0.1, 7); vleermuis(w * 0.85, h * 0.3, 6);
      for (const [x, s] of [[0.62, 22], [0.8, 30], [0.92, 18]]) pompoen(g, w * x, h * 0.74 + s, s); },
    bord(g, w, h) { verloop(g, w, h, ['#3a1650', '#170a22']);
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; for (const [cx, sx] of [[0, 1], [w, -1]]) { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 10; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx + sx * Math.cos(a) * 150, Math.sin(a) * 150); g.stroke(); } for (let r = 30; r < 150; r += 30) { g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 10; g.lineTo(cx + sx * Math.cos(a) * r, Math.sin(a) * r); } g.stroke(); } }
      pompoen(g, w / 2, h * 0.58, h * 0.3, true); g.fillStyle = '#ff9a2a'; for (let i = 0; i < 14; i++) bol(g, (i + 0.5) * w / 14, h * 0.94, 8, i % 2 ? '#ff9a2a' : '#9a4aff'); } },
  { id: 'kermis', n: 'Kermis', prijs: 60, kast: '#6a2aa0', donker: '#2e1250', vloer: '#2a1440', mist: '#3a1a5a',
    lucht(g, w, h) { verloop(g, w, h, ['#140a30', '#3a1a5a', '#6a2a6a']); sterren(g, w, h, 70);
      const cx = w * 0.78, cy = h * 0.42, r = Math.min(w, h) * 0.3; g.strokeStyle = '#ffd6f0'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke(); bol(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 6, ['#ff5a8a', '#ffd84a', '#5ad8ff'][i % 3]); }
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - r * 0.5, h); g.moveTo(cx, cy); g.lineTo(cx + r * 0.5, h); g.stroke();
      for (let i = 0; i < 24; i++) bol(g, (i + 0.5) * w / 24, h * 0.06 + Math.sin(i * 0.8) * h * 0.02 + (i % 4) * 3, 4, ['#ff5a8a', '#ffd84a', '#5ad8ff', '#8aff7a'][i % 4]); },
    bord(g, w, h) { for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? '#fff4dc' : '#d82a4a'; g.beginPath(); g.moveTo(w / 2, -h * 0.1); g.lineTo(i * w / 9 - w * 0.05, h); g.lineTo((i + 1) * w / 9 - w * 0.05, h); g.fill(); }
      g.fillStyle = '#2e1250'; g.fillRect(0, h * 0.82, w, h * 0.18); for (let i = 0; i < 16; i++) bol(g, (i + 0.5) * w / 16, h * 0.9, 9, i % 2 ? '#ffd84a' : '#fff');
      bol(g, w / 2, h * 0.45, h * 0.2, '#ffd84a'); bol(g, w / 2, h * 0.45, h * 0.15, '#e8a820'); g.fillStyle = '#fff4b0'; g.font = `bold ${h * 0.18}px Georgia`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('★', w / 2, h * 0.46); } },
  { id: 'strand', n: 'Strand', prijs: 100, kast: '#1a9ab8', donker: '#0e5a70', vloer: '#e8cc90', mist: '#f2d9a0',
    lucht(g, w, h) { verloop(g, w, h, ['#5ab8f0', '#bfe6ff']); bol(g, w * 0.8, h * 0.16, Math.min(w, h) * 0.09, '#ffe46a');
      g.fillStyle = '#2a8ac8'; g.fillRect(0, h * 0.45, w, h * 0.2); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3;
      for (let y = h * 0.48; y < h * 0.64; y += h * 0.05) { g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, y + Math.sin(x / 18 + y) * 3); g.stroke(); }
      g.fillStyle = '#f2d9a0'; g.fillRect(0, h * 0.64, w, h);
      g.fillStyle = '#fff'; for (const [x, y] of [[0.2, 0.12], [0.45, 0.2]]) { bol(g, w * x, h * y, 18, '#fff'); bol(g, w * x + 20, h * y + 4, 14, '#fff'); bol(g, w * x - 18, h * y + 6, 12, '#fff'); } },
    bord(g, w, h) { for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#fff' : '#2a9ad0'; g.fillRect(i * w / 12, 0, w / 12 + 1, h); }
      bol(g, w / 2, h * 0.45, h * 0.28, '#ffe46a'); g.fillStyle = '#e8a020'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.arc(w / 2 + Math.cos(a) * h * 0.36, h * 0.45 + Math.sin(a) * h * 0.36, 8, 0, 7); g.fill(); }
      g.fillStyle = '#5a3a1a'; g.beginPath(); g.arc(w / 2 - 22, h * 0.4, 7, 0, 7); g.arc(w / 2 + 22, h * 0.4, 7, 0, 7); g.fill(); g.strokeStyle = '#5a3a1a'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h * 0.46, 30, 0.3, Math.PI - 0.3); g.stroke();
      g.fillStyle = '#2a8ac8'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 10) g.lineTo(x, h * 0.86 + Math.sin(x / 25) * 8); g.lineTo(w, h); g.fill(); } },
  { id: 'winter', n: 'Winternacht', prijs: 150, kast: '#1f7a3a', donker: '#0f4a22', vloer: '#e6eef6', mist: '#2a4a7a', sneeuw: true,
    lucht(g, w, h) { verloop(g, w, h, ['#08142e', '#1a3360', '#2a4a7a']); sterren(g, w, h, 80, 0.6); bol(g, w * 0.2, h * 0.14, Math.min(w, h) * 0.06, '#fff8dc');
      g.fillStyle = '#e6eef6'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 10) g.lineTo(x, h * 0.62 + Math.sin(x / 70) * h * 0.04); g.lineTo(w, h); g.fill();
      const r = rnd(11); for (let i = 0; i < 9; i++) { const x = r() * w, y = h * 0.62 + r() * h * 0.08, s = 24 + r() * 26; g.fillStyle = '#1a4a30'; g.beginPath(); g.moveTo(x, y - s * 2); g.lineTo(x - s * 0.7, y); g.lineTo(x + s * 0.7, y); g.fill(); bol(g, x, y - s * 2, 3, '#ffd84a'); } },
    bord(g, w, h) { verloop(g, w, h, ['#0b1c3e', '#24467a']); sterren(g, w, h, 40);
      g.fillStyle = '#e6eef6'; g.fillRect(0, h * 0.82, w, h * 0.18);
      const hx = w / 2, hy = h * 0.82; g.fillStyle = '#b8743a'; g.fillRect(hx - 90, hy - 110, 180, 110); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(hx - 110, hy - 105); g.lineTo(hx, hy - 190); g.lineTo(hx + 110, hy - 105); g.fill();
      g.fillStyle = '#d8323c'; g.beginPath(); g.moveTo(hx - 96, hy - 112); g.lineTo(hx, hy - 176); g.lineTo(hx + 96, hy - 112); g.fill();
      g.fillStyle = '#5a2a10'; g.fillRect(hx - 22, hy - 60, 44, 60); g.fillStyle = '#ffd84a'; g.fillRect(hx - 70, hy - 85, 30, 26); g.fillRect(hx + 40, hy - 85, 30, 26);
      for (const x of [0.12, 0.88]) { const tx = w * x; g.fillStyle = '#1a6a3a'; for (let j = 0; j < 3; j++) { g.beginPath(); g.moveTo(tx, hy - 200 + j * 45); g.lineTo(tx - 50 - j * 10, hy - 110 + j * 45); g.lineTo(tx + 50 + j * 10, hy - 110 + j * 45); g.fill(); } for (let j = 0; j < 7; j++) bol(g, tx - 40 + (j * 37) % 80, hy - 130 + j * 14, 6, ['#ffd84a', '#ff5a5a', '#fff'][j % 3]); } } },
  { id: 'ruimte', n: 'Ruimte', prijs: 250, kast: '#2a2a44', donker: '#15152a', vloer: '#120a24', mist: '#1a0b3a',
    lucht(g, w, h) { verloop(g, w, h, ['#03010c', '#120830', '#2a0f4a']); sterren(g, w, h, 160, 1);
      const px = w * 0.75, py = h * 0.3, r = Math.min(w, h) * 0.13; const gr = g.createRadialGradient(px - r * 0.4, py - r * 0.4, 2, px, py, r); gr.addColorStop(0, '#ffb07a'); gr.addColorStop(1, '#a03a6a'); bol(g, px, py, r, gr);
      g.strokeStyle = 'rgba(255,220,180,.7)'; g.lineWidth = 4; g.beginPath(); g.ellipse(px, py, r * 1.8, r * 0.45, -0.3, 0, 7); g.stroke(); bol(g, w * 0.2, h * 0.55, r * 0.3, '#7ad8ff'); },
    bord(g, w, h) { verloop(g, w, h, ['#1a0630', '#4a0f5a', '#ff4a8a']);
      for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#ffd84a' : '#ff8a4a'; g.fillRect(w * 0.3, h * 0.2 + i * h * 0.07, w * 0.4, h * 0.05); }
      g.strokeStyle = '#ff5ad8'; g.lineWidth = 3; for (let i = 0; i <= 12; i++) { g.beginPath(); g.moveTo(w / 2, h * 0.62); g.lineTo(i * w / 12, h); g.stroke(); }
      for (let y = h * 0.66; y < h; y += (y - h * 0.6) * 0.5 + 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } sterren(g, w, h, 30, 0.5); } },
  { id: 'schatkamer', n: 'Schatkamer', prijs: 1000, kast: '#d4a020', donker: '#3a1450', vloer: '#24102e', mist: '#2a1238', tafel: '#ffe6a8', lamp: '#ffffff',
    lucht(g, w, h) { verloop(g, w, h, ['#12061e', '#3a1450', '#5a1a5a']);
      const r = rnd(9); for (let i = 0; i < 70; i++) { const x = r() * w, y = r() * h, s = 2 + r() * 6; g.fillStyle = ['#fff', '#ffe68a', '#bfe8ff', '#ffb0e0'][i % 4]; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.25, y - s * 0.25); g.lineTo(x + s, y); g.lineTo(x + s * 0.25, y + s * 0.25); g.lineTo(x, y + s); g.lineTo(x - s * 0.25, y + s * 0.25); g.lineTo(x - s, y); g.lineTo(x - s * 0.25, y - s * 0.25); g.fill(); }
      g.fillStyle = '#d4a020'; const ky = h * 0.72; g.fillRect(0, ky, w, h - ky); g.fillStyle = '#b8860b'; for (let x = 0; x < w; x += 26) { bol(g, x + 13, ky + 14, 9, '#ffd84a'); bol(g, x, ky + 30, 9, '#e8b830'); } // stapels goudstukken
      for (const [x, k] of [[0.15, '#ff3a5a'], [0.35, '#3ad8ff'], [0.6, '#5aff8a'], [0.85, '#c06aff']]) { g.fillStyle = k; g.beginPath(); g.moveTo(w * x, ky - 22); g.lineTo(w * x + 14, ky - 8); g.lineTo(w * x, ky + 6); g.lineTo(w * x - 14, ky - 8); g.fill(); } },
    bord(g, w, h) { verloop(g, w, h, ['#4a1a6a', '#22082e']);
      g.fillStyle = '#ffd84a'; const cx = w / 2, cy = h * 0.5; g.beginPath(); g.moveTo(cx - 150, cy + 60); g.lineTo(cx - 170, cy - 60); g.lineTo(cx - 80, cy); g.lineTo(cx, cy - 90); g.lineTo(cx + 80, cy); g.lineTo(cx + 170, cy - 60); g.lineTo(cx + 150, cy + 60); g.fill(); // kroon
      g.fillRect(cx - 155, cy + 60, 310, 34); for (const [dx, k] of [[-100, '#ff3a5a'], [0, '#3ad8ff'], [100, '#5aff8a']]) bol(g, cx + dx, cy + 77, 12, k);
      for (const dx of [-170, 0, 170]) bol(g, cx + dx, dx ? cy - 64 : cy - 94, 12, '#fff4c0');
      for (let i = 0; i < 16; i++) bol(g, (i + 0.5) * w / 16, h * 0.93, 7, i % 2 ? '#fff' : '#ffd84a'); } },
  { id: 'snoep', n: 'Snoepland', prijs: 10000, kast: '#ff5aa8', donker: '#8a2a7a', vloer: '#ffc8e4', mist: '#ffb8dc', tafel: '#ffe4f2', lamp: '#ffffff',
    lucht(g, w, h) { verloop(g, w, h, ['#9ad8ff', '#ffd0ec', '#fff0f8']);
      for (const [x, y] of [[0.2, 0.12], [0.7, 0.2]]) { bol(g, w * x, h * y, 22, '#fff'); bol(g, w * x + 24, h * y + 4, 17, '#fff'); bol(g, w * x - 22, h * y + 6, 15, '#fff'); }
      for (let i = 0; i < 7; i++) { const x = (i + 0.5) * w / 7; bol(g, x, h + 10, w * 0.12, ['#ff8ac8', '#8ad8ff', '#b8ff8a', '#ffd84a'][i % 4]); } // gomheuvels
      for (const [x, k] of [[0.12, '#ff3a8a'], [0.88, '#3ab8ff'], [0.5, '#ffb03a']]) { g.fillStyle = '#fff'; g.fillRect(w * x - 3, h * 0.45, 6, h * 0.4); for (let r = 40; r > 0; r -= 8) bol(g, w * x, h * 0.42, r, r / 8 % 2 ? k : '#fff'); } // lolly's
      for (const x of [0.3, 0.7]) { g.lineWidth = 12; g.lineCap = 'round'; for (let j = 0; j < 8; j++) { g.strokeStyle = j % 2 ? '#fff' : '#ff2a4a'; g.beginPath(); g.moveTo(w * x, h * 0.95 - j * 18); g.lineTo(w * x, h * 0.95 - j * 18 - 18); g.stroke(); } g.beginPath(); g.arc(w * x + 18, h * 0.95 - 144, 18, Math.PI, 0); g.strokeStyle = '#ff2a4a'; g.stroke(); } },
    bord(g, w, h) { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#fff' : '#ff6ab0'; g.beginPath(); g.moveTo(i * w / 8 - h, h); g.lineTo(i * w / 8 - h + w / 16, h); g.lineTo(i * w / 8 + w / 16, 0); g.lineTo(i * w / 8, 0); g.fill(); }
      const cx = w / 2, cy = h * 0.45; for (let r = 150; r > 0; r -= 18) bol(g, cx, cy, r, r / 18 % 2 ? '#ff3a8a' : '#fff4fa'); g.fillStyle = '#fff'; g.fillRect(cx - 8, cy + 150, 16, h); } },
  { id: 'dino', n: 'Dino-eiland', prijs: 25000, kast: '#4a8a2a', donker: '#24400e', vloer: '#4a3a1a', mist: '#7a9a50', tafel: '#f0e4b8', lamp: '#ffd84a',
    lucht(g, w, h) { verloop(g, w, h, ['#f8b060', '#ffd890', '#b8e0a0']);
      g.fillStyle = '#6a4a3a'; g.beginPath(); g.moveTo(w * 0.45, h * 0.7); g.lineTo(w * 0.62, h * 0.28); g.lineTo(w * 0.7, h * 0.28); g.lineTo(w * 0.88, h * 0.7); g.fill(); // vulkaan
      g.fillStyle = '#ff5a1a'; g.beginPath(); g.moveTo(w * 0.62, h * 0.28); g.lineTo(w * 0.7, h * 0.28); g.lineTo(w * 0.67, h * 0.4); g.lineTo(w * 0.64, h * 0.34); g.fill();
      for (let i = 0; i < 5; i++) bol(g, w * (0.66 + i * 0.02), h * (0.22 - i * 0.04), 14 + i * 5, `rgba(90,80,80,${0.5 - i * 0.07})`); // rook
      g.fillStyle = '#2a5a1a'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 20) g.lineTo(x, h * 0.72 + Math.sin(x / 30) * 12); g.lineTo(w, h); g.fill(); // oerwoud
      for (const x of [0.1, 0.3, 0.92]) { g.fillStyle = '#6a4a2a'; g.fillRect(w * x - 4, h * 0.45, 8, h * 0.3); g.fillStyle = '#3a8a2a'; for (let j = 0; j < 6; j++) { g.save(); g.translate(w * x, h * 0.45); g.rotate(j * 1.05); g.beginPath(); g.ellipse(26, 0, 28, 8, 0, 0, 7); g.fill(); g.restore(); } }
      g.fillStyle = '#3a2a2a'; for (const [x, y] of [[0.25, 0.18], [0.4, 0.12]]) { g.beginPath(); g.moveTo(w * x, h * y); g.lineTo(w * x - 26, h * y - 8); g.lineTo(w * x - 6, h * y + 2); g.lineTo(w * x + 6, h * y + 2); g.lineTo(w * x + 26, h * y - 8); g.fill(); } }, // pterosauriërs
    bord(g, w, h) { verloop(g, w, h, ['#6a8a3a', '#3a5a1a']); g.fillStyle = '#f4e8c8';
      const voet = (x, y, s) => { g.beginPath(); g.ellipse(x, y, 30 * s, 38 * s, 0, 0, 7); g.fill(); for (const dx of [-28, 0, 28]) { g.beginPath(); g.ellipse(x + dx * s, y - 52 * s, 9 * s, 22 * s, dx / 60, 0, 7); g.fill(); } };
      voet(w * 0.3, h * 0.65, 1.3); voet(w * 0.6, h * 0.42, 1.1); voet(w * 0.82, h * 0.72, 0.9);
      g.font = `bold ${h * 0.14}px Georgia`; g.textAlign = 'center'; g.fillStyle = '#ffd84a'; g.fillText('ROAR!', w * 0.5, h * 0.92); } },
  { id: 'zee', n: 'Onderwaterwereld', prijs: 50000, kast: '#1a7aaa', donker: '#0a2a4a', vloer: '#0a3050', mist: '#0a3a5a', tafel: '#c8f0ff', lamp: '#8affff', bubbels: true,
    lucht(g, w, h) { verloop(g, w, h, ['#2ab8e8', '#0a5a9a', '#062a4a']);
      g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(w * (0.1 + i * 0.17), 0); g.lineTo(w * (0.18 + i * 0.17), 0); g.lineTo(w * (0.05 + i * 0.17), h); g.lineTo(w * (-0.05 + i * 0.17), h); g.fill(); } // lichtstralen
      for (let i = 0; i < 9; i++) { const x = (i + 0.5) * w / 9; g.strokeStyle = '#2a8a4a'; g.lineWidth = 7; g.beginPath(); g.moveTo(x, h); for (let y = h; y > h * 0.62; y -= 10) g.lineTo(x + Math.sin(y / 20 + i) * 10, y); g.stroke(); } // zeewier
      for (const [x, k] of [[0.2, '#ff7a6a'], [0.55, '#ffb03a'], [0.85, '#ff5ab8']]) for (let j = 0; j < 5; j++) bol(g, w * x + (j - 2) * 14, h * 0.9 - Math.abs(j - 2) * -6 - j % 2 * 18, 12, k); // koraal
      const vis = (x, y, k, s) => { g.fillStyle = k; g.beginPath(); g.ellipse(x, y, 18 * s, 10 * s, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(x + 14 * s, y); g.lineTo(x + 28 * s, y - 10 * s); g.lineTo(x + 28 * s, y + 10 * s); g.fill(); bol(g, x - 9 * s, y - 2 * s, 2.5 * s, '#000'); };
      vis(w * 0.3, h * 0.35, '#ffb03a', 1.2); vis(w * 0.7, h * 0.25, '#ffd84a', 1); vis(w * 0.6, h * 0.5, '#ff7ab8', 0.8); vis(w * 0.15, h * 0.55, '#7ae8ff', 0.9); },
    bord(g, w, h) { verloop(g, w, h, ['#1a8ac8', '#0a3a6a']); const cx = w / 2, cy = h * 0.55;
      g.fillStyle = '#ffb0c8'; for (let i = 0; i < 9; i++) { g.save(); g.translate(cx, cy + 60); g.rotate(-Math.PI / 2 + (i - 4) * 0.28); g.beginPath(); g.moveTo(0, 0); g.lineTo(150, -22); g.quadraticCurveTo(165, 0, 150, 22); g.fill(); g.restore(); } // schelp
      bol(g, cx, cy + 20, 26, '#fbf6ff'); bol(g, cx - 8, cy + 12, 8, '#fff'); for (let i = 0; i < 12; i++) bol(g, (i + 0.5) * w / 12, h * 0.1 + (i % 3) * 12, 6 + (i % 2) * 4, 'rgba(255,255,255,.5)'); } },
  { id: 'draak', n: 'Drakenburcht', prijs: 100000, kast: '#6a1a12', donker: '#1a0806', vloer: '#1a0806', mist: '#2a0c06', tafel: '#ffcf7a', lamp: '#ff9a2a', vonken: true,
    lucht(g, w, h) { verloop(g, w, h, ['#0a0302', '#2a0c06', '#5a1a08']);
      g.fillStyle = '#120403'; for (let x = 0; x < w; x += w / 9) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w / 18, h * (0.12 + ((x * 7) % 5) / 40)); g.lineTo(x + w / 9, 0); g.fill(); } // stalactieten
      const gr = g.createLinearGradient(0, h * 0.75, 0, h); gr.addColorStop(0, 'rgba(255,90,0,0)'); gr.addColorStop(1, 'rgba(255,120,20,.7)'); g.fillStyle = gr; g.fillRect(0, h * 0.75, w, h * 0.25); // lavagloed
      const r = rnd(4); for (let i = 0; i < 90; i++) bol(g, r() * w, h * 0.78 + r() * h * 0.2, 4 + r() * 8, ['#ffd84a', '#e8b830', '#fff0a0'][i % 3]); // goudschat
      g.fillStyle = 'rgba(0,0,0,.75)'; g.beginPath(); const dx = w * 0.62, dy = h * 0.38; g.moveTo(dx - 120, dy + 30); g.quadraticCurveTo(dx - 60, dy - 70, dx, dy); g.quadraticCurveTo(dx + 60, dy - 70, dx + 120, dy + 30); g.quadraticCurveTo(dx + 40, dy + 10, dx + 20, dy + 40); g.lineTo(dx + 50, dy + 60); g.lineTo(dx, dy + 45); g.lineTo(dx - 50, dy + 60); g.lineTo(dx - 20, dy + 40); g.quadraticCurveTo(dx - 40, dy + 10, dx - 120, dy + 30); g.fill(); // draak in de verte
      bol(g, dx - 8, dy + 20, 3, '#ff5a1a'); bol(g, dx + 8, dy + 20, 3, '#ff5a1a'); },
    bord(g, w, h) { verloop(g, w, h, ['#3a0c06', '#120403']);
      const cx = w / 2, cy = h * 0.5; g.fillStyle = '#d4a020'; g.beginPath(); g.moveTo(cx, cy - 170); g.lineTo(cx + 150, cy - 110); g.lineTo(cx + 120, cy + 90); g.lineTo(cx, cy + 180); g.lineTo(cx - 120, cy + 90); g.lineTo(cx - 150, cy - 110); g.fill(); // schild
      g.fillStyle = '#8a1a10'; g.beginPath(); g.moveTo(cx, cy - 140); g.lineTo(cx + 125, cy - 92); g.lineTo(cx + 100, cy + 76); g.lineTo(cx, cy + 152); g.lineTo(cx - 100, cy + 76); g.lineTo(cx - 125, cy - 92); g.fill();
      g.fillStyle = '#ffd84a'; g.beginPath(); g.moveTo(cx - 60, cy + 60); g.quadraticCurveTo(cx - 70, cy - 40, cx - 10, cy - 70); g.lineTo(cx + 40, cy - 100); g.lineTo(cx + 30, cy - 60); g.lineTo(cx + 70, cy - 50); g.quadraticCurveTo(cx + 20, cy - 20, cx + 40, cy + 30); g.quadraticCurveTo(cx, cy + 10, cx - 20, cy + 70); g.fill(); // gestileerde draak
      bol(g, cx + 22, cy - 72, 6, '#ff3a1a'); for (let i = 0; i < 14; i++) bol(g, (i + 0.5) * w / 14, h * 0.94, 8, i % 2 ? '#ff9a2a' : '#ffd84a'); } }
];
// een pompoen (met een lachend gezicht dat van binnen gloeit)
function pompoen(g, x, y, s, groot) {
  g.fillStyle = '#e8731a'; for (const dx of [-0.45, 0.45, 0]) { g.beginPath(); g.ellipse(x + dx * s, y, s * 0.62, s * 0.8, 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(120,40,0,.45)'; g.lineWidth = Math.max(1, s * 0.05); for (const dx of [-0.3, 0.3]) { g.beginPath(); g.ellipse(x + dx * s, y, s * 0.35, s * 0.78, 0, 0, 7); g.stroke(); }
  g.fillStyle = '#3a6a1a'; g.fillRect(x - s * 0.08, y - s * 0.98, s * 0.16, s * 0.25);
  g.fillStyle = groot ? '#ffd84a' : '#ffb03a';
  for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(x + sx * s * 0.45, y - s * 0.12); g.lineTo(x + sx * s * 0.2, y - s * 0.12); g.lineTo(x + sx * s * 0.32, y - s * 0.4); g.fill(); }
  g.beginPath(); g.moveTo(x - s * 0.55, y + s * 0.15); for (let i = 0; i <= 8; i++) g.lineTo(x - s * 0.55 + i * s * 0.1375, y + s * (i % 2 ? 0.28 : 0.4) + Math.sin(i / 8 * Math.PI) * s * 0.12); g.quadraticCurveTo(x, y + s * 0.15, x - s * 0.55, y + s * 0.15); g.fill();
}
let thema = THEMAS[0];
const KM = { kast: new THREE.MeshStandardMaterial({ roughness: 0.5 }), donker: new THREE.MeshStandardMaterial({ roughness: 0.6 }), vloer: new THREE.MeshStandardMaterial({ roughness: 0.9 }),
  bord: new THREE.MeshStandardMaterial({ roughness: 0.6 }), lampAan: new THREE.MeshBasicMaterial({ color: '#fff3b0' }), tafel: new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.5 }), goud: new THREE.MeshStandardMaterial({ color: '#e8b830', roughness: 0.3, metalness: 0.8 }), lampUit: new THREE.MeshBasicMaterial({ color: '#8a6a3a' }) };
let lampjes = [];
let luchtTex = null;
function tekenLucht() {
  const w = 512, h = Math.round(512 * Math.min(2.4, Math.max(0.4, innerHeight / innerWidth)));
  if (luchtTex) luchtTex.dispose();
  luchtTex = canvasTex((g) => thema.lucht(g, w, h), w, h); scene.background = luchtTex;
}
function zetThema(id) {
  thema = THEMAS.find((x) => x.id == id) || THEMAS[0];
  KM.kast.color.set(thema.kast); KM.donker.color.set(thema.donker); KM.vloer.color.set(thema.vloer);
  KM.tafel.color.set(thema.tafel || '#ffffff'); KM.lampAan.color.set(thema.lamp || '#fff3b0');
  if (KM.bord.map) KM.bord.map.dispose(); KM.bord.map = canvasTex((g, w, h) => thema.bord(g, w, h), 768, 500); KM.bord.needsUpdate = true;
  scene.fog.color.set(thema.mist); tekenLucht(); sneeuw.visible = !!thema.sneeuw || !!thema.vonken || !!thema.bubbels;
  sneeuw.material.color.set(thema.vonken ? '#ff9a2a' : thema.bubbels ? '#c8f4ff' : '#ffffff'); sneeuw.userData.op = !!thema.vonken || !!thema.bubbels;
}
// vallende sneeuw (Winternacht)
const sneeuw = (() => {
  const n = 500, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) pos.set([(Math.random() - 0.5) * 16, Math.random() * 10 - 2, (Math.random() - 0.5) * 16], i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 0.07, transparent: true, opacity: 0.85, depthWrite: false }));
  p.visible = false; scene.add(p); return p;
})();
function sneeuwStap(dt) {
  if (!sneeuw.visible) return;
  const a = sneeuw.geometry.attributes.position, op = sneeuw.userData.op ? -1.4 : 1; // vonken gaan omhoog
  for (let i = 0; i < a.count; i++) { let y = a.getY(i) - dt * (0.5 + (i % 7) * 0.08) * op; if (y < -2) y += 10; if (y > 8) y -= 10; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t + i) * dt * 0.1); }
  a.needsUpdate = true;
}

// de kast: tafel, schuif, wanden, glas en lampjes
function bouwKast() {
  const metaal = canvasTex((g, w) => { g.fillStyle = '#d6dbe2'; g.fillRect(0, 0, w, w); g.fillStyle = '#b8bec8'; for (let y = 8; y < w; y += 20) for (let x = (y / 20 % 2) * 10 + 8; x < w; x += 20) { g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); } }, 128, 128);
  metaal.wrapS = metaal.wrapT = THREE.RepeatWrapping; metaal.repeat.set(5, 8);
  KM.tafel.map = metaal;
  const tafel = new THREE.Mesh(new THREE.BoxGeometry(HB * 2, 0.2, 10), KM.tafel);
  tafel.position.set(0, -0.1, VOOR - 5); tafel.receiveShadow = true; scene.add(tafel);
  const goud = KM.goud;
  const rand = new THREE.Mesh(new THREE.BoxGeometry(HB * 2 + 0.3, 0.12, 0.16), goud); rand.position.set(0, 0.0, VOOR + 0.06); scene.add(rand);
  // de schuif: rood met een gouden bies
  const schuif = new THREE.Group();
  const blok = new THREE.Mesh(new THREE.BoxGeometry(HB * 2, SCHUIF.hoog, SCHUIF.half * 2), new THREE.MeshStandardMaterial({ map: metaal, roughness: 0.5, metalness: 0.4, color: '#ffe8e8' }));
  blok.castShadow = blok.receiveShadow = true; schuif.add(blok);
  const voorkant = new THREE.Mesh(new THREE.BoxGeometry(HB * 2, SCHUIF.hoog, 0.06), KM.kast);
  voorkant.position.z = SCHUIF.half + 0.03; schuif.add(voorkant);
  const bies = new THREE.Mesh(new THREE.BoxGeometry(HB * 2, 0.06, 0.08), goud); bies.position.set(0, SCHUIF.hoog / 2 - 0.03, SCHUIF.half + 0.04); schuif.add(bies);
  scene.add(schuif);
  // achterwand met een plaatje dat bij de achtergrond hoort (zetThema)
  const wand = new THREE.Mesh(new THREE.BoxGeometry(HB * 2 + 0.4, 3.4, 0.3), [0, 1, 2, 3].map(() => KM.donker).concat([KM.bord, KM.donker]));
  wand.position.set(0, SCHUIF.hoog + 0.02 + 1.7, MUUR_VOOR - 0.15); wand.castShadow = true; scene.add(wand);
  // lampjes langs de bovenkant van de achterwand en de glazen zijkanten
  const lampGeo = new THREE.SphereGeometry(0.07, 10, 8);
  for (let i = 0; i < 13; i++) lampjes.push([-HB + i * HB / 6, SCHUIF.hoog + 3.48, MUUR_VOOR - 0.02]);
  for (const s of [-1, 1]) for (let z = MUUR_VOOR + 0.4; z < ZIJ_EIND; z += 0.55) lampjes.push([s * (HB + 0.1), 1.66, z]);
  lampjes = lampjes.map(([x, y, z], i) => { const m = new THREE.Mesh(lampGeo, KM.lampAan); m.position.set(x, y, z); m.userData.i = i; scene.add(m); return m; });
  // glazen zijwanden met gouden stijlen
  const glas = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1, depthWrite: false });
  for (const s of [-1, 1]) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, ZIJ_EIND + 6), glas); g.position.set(s * (HB + 0.08), 0.8, (ZIJ_EIND - 6) / 2); scene.add(g);
    for (const z of [ZIJ_EIND, -1.5, MUUR_VOOR]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.7, 0.12), goud); p.position.set(s * (HB + 0.1), 0.85, z); p.castShadow = true; scene.add(p); }
  }
  // opvangbak onder de voorrand
  // een ondiepe bak met afgeronde gouden rand; gewonnen koekjes vallen erin en blijven even liggen
  const bakB = HB * 2 + 0.5, bakZ = VOOR + BAK.diep / 2 - 0.25;
  const bodem = new THREE.Mesh(new THREE.BoxGeometry(bakB, 0.1, BAK.diep), KM.donker); bodem.position.set(0, BAK.y - 0.05, bakZ); bodem.receiveShadow = true; scene.add(bodem);
  const voorkantBak = new THREE.Mesh(new THREE.BoxGeometry(bakB, 0.9, 0.12), KM.kast); voorkantBak.position.set(0, BAK.y - 0.25, bakZ + BAK.diep / 2); scene.add(voorkantBak);
  for (const s of [-1, 1]) { const z = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, BAK.diep), KM.kast); z.position.set(s * bakB / 2, BAK.y - 0.15, bakZ); scene.add(z); }
  const randGeo = new THREE.CylinderGeometry(0.07, 0.07, bakB + 0.1, 12); randGeo.rotateZ(Math.PI / 2);
  const bakRand = new THREE.Mesh(randGeo, goud); bakRand.position.set(0, BAK.y + 0.2, bakZ + BAK.diep / 2); scene.add(bakRand);
  for (const s of [-1, 1]) { const g2 = new THREE.CylinderGeometry(0.07, 0.07, BAK.diep, 12); g2.rotateX(Math.PI / 2); const r2 = new THREE.Mesh(g2, goud); r2.position.set(s * bakB / 2, BAK.y + 0.2, bakZ); scene.add(r2); }
  const schort = new THREE.Mesh(new THREE.BoxGeometry(HB * 2 + 0.3, BAK.y * -1, 0.1), KM.kast); schort.position.set(0, BAK.y / 2 - 0.1, VOOR - 0.06); scene.add(schort); // voorkant onder de tafel
  for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), KM.lampAan); m.position.set(-bakB / 2 + 0.3 + i * (bakB - 0.6) / 8, BAK.y + 0.06, bakZ + BAK.diep / 2 + 0.08); m.userData.i = i; scene.add(m); lampjes.push(m); }
  // tegelvloer en wat gezelligheid in de verte
  const vloer = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), KM.vloer);
  vloer.rotation.x = -Math.PI / 2; vloer.position.y = -2; vloer.receiveShadow = true; scene.add(vloer);
  // muurtjes (kracht): gouden hekjes langs de voorkant van de zijkanten
  const hekjes = new THREE.Group();
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, VOOR - ZIJ_EIND), goud); h.position.set(s * (HB + 0.08), 0.25, (VOOR + ZIJ_EIND) / 2); hekjes.add(h); }
  hekjes.visible = false; scene.add(hekjes);
  return { schuif, hekjes };
}
const kast = bouwKast();

// ---------- natuurkunde ----------
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -22, 0) });
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true; world.solver.iterations = 10;
const matKoek = new CANNON.Material('koek'), matTafel = new CANNON.Material('tafel');
const WRIJF = { tafel: 0.15, koek: 0.12 };
const cmTafel = new CANNON.ContactMaterial(matKoek, matTafel, { friction: WRIJF.tafel, restitution: 0.01 }), cmKoek = new CANNON.ContactMaterial(matKoek, matKoek, { friction: WRIJF.koek, restitution: 0.01 });
world.addContactMaterial(cmTafel); world.addContactMaterial(cmKoek);
function vast(hx, hy, hz, x, y, z, type = CANNON.Body.STATIC) {
  const b = new CANNON.Body({ mass: 0, type, material: matTafel, shape: new CANNON.Box(new CANNON.Vec3(hx, hy, hz)) });
  b.position.set(x, y, z); world.addBody(b); return b;
}
vast(HB, 0.1, 5, 0, -0.1, VOOR - 5); // tafel
vast(HB + 0.2, 1.7, 0.15, 0, SCHUIF.hoog + 0.02 + 1.7, MUUR_VOOR - 0.15); // achterwand boven de schuif
for (const s of [-1, 1]) vast(0.1, 2, (ZIJ_EIND + 7) / 2, s * (HB + 0.1), 1.5, (ZIJ_EIND - 7) / 2); // zijwanden
const muurtjes = [-1, 1].map((s) => { const b = vast(0.1, 0.5, (VOOR - ZIJ_EIND) / 2, s * (HB + 0.1), 0.5, (VOOR + ZIJ_EIND) / 2); world.removeBody(b); return b; });
vast(HB + 0.25, 0.05, BAK.diep / 2, 0, BAK.y - 0.05, VOOR + BAK.diep / 2 - 0.25); vast(HB + 0.25, 0.4, 0.06, 0, BAK.y + 0.3, VOOR + BAK.diep - 0.25); // opvangbak
const schuifBody = vast(HB, SCHUIF.hoog / 2, SCHUIF.half, 0, SCHUIF.hoog / 2, SCHUIF.midden, CANNON.Body.KINEMATIC);

// ---------- koekjes ----------
let koekjes = [];
function nieuwKoekje(code, x, y, z, q) {
  const r = straal(code), h = dikte(code);
  const body = new CANNON.Body({ mass: code >= 10 ? 1.3 : 1, material: matKoek, shape: VORMEN[code] ? new CANNON.Box(new CANNON.Vec3(VORMEN[code].b / 2, h / 2, VORMEN[code].d / 2)) : new CANNON.Cylinder(r, r, h, code == 11 ? 3 : 10), linearDamping: 0.12, angularDamping: 0.85 }); // veel draaidemping: koekjes blijven plat liggen
  body.position.set(x, y, z);
  if (q) body.quaternion.set(q[0], q[1], q[2], q[3]); else body.quaternion.setFromEuler(0, Math.random() * 6, 0);
  body.sleepSpeedLimit = 0.12; body.sleepTimeLimit = 0.8;
  world.addBody(body);
  const mesh = code >= 100 ? item(code).maak() : new THREE.Mesh(koekGeo(code), code < 10 || code >= 20 ? materialen(code)[1] : materialen(code));
  mesh.traverse((m) => { m.castShadow = m.receiveShadow = true; }); scene.add(mesh);
  const k = { code, body, mesh, geteld: false };
  body.addEventListener('collide', (e) => { const v = Math.abs(e.contact.getImpactVelocityAlongNormal()); if (v > 2.5 && Math.random() < 0.3) sTik(v * 0.01); });
  koekjes.push(k); return k;
}
function weg(k) { world.removeBody(k.body); scene.remove(k.mesh); koekjes.splice(koekjes.indexOf(k), 1); }
function randCookie() { const r = Math.random(); return r < (themaId == 'draak' && modus == 'vrij' ? 0.1 : 0.04) ? 3 : r < 0.24 ? 2 : r < 0.44 ? 1 : 0; }

// ---------- toestand ----------
let modus = 'menu', vrij = null, wedBest = 0, stilT = 0; // menu, vrij, wedstrijd of einde
let itemsGewonnen = {};
let munten = 0, muntenTotaal = 0, gekocht = ['bakkerij'], themaId = 'bakkerij', ingestuurd = {};
let supply = 40, score = 0, best = 0, coll = [0, 0, 0, 0, 0], found = [0, 0, 0, 0, 0, 0, 0, 0], wonTotal = 0, goldWon = 0, powersUsed = [], badges = [];
let rozeQ = 0, goldQ = 0, rainQ = 0, wallT = 0, regen = 0, t = 0, laatsteVal = -1, mikX = 0;
// opslag per speler (koekjesschuiver3d:<naam>), met de oude sleutel zonder naam als beginwaarde
let SPELER = ''; try { SPELER = localStorage.getItem('speler') || ''; } catch (e) {}
const REGEN = 5, REGEN_MAX = 30, KEY0 = 'koekjesschuiver3d', KEY = KEY0 + (SPELER ? ':' + SPELER : '');
function schuifZ(tt) { return SCHUIF.midden + SCHUIF.slag * Math.sin(tt * SCHUIF.w); }
function vulTafel() { // minder, grotere koekjes dan in 2D; een paar al op elkaar gestapeld
  const dx = KR * 2 + 0.04, dz = dx * 0.87;
  let rij = 0;
  for (let z = 0.6; z < VOOR - KR * 0.6; z += dz, rij++) for (let x = -HB + KR + 0.05 + (rij % 2) * dx / 2; x < HB - KR; x += dx) {
    if (Math.random() < 0.04) continue;
    nieuwKoekje(Math.random() < 0.03 ? 3 : [0, 0, 0, 1, 2][Math.floor(Math.random() * 5)], x + (Math.random() - 0.5) * 0.05, KH / 2 + 0.01, z);
  }
  for (let i = 0; i < 16; i++) nieuwKoekje(randCookie(), (Math.random() - 0.5) * (HB * 2 - 0.9), KH * 1.6 + 0.05 + (i % 2) * KH, 0.8 + Math.random() * (VOOR - 1.2));
  for (let i = 0; i < 2; i++) nieuwKoekje(10 + Math.floor(Math.random() * 5), (Math.random() - 0.5) * (HB * 2 - 1.4), 0.6, 1.2 + Math.random() * 1.6);
  nieuwKoekje(20 + Math.floor(Math.random() * 8), (Math.random() - 0.5) * 2.4, 0.7, 1.6);
  for (let i = 0; i < 4; i++) nieuwKoekje(randCookie(), -HB + 0.6 + i * (HB * 2 - 1.2) / 3, SCHUIF.hoog + KH / 2 + 0.02, -2.0);
}
function bewaar() {
  if (TEGEL) return;
  try {
    const alles = { itemsGewonnen, best, found, wonTotal, goldWon, powersUsed, badges, munten, muntenTotaal, gekocht, thema: themaId, ingestuurd, wedBest };
    if (modus == 'wedstrijd' || modus == 'einde') { // tijdens een wedstrijd blijft je eigen tafel bewaard zoals hij was
      const oud = JSON.parse(localStorage.getItem(KEY) || '{}'); localStorage.setItem(KEY, JSON.stringify(Object.assign(oud, alles))); return;
    }
    localStorage.setItem(KEY, JSON.stringify({ ...alles, supply, score, coll,
      c: koekjes.filter((k) => !k.geteld && k.body.position.y > -0.3).map((k) => { const p = k.body.position, q = k.body.quaternion; return [p.x, p.y, p.z, q.x, q.y, q.z, q.w, k.code].map((v, i) => (i == 7 ? v : +v.toFixed(3))); }) }));
  } catch (e) {}
}
function laad() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(KEY0)); if (!s || !s.c || !s.c.length) return false;
    ({ supply, score, best = 0, coll = coll, found = found, wonTotal = 0, goldWon = 0, powersUsed = [], badges = [], munten = 0, muntenTotaal = munten, gekocht = ['bakkerij'], thema: themaId = 'bakkerij', ingestuurd = {}, wedBest = 0, itemsGewonnen = {} } = s);
    for (const [x, y, z, qx, qy, qz, qw, c] of s.c) nieuwKoekje(c, x, y + 0.01, z, [qx, qy, qz, qw]);
    return true;
  } catch (e) { return false; }
}
function opnieuw() {
  for (const k of [...koekjes]) weg(k);
  supply = 40; score = 0; coll = [0, 0, 0, 0, 0]; goldQ = rainQ = rozeQ = 0; zetMuurtjes(false); wallT = 0;
  vulTafel(); bewaar(); tekenHud(true);
}

// ---------- spelen ----------
function laatVallen(x, gratis, vast) {
  if (!gratis) {
    if (supply <= 0) { snd(150, 0.15, 'square', 0.04); return; }
    if (t - laatsteVal < 0.15) return;
    laatsteVal = t; supply--; stilT = 0;
  }
  x = Math.max(-HB + KR + 0.08, Math.min(HB - KR - 0.08, x));
  let code = vast ?? randCookie();
  const eigen = ITEMS.map((it, i) => (it.thema == themaId ? 100 + i : -1)).filter((c) => c >= 0);
  if (vast != null) {}
  else if (goldQ > 0 && !gratis) { goldQ--; code = 3; }
  else if (rozeQ > 0 && !gratis) { rozeQ--; code = 5; }
  else if (!gratis && modus == 'vrij' && eigen.length && Math.random() < (themaId == 'draak' ? ITEM_KANS_DRAAK : ITEM_KANS)) code = eigen[Math.floor(Math.random() * eigen.length)];
  else if (!gratis && Math.random() < (themaId == 'dino' && modus == 'vrij' ? 1 / 11 : 1 / 18)) { const nog = found.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0); code = 20 + (nog.length && Math.random() < 0.5 ? nog[Math.floor(Math.random() * nog.length)] : Math.floor(Math.random() * 8)); }
  else if (!gratis && Math.random() < (themaId == 'snoep' && modus == 'vrij' ? 1 / 7 : 1 / 13)) code = 10 + Math.floor(Math.random() * 5);
  const k = nieuwKoekje(code, x, VAL_Y, VAL_Z + Math.random() * 0.1);
  k.body.quaternion.setFromEuler((Math.random() - 0.5) * 0.12, Math.random() * 6, (Math.random() - 0.5) * 0.12);
  snd(1400, 0.05, 'triangle', 0.04, 900); tekenHud();
}
function zetMuurtjes(aan) {
  for (const b of muurtjes) { if (aan && !world.bodies.includes(b)) world.addBody(b); if (!aan && world.bodies.includes(b)) world.removeBody(b); }
  kast.hekjes.visible = aan;
}
function gebruikKracht(k) {
  if (coll[k] < 3) { snd(150, 0.12, 'square', 0.035); pop(TREATS[k].n + ': nog ' + (3 - coll[k]) + ' nodig', innerWidth / 2, innerHeight - 120, 'weg'); return; }
  coll[k] -= 3; sPower(); if (!powersUsed.includes(k)) powersUsed.push(k); checkBadges(); roep(TREATS[k].p + '!');
  if (k == 0) { wallT = 30; zetMuurtjes(true); }
  if (k == 1) rainQ += 12;
  if (k == 2) { for (const c of koekjes) { c.body.wakeUp(); c.body.velocity.z += 2 + Math.random() * 2.5; c.body.velocity.x += (Math.random() - 0.5) * 2; c.body.velocity.y += 2 + Math.random() * 2; } snd(90, 0.5, 'sawtooth', 0.08, 50); }
  if (k == 3) goldQ += 8;
  if (k == 4) supply += 20;
  bewaar(); tekenHud(true);
}
function gewonnen(k) {
  stilT = 0;
  const c = k.code, p = schermPunt(k.body.position.x, 0, VOOR);
  if (c >= 100) {
    const it = item(c); itemsGewonnen[it.id] = (itemsGewonnen[it.id] || 0) + 1; score += 25; sPrize(); roep(it.n + '!'); verdien(themaId == 'zee' ? 10 : 5, p.x, p.y - 50);
    setTimeout(() => pop(it.grap, innerWidth / 2, innerHeight * 0.42, 'goud grap'), 900); it.doe();
  } else if (c >= 20) {
    const i = c - 20; found[i]++; score += 50; if (modus != 'wedstrijd') supply += 2; sRoep(); roep(KAR[i].roep); verdien(3, p.x, p.y - 50);
    springers.push({ code: c, t: 0, x: k.body.position.x, groot: !!KAR[i].spring });
    if (KAR[i].spring) likkie();
  } else if (c >= 10) {
    const i = c - 10; coll[i]++; score += 25; sPrize(); pop(TREATS[i].n + '!', p.x, p.y - 20, 'goud'); verdien(1, p.x, p.y - 50);
    if (coll[i] == 3) pop(TREATS[i].p + ' klaar!', innerWidth / 2, innerHeight - 110, 'goud');
  } else {
    const v = (c == 3 ? 10 : c == 4 || c == 7 ? 5 : c == 6 ? 4 : c == 5 ? 3 : 1) * (wiebelT > 0 ? 2 : 1) * (driesT > 0 ? 3 : 1); score += v; wonTotal++; if (c == 3) goldWon++; if (modus != 'wedstrijd') supply += c == 3 ? 3 : 1; /* in een wedstrijd geen koekjes terug */ pop('+' + v, p.x, p.y - 20, c == 3 ? 'goud' : ''); sWin(c == 3); if (c == 3) verdien(1, p.x, p.y - 50);
  }
  checkBadges(); tekenHud(true);
}
function verdien(n, x, y) { munten += n; muntenTotaal += n; if (x != null) setTimeout(() => pop('+' + n + ' 🪙', x, y, 'goud'), 250); setTimeout(() => snd(1568, 0.08, 'square', 0.03), 250); tekenHud(); }
let weggevallen = 0;
function verloren(k) { weggevallen++; stilT = 0; const p = schermPunt(k.body.position.x, 0, k.body.position.z); pop(k.code >= 100 ? item(k.code).weg : 'weg', p.x, p.y, 'weg'); snd(200, 0.25, 'sine', 0.04, 90); }
let toastRij = [];
function checkBadges() {
  const add = (id) => { if (badges.includes(id)) return; badges.push(id); munten += 10; muntenTotaal += 10; toastRij.push(ALLE_BADGES.find((b) => b.id == id)); bewaar(); };
  found.forEach((v, i) => { if (v) add('kar' + i); });
  if (wonTotal >= 1) add('eerste'); if (wonTotal >= 100) add('honderd'); if (wonTotal >= 500) add('vijfhonderd'); if (goldWon >= 5) add('goud');
  for (const it of ITEMS) { const n = itemsGewonnen[it.id] || 0; if (n >= 1) add('it_' + it.id); if (n >= 5) add('it5_' + it.id); }
  if (coll.some((c) => c >= 3) || powersUsed.length) add('set'); if (powersUsed.length >= 5) add('krachten'); if (found.every(Boolean)) add('meester');
}

// ---------- tafel-items: modellen en effecten ----------
const effecten = []; // korte animaties: stap(t, dt) geeft false als hij klaar is
function effectenStap(dt) { for (const e of [...effecten]) { e.t = (e.t || 0) + dt; if (e.stap(e.t, dt) === false) effecten.splice(effecten.indexOf(e), 1); } }
let pompoenTex = null;
function maakPompoen() {
  pompoenTex = pompoenTex || canvasTex((g, w, h) => { // ribbels rondom en één lachend gezicht
    g.fillStyle = '#e8731a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8500e'; g.lineWidth = 6;
    for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(i * w / 10, 0); g.lineTo(i * w / 10, h); g.stroke(); }
    const cx = w * 0.75, cy = h * 0.5; g.fillStyle = '#2a1004';
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(cx + sx * 34, cy - 4); g.lineTo(cx + sx * 12, cy - 4); g.lineTo(cx + sx * 23, cy - 26); g.fill(); }
    g.beginPath(); g.moveTo(cx - 40, cy + 10); for (let i = 0; i <= 8; i++) g.lineTo(cx - 40 + i * 10, cy + (i % 2 ? 20 : 30)); g.lineTo(cx + 40, cy + 10); g.quadraticCurveTo(cx, cy + 22, cx - 40, cy + 10); g.fill();
  }, 512, 128);
  const grp = new THREE.Group();
  const bol = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 18), new THREE.MeshStandardMaterial({ map: pompoenTex, roughness: 0.6, emissive: '#3a1400' })); bol.scale.y = 0.6; grp.add(bol);
  const steel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.14, 8), new THREE.MeshStandardMaterial({ color: '#3a6a1a' })); steel.position.y = 0.3; steel.rotation.z = 0.2; grp.add(steel);
  return grp;
}
function maakSpook(los) {
  const pts = [[0.36, -0.31], [0.35, -0.12], [0.31, 0.06], [0.24, 0.2], [0.13, 0.28], [0, 0.31]].map(([a, b]) => new THREE.Vector2(a, b));
  const grp = new THREE.Group();
  grp.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 24), new THREE.MeshStandardMaterial({ color: '#f6f8ff', emissive: '#334', roughness: 0.4, transparent: !!los, opacity: los ? 0.9 : 1, side: THREE.DoubleSide })));
  const zwart = new THREE.MeshBasicMaterial({ color: '#111' });
  for (const sx of [-1, 1]) { const oog = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), zwart); oog.position.set(sx * 0.1, 0.1, 0.27); grp.add(oog); }
  const mond = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), zwart); mond.scale.set(0.8, 1.2, 0.5); mond.position.set(0, -0.03, 0.31); grp.add(mond);
  return grp;
}
// pompoen gewonnen: vleermuizen vliegen over de tafel en jagen de koekjes naar voren
function vleermuizen() {
  const vleugel = new THREE.Shape(); vleugel.moveTo(0, 0); vleugel.quadraticCurveTo(0.12, 0.12, 0.3, 0.06); vleugel.quadraticCurveTo(0.2, 0, 0.26, -0.06); vleugel.quadraticCurveTo(0.12, -0.02, 0, -0.04);
  const vgeo = new THREE.ShapeGeometry(vleugel), mat = new THREE.MeshBasicMaterial({ color: '#0a0510', side: THREE.DoubleSide });
  const vm = [];
  for (let i = 0; i < 8; i++) {
    const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mat));
    const l = new THREE.Mesh(vgeo, mat), r = new THREE.Mesh(vgeo, mat); r.scale.x = -1; g.add(l, r); g.userData = { l, r, x: (Math.random() - 0.5) * HB * 1.8, y: 1 + Math.random() * 1.2, v: 0.8 + Math.random() * 0.5, f: Math.random() * 6 };
    g.rotation.x = -Math.PI / 2.3; scene.add(g); vm.push(g);
  }
  [0, 0.15, 0.3, 0.5].forEach((d) => snd(2400 + Math.random() * 800, 0.08, 'square', 0.025, 3200, d));
  let geduwd = false;
  effecten.push({ stap: (t) => {
    for (const g of vm) { const u = g.userData; g.position.set(u.x + Math.sin(t * 3 + u.f) * 0.4, u.y, -2.5 + t * 5 * u.v); const fl = Math.sin(t * 30 + u.f) * 0.8; u.l.rotation.y = fl; u.r.rotation.y = -fl; }
    if (!geduwd && t > 0.5) { geduwd = true; for (const c of koekjes) if (c.body.position.y > -0.3) { c.body.wakeUp(); c.body.velocity.z += 1.5 + Math.random() * 1.5; c.body.velocity.y += 1 + Math.random(); } snd(90, 0.4, 'sawtooth', 0.06, 50); }
    if (t > 2) { vm.forEach((g) => scene.remove(g)); return false; }
  } });
}
// spookje gewonnen: een spookje zweeft over de tafel en laat 5 halloweenkoekjes vallen (5 punten per stuk)
function spookVlucht() {
  const sp = maakSpook(true); sp.scale.setScalar(1.3); scene.add(sp);
  const plekken = [-0.8, -0.4, 0, 0.4, 0.8].map((f) => f * (HB - 0.6)); let n = 0;
  snd(500, 1.2, 'sine', 0.04, 300); snd(520, 1.2, 'sine', 0.03, 280, 0.1);
  effecten.push({ stap: (t) => {
    const x = -HB - 1 + t * (2 * HB + 2) / 2.4; sp.position.set(x, 1.7 + Math.sin(t * 5) * 0.15, VAL_Z + 0.2); sp.rotation.y = Math.sin(t * 3) * 0.4;
    while (n < plekken.length && x > plekken[n]) laatVallen(plekken[n++], true, 4);
    if (t > 2.4) { scene.remove(sp); return false; }
  } });
}

// strand: kwal, flamingo, parasol en krab
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...extra });
function maakKwal() {
  const grp = new THREE.Group(), paars = mat('#e08aff', { transparent: true, opacity: 0.75, emissive: '#5a1a7a' });
  const kap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), paars); kap.scale.y = 0.75; kap.position.y = -0.05; grp.add(kap);
  const rok = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 8, 24), paars); rok.rotation.x = Math.PI / 2; rok.position.y = -0.05; grp.add(rok);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, d = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.01, 0.3, 5), paars); d.position.set(Math.cos(a) * 0.2, -0.18, Math.sin(a) * 0.2); d.rotation.set(Math.sin(a) * 0.5, 0, Math.cos(a) * 0.5); grp.add(d); }
  const zwart = new THREE.MeshBasicMaterial({ color: '#2a0a3a' }); for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), zwart); o.position.set(sx * 0.1, 0.12, 0.24); grp.add(o); }
  return grp;
}
function maakFlamingo() {
  const grp = new THREE.Group(), roze = mat('#ff7ab8'), zwart = mat('#222'), geel = mat('#ffd24a');
  const lijf = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), roze); lijf.scale.set(1.3, 0.8, 0.9); lijf.position.y = 0.05; grp.add(lijf);
  const nek = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 16, Math.PI * 1.3), roze); nek.position.set(0.18, 0.2, 0); nek.rotation.z = -0.4; grp.add(nek);
  const kop = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), roze); kop.position.set(0.14, 0.38, 0); grp.add(kop);
  const snavel = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 8), zwart); snavel.position.set(0.22, 0.35, 0); snavel.rotation.z = -2; grp.add(snavel);
  const been = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.36, 6), geel); been.position.set(0, -0.2, 0); grp.add(been); // op één poot, natuurlijk
  const voet = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.08), geel); voet.position.set(0.03, -0.39, 0); grp.add(voet);
  return grp;
}
let parasolTex = null;
function maakParasol() {
  parasolTex = parasolTex || canvasTex((g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#fff' : '#ff5a5a'; g.fillRect(i * w / 8, 0, w / 8 + 1, h); } }, 256, 32);
  const grp = new THREE.Group();
  const doek = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.22, 16, 1, true), new THREE.MeshStandardMaterial({ map: parasolTex, side: THREE.DoubleSide, roughness: 0.7 })); doek.position.y = 0.16; grp.add(doek);
  const stok = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), mat('#d8c8a0')); grp.add(stok);
  const voet = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.06, 14), mat('#3a8ac8')); voet.position.y = -0.25; grp.add(voet);
  return grp;
}
function maakKrab() {
  const grp = new THREE.Group(), rood = mat('#e8402a'), wit = new THREE.MeshBasicMaterial({ color: '#fff' }), zwart = new THREE.MeshBasicMaterial({ color: '#111' });
  const lijf = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 10), rood); lijf.scale.set(1.2, 0.5, 0.9); grp.add(lijf);
  for (const sx of [-1, 1]) {
    const steel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 5), rood); steel.position.set(sx * 0.08, 0.14, 0.12); grp.add(steel);
    const oog = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), wit); oog.position.set(sx * 0.08, 0.21, 0.12); grp.add(oog);
    const pup = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 5), zwart); pup.position.set(sx * 0.08, 0.215, 0.155); grp.add(pup);
    const schaar = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), rood); schaar.scale.set(1, 0.6, 1.3); schaar.position.set(sx * 0.32, 0.03, 0.12); grp.add(schaar);
    for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.012, 0.16, 5), rood); p.position.set(sx * 0.27, -0.05, -0.1 + i * 0.08); p.rotation.z = sx * 1.1; grp.add(p); }
  }
  return grp;
}
// kwal: de tafel wordt even glibberig (minder wrijving, en de tafel glimt blauwig)
let driesT = 0, laagT = 0, vriesT = 0, glibberT = 0, wiebelT = 0, camBasis = null;
function glibber(sec) {
  glibberT = sec; const aan = sec > 0;
  cmTafel.friction = aan ? 0.04 : WRIJF.tafel; cmKoek.friction = aan ? 0.05 : WRIJF.koek;
  KM.tafel.emissive.set(aan ? '#1a4a6a' : '#000000');
  if (aan) { snd(300, 0.6, 'sine', 0.04, 900); for (const c of koekjes) c.body.wakeUp(); }
}
// krab: loopt zijwaarts over de tafel en knipt de koekjes waar hij langskomt naar voren
function krabWandeling() {
  const k = maakKrab(); k.scale.setScalar(1.4); scene.add(k);
  effecten.push({ stap: (t, dt) => {
    const x = -HB - 0.5 + t * (2 * HB + 1) / 3, z = 1.2; k.position.set(x, 0.35 + Math.abs(Math.sin(t * 12)) * 0.05, z); k.rotation.z = Math.sin(t * 12) * 0.08;
    for (const c of koekjes) { const p = c.body.position; if (Math.abs(p.x - x) < 0.5 && Math.abs(p.z - z) < 0.9 && p.y > -0.2) { c.body.wakeUp(); c.body.velocity.z = Math.max(c.body.velocity.z, 2.2); } }
    if (Math.floor(t * 6) != Math.floor((t - dt) * 6)) snd(1800 + Math.random() * 400, 0.03, 'square', 0.03, 900);
    if (t > 3) { scene.remove(k); return false; }
  } });
}

// kermis: suikerspin, badeendje, dartpijl, biertje en de P-knuffel
function ruisKnal() { try { const n = ac.currentTime, b = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); const src = ac.createBufferSource(), g = ac.createGain(); src.buffer = b; g.gain.value = 0.15; src.connect(g).connect(ac.destination); src.start(n); } catch (e) {} }
function maakSuikerspin() {
  const grp = new THREE.Group(), roze = mat('#ffb0d8', { roughness: 0.95, emissive: '#3a1028' });
  for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.06, 10, 8), roze); const a = Math.random() * 7, r = Math.random() * 0.16; b.position.set(Math.cos(a) * r, 0.12 + Math.random() * 0.2, Math.sin(a) * r); grp.add(b); }
  const stok = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), mat('#f4e8d0')); stok.position.y = -0.12; grp.add(stok);
  return grp;
}
function maakEend() {
  const grp = new THREE.Group(), geel = mat('#ffd400', { roughness: 0.35 }), oranje = mat('#ff8a1a'), zwart = new THREE.MeshBasicMaterial({ color: '#111' });
  const lijf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), geel); lijf.scale.set(1.2, 0.8, 1); lijf.position.y = -0.06; grp.add(lijf);
  const kop = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), geel); kop.position.set(0.14, 0.12, 0); grp.add(kop);
  const snavel = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), oranje); snavel.scale.set(1.4, 0.5, 1); snavel.position.set(0.27, 0.1, 0); grp.add(snavel);
  for (const sz of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), zwart); o.position.set(0.22, 0.17, sz * 0.07); grp.add(o); }
  return grp;
}
function maakPijl() {
  const grp = new THREE.Group(), deel = new THREE.Group();
  const punt = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 8), mat('#cccccc', { metalness: 0.8, roughness: 0.3 })); punt.position.y = 0.3; deel.add(punt);
  const schacht = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), mat('#2a5ad8')); schacht.position.y = 0.05; deel.add(schacht);
  for (let i = 0; i < 3; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.14, 0.1), mat('#ff3a3a')); v.position.y = -0.18; v.rotation.y = i * Math.PI / 3; deel.add(v); }
  deel.rotation.z = Math.PI / 2; grp.add(deel); return grp; // ligt plat
}
function maakBier() {
  const grp = new THREE.Group();
  const glas = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.42, 16), new THREE.MeshStandardMaterial({ color: '#f2b02a', roughness: 0.2, transparent: true, opacity: 0.85, emissive: '#3a2000' })); glas.position.y = -0.04; grp.add(glas);
  const schuim = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#fffaf0', { roughness: 1 })); schuim.scale.y = 0.5; schuim.position.y = 0.17; grp.add(schuim);
  const oor = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 14), new THREE.MeshStandardMaterial({ color: '#ffe0a0', transparent: true, opacity: 0.6 })); oor.position.set(0.22, -0.02, 0); grp.add(oor);
  return grp;
}
// de P-knuffel: roze, zacht, met een lief snoetje (speels, niet meer dan dat)
function maakPKnuffel() {
  const grp = new THREE.Group(), roze = mat('#ff9ec4', { roughness: 0.95 }), zwart = new THREE.MeshBasicMaterial({ color: '#2a1020' }), blos = new THREE.MeshBasicMaterial({ color: '#ff6aa0' });
  const lijf = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.26, 6, 14), roze); lijf.position.y = 0.06; grp.add(lijf);
  for (const sx of [-1, 1]) { const bol = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), roze); bol.position.set(sx * 0.13, -0.19, 0.02); grp.add(bol); }
  for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), zwart); o.position.set(sx * 0.055, 0.2, 0.135); grp.add(o); const b = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), blos); b.scale.set(1.3, 0.7, 0.4); b.position.set(sx * 0.1, 0.14, 0.13); grp.add(b); }
  const mond = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 6, 12, Math.PI), zwart); mond.rotation.z = Math.PI; mond.position.set(0, 0.15, 0.145); grp.add(mond);
  return grp;
}
// badeendje: onder het eendje staat je prijs
function eendPrijs() {
  const n = [10, 25, 25, 50, 100][Math.floor(Math.random() * 5)];
  setTimeout(() => { score += n; roep('Onder het eendje staat… ' + n + '!'); if (n == 100) sBadge(); else sPrize(); tekenHud(); }, 1600);
}
// P-knuffel: een grote P-knuffel stuitert over de tafel en duwt bij elke landing de koekjes weg
function knuffelSprong() { stuiter(maakPKnuffel(), 2.4); setTimeout(() => verdien(10, innerWidth / 2, innerHeight * 0.3), 600); }
// iets groots stuitert drie keer over de tafel en duwt bij elke landing de koekjes weg (P-knuffel, gummibeer)
function stuiter(k, S) {
  k.scale.setScalar(S); scene.add(k); let land = 0;
  effecten.push({ stap: (t) => {
    const f = t / 3, z = -1.6 + f * 4.4, sprong = Math.abs(Math.sin(f * Math.PI * 3)); k.position.set(Math.sin(f * 6) * 0.6, 0.8 + sprong * 1.6, z); k.rotation.y = t * 2;
    k.scale.set(S * (1 + (1 - sprong) * 0.15), S * (1 - (1 - sprong) * 0.2), S);
    const nu = Math.floor(f * 3 + 0.5); if (nu > land && nu <= 3) { land = nu; snd(220, 0.25, 'sine', 0.07, 520); roep('Boing!');
      for (const c of koekjes) { const dx = c.body.position.x - k.position.x, dz = c.body.position.z - z; if (dx * dx + dz * dz < 2.2 && c.body.position.y > -0.3) { c.body.wakeUp(); c.body.velocity.y += 2.5; c.body.velocity.z += 2; c.body.velocity.x += dx * 1.5; } } }
    if (t > 3) { scene.remove(k); return false; }
  } });
}

// schatkamer: glimmende sieraden (eigen omgevingskaart zodat metaal en diamant glanzen)
let glansKaart = null;
function glans() {
  if (glansKaart) return glansKaart;
  const tex = canvasTex((g, w, h) => { verloop(g, w, h, ['#ffffff', '#c8b0ff', '#3a2050', '#ffe0a0', '#201030']); for (let i = 0; i < 30; i++) bol(g, Math.random() * w, Math.random() * h * 0.6, 3 + Math.random() * 10, '#ffffff'); }, 512, 256);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  const pm = new THREE.PMREMGenerator(renderer); glansKaart = pm.fromEquirectangular(tex).texture; pm.dispose(); return glansKaart;
}
const sieraad = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: 0.18, envMap: glans(), ...extra });
function maakDiamant() {
  const grp = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: '#9fd8ff', metalness: 0.6, roughness: 0.04, envMap: glans(), envMapIntensity: 1.1, flatShading: true });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.29, 0.1, 10), m); top.position.y = 0.11; grp.add(top);
  const onder = new THREE.Mesh(new THREE.ConeGeometry(0.29, 0.32, 10), m); onder.rotation.x = Math.PI; onder.position.y = -0.1; grp.add(onder);
  return grp;
}
function maakRing() {
  const grp = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 12, 28), sieraad('#e8eef4')); band.rotation.x = Math.PI / 2; grp.add(band);
  const steen = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), new THREE.MeshStandardMaterial({ color: '#ff5aa0', metalness: 0.3, roughness: 0.05, envMap: glans(), flatShading: true, emissive: '#3a0a1a' })); steen.position.set(0, 0.04, 0.22); grp.add(steen);
  return grp;
}
function maakKetting() {
  const grp = new THREE.Group(), parel = new THREE.MeshStandardMaterial({ color: '#fbf6ff', metalness: 0.1, roughness: 0.15, envMap: glans(), envMapIntensity: 1.5 });
  const pg = new THREE.SphereGeometry(0.045, 10, 8);
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, p = new THREE.Mesh(pg, parel); p.position.set(Math.cos(a) * 0.33, 0, Math.sin(a) * 0.26 + (Math.sin(a) > 0.8 ? 0.06 : 0)); grp.add(p); }
  const slot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), sieraad('#ffd24a')); slot.position.set(0, 0, -0.27); grp.add(slot);
  return grp;
}
function maakArmband() {
  const grp = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.06, 14, 32), sieraad('#ffcc3a')); band.rotation.x = Math.PI / 2; grp.add(band);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, st = new THREE.Mesh(new THREE.OctahedronGeometry(0.045), new THREE.MeshStandardMaterial({ color: ['#ff3a5a', '#3ad8ff', '#5aff8a'][i % 3], roughness: 0.05, metalness: 0.3, envMap: glans(), flatShading: true })); st.position.set(Math.cos(a) * 0.27, 0.05, Math.sin(a) * 0.27); grp.add(st); }
  return grp;
}
function maakGoudklomp() {
  const g = new THREE.IcosahedronGeometry(0.3, 1), pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) { const f = 0.8 + Math.sin(pos.getX(i) * 17 + pos.getZ(i) * 11) * 0.12 + Math.cos(pos.getY(i) * 13) * 0.08; pos.setXYZ(i, pos.getX(i) * f, pos.getY(i) * f * 0.75, pos.getZ(i) * f); }
  g.computeVertexNormals();
  return new THREE.Mesh(g, sieraad('#ffc21a', { roughness: 0.32, flatShading: true }));
}
// diamant gewonnen: de hele kast fonkelt even
function flonker() {
  const n = 40, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) pos.set([(Math.random() - 0.5) * HB * 2, Math.random() * 2.5, -2 + Math.random() * (VOOR + 2)], i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({ color: '#ffffff', size: 0.16, transparent: true, depthWrite: false }), p = new THREE.Points(g, pm); scene.add(p);
  [1568, 2093, 2637, 3136].forEach((f, i) => snd(f, 0.4, 'sine', 0.04, 0, i * 0.09));
  effecten.push({ stap: (t) => { pm.opacity = Math.max(0, 1 - t / 2) * (0.6 + 0.4 * Math.sin(t * 30)); p.rotation.y = t * 0.2; if (t > 2) { scene.remove(p); return false; } } });
}
// armband gewonnen: een grote gouden armband rolt over de tafel en duwt de koekjes naar voren
function armbandRol() {
  const a = maakArmband(); a.scale.setScalar(2.2); a.rotation.z = Math.PI / 2; scene.add(a);
  effecten.push({ stap: (t) => {
    const z = -1.6 + t * 1.6, x = Math.sin(t * 1.5) * 0.8; a.position.set(x, 0.65, z); a.rotation.x = -t * 4;
    for (const c of koekjes) { const p = c.body.position; if (Math.abs(p.z - z) < 0.5 && Math.abs(p.x - x) < 0.8 && p.y > -0.2) { c.body.wakeUp(); c.body.velocity.z = Math.max(c.body.velocity.z, 2.5); } }
    if (t > 3) { scene.remove(a); return false; }
  } });
}

// winternacht: sneeuwpop, cadeautje, rendier met slee en kerstbal
function maakSneeuwpop() {
  const grp = new THREE.Group(), wit = mat('#f6faff', { roughness: 0.9 }), zwart = mat('#1a1a1a');
  [[0.2, -0.2], [0.15, 0.08], [0.11, 0.28]].forEach(([r, y]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), wit); b.position.y = y; grp.add(b); });
  const neus = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 8), mat('#ff8a1a')); neus.rotation.x = Math.PI / 2; neus.position.set(0, 0.28, 0.15); grp.add(neus);
  for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), zwart); o.position.set(sx * 0.04, 0.32, 0.095); grp.add(o); }
  const sjaal = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 16), mat('#e8303a')); sjaal.rotation.x = Math.PI / 2; sjaal.position.y = 0.19; grp.add(sjaal);
  const rand = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 14), zwart); rand.position.y = 0.37; grp.add(rand);
  const hoed = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 14), zwart); hoed.position.y = 0.42; grp.add(hoed);
  return grp;
}
function maakCadeau() {
  const grp = new THREE.Group(), goudLint = mat('#ffd24a', { metalness: 0.4, roughness: 0.3 });
  grp.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.42), mat('#d8202a')));
  for (const [x, z] of [[0.43, 0.06], [0.06, 0.43]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(x, 0.35, z), goudLint); grp.add(l); }
  for (const sx of [-1, 1]) { const strik = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 6, 12), goudLint); strik.position.set(sx * 0.05, 0.2, 0); strik.rotation.set(0, Math.PI / 2, sx * 0.6); grp.add(strik); }
  return grp;
}
function maakRendier() {
  const grp = new THREE.Group(), bruin = mat('#8a5a30'), licht = mat('#c89a6a'), zwart = new THREE.MeshBasicMaterial({ color: '#111' });
  const lijf = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), bruin); lijf.scale.set(1.4, 0.8, 0.8); lijf.position.y = 0.02; grp.add(lijf);
  const kop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), bruin); kop.position.set(0.26, 0.17, 0); grp.add(kop);
  const snuit = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), licht); snuit.position.set(0.34, 0.14, 0); grp.add(snuit);
  const neus = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), zwart); neus.position.set(0.39, 0.15, 0); grp.add(neus);
  for (const sz of [-1, 1]) {
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), zwart); o.position.set(0.3, 0.21, sz * 0.06); grp.add(o);
    const gewei = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.18, 5), licht); gewei.position.set(0.22, 0.32, sz * 0.06); gewei.rotation.x = sz * 0.4; grp.add(gewei);
    const tak = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.09, 5), licht); tak.position.set(0.26, 0.36, sz * 0.1); tak.rotation.set(sz * 0.9, 0, -0.6); grp.add(tak);
    for (const dx of [-0.15, 0.15]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.2, 6), bruin); p.position.set(dx, -0.17, sz * 0.08); grp.add(p); }
  }
  return grp;
}
function maakKerstbal() {
  const grp = new THREE.Group();
  const bal = new THREE.Mesh(new THREE.SphereGeometry(0.22, 22, 16), sieraad('#e8202a', { metalness: 0.7, roughness: 0.12 })); bal.position.y = -0.04; grp.add(bal);
  const dop = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 10), sieraad('#ffd24a')); dop.position.y = 0.19; grp.add(dop);
  const oog = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 6, 10), sieraad('#ffd24a')); oog.position.y = 0.23; grp.add(oog);
  return grp;
}
// sneeuwpop: de tafel bevriest even (ijsblauw)
function vries(sec) { vriesT = sec; KM.tafel.emissive.set(sec > 0 ? '#3a6a8a' : '#000000'); if (sec > 0) snd(2400, 0.5, 'sine', 0.03, 1200); }
// cadeautje: munten, een gebakje of… een zak kolen
function cadeauUitpakken() {
  setTimeout(() => {
    const r = Math.random();
    if (r < 0.4) { verdien(15, innerWidth / 2, innerHeight * 0.35); roep('Er zitten 15 munten in!'); sBadge(); }
    else if (r < 0.75) { const i = Math.floor(Math.random() * 5); coll[i]++; roep('Een ' + TREATS[i].n.toLowerCase() + '!'); sPrize(); tekenHud(true); }
    else { roep('Een zak kolen…'); setTimeout(() => pop('Was je wel lief dit jaar?', innerWidth / 2, innerHeight * 0.42, 'goud grap'), 700); snd(110, 0.5, 'sawtooth', 0.05, 70); }
  }, 1500);
}
// rendier: trekt een slee van achter naar voren over de tafel, met belletjes
function sleeRit() {
  const grp = new THREE.Group(), r = maakRendier(); r.scale.setScalar(1.6); r.rotation.y = -Math.PI / 2; grp.add(r);
  const slee = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.6), mat('#c82020')); slee.position.set(0, -0.05, -0.75); grp.add(slee);
  const lading = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.35), mat('#2a8a3a')); lading.position.set(0, 0.2, -0.8); grp.add(lading);
  scene.add(grp); const x = (Math.random() - 0.5) * (HB - 0.6);
  effecten.push({ stap: (t, dt) => {
    const z = -2 + t * 2.2; grp.position.set(x, 0.55 + Math.abs(Math.sin(t * 9)) * 0.06, z);
    for (const c of koekjes) { const p = c.body.position; if (Math.abs(p.x - x) < 0.8 && p.z < z + 0.4 && p.z > z - 1.2 && p.y > -0.2) { c.body.wakeUp(); c.body.velocity.z = Math.max(c.body.velocity.z, 2.4); } }
    if (Math.floor(t * 5) != Math.floor((t - dt) * 5)) snd(2600 + Math.random() * 600, 0.15, 'triangle', 0.03, 0);
    if (t > 2.8) { scene.remove(grp); return false; }
  } });
}

// bakkerij: taart, deegroller en muisje
function maakTaart() {
  const grp = new THREE.Group();
  const onder = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 24), mat('#fff4e0')); onder.position.y = -0.1; grp.add(onder);
  const glazuur = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.39, 0.06, 24), mat('#ff8ac0')); glazuur.position.y = 0.03; grp.add(glazuur);
  for (let i = 0; i < 3; i++) { const a = i * 2.1, k = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), mat(['#5ab8ff', '#ffd84a', '#8aff7a'][i])); k.position.set(Math.cos(a) * 0.16, 0.13, Math.sin(a) * 0.16); grp.add(k);
    const vlam = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffb030' })); vlam.scale.y = 1.6; vlam.position.set(Math.cos(a) * 0.16, 0.23, Math.sin(a) * 0.16); grp.add(vlam); }
  for (let i = 0; i < 10; i++) { const a = i * 0.63, b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), mat('#ffffff')); b.position.set(Math.cos(a) * 0.34, 0.07, Math.sin(a) * 0.34); grp.add(b); }
  return grp;
}
function maakDeegroller() {
  const grp = new THREE.Group(), hout = mat('#d8a868', { roughness: 0.7 });
  const rol = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 14), hout); rol.rotation.z = Math.PI / 2; grp.add(rol);
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), mat('#a8743a')); h.rotation.z = Math.PI / 2; h.position.x = s * 0.32; grp.add(h); }
  return grp;
}
function maakMuis() {
  const grp = new THREE.Group(), grijs = mat('#9a9aa6'), roze = mat('#ffa0b8'), zwart = new THREE.MeshBasicMaterial({ color: '#111' });
  const lijf = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), grijs); lijf.scale.set(1.5, 0.8, 0.9); grp.add(lijf);
  const kop = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 10), grijs); kop.rotation.z = -Math.PI / 2; kop.position.set(0.24, 0.02, 0); grp.add(kop);
  for (const sz of [-1, 1]) { const oor = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), roze); oor.scale.z = 0.3; oor.position.set(0.18, 0.1, sz * 0.06); oor.rotation.y = Math.PI / 2; grp.add(oor); const o = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 5), zwart); o.position.set(0.26, 0.06, sz * 0.035); grp.add(o); }
  const neus = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 5), roze); neus.position.set(0.32, 0.02, 0); grp.add(neus);
  const staart = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.01, 5, 12, Math.PI), roze); staart.position.set(-0.27, 0.02, 0); staart.rotation.x = Math.PI / 2; grp.add(staart);
  return grp;
}
// iets groots rolt van achter naar voren over de hele tafelbreedte (deegroller)
function rolOver(m, schaal) {
  m.scale.setScalar(schaal); scene.add(m);
  effecten.push({ stap: (t) => {
    const z = -1.8 + t * 1.8; m.position.set(0, 0.25, z); m.rotation.x = -t * 6;
    for (const c of koekjes) { const p = c.body.position; if (Math.abs(p.z - z) < 0.45 && p.y > -0.2) { c.body.wakeUp(); c.body.velocity.z = Math.max(c.body.velocity.z, 2.6); } }
    if (t > 2.8) { scene.remove(m); return false; }
  } });
}
// muisje: rent over de tafel, pikt 3 koekjes en laat munten achter
function muisRoof() {
  const m = maakMuis(); m.scale.setScalar(1.6); scene.add(m);
  const prooi = koekjes.filter((k) => k.code < 10 && !k.geteld && k.body.position.y > -0.2 && k.body.position.z > 0.5).sort(() => Math.random() - 0.5).slice(0, 3);
  let n = 0; setTimeout(() => verdien(5, innerWidth / 2, innerHeight * 0.35), 1800);
  effecten.push({ stap: (t, dt) => {
    const x = -HB - 0.6 + t * (2 * HB + 1.2) / 2.4; m.position.set(x, 0.32, 1.5 + Math.sin(t * 7) * 0.3); m.rotation.y = 0;
    while (n < prooi.length && x > prooi[n].body.position.x) { const k = prooi[n++]; if (koekjes.includes(k)) { weg(k); snd(1600, 0.05, 'square', 0.03, 2200); } }
    if (Math.floor(t * 8) != Math.floor((t - dt) * 8)) snd(3000, 0.02, 'square', 0.015);
    if (t > 2.4) { scene.remove(m); return false; }
  } });
}

// ruimte: ufo, meteoriet en alien
function maakUfo() {
  const grp = new THREE.Group();
  const schotel = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 10), sieraad('#c8d0dc', { roughness: 0.25 })); schotel.scale.y = 0.25; grp.add(schotel);
  const koepel = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#7ae8ff', transparent: true, opacity: 0.7, emissive: '#1a4a5a' })); koepel.position.y = 0.06; grp.add(koepel);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, l = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), new THREE.MeshBasicMaterial({ color: ['#ff5a5a', '#ffd84a', '#5aff8a'][i % 3] })); l.position.set(Math.cos(a) * 0.33, -0.02, Math.sin(a) * 0.33); grp.add(l); }
  return grp;
}
function maakMeteoriet() {
  const g = new THREE.IcosahedronGeometry(0.3, 1), pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) { const f = 0.82 + Math.sin(pos.getX(i) * 19 + pos.getY(i) * 7) * 0.12; pos.setXYZ(i, pos.getX(i) * f, pos.getY(i) * f, pos.getZ(i) * f); }
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat('#5a4a44', { roughness: 0.95, flatShading: true, emissive: '#3a0a00' }));
}
function maakAlien() {
  const grp = new THREE.Group(), groen = mat('#7aff6a', { roughness: 0.5 }), zwart = mat('#0a0a10', { roughness: 0.1 });
  const lijf = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.14, 4, 10), groen); lijf.position.y = -0.12; grp.add(lijf);
  const kop = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), groen); kop.scale.set(1, 1.15, 0.9); kop.position.y = 0.12; grp.add(kop);
  for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), zwart); o.scale.set(1, 0.6, 0.5); o.rotation.z = sx * 0.4; o.position.set(sx * 0.07, 0.14, 0.13); grp.add(o);
    const spriet = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 5), groen); spriet.position.set(sx * 0.06, 0.33, 0); spriet.rotation.z = -sx * 0.3; grp.add(spriet);
    const bol = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffef5a' })); bol.position.set(sx * 0.08, 0.39, 0); grp.add(bol); }
  return grp;
}
// ufo: zweeft boven de tafel en straalt 3 koekjes op naar de opvangbak
function ufoStraal() {
  const u = maakUfo(); u.scale.setScalar(2); scene.add(u);
  const straal = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.6, 2, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#9aff9a', transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false })); scene.add(straal);
  const prooi = koekjes.filter((k) => !k.geteld && k.body.position.y > -0.2 && k.code < 100).sort((a, b) => a.body.position.z - b.body.position.z).slice(0, 3);
  effecten.push({ stap: (t) => {
    const x = Math.sin(t * 1.4) * 0.8; u.position.set(x, 2.2, 1); u.rotation.y = t * 3; straal.position.set(x, 1.1, 1); straal.visible = t > 0.4 && t < 2.6;
    if (t > 0.5 && t < 2.5) { const f = (t - 0.5) / 2; prooi.forEach((k, i) => { if (!koekjes.includes(k)) return; const b = k.body; b.velocity.set(0, 0, 0); b.angularVelocity.set(0, 3, 0); b.position.set(b.position.x + (x - b.position.x) * 0.05, Math.min(1.9, b.position.y + 0.04), b.position.z + (1 - b.position.z) * 0.05); }); }
    if (t > 2.5 && !u.userData.klaar) { u.userData.klaar = true; prooi.forEach((k, i) => { if (koekjes.includes(k)) { k.body.position.set(-0.6 + i * 0.6, 0.4, VOOR + 0.5); k.body.velocity.set(0, -2, 0); } }); snd(1200, 0.4, 'sine', 0.05, 300); }
    if (t > 3) { scene.remove(u); scene.remove(straal); return false; }
  } });
  snd(400, 1.5, 'sine', 0.03, 1600);
}
// meteoriet: een vuurbal slaat in midden op de tafel
function inslag() {
  const m = maakMeteoriet(); m.scale.setScalar(1.8); scene.add(m);
  const vuur = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), new THREE.MeshBasicMaterial({ color: '#ff8a1a', transparent: true, opacity: 0.6 })); scene.add(vuur);
  const doel = new THREE.Vector3((Math.random() - 0.5) * HB, 0.2, 1.4); let geknald = false;
  effecten.push({ stap: (t) => {
    const f = Math.min(1, t / 0.9); m.position.set(doel.x + (1 - f) * 3, doel.y + (1 - f) * 6, doel.z - (1 - f) * 2); m.rotation.x += 0.2; vuur.position.copy(m.position); vuur.scale.setScalar(geknald ? 1 + (t - 0.9) * 6 : 0.8); vuur.material.opacity = geknald ? Math.max(0, 0.7 - (t - 0.9) * 1.2) : 0.6;
    if (f >= 1 && !geknald) { geknald = true; scene.remove(m); ruisKnal(); snd(60, 0.8, 'sawtooth', 0.1, 30);
      for (const c of koekjes) { const p = c.body.position, dx = p.x - doel.x, dz = p.z - doel.z, d = Math.hypot(dx, dz) + 0.3; if (d < 2.5 && p.y > -0.3) { c.body.wakeUp(); c.body.velocity.x += dx / d * 3; c.body.velocity.z += dz / d * 3 + 1.5; c.body.velocity.y += 4 / d; } } }
    if (t > 1.6) { scene.remove(vuur); return false; }
  } });
}

// drakenburcht (25.000 munten): drakenei, draak, schatkist en toverkristal
function maakDrakenei() {
  const grp = new THREE.Group();
  const ei = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), new THREE.MeshStandardMaterial({ color: '#3a8a4a', roughness: 0.35, metalness: 0.3, envMap: glans(), emissive: '#0a2a10' })); ei.scale.set(1, 1.35, 1); grp.add(ei);
  for (let i = 0; i < 12; i++) { const a = i * 2.4, y = -0.18 + (i % 6) * 0.07, v = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), sieraad('#ffd24a')); v.position.set(Math.cos(a) * 0.19 * Math.cos(y * 2), y, Math.sin(a) * 0.19 * Math.cos(y * 2)); grp.add(v); }
  return grp;
}
function maakDraakje(groot) {
  const grp = new THREE.Group(), rood = mat('#c8281a', { roughness: 0.45, emissive: '#2a0400' }), goudM = sieraad('#ffcc3a'), zwart = new THREE.MeshBasicMaterial({ color: '#ffef5a' });
  const lijf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), rood); lijf.scale.set(1.5, 0.9, 0.9); grp.add(lijf);
  const nek = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.2, 8), rood); nek.position.set(0.2, 0.12, 0); nek.rotation.z = -0.8; grp.add(nek);
  const kop = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), rood); kop.scale.set(1.5, 0.9, 1); kop.position.set(0.3, 0.2, 0); grp.add(kop);
  for (const sz of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 5), zwart); o.position.set(0.34, 0.24, sz * 0.05); grp.add(o);
    const hoorn = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.09, 6), goudM); hoorn.position.set(0.27, 0.29, sz * 0.04); hoorn.rotation.z = 0.5; grp.add(hoorn);
    const vleugel = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.04, 3), rood); vleugel.scale.set(1.4, 1, 1); vleugel.position.set(-0.02, 0.14, sz * 0.18); vleugel.rotation.set(sz * 0.6, 0, 0); vleugel.name = 'vleugel'; grp.add(vleugel); }
  const staart = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.32, 8), rood); staart.position.set(-0.3, 0, 0); staart.rotation.z = Math.PI / 2 + 0.2; grp.add(staart);
  return grp;
}
function maakSchatkist() {
  const grp = new THREE.Group(), hout = mat('#7a4a22', { roughness: 0.7 }), goudM = sieraad('#ffcc3a');
  const bak = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.26, 0.34), hout); bak.position.y = -0.06; grp.add(bak);
  const deksel = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.5, 14, 1, false, 0, Math.PI), hout); deksel.rotation.z = Math.PI / 2; deksel.rotation.y = Math.PI / 2; deksel.position.y = 0.07; grp.add(deksel);
  for (const x of [-0.18, 0.18]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.36), goudM); b.position.set(x, -0.05, 0); grp.add(b); }
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), goudM); slot.position.set(0, 0.04, 0.18); grp.add(slot);
  return grp;
}
function maakKristal() {
  const m = new THREE.MeshStandardMaterial({ color: '#c06aff', metalness: 0.3, roughness: 0.05, envMap: glans(), emissive: '#3a0a5a', flatShading: true, transparent: true, opacity: 0.9 });
  const grp = new THREE.Group(); const k = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), m); k.scale.y = 1.6; grp.add(k);
  for (const [x, z, s] of [[0.12, 0.05, 0.5], [-0.1, -0.06, 0.6]]) { const kk = new THREE.Mesh(new THREE.OctahedronGeometry(0.18 * s), m); kk.scale.y = 1.6; kk.position.set(x, -0.1, z); kk.rotation.z = x * 3; grp.add(kk); }
  return grp;
}
// babydraakje: fladdert over de tafel en laat 6 gouden koekjes vallen
function babyDraak() {
  const d = maakDraakje(); d.scale.setScalar(1.5); scene.add(d); let n = 0;
  const plekken = [-0.8, -0.5, -0.2, 0.2, 0.5, 0.8].map((f) => f * (HB - 0.6));
  effecten.push({ stap: (t) => {
    const x = -HB - 1 + t * (2 * HB + 2) / 2.6; d.position.set(x, 1.8 + Math.sin(t * 8) * 0.12, VAL_Z + 0.2);
    d.children.filter((c) => c.name == 'vleugel').forEach((v, i) => { v.rotation.x = (i ? 1 : -1) * (0.6 + Math.sin(t * 25) * 0.5); });
    while (n < plekken.length && x > plekken[n]) laatVallen(plekken[n++], true, 3);
    if (t > 2.6) { scene.remove(d); return false; }
  } });
  snd(1400, 0.2, 'square', 0.03, 2000);
}
// grote draak: vliegt over de tafel, spuwt vuur en alle gewone koekjes worden goud
function drakenvuur() {
  const d = maakDraakje(); d.scale.setScalar(4.5); d.rotation.y = -Math.PI / 2; scene.add(d);
  const vuur = [], vm = new THREE.MeshBasicMaterial({ color: '#ff7a1a', transparent: true, opacity: 0.8, depthWrite: false });
  let goud = false;
  effecten.push({ stap: (t, dt) => {
    const z = -3 + t * 2.4; d.position.set(Math.sin(t * 1.5) * 0.6, 3.2, z);
    d.children.filter((c) => c.name == 'vleugel').forEach((v, i) => { v.rotation.x = (i ? 1 : -1) * (0.6 + Math.sin(t * 9) * 0.6); });
    if (t > 0.6 && t < 2.4 && Math.random() < 0.7) { const v = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.15, 8, 6), vm); v.position.set(d.position.x, 2.6, z + 1.2); v.userData.v = new THREE.Vector3((Math.random() - 0.5) * 1.5, -4 - Math.random() * 2, 1 + Math.random()); scene.add(v); vuur.push(v); }
    for (const v of [...vuur]) { v.position.addScaledVector(v.userData.v, dt); v.scale.multiplyScalar(1 + dt * 1.5); if (v.position.y < 0.1) { scene.remove(v); vuur.splice(vuur.indexOf(v), 1); } }
    if (Math.random() < 0.3) ruisKnal();
    if (!goud && t > 1.5) { goud = true; let n = 0; for (const k of koekjes) if (k.code <= 2 && !k.geteld) { k.code = 3; k.mesh.material = materialen(3)[1]; n++; } roep(n + ' koekjes van goud!'); sBadge(); }
    if (t > 3.2) { scene.remove(d); vuur.forEach((v) => scene.remove(v)); return false; }
  } });
  snd(80, 2, 'sawtooth', 0.06, 50);
}

// snoepland: gummibeer, chocoladefontein, lolly en zuurstok
function maakGummibeer() {
  const grp = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: '#ff2a4a', roughness: 0.15, transparent: true, opacity: 0.85, emissive: '#4a0010' });
  const lijf = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), m); lijf.scale.set(1, 1.2, 0.8); lijf.position.y = -0.06; grp.add(lijf);
  const kop = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), m); kop.position.y = 0.16; grp.add(kop);
  for (const sx of [-1, 1]) { const oor = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), m); oor.position.set(sx * 0.08, 0.25, 0); grp.add(oor);
    const arm = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), m); arm.position.set(sx * 0.14, 0.0, 0.03); grp.add(arm); const been = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), m); been.position.set(sx * 0.08, -0.2, 0.03); grp.add(been); }
  return grp;
}
function maakFontein() {
  const grp = new THREE.Group(), choc = mat('#5a3018', { roughness: 0.25 }), zilver = sieraad('#d8d8e0');
  [[0.28, -0.22], [0.2, -0.05], [0.12, 0.1]].forEach(([r, y]) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, 0.05, 20), zilver); s.position.y = y; grp.add(s); const c = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.95, r * 0.95, 0.03, 20), choc); c.position.y = y + 0.03; grp.add(c); });
  const paal = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), zilver); grp.add(paal);
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), choc); top.position.y = 0.22; grp.add(top);
  return grp;
}
let lollyTex = null;
function maakLolly() {
  lollyTex = lollyTex || canvasTex((g, w) => { const c = w / 2; g.fillStyle = '#fff'; g.fillRect(0, 0, w, w); g.lineWidth = 18; for (const [k, o] of [['#ff2a6a', 0], ['#3ab8ff', 2.1], ['#ffd84a', 4.2]]) { g.strokeStyle = k; g.beginPath(); for (let a = 0; a < 16; a += 0.1) g.lineTo(c + Math.cos(a + o) * a * 7.5, c + Math.sin(a + o) * a * 7.5); g.stroke(); } });
  const grp = new THREE.Group();
  const schijf = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 28), [mat('#ff8ab8'), new THREE.MeshStandardMaterial({ map: lollyTex, roughness: 0.2 }), new THREE.MeshStandardMaterial({ map: lollyTex, roughness: 0.2 })]); grp.add(schijf);
  const stok = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), mat('#ffffff')); stok.rotation.z = Math.PI / 2; stok.position.x = 0.45; grp.add(stok);
  return grp;
}
let zuurTex = null;
function maakZuurstok() {
  zuurTex = zuurTex || canvasTex((g, w, h) => { for (let i = -8; i < 16; i++) { g.fillStyle = i % 2 ? '#fff' : '#ff2a3a'; g.beginPath(); g.moveTo(i * 24, 0); g.lineTo(i * 24 + 24, 0); g.lineTo(i * 24 + 64, h); g.lineTo(i * 24 + 40, h); g.fill(); } }, 256, 32);
  zuurTex.wrapS = THREE.RepeatWrapping; zuurTex.repeat.set(3, 1);
  const grp = new THREE.Group(), m = new THREE.MeshStandardMaterial({ map: zuurTex, roughness: 0.3 });
  const stok = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 12), m); stok.rotation.z = Math.PI / 2; stok.position.x = -0.05; grp.add(stok);
  const haak = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.05, 10, 16, Math.PI), m); haak.position.set(0.25, 0, -0.12); haak.rotation.x = -Math.PI / 2; grp.add(haak);
  return grp;
}
// lolly: alle koekjes draaien even rond (en schuiven daarbij naar voren)
function draaikolk() {
  const mid = new THREE.Vector3(0, 0, 1.4); snd(300, 1.5, 'sine', 0.04, 900);
  effecten.push({ stap: (t) => {
    if (Math.floor(t * 6) != Math.floor((t - 1 / 60) * 6)) for (const c of koekjes) { const p = c.body.position; if (p.y < -0.2) continue; const dx = p.x - mid.x, dz = p.z - mid.z; c.body.wakeUp(); c.body.velocity.x += -dz * 0.9; c.body.velocity.z += dx * 0.9 + 0.5; c.body.angularVelocity.y += 2; }
    if (t > 2.5) return false;
  } });
}
// zuurstok: veegt van links naar rechts langs de voorkant en duwt koekjes over de rand
function zuurstokVeeg() {
  const z = maakZuurstok(); z.scale.setScalar(2.4); z.rotation.y = Math.PI / 2; scene.add(z);
  effecten.push({ stap: (t) => {
    const x = -HB - 0.8 + t * (2 * HB + 1.6) / 1.6; z.position.set(x, 0.35, VOOR - 0.9);
    for (const c of koekjes) { const p = c.body.position; if (Math.abs(p.x - x) < 0.5 && p.z > VOOR - 1.6 && p.y > -0.2) { c.body.wakeUp(); c.body.velocity.z = Math.max(c.body.velocity.z, 3); c.body.velocity.x += 0.5; } }
    if (t > 1.6) { scene.remove(z); return false; }
  } });
  snd(900, 0.4, 'sawtooth', 0.03, 300);
}

// dino-eiland: T-rex, dino-ei, vulkaan en fossiel
function maakTrex() {
  const grp = new THREE.Group(), groen = mat('#4a9a3a', { roughness: 0.6 }), wit = new THREE.MeshBasicMaterial({ color: '#fff' }), zwart = new THREE.MeshBasicMaterial({ color: '#111' });
  const lijf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), groen); lijf.scale.set(1.3, 1.1, 0.9); lijf.position.y = -0.02; lijf.rotation.z = 0.4; grp.add(lijf);
  const kop = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.13, 0.13), groen); kop.position.set(0.14, 0.2, 0); grp.add(kop);
  for (const sz of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), zwart); o.position.set(0.18, 0.25, sz * 0.066); grp.add(o);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.07, 5), groen); arm.position.set(0.12, 0.02, sz * 0.09); arm.rotation.z = 1; grp.add(arm); // piepkleine armpjes
    const been = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.18, 8), groen); been.position.set(-0.02, -0.18, sz * 0.08); grp.add(been); }
  for (let i = 0; i < 4; i++) { const tand = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.03, 4), wit); tand.rotation.x = Math.PI; tand.position.set(0.12 + i * 0.03, 0.135, 0.06); grp.add(tand); }
  const staart = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.36, 8), groen); staart.position.set(-0.27, -0.06, 0); staart.rotation.z = Math.PI / 2 + 0.25; grp.add(staart);
  return grp;
}
function maakDinoEi() {
  const grp = new THREE.Group(), ei = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), mat('#f4ecd8', { roughness: 0.5 })); ei.scale.y = 1.3; grp.add(ei);
  for (let i = 0; i < 14; i++) { const a = i * 2.3, y = -0.16 + (i % 7) * 0.05, v = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 5), mat('#8a6a3a')); v.position.set(Math.cos(a) * 0.175 * Math.cos(y * 2.2), y, Math.sin(a) * 0.175 * Math.cos(y * 2.2)); grp.add(v); }
  return grp;
}
function maakVulkaan() {
  const grp = new THREE.Group();
  const berg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.38, 0.34, 12), mat('#6a4a3a', { roughness: 0.9, flatShading: true })); grp.add(berg);
  const lava = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 12), new THREE.MeshBasicMaterial({ color: '#ff5a1a' })); lava.position.y = 0.17; grp.add(lava);
  for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.02), new THREE.MeshBasicMaterial({ color: '#ff7a1a' })); const a = i * 2.1; s.position.set(Math.cos(a) * 0.15, 0.08, Math.sin(a) * 0.15); s.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); grp.add(s); }
  return grp;
}
function maakFossiel() {
  const grp = new THREE.Group(), bot = mat('#f2ead2', { roughness: 0.8 });
  const stuk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 10), bot); stuk.rotation.z = Math.PI / 2; grp.add(stuk);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), bot); k.position.set(sx * 0.26, 0, sz * 0.05); grp.add(k); }
  return grp;
}
// T-rex: aardbeving, de tafel trilt en alle koekjes springen rommelig naar voren
function aardbeving() {
  wiebelT = Math.max(wiebelT, 2.5); snd(50, 2, 'sawtooth', 0.09, 35); ruisKnal();
  effecten.push({ stap: (t) => {
    if (Math.floor(t * 5) != Math.floor((t - 1 / 60) * 5)) for (const c of koekjes) if (c.body.position.y > -0.2) { c.body.wakeUp(); c.body.velocity.x += (Math.random() - 0.5) * 2; c.body.velocity.z += 0.4 + Math.random() * 1.2; c.body.velocity.y += 1 + Math.random(); }
    if (t > 2.4) return false;
  } });
}
// babydino: waggelt van achter naar voren en duwt koekjes mee
function babyDino() {
  const d = maakTrex(); d.scale.setScalar(1.4); d.rotation.y = -Math.PI / 2; scene.add(d); const x = (Math.random() - 0.5) * (HB - 0.6);
  effecten.push({ stap: (t, dt) => {
    const z = -1.6 + t * 1.6; d.position.set(x + Math.sin(t * 8) * 0.1, 0.4 + Math.abs(Math.sin(t * 8)) * 0.05, z); d.rotation.z = Math.sin(t * 8) * 0.12;
    for (const c of koekjes) { const p = c.body.position; if (Math.abs(p.x - x) < 0.55 && Math.abs(p.z - z - 0.3) < 0.4 && p.y > -0.2) { c.body.wakeUp(); c.body.velocity.z = Math.max(c.body.velocity.z, 2.2); } }
    if (Math.floor(t * 3) != Math.floor((t - dt) * 3)) snd(500, 0.12, 'square', 0.03, 700);
    if (t > 3) { scene.remove(d); return false; }
  } });
}
// vulkaan: er vallen 15 koekjes uit de lucht (soms een gouden)
function uitbarsting() {
  ruisKnal(); snd(70, 1.2, 'sawtooth', 0.08, 40);
  for (let i = 0; i < 15; i++) setTimeout(() => laatVallen((Math.random() - 0.5) * (HB * 2 - 1.2), true, Math.random() < 0.2 ? 3 : randCookie()), 200 + i * 110);
}

// onderwaterwereld: octopus, haai, schelp en duikboot
function maakOctopus() {
  const grp = new THREE.Group(), paars = mat('#b05ad8', { roughness: 0.4 }), wit = new THREE.MeshBasicMaterial({ color: '#fff' }), zwart = new THREE.MeshBasicMaterial({ color: '#111' });
  const kop = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), paars); kop.scale.y = 1.2; kop.position.y = 0.06; grp.add(kop);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, arm = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.3, 6), paars); arm.position.set(Math.cos(a) * 0.17, -0.14, Math.sin(a) * 0.17); arm.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2); arm.rotateX(Math.PI); grp.add(arm); }
  for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), wit); o.position.set(sx * 0.07, 0.08, 0.15); grp.add(o); const pu = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 5), zwart); pu.position.set(sx * 0.07, 0.08, 0.185); grp.add(pu); }
  return grp;
}
function maakHaai() {
  const grp = new THREE.Group(), grijs = mat('#7a8a9a', { roughness: 0.4 }), wit = mat('#f0f4f8'), zwart = new THREE.MeshBasicMaterial({ color: '#111' });
  const lijf = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 10), grijs); lijf.scale.set(2.2, 0.8, 0.8); grp.add(lijf);
  const buik = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 8), wit); buik.scale.set(2, 0.6, 0.75); buik.position.y = -0.04; grp.add(buik);
  const vin = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 4), grijs); vin.position.set(0, 0.17, 0); vin.scale.z = 0.3; grp.add(vin);
  const staart = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.18, 4), grijs); staart.position.set(-0.36, 0.02, 0); staart.rotation.z = Math.PI / 2; staart.scale.z = 0.3; grp.add(staart);
  for (const sz of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), zwart); o.position.set(0.24, 0.04, sz * 0.08); grp.add(o); }
  return grp;
}
function maakSchelp() {
  const grp = new THREE.Group(), roze = mat('#ffc0d0', { roughness: 0.5 });
  const onder = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), roze); onder.scale.y = 0.35; grp.add(onder);
  const boven = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), roze); boven.scale.y = 0.3; boven.position.set(0, 0.03, -0.08); boven.rotation.x = -0.5; grp.add(boven);
  const parel = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), new THREE.MeshStandardMaterial({ color: '#fbf6ff', roughness: 0.15, metalness: 0.1, envMap: glans(), envMapIntensity: 1.5 })); parel.position.set(0, 0.03, 0.06); grp.add(parel);
  return grp;
}
function maakDuikboot() {
  const grp = new THREE.Group(), geel = mat('#ffd02a', { roughness: 0.4 }), raam = new THREE.MeshStandardMaterial({ color: '#7ae8ff', emissive: '#1a5a6a' });
  const romp = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.34, 6, 14), geel); romp.rotation.z = Math.PI / 2; grp.add(romp);
  const toren = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.09), geel); toren.position.set(0.02, 0.15, 0); grp.add(toren);
  const kijker = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6), mat('#888')); kijker.position.set(0.05, 0.26, 0); grp.add(kijker);
  for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12), raam); r.rotation.x = Math.PI / 2; r.position.set(-0.12 + i * 0.12, 0, 0.12); grp.add(r); }
  const schroef = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.03), mat('#888')); schroef.position.set(-0.3, 0, 0); grp.add(schroef);
  return grp;
}
// octopus (en anderen): pakt een paar koekjes van de tafel en zet ze in de opvangbak
function grijp(n, m) {
  m.scale.setScalar(2.2); scene.add(m);
  const prooi = koekjes.filter((k) => !k.geteld && k.body.position.y > -0.2 && k.code < 100).sort((a, b) => b.body.position.z - a.body.position.z).slice(0, n);
  effecten.push({ stap: (t) => {
    m.position.set(Math.sin(t * 2) * 0.6, 1.9 + Math.sin(t * 5) * 0.1, 1.3); m.rotation.y = t;
    if (t > 0.4 && t < 1.8) prooi.forEach((k) => { if (!koekjes.includes(k)) return; const b = k.body; b.velocity.set(0, 0, 0); b.position.set(b.position.x + (m.position.x - b.position.x) * 0.06, Math.min(1.5, b.position.y + 0.04), b.position.z + (1.3 - b.position.z) * 0.06); });
    if (t > 1.8 && !m.userData.klaar) { m.userData.klaar = true; prooi.forEach((k, i) => { if (koekjes.includes(k)) { k.body.position.set(-0.8 + i * 0.4, 0.4, VOOR + 0.5); k.body.velocity.set(0, -2, 0); } }); snd(700, 0.3, 'sine', 0.05, 300); }
    if (t > 2.4) { scene.remove(m); return false; }
  } });
}
// haai: zwemt over de tafel en hapt 4 koekjes weg, maar laat een tand (munten) achter
function haaiHap() {
  const h = maakHaai(); h.scale.setScalar(2.4); scene.add(h); let n = 0;
  const prooi = koekjes.filter((k) => k.code < 10 && !k.geteld && k.body.position.y > -0.2).sort(() => Math.random() - 0.5).slice(0, 4).sort((a, b) => a.body.position.x - b.body.position.x);
  [0, 0.5, 0.9, 1.2].forEach((d, i) => snd(i % 2 ? 98 : 104, 0.3, 'sawtooth', 0.05, 0, d)); // dun-dun
  setTimeout(() => verdien(15, innerWidth / 2, innerHeight * 0.35), 2200);
  effecten.push({ stap: (t) => {
    const x = -HB - 1 + t * (2 * HB + 2) / 2.6; h.position.set(x, 0.55, 1.4 + Math.sin(t * 3) * 0.4); h.rotation.y = Math.sin(t * 6) * 0.15;
    while (n < prooi.length && x > prooi[n].body.position.x) { const k = prooi[n++]; if (koekjes.includes(k)) { weg(k); snd(160, 0.08, 'square', 0.06, 80); } }
    if (t > 2.6) { scene.remove(h); return false; }
  } });
}
// duikboot: sonar-golven die de koekjes naar voren duwen
function sonar() {
  for (let i = 0; i < 3; i++) setTimeout(() => {
    snd(1400, 0.6, 'sine', 0.05, 1350);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 6, 32), new THREE.MeshBasicMaterial({ color: '#8affff', transparent: true, opacity: 0.7 })); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.3, -1.5); scene.add(ring);
    effecten.push({ stap: (t) => { ring.scale.setScalar(1 + t * 6); ring.material.opacity = Math.max(0, 0.7 - t * 0.6); const r = 0.3 * (1 + t * 6);
      for (const c of koekjes) { const p = c.body.position, d = Math.hypot(p.x, p.z + 1.5); if (Math.abs(d - r) < 0.25 && p.y > -0.2) { c.body.wakeUp(); c.body.velocity.z = Math.max(c.body.velocity.z, 1.8); } }
      if (t > 1.2) { scene.remove(ring); return false; } } });
  }, i * 600);
}

// figuren springen na het winnen uit de bak omhoog (het likkoekje extra groot, recht naar je toe)
const springers = [];
function tekenSpringers(dt) {
  for (const s of [...springers]) {
    if (!s.mesh) { s.mesh = new THREE.Mesh(koekGeo(s.code), materialen(s.code)[1]); scene.add(s.mesh); }
    s.t += dt;
    const f = Math.min(1, s.t / 0.9), hoog = s.groot ? 4.2 : 2.6;
    s.mesh.position.set(s.x * (1 - f), -0.6 + Math.sin(f * Math.PI * 0.5) * hoog + (s.t > 0.9 ? Math.abs(Math.sin(s.t * 6)) * 0.25 : 0), VOOR + 0.6 + f * (s.groot ? 2.2 : 1));
    s.mesh.rotation.set(Math.PI / 2.4, s.t * 5, 0);
    s.mesh.scale.setScalar(1 + f * (s.groot ? 2.2 : 1));
    if (s.t > (s.groot ? 2.6 : 1.6)) { scene.remove(s.mesh); springers.splice(springers.indexOf(s), 1); }
  }
}

// ---------- scherm: getallen, krachten, meldingen ----------
function schermPunt(x, y, z) { v3.set(x, y, z).project(camera); return { x: (v3.x + 1) / 2 * innerWidth, y: (1 - v3.y) / 2 * innerHeight }; }
function pop(tekst, x, y, soort = '') { const el = document.createElement('div'); el.className = 'pop ' + soort; el.textContent = tekst; el.style.left = x + 'px'; el.style.top = y + 'px'; $('pops').appendChild(el); setTimeout(() => el.remove(), soort.includes('grap') ? 2700 : 1200); }
function roep(tekst) { const el = document.createElement('div'); el.className = 'roep'; el.textContent = tekst; $('pops').appendChild(el); setTimeout(() => el.remove(), 2300); }
let hudSleutel = '';
function tekenHud(forceer) {
  $('voorraad').textContent = supply; $('punten').textContent = score;
  $('badgetal').textContent = badges.length + '/' + badgeTotaal(); $('munten').textContent = munten + ' 🪙';
  const s = coll.join(',');
  if (!forceer && s == hudSleutel) return; hudSleutel = s;
  $('krachten').innerHTML = TREATS.map((tr, i) => `<button data-k="${i}" class="${coll[i] >= 3 ? 'klaar' : ''}" title="${tr.d}">${tr.p}<i>${'●'.repeat(Math.min(3, coll[i]))}${'○'.repeat(Math.max(0, 3 - coll[i]))}</i><small>${tr.n}</small></button>`).join('');
  $('krachten').querySelectorAll('button').forEach((b) => b.onclick = (e) => { e.stopPropagation(); unlock(); gebruikKracht(+b.dataset.k); });
}
let toastT = 0;
function tekenToast(dt) {
  if (!toastRij.length) { $('toast').hidden = true; return; }
  if (toastT == 0) { sBadge(); $('toast').innerHTML = 'Badge verdiend!<b>' + toastRij[0].n + '</b>+10 🪙'; $('toast').hidden = false; }
  toastT += dt; if (toastT > 2.8) { toastRij.shift(); toastT = 0; }
}
$('badgeknop').onclick = () => {
  $('badgetel').textContent = badges.length + ' van de ' + badgeTotaal() + ' verdiend (koop een tafel in de winkel voor nog meer badges)';
  $('tafelbadges').innerHTML = THEMAS.filter((th) => ITEMS.some((it) => it.thema == th.id)).map((th) => `<h4 class="${gekocht.includes(th.id) ? '' : 'niet'}">${th.n}${gekocht.includes(th.id) ? '' : ' (koop deze tafel in de winkel)'}</h4><div class="tbadges">` +
    ITEMS.filter((it) => it.thema == th.id).map((it) => [['it_' + it.id, badgeNaam(it), 'Win de ' + it.n.toLowerCase()], ['it5_' + it.id, badgeNaam(it, true), 'Win 5 keer de ' + it.n.toLowerCase() + ' (' + Math.min(5, itemsGewonnen[it.id] || 0) + '/5)']].map(([id, n, d]) => `<div class="${badges.includes(id) ? '' : 'niet'}"><b>${badges.includes(id) ? '🏅 ' : ''}${n}</b>${d}</div>`).join('')).join('') + '</div>').join('');
  $('badgelijst').innerHTML = BADGES.map((b) => `<div class="${badges.includes(b.id) ? '' : 'niet'}"><b>${badges.includes(b.id) ? '🏅 ' : ''}${b.n}</b>${b.d}</div>`).join('');
  $('figlijst').innerHTML = KAR.map((k, i) => `<div class="${found[i] ? '' : 'niet'}">${k.n}${found[i] > 1 ? ' <b>×' + found[i] + '</b>' : ''}</div>`).join('');
  const dubbel = found.reduce((a, v) => a + Math.max(0, v - 1), 0);
  $('ruilknop').textContent = dubbel ? `Ruil ${dubbel} dubbele ${dubbel == 1 ? 'figuur' : 'figuren'} voor ${dubbel * 5} 🪙` : 'Geen dubbele figuren om te ruilen';
  $('ruilknop').disabled = !dubbel; $('ruilknop').style.opacity = dubbel ? 1 : 0.5;
  $('badges').hidden = false;
};
// dubbele koekjesfiguren ruilen voor munten (je houdt er van elk één)
$('ruilknop').onclick = () => {
  const dubbel = found.reduce((a, v) => a + Math.max(0, v - 1), 0); if (!dubbel) return;
  found = found.map((v) => Math.min(v, 1)); munten += dubbel * 5; muntenTotaal += dubbel * 5; sPrize(); bewaar(); tekenHud(); $('badgeknop').onclick();
};
// winkel: achtergronden kopen en kiezen
function tekenWinkel() {
  $('wmunten').textContent = munten;
  $('themalijst').innerHTML = THEMAS.map((th) => { const heb = gekocht.includes(th.id);
    return `<div class="${th.id == themaId ? 'gekozen' : ''}"><canvas data-t="${th.id}" width="160" height="100"></canvas><b>${th.n}</b><button data-k="${th.id}" ${th.id == themaId || (!heb && munten < th.prijs) ? 'disabled' : ''}>${th.id == themaId ? 'Gekozen' : heb ? 'Kiezen' : 'Kopen: ' + th.prijs + ' 🪙'}</button></div>`; }).join('');
  $('themalijst').querySelectorAll('canvas').forEach((c) => THEMAS.find((x) => x.id == c.dataset.t).lucht(c.getContext('2d'), 160, 100));
  $('themalijst').querySelectorAll('button').forEach((b) => b.onclick = () => {
    const th = THEMAS.find((x) => x.id == b.dataset.k);
    if (!gekocht.includes(th.id)) { if (munten < th.prijs) return; munten -= th.prijs; gekocht.push(th.id); sBadge(); } else sTik(0.05);
    themaId = th.id; zetThema(themaId); bewaar(); tekenHud(); tekenWinkel();
  });
}
$('muntknop').onclick = () => { unlock(); tekenWinkel(); $('winkel').hidden = false; };
$('winkeldicht').onclick = () => { $('winkel').hidden = true; };
// de terugknop gaat altijd eerst naar het hoofdscherm van de Koekjesschuiver; pas vanuit dat scherm naar alle spellen
document.querySelector('.terug').addEventListener('click', (e) => {
  const open = [...document.querySelectorAll('.scherm')].filter((x) => !x.hidden && x.id != 'menu');
  if (modus == 'menu' && !open.length) return;
  e.preventDefault(); open.forEach((x) => (x.hidden = true));
  if (modus != 'menu') naarMenu(); else tekenMenu();
});

// ---------- online scorebord (zelfde Google Spreadsheet als Fladderfeest, zie extra/scorebord.gs) ----------
// koek3d_punten = beste tafel, koek3d_munten = alle munten ooit verdiend. Gaat vanzelf: alleen met een gekozen naam
// en alleen als het beter is dan wat al ingestuurd is (hooguit eens per minuut, en als je weggaat).
const BORD_URL = 'https://script.google.com/macros/s/AKfycbzo6b4TQRiL2j1ZhEtBa6xpbNcBxmL7IIIB6e1FdYWnswDIxJ1MphWAlAjm12aK_J9U/exec';
const BORDEN = [['koek3d_wedstrijd', 'Beste wedstrijd', 'punten']];
let bord = null, bordTab = BORDEN[0][0];
try { bord = JSON.parse(localStorage.getItem('koekjesschuiver3d_bord')); } catch (e) {}
function bordHalen(extra = '') {
  return fetch(BORD_URL + extra, { redirect: 'follow', keepalive: true }).then((r) => r.json())
    .then((d) => { bord = d; try { localStorage.setItem('koekjesschuiver3d_bord', JSON.stringify(d)); } catch (e) {} return true; }).catch(() => false);
}
// insturen na een wedstrijd: alleen met een gekozen naam en alleen als het beter is dan wat al ingestuurd is
function autoInsturen(klaar) {
  if (!SPELER || TEGEL) return klaar && klaar('Kies je naam op de startpagina om op het scorebord te komen.');
  const stuur = [[BORDEN[0][0], wedBest]].filter(([o, v]) => v > 0 && v > (ingestuurd[o] || 0));
  if (!stuur.length) return klaar && klaar('');
  if (klaar) klaar('Naar het scorebord sturen…');
  for (const [o, v] of stuur) bordHalen('?actie=opslaan&naam=' + encodeURIComponent(SPELER) + '&onderdeel=' + o + '&modus=gewoon&score=' + v).then((ok) => { if (ok) { ingestuurd[o] = Math.max(ingestuurd[o] || 0, v); bewaar(); } if (klaar) klaar(ok ? '🏆 Je record staat op het scorebord!' : 'Scorebord niet bereikbaar (internet?). Volgende keer opnieuw.'); });
}
function tekenBord(melding) {
  $('bordtabs').hidden = BORDEN.length < 2;
  $('bordtabs').innerHTML = BORDEN.map(([o, n]) => `<button data-o="${o}" class="${o == bordTab ? 'aan' : ''}">${n}</button>`).join('');
  $('bordtabs').querySelectorAll('button').forEach((b) => b.onclick = () => { bordTab = b.dataset.o; tekenBord(melding); });
  const rij = (bord && bord[bordTab + '_gewoon']) || [], eenheid = BORDEN.find((x) => x[0] == bordTab)[2];
  $('bordlijst').innerHTML = rij.length ? rij.map((r, i) => `<li class="${r.naam == SPELER ? 'ik' : ''}"><span>${i + 1}. ${r.naam.replace(/[<>&]/g, '')}</span><b>${r.score} ${eenheid}</b></li>`).join('') : '<li>Nog niemand. Wees de eerste!</li>';
  $('bordmelding').textContent = melding || (SPELER ? '' : 'Kies je naam op de startpagina om op het scorebord te komen.');
}
$('bordknop').onclick = () => { $('badges').hidden = true; $('bordscherm').hidden = false; tekenBord('Scores ophalen…'); autoInsturen(); bordHalen().then((ok) => tekenBord(ok ? '' : 'Geen internet: dit zijn de laatst bekende scores.')); };
$('borddicht').onclick = () => { $('bordscherm').hidden = true; };
$('badgesdicht').onclick = () => { $('badges').hidden = true; };
$('nieuwknop').onclick = () => { if (modus == 'wedstrijd' || modus == 'einde') return alert('Dat kan alleen op je eigen tafel, niet tijdens een wedstrijd.'); if (confirm('Nieuwe tafel? Je begint weer met 40 koekjes en 0 punten. Je badges, figuren, munten en achtergronden blijf je houden.')) { $('badges').hidden = true; opnieuw(); } };

// ---------- invoer: mikken met de muis, klikken of tikken om te laten vallen ----------
const ray = new THREE.Raycaster(), muis = new THREE.Vector2(), mikVlak = new THREE.Plane(new THREE.Vector3(0, 0, 1), -VAL_Z), mikPunt = new THREE.Vector3();
const spook = new THREE.Mesh(koekGeo(0), new THREE.MeshStandardMaterial({ color: '#ffe0a0', transparent: true, opacity: 0.35, depthWrite: false }));
scene.add(spook);
function mik(e) {
  muis.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(muis, camera);
  if (ray.ray.intersectPlane(mikVlak, mikPunt)) mikX = Math.max(-HB + KR + 0.08, Math.min(HB - KR - 0.08, mikPunt.x));
}
renderer.domElement.addEventListener('pointermove', mik);
const spelen = () => modus == 'vrij' || modus == 'wedstrijd';
renderer.domElement.addEventListener('pointerdown', (e) => { e.preventDefault(); unlock(); if (!spelen()) return; mik(e); laatVallen(mikX); $('tip').hidden = true; });
addEventListener('keydown', (e) => {
  if (e.code == 'Space') { e.preventDefault(); if (spelen()) laatVallen(mikX); }
  if (e.code == 'ArrowLeft') mikX = Math.max(-HB + KR, mikX - 0.3);
  if (e.code == 'ArrowRight') mikX = Math.min(HB - KR, mikX + 0.3);
  const n = +e.key; if (n >= 1 && n <= 5 && spelen()) gebruikKracht(n - 1);
  if (e.code == 'KeyB') $('badges').hidden ? $('badgeknop').onclick() : ($('badges').hidden = true);
  if (e.code == 'Escape') { $('badges').hidden = true; $('winkel').hidden = true; $('bordscherm').hidden = true; }
});
addEventListener('pagehide', bewaar);
document.addEventListener('visibilitychange', () => { if (document.hidden) bewaar(); });

// ---------- menu en wedstrijd ----------
function tekenMenu() {
  $('menunaam').textContent = SPELER ? 'Speler: ' + SPELER + ' · ' + munten + ' 🪙' : 'Geen naam gekozen (kies die op de startpagina) · ' + munten + ' 🪙';
  $('wedtekst').textContent = wedBest ? 'Je beste wedstrijd: ' + wedBest + ' punten. Telt voor het scorebord.' : 'Wie haalt de meeste punten? Telt voor het scorebord.';
  const mijn = THEMAS.filter((th) => gekocht.includes(th.id)); // alleen tafels die je hebt, de rest koop je in de winkel
  $('tafels').innerHTML = mijn.map((th) => `<button data-t="${th.id}" class="${th.id == themaId ? 'aan' : ''}"><canvas width="160" height="100"></canvas>${th.n}</button>`).join('');
  $('tafels').querySelectorAll('button').forEach((b) => { THEMAS.find((x) => x.id == b.dataset.t).lucht(b.querySelector('canvas').getContext('2d'), 160, 100);
    b.onclick = () => { themaId = b.dataset.t; zetThema(themaId); bewaar(); sTik(0.05); tekenMenu(); }; });
  $('tafeluitleg').textContent = mijn.length < THEMAS.length ? 'Meer tafels koop je met munten in de winkel.' : 'Je hebt ze allemaal!';
}
function naarMenu() {
  bewaar(); // ook munten en badges uit een wedstrijd
  if (modus == 'wedstrijd' || modus == 'einde') terugNaarVrij();
  bewaar(); modus = 'menu'; document.body.classList.add('inmenu'); $('einde').hidden = true; tekenMenu(); $('menu').hidden = false;
}
function speel() { modus = 'vrij'; document.body.classList.remove('inmenu'); $('menu').hidden = true; $('wedlabel').hidden = true; tekenHud(true); pasAan(); }
function startWedstrijd() {
  if (modus == 'vrij' || modus == 'menu') bewaar(); // je eigen tafel staat veilig in de opslag
  for (const k of [...koekjes]) weg(k);
  supply = 50; score = 0; coll = [0, 0, 0, 0, 0]; goldQ = rainQ = rozeQ = 0; glibber(0); vries(0); driesT = 0; laagT = 0; world.gravity.set(0, -22, 0); zetMuurtjes(false); wallT = 0; stilT = 0;
  vulTafel(); modus = 'wedstrijd'; document.body.classList.remove('inmenu'); $('menu').hidden = true; $('einde').hidden = true; $('wedlabel').hidden = false; document.body.classList.add('wed');
  tekenHud(true); pasAan(); roep('Wedstrijd!');
}
function eindeWedstrijd() {
  modus = 'einde'; const nieuw = score > wedBest; if (nieuw) wedBest = score; bewaar();
  $('eindpunten').textContent = score + ' punten';
  $('eindtekst').textContent = nieuw ? 'Nieuw record!' : 'Je beste wedstrijd: ' + wedBest + ' punten';
  $('eindstatus').textContent = ''; autoInsturen((tekst) => { $('eindstatus').textContent = tekst; });
  $('einde').hidden = false; if (nieuw) sBadge(); else sPrize();
}
function terugNaarVrij() { for (const k of [...koekjes]) weg(k); goldQ = rainQ = rozeQ = 0; glibber(0); vries(0); driesT = 0; laagT = 0; world.gravity.set(0, -22, 0); zetMuurtjes(false); wallT = 0; if (!laad()) vulTafel(); $('wedlabel').hidden = true; document.body.classList.remove('wed'); tekenHud(true); }
$('mvrij').onclick = () => { unlock(); speel(); };
$('mwed').onclick = () => { unlock(); startWedstrijd(); };
$('mbord').onclick = () => { unlock(); $('bordknop').onclick(); };
$('mwinkel').onclick = () => { unlock(); $('muntknop').onclick(); };
$('mbadges').onclick = () => { unlock(); $('badgeknop').onclick(); };
$('enog').onclick = () => { unlock(); startWedstrijd(); };
$('emenu').onclick = () => naarMenu();
$('winkeldicht').addEventListener('click', () => { if (modus == 'menu') tekenMenu(); });

// ---------- de lus ----------
if (TEGEL) document.body.classList.add('tegel');
if (TEGEL || !laad()) vulTafel();
zetThema(TEGEL ? 'bakkerij' : themaId);
tekenHud(true); pasAan();
if (!TEGEL) naarMenu();
$('laden').hidden = true;
let tijdOver = 0, vorige = performance.now(), bewaarT = 0, regenT = 0, omvalT = 0;
function stap(dt) {
  t += dt;
  // schuif heen en weer (kinematisch: met snelheid, zodat koekjes echt geduwd worden)
  const z = schuifZ(t);
  schuifBody.velocity.set(0, 0, (z - schuifBody.position.z) / dt);
  world.step(dt, dt, 1);
  schuifBody.position.z = z;
  // koekjesregen en vallende koekjes
  if (rainQ > 0 && (regenT += dt) > 0.09) { regenT = 0; rainQ--; laatVallen((Math.random() - 0.5) * (HB * 2 - 1.2), true); }
  for (const k of [...koekjes]) {
    const p = k.body.position;
    if (!k.geteld && p.y < -0.5) { k.geteld = t; if (p.z > VOOR - 0.3 && Math.abs(p.x) < HB + 0.1) gewonnen(k); else verloren(k); }
    if (p.y < -4 || (k.geteld && t - k.geteld > 2.5)) weg(k); // na een tijdje uit de bak gehaald
  }
  // koekjes die stil op hun kant staan, krijgen een zetje zodat ze weer plat vallen
  if ((omvalT += dt) > 0.4) {
    omvalT = 0;
    for (const k of koekjes) {
      const q = k.body.quaternion, boven = 1 - 2 * (q.x * q.x + q.z * q.z);
      if (Math.abs(boven) < 0.55 && k.body.velocity.length() < 0.4 && k.body.position.y > -0.2) {
        k.body.wakeUp(); k.body.angularVelocity.x += (Math.random() - 0.5) * 6; k.body.angularVelocity.z += (Math.random() - 0.5) * 6;
      }
    }
  }
  if (wallT > 0 && (wallT -= dt) <= 0) zetMuurtjes(false);
  if (glibberT > 0 && (glibberT -= dt) <= 0) glibber(0);
  if (vriesT > 0 && (vriesT -= dt) <= 0) vries(0);
  if (driesT > 0) driesT -= dt;
  if (laagT > 0 && (laagT -= dt) <= 0) { world.gravity.set(0, -22, 0); for (const c of koekjes) c.body.wakeUp(); }
  if (wiebelT > 0 && (wiebelT -= dt) <= 0) { wiebelT = 0; pasAan(); }
  if (modus != 'wedstrijd' && supply < REGEN_MAX) { if ((regen += dt) >= REGEN) { regen = 0; supply++; tekenHud(); } } else regen = 0;
  if (modus != 'wedstrijd' && score > best) best = score;
  if ((bewaarT += dt) > 3) { bewaarT = 0; bewaar(); }
  // einde van de wedstrijd: koekjes op, er valt al 7 seconden niets meer en er staat geen kracht klaar die koekjes geeft
  if (modus == 'wedstrijd' && supply <= 0 && rainQ <= 0) {
    const klaar = coll[1] >= 3 || coll[4] >= 3; // nog een kracht die koekjes geeft: eerst even wijzen, na 25 seconden toch klaar
    stilT += dt;
    if (klaar && stilT > 7 && stilT - dt <= 7) roep(coll[1] >= 3 ? 'Gebruik je Koekjesregen!' : 'Gebruik je Bakplaat!');
    if (stilT > (klaar ? 25 : 7)) eindeWedstrijd();
  }
}
function lus(nu) {
  requestAnimationFrame(lus);
  const echt = Math.min(0.05, (nu - vorige) / 1000); vorige = nu;
  // natuurkunde in vaste stapjes van 1/60 seconde, zodat het op elke telefoon en pc precies hetzelfde werkt
  // (een trage telefoon doet een paar stapjes per beeld; is hij nog trager, dan loopt het spel wat langzamer)
  if (spelen() || TEGEL) { tijdOver = Math.min(tijdOver + echt, 4 / 60); while (tijdOver >= 1 / 60) { stap(1 / 60); tijdOver -= 1 / 60; } }
  for (const k of koekjes) { k.mesh.position.copy(k.body.position); k.mesh.quaternion.copy(k.body.quaternion); }
  kast.schuif.position.set(0, SCHUIF.hoog / 2, schuifBody.position.z);
  spook.position.set(mikX, VAL_Y, VAL_Z); spook.rotation.y = nu / 600; spook.visible = supply > 0;
  tekenSpringers(echt); tekenToast(echt); sneeuwStap(echt); if (spelen()) effectenStap(echt);
  const fase = Math.floor(nu / 350); for (const l of lampjes) l.material = (l.userData.i + fase) % 3 ? KM.lampAan : KM.lampUit;
  if (wiebelT > 0) { if (!camBasis) camBasis = { p: camera.position.clone(), q: camera.quaternion.clone() }; const w = Math.min(1, wiebelT / 2); camera.position.copy(camBasis.p); camera.quaternion.copy(camBasis.q); camera.position.x += Math.sin(nu / 700) * 0.6 * w; camera.rotateZ(Math.sin(nu / 900) * 0.07 * w); } else camBasis = null; // biertje: dronken camera
  renderer.render(scene, camera);
}
requestAnimationFrame(lus);
window.__test = { ITEMS, laatVallenVast: (x, c) => laatVallen(x, true, c), get itemsGewonnen() { return itemsGewonnen; }, zetThemaId: (id) => { themaId = id; zetThema(id); }, likkie, world, get koekjes() { return koekjes; }, laatVallen, gebruikKracht, stap, autoInsturen, naarMenu, startWedstrijd, eindeWedstrijd, speel, get modus() { return modus; }, get toestand() { return { wedBest, muntenTotaal, ingestuurd, best, weggevallen, supply, score, coll, found, badges, wonTotal, munten, gekocht, themaId }; }, zetMunten: (n) => { munten = n; tekenHud(); }, zetFound: (f) => { found = f; }, zetColl: (c) => { coll = c; tekenHud(true); } };
