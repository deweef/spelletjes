// Tussenstukjes tussen de levels: een groepje van je eigen mannetjes trekt verder, en onderweg gaat er van
// alles mis (enkel verstuikt, plassen in het bos, een eekhoorn, en per land een eigen grap). Daarna een
// tekstkaart naar het volgende level. De gegevens per overgang staan bij het level in data.js (`tussen`).

import * as THREE from 'three';
import { G, T, stuur, plaats, klaarVoorFilmpje, blocked } from './spel.js';
import { speak, sDone, sBuild } from './geluid.js';
import * as K from './kenney.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const taal = (u) => (u.voice && u.voice.lang) || 'nl';
const tegel = (u) => [Math.floor(u.x / T), Math.floor(u.y / T)];

// ---------- de grappen ----------
// zin: per taal wat het mannetje zelf zegt (in een tekstwolkje en hardop), verteller: de ondertitel in het Nederlands
const GRAPPEN = {
  enkel: {
    past: (u) => u.k != 'werker',
    zin: { nl: 'Au, mijn enkel!', en: 'Ouch, my ankle!', de: 'Au, mein Knöchel!', it: 'Ahi, la caviglia!', fr: 'Aïe, ma cheville!' },
    verteller: 'Eentje verstuikt zijn enkel en hinkt terug naar huis.',
    doe(u, f) { u.tempo = 0.35; u.pose = null; f.naarHuis(u); },
  },
  plassen: {
    past: () => true,
    zin: { nl: 'Ik moet even plassen… ga maar vast!', en: 'I need a wee… go on ahead!', de: 'Ich muss mal… geht schon vor!', it: 'Devo fare pipì… andate pure!', fr: 'Je dois faire pipi… allez-y!' },
    verteller: 'Iemand moet nodig plassen achter een boom. Hij is nooit meer teruggezien.',
    doe(u, f) {
      const boom = f.boomBij(u);
      if (boom) { stuur(u, boom[0], boom[1]); u.tempo = 1.2; }
      f.later(3.2, () => { u.hidden = true; });
    },
  },
  eekhoorn: {
    past: (u) => u.k != 'werker',
    zin: { nl: 'Een eekhoorn! Kom hier jij!', en: 'A squirrel! Come here!', de: 'Ein Eichhörnchen! Komm her!', it: 'Uno scoiattolo! Vieni qui!', fr: 'Un écureuil! Viens ici!' },
    verteller: 'Eentje ziet een eekhoorn en rent er als een gek achteraan.',
    doe(u, f) {
      const doel = f.zijkant(u);
      f.eekhoorn(u, doel);
      u.tempo = 1.7; stuur(u, doel[0], doel[1]);
      f.later(4.5, () => { u.hidden = true; });
    },
  },
  donker: {
    past: (u) => u.k != 'werker',
    zin: { nl: 'Daar ga ik niet in, het is daar donker!', en: "I'm not going in there, it's dark!", de: 'Da geh ich nicht rein, da ist es dunkel!', it: 'Io lì non entro, è buio!', fr: "Je n'entre pas là-dedans, il fait noir!" },
    verteller: 'Eentje is bang in het donker en blijft liever buiten.',
    doe(u, f) { u.tempo = 1.4; f.naarHuis(u); },
  },
  schat: {
    past: (u) => u.k != 'werker' && u.k != 'genezer',
    zin: { nl: 'Een schatkist! Dit is allemaal van mij!', en: 'A treasure chest! It’s all mine!', de: 'Eine Schatztruhe! Alles meins!', it: 'Un tesoro! È tutto mio!', fr: 'Un trésor! Tout est à moi!' },
    verteller: 'Eentje vindt een schatkist en wil niet meer mee. Rijk worden gaat voor.',
    doe(u, f) { u.path = null; u.pose = 'interact-right'; f.kist(u); f.later(2.5, () => { u.pose = 'emote-yes'; }); },
  },
  krukken: {
    past: (u) => u.k == 'genezer',
    zin: { nl: 'Wacht even op mij! Op krukken gaat het niet zo snel…', en: 'Wait for me! Crutches are slow…', de: 'Wartet auf mich! Mit Krücken geht das nicht so schnell…', it: 'Aspettatemi! Con le stampelle non vado veloce…', fr: 'Attendez-moi! Avec des béquilles, ça ne va pas vite…' },
    verteller: 'De genezer op krukken raakt achter. Hij komt later wel, zegt hij.',
    doe(u, f) { u.tempo = 0.3; f.later(0.5, () => stuur(u, f.uitgang()[0], f.uitgang()[1])); },
  },
  // per land, alleen voor werkers
  nl: {
    past: (u) => u.k == 'werker' && taal(u) == 'nl',
    zin: { nl: 'Effe pauze… even een kruidensigaretje.' },
    verteller: 'De Nederlander steekt een kruidensigaretje op…',
    doe(u, f) {
      u.path = null; u.pose = 'sit';
      f.rook(u, 3.5);
      f.later(3.4, () => { f.wolkje(u, 'Hihihi… waar ging ik ook alweer heen?'); f.zeg(u, 'Hihihi!'); f.verteller('…krijgt de slappe lach, eet van de vreetkick zijn hele kaasje op en loopt de verkeerde kant op.'); });
      f.later(4.2, () => { u.pose = null; u.tempo = 0.6; const d = f.zijkant(u, true); stuur(u, d[0], d[1]); });
      f.later(7.5, () => f.wolkje(u, 'Heeft iemand nog kaas?'));
    },
  },
  de: {
    past: (u) => u.k == 'werker' && taal(u) == 'de',
    zin: { de: 'Prost! … Hik!' },
    verteller: 'De Duitser heeft te diep in zijn pul gekeken en zwalkt terug naar huis.',
    doe(u, f) {
      u.zigzag = true; u.tempo = 0.55; f.naarHuis(u);
      f.later(2.8, () => { f.wolkje(u, 'Hik! Wo ist mein Bett?'); f.zeg(u, 'Hick!'); });
    },
  },
  fr: {
    past: (u) => u.k == 'werker' && taal(u) == 'fr',
    zin: { fr: 'Mmm, ma baguette… toute entière!' },
    verteller: 'De Fransman eet in één keer zijn hele stokbrood op…',
    doe(u, f) {
      u.path = null; u.pose = 'holding-left';
      f.later(2.4, () => { u.pose = 'emote-no'; f.wolkje(u, 'Aïe, mon ventre!'); f.zeg(u, 'Aïe, mon ventre!'); f.verteller('…en krijgt buikpijn.'); });
      f.later(4.2, () => { u.pose = null; u.tempo = 1.6; f.naarHuis(u); f.wolkje(u, 'Où sont les toilettes?!'); });
    },
  },
  en: {
    past: (u) => u.k == 'werker' && taal(u) == 'en',
    zin: { en: "Tea time! I shan't be a minute." },
    verteller: 'De Engelsman gaat eerst rustig een kopje thee drinken. Dat duurt nog wel even.',
    doe(u) { u.path = null; u.pose = 'sit'; u.thee = 9999; },
  },
  it: {
    past: (u) => u.k == 'werker' && taal(u) == 'it',
    zin: { it: 'Mamma mia, prima la pizza!' },
    verteller: 'De Italiaan gaat eerst zijn pizza opeten. Koud is hij niet lekker.',
    doe(u) { u.path = null; u.pose = 'sit'; },
  },
};

// ---------- het filmpje ----------
let actief = null;

export function bezig() { return !!actief; }

// api: { scene, camera, controls, scherm(x, y, z) -> {x, y} op het scherm }, klaar: na de tekstkaart
export function start(api, info, klaar) {
  klaarVoorFilmpje();
  const eigen = G.units.filter((u) => u.side == 'h' && u.k != 'held');
  const kasteel = G.blds.find((b) => b.k == 'kasteel');
  const thuis = kasteel ? [kasteel.x + 1, kasteel.y + kasteel.h] : tegel(eigen[0]);
  const a = actief = { api, info, klaar, t: 0, taken: [], wolkjes: [], acteurs: [], groep: eigen, aankomers: [], thuis, uitgang: info.uitgang || [0, 0], kaart: false };
  const f = hulpjes(a);
  if (info.soort == 'overval') overval(a, f, eigen, kasteel); else tocht(a, f, eigen);
  f.later(info.duur || 24, () => toonKaart(a));
  $('hud').hidden = true; $('tussen').hidden = false;
  $('overslaan').onclick = () => toonKaart(a);
}

// Een groepje trekt verder; onderweg krijgen een paar van hen een grap
function tocht(a, f, eigen) {
  const { info } = a;
  const soldaten = eigen.filter((u) => u.k != 'werker').sort((p, q) => (q.k == info.voorop) - (p.k == info.voorop)), werkers = eigen.filter((u) => u.k == 'werker'); // voorop: deze soort gaat zeker mee
  const groep = a.groep = [...soldaten.slice(0, info.held ? 7 : 3), ...werkers.slice(0, Math.max(2, werkers.length - 1))].slice(0, 7);
  const held = info.held && G.units.find((u) => u.k == 'held' && u.side == 'h');
  let start = 0;
  if (info.spreker) { // eerst vertelt iemand iets (een werker, of Sir Lodewijk)
    const s = held || werkers[werkers.length - 1] || eigen[0];
    f.wolkje(s, info.spreker); f.zeg(s, info.spreker); start = 3;
  }
  // vertrek: meteen, of pas later (als de uitgang vlakbij is, eerst de grappen)
  const weg = start + (info.vertrek || 0);
  f.later(weg, () => { for (const u of groep) if (!info.vertrek || !a.bezet.has(u)) { u.tempo = 1.25; stuur(u, a.uitgang[0], a.uitgang[1]); } });
  // wie krijgt welke grap (er blijft altijd minstens één over die aankomt)
  const vrij = [...groep], plan = [];
  const neem = (soort) => { // elke grap hooguit één keer per filmpje
    if (plan.some(([, s]) => s == soort)) return;
    const g = GRAPPEN[soort]; const i = vrij.findIndex(g.past); if (i < 0) return; plan.push([vrij.splice(i, 1)[0], soort]);
  };
  const landen = ['nl', 'de', 'fr', 'en', 'it'].sort(() => Math.random() - 0.5);
  const eerst = info.grappen || ['enkel'];
  for (const g of eerst) neem(g);
  for (const l of landen) if (plan.length < 2) neem(l);
  const zonder = info.zonder || [];
  if (!zonder.includes('plassen')) neem('plassen');
  for (const l of landen) if (plan.length < 4) neem(l);
  if (!zonder.includes('eekhoorn')) neem('eekhoorn');
  while (plan.length >= groep.length && plan.length) vrij.push(plan.pop()[0]);
  a.aankomers = vrij; a.bezet = new Set(plan.map(([u]) => u));
  if (held) { // Sir Lodewijk gaat voorop en komt altijd aan
    groep.push(held);
    f.later(weg + 1.5, () => a.aankomers.push(held)); // pas verdwijnen als hij echt op weg is
  }
  f.verteller(info.begin);
  plan.forEach(([u, soort], i) => f.later(start + (info.vertrek ? 0.8 : 2.5) + i * 2.6, () => {
    const g = GRAPPEN[soort];
    const zin = g.zin[taal(u)] || g.zin.nl || Object.values(g.zin)[0];
    f.wolkje(u, zin); f.zeg(u, zin); f.verteller(g.verteller);
    g.doe(u, f);
  }));
  f.later(start + 16, () => f.verteller(info.eind));
}

// Feest in het dorp, het wordt nacht, iedereen slaapt, en de orks voeren de werkers mee
const FEEST = { nl: 'Gezellig! Proost!', en: 'Cheers, mates!', de: 'Prost! Noch eine Runde!', it: 'Salute! Che festa!', fr: 'Vive la fête!' };
const HELP = { nl: 'Help! Laat me los!', en: 'Help! Let go of me!', de: 'Hilfe! Lass mich los!', it: 'Aiuto! Lasciami!', fr: 'Au secours! Lâche-moi!' };
function overval(a, f, eigen, kasteel) {
  const { info, api } = a;
  const werkers = eigen.filter((u) => u.k == 'werker'), soldaten = eigen.filter((u) => u.k != 'werker');
  // iedereen komt bij het kasteel
  const k = kasteel || { x: tegel(eigen[0])[0], y: tegel(eigen[0])[1], w: 1, h: 1 };
  eigen.forEach((u, i) => { u.tempo = 1.3; stuur(u, k.x - 1 + (i % 6), k.y + k.h + 1 + Math.floor(i / 6)); });
  f.verteller(info.begin);
  eigen.slice(0, 5).forEach((u, i) => f.later(1.5 + i * 0.9, () => { const z = FEEST[taal(u)] || FEEST.nl; u.pose = 'emote-yes'; f.wolkje(u, z); f.zeg(u, z); }));
  f.later(6.5, () => {
    f.verteller('Het werd laat… en één voor één vielen ze in slaap.');
    for (const u of eigen) { u.pose = 'sit'; u.path = null; }
  });
  for (let i = 0; i <= 20; i++) f.later(6.5 + i * 0.1, () => api.nacht && api.nacht(i / 20));
  f.later(7.5, () => { for (const u of soldaten.slice(0, 2)) f.wolkje(u, 'Zzz…'); });
  // de orks komen
  // de orks komen van een vrij plekje zo'n 12 vakjes boven het dorp
  let rand = [Math.floor(G.MW / 2), 1];
  zoek: for (let y = Math.max(1, k.y - 12); y < k.y; y++) for (let d = 0; d < G.MW; d++) for (const x of [k.x + 4 + d, k.x + 4 - d]) {
    if (x > 0 && x < G.MW - 1 && !blocked(x, y) && !blocked(x + 1, y)) { rand = [x, y]; break zoek; }
  }
  f.later(8.5, () => {
    f.verteller('Toen slopen de orks het dorp in…');
    werkers.forEach((w, i) => {
      const [wx, wy] = tegel(w);
      const o = plaats(i % 3 == 2 ? 'speerork' : 'ork', rand[0], rand[1]);
      o.x += (i % 3 - 1) * 10; o.y += Math.floor(i / 3) * 10;
      o.tempo = 2.1; stuur(o, wx, wy); o.rover = w;
      a.acteurs.push({ ork: o });
    });
  });
  // wie bij zijn werker is, neemt hem mee
  a.elkBeeld = () => {
    for (const ac of a.acteurs) {
      const o = ac.ork; if (!o || ac.mee) continue;
      const w = o.rover;
      if (Math.hypot(o.x - w.x, o.y - w.y) < 1.4 * T) {
        ac.mee = true; w.pose = null;
        const z = HELP[taal(w)] || HELP.nl; f.wolkje(w, z); f.zeg(w, z);
        stuur(o, rand[0], rand[1]); stuur(w, rand[0], rand[1]); o.tempo = 1.7; w.tempo = 1.7;
        a.aankomers.push(o, w);
      }
    }
  };
  a.uitgang = rand;
  f.later(19, () => { f.verteller(info.eind); const s = soldaten[0]; if (s) { s.pose = null; f.wolkje(s, 'Huh? Waar is iedereen?'); } });
}

// ---------- het beginfilmpje van een level (level 1: aankomst en het kasteel bouwen) ----------
const MOOI = { nl: 'Dit is een mooie plek om te bouwen!', en: 'What a lovely spot to build!', de: 'Hier ist ein schöner Ort zum Bauen!', it: 'Che bel posto per costruire!', fr: 'Quel bel endroit pour construire!' };
const ORKS = { nl: 'Hmm… daar in het bos zitten orks.', en: 'Hmm… there are orcs in those woods.', de: 'Hmm… da im Wald sind Orks.', it: 'Mmm… in quel bosco ci sono gli orchi.', fr: 'Hmm… il y a des orques dans ces bois.' };
const BEGIN = { nl: 'Kom op, laten we beginnen!', en: "Right, let's get started!", de: 'Los, fangen wir an!', it: 'Forza, cominciamo!', fr: 'Allez, on commence!' };
const WACHT = { nl: 'Ik hou wel de wacht…', en: "I'll keep watch…", de: 'Ich halte Wache…', it: 'Io faccio la guardia…', fr: 'Je monte la garde…' };
// een grapje per land voor de werker die niet als eerste begint
const BOUWGRAP = {
  nl: { zin: 'Kan het niet een tikkie goedkoper?', verteller: 'De Nederlander vraagt meteen of het kasteel niet wat goedkoper kan.' },
  en: { zin: "Tea first. One doesn't build on an empty stomach.", verteller: 'De Engelsman begint natuurlijk eerst met een kopje thee.', zit: 3.5 },
  de: { zin: 'Ein Bier zum Richtfest! Prost!', verteller: 'Bij een nieuw huis hoort een biertje, vindt de Duitser. Hij proost alvast op het kasteel.' },
  it: { zin: 'E la pizzeria, dove la mettiamo?', verteller: 'De Italiaan wil eerst weten waar de pizzeria komt.' },
  fr: { zin: "Ce château n'est pas assez chic…", verteller: 'De Fransman vindt het kasteel niet chic genoeg.' },
};

export function intro(api, info, klaar) {
  G.tussen = true; G.sel = []; G.selB = null; G.place = null; G.msgT = 0;
  const kasteel = G.blds.find((b) => b.k == 'kasteel');
  const eigen = G.units.filter((u) => u.side == 'h');
  const werkers = eigen.filter((u) => u.k == 'werker'), soldaten = eigen.filter((u) => u.k != 'werker');
  const [bx, by] = info.van;
  // iedereen begint bij de ingang van de kaart en het kasteel moet nog gebouwd worden
  eigen.forEach((u, i) => { u.x = (bx + 0.5) * T + (i % 2) * 8; u.y = (by + 0.5) * T + i * 6; u.st = 'idle'; u.path = null; u.hidden = false; });
  if (kasteel) { kasteel.done = false; kasteel.prog = 0; kasteel.hp = 1; }
  const a = actief = { api, info, klaar: () => { stop(); klaar(); }, t: 0, taken: [], wolkjes: [], acteurs: [], groep: eigen, aankomers: [], thuis: info.naar, uitgang: [-99, -99], kaart: false };
  const f = hulpjes(a);
  const zeg = (u, lijst) => { if (!u) return; const z = lijst[taal(u)] || lijst.nl; f.wolkje(u, z); f.zeg(u, z); };
  f.verteller(info.begin);
  eigen.forEach((u, i) => f.later(0.3 + i * 0.4, () => { u.tempo = 1.1; stuur(u, info.naar[0] + (i % 3), info.naar[1] + Math.floor(i / 3)); }));
  const [w1, w2] = werkers, s = soldaten[0];
  f.later(4.5, () => { zeg(w1, MOOI); w1 && (w1.pose = 'emote-yes'); });
  f.later(7, () => { if (w1) w1.pose = null; zeg(s, ORKS); f.verteller(info.orks); });
  f.later(9.5, () => {
    zeg(w1, BEGIN); f.verteller(info.bouw);
    // de werkers lopen naar het kasteel en gaan aan de slag
    werkers.forEach((w, i) => stuur(w, kasteel.x + kasteel.w, kasteel.y + i * 2));
    if (s) { stuur(s, kasteel.x + kasteel.w + 1, kasteel.y - 1); }
  });
  // de grap van de tweede werker
  const grap = w2 && BOUWGRAP[taal(w2)];
  f.later(12, () => {
    if (s) { zeg(s, WACHT); }
    if (grap) { f.wolkje(w2, grap.zin); f.zeg(w2, grap.zin); f.verteller(grap.verteller); if (grap.zit) { w2.path = null; w2.pose = 'sit'; a.zit = w2; } }
  });
  f.later(14.5, () => { if (s) { s.pose = 'sit'; f.wolkje(s, 'Zzz…'); } });
  if (grap && grap.zit) f.later(12 + grap.zit, () => { w2.pose = null; a.zit = null; });
  a.elkBeeld = (dt) => { // het kasteel groeit zolang er werkers bij staan
    if (!kasteel || kasteel.done || a.t < 10) return;
    const bij = werkers.filter((w) => w != a.zit && Math.hypot(w.x - (kasteel.x + kasteel.w / 2) * T, w.y - (kasteel.y + kasteel.h / 2) * T) < 2.6 * T && (!w.path || !w.path.length));
    for (const w of werkers) if (w != a.zit && w.pose != 'sit') w.pose = bij.includes(w) ? 'interact-right' : null;
    if (!bij.length) return;
    kasteel.prog = Math.min(1, kasteel.prog + bij.length * dt / 10);
    kasteel.hp = Math.max(1, Math.round(kasteel.max * kasteel.prog));
    if (Math.random() < 0.03) sBuild();
    if (kasteel.prog >= 1) {
      kasteel.done = true; kasteel.hp = kasteel.max; sDone();
      for (const w of werkers) w.pose = 'emote-yes';
      if (s) s.pose = null;
      f.verteller(info.eind);
      if (taal(w2 || {}) == 'de' && grap) { f.wolkje(w2, 'Prost! Hik!'); w2.zigzag = true; }
      f.later(4, () => toonKaart(a));
    }
  };
  // voor als het in een trage browser langer duurt
  f.later(info.duur || 30, () => toonKaart(a));
  $('hud').hidden = true; $('tussen').hidden = false;
  $('overslaan').onclick = () => toonKaart(a);
}

function hulpjes(a) {
  const f = {
    later: (sec, fn) => a.taken.push({ op: a.t + sec, fn }),
    verteller: (tekst) => { const v = $('verteller'); v.textContent = tekst; v.classList.remove('nieuw'); void v.offsetWidth; v.classList.add('nieuw'); },
    wolkje: (u, tekst) => {
      const el = document.createElement('div'); el.className = 'wolkje'; el.innerHTML = esc(tekst);
      $('wolkjes').appendChild(el); a.wolkjes.push({ el, u, tot: a.t + 3.2 });
    },
    zeg: (u, tekst) => speak(tekst, (u.voice && u.voice.pitch) || 1, taal(u), true),
    naarHuis: (u) => stuur(u, a.thuis[0], a.thuis[1]),
    uitgang: () => a.uitgang,
    boomBij: (u) => { // een vrij vakje naast de dichtstbijzijnde boom
      const [x, y] = tegel(u); let best = null, bd = 1e9;
      for (const k in G.trees) if (G.trees[k] > 0) {
        const [bx, by] = k.split(',').map(Number), d = (bx - x) ** 2 + (by - y) ** 2;
        if (d < bd && !blocked(bx, by + 1)) { bd = d; best = [bx, by + 1]; }
      }
      return best;
    },
    zijkant: (u, andersom) => { // een vrij vakje aan de linker- of rechterrand van de kaart
      const [x, y] = tegel(u); const naarRechts = andersom ? x < G.MW / 2 : x >= G.MW / 2;
      for (let d = 0; d < G.MH; d++) for (const yy of [y - d, y + d]) {
        if (yy < 0 || yy >= G.MH) continue;
        const xs = naarRechts ? [...Array(G.MW).keys()].reverse() : [...Array(G.MW).keys()];
        for (const xx of xs) if (!blocked(xx, yy)) return [xx, yy];
      }
      return [x, y];
    },
    rook: (u, sec) => { for (let i = 0; i < sec * 10; i++) f.later(i / 10, () => G.fx.push({ x: u.x + (Math.random() - 0.5) * 8, y: u.y + (Math.random() - 0.5) * 8, l: 70, rook: 1 })); },
    kist: (u) => { // een schatkist vlak voor zijn voeten
      let g;
      if (K.klaar) { g = K.stuk('dungeon/chest'); g.scale.setScalar(1.6); }
      else { g = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), new THREE.MeshLambertMaterial({ color: '#8b5a2b' })); g.position.y = 0.15; }
      const h = new THREE.Group(); h.add(g); h.position.set(u.x / T + 0.45, 0, u.y / T + 0.1); h.rotation.y = -0.6;
      a.api.scene.add(h); a.acteurs.push({ g: h, x: h.position.x, z: h.position.z, doel: [h.position.x, h.position.z], t: 0, stil: 1 });
    },
    eekhoorn: (u, doel) => { // een klein bruin eekhoorntje dat voor hem uit rent
      const g = new THREE.Group();
      const bruin = new THREE.MeshLambertMaterial({ color: '#a0622d' });
      const lijf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), bruin); lijf.scale.set(1, 0.8, 1.4); lijf.position.y = 0.1; g.add(lijf);
      const kop = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), bruin); kop.position.set(0, 0.17, 0.11); g.add(kop);
      const staart = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshLambertMaterial({ color: '#c47a3a' })); staart.scale.set(0.7, 1.6, 0.7); staart.position.set(0, 0.22, -0.13); g.add(staart);
      a.api.scene.add(g);
      a.acteurs.push({ g, x: u.x / T + 0.6, z: u.y / T, doel: [doel[0] + 0.5, doel[1] + 0.5], t: 0 });
    },
  };
  return f;
}

// elk beeldje: taken op tijd uitvoeren, wolkjes boven de hoofden houden, camera volgen, eekhoorn laten rennen
export function tik(dt) {
  const a = actief; if (!a || a.kaart) return;
  a.t += dt;
  for (const k of a.taken.filter((k) => a.t >= k.op)) { a.taken.splice(a.taken.indexOf(k), 1); k.fn(); }
  if (a.elkBeeld) a.elkBeeld(dt);
  // wie bij de uitgang is, verdwijnt het bos in
  for (const u of a.aankomers) if (!u.hidden && Math.hypot(u.x / T - a.uitgang[0] - 0.5, u.y / T - a.uitgang[1] - 0.5) < 1.6) u.hidden = true;
  // tekstwolkjes
  for (const w of [...a.wolkjes]) {
    if (a.t > w.tot || w.u.hidden) { w.el.remove(); a.wolkjes.splice(a.wolkjes.indexOf(w), 1); continue; }
    const p = a.api.scherm(w.u.x / T, 1.9, w.u.y / T);
    w.el.style.left = p.x + 'px'; w.el.style.top = p.y + 'px';
  }
  // eekhoorn rent naar de rand
  for (const e of a.acteurs) {
    if (!e.g || e.stil) continue;
    const dx = e.doel[0] - e.x, dz = e.doel[1] - e.z, d = Math.hypot(dx, dz);
    if (d > 0.05) { const s = Math.min(d, dt * 2.6); e.x += dx / d * s; e.z += dz / d * s; e.g.rotation.y = Math.atan2(dx, dz); }
    e.t += dt; e.g.position.set(e.x, Math.abs(Math.sin(e.t * 14)) * 0.12, e.z);
    if (d < 0.3) e.g.visible = false;
  }
  // camera volgt de groep die nog onderweg is
  const zicht = a.groep.filter((u) => !u.hidden);
  if (zicht.length) {
    const cx = zicht.reduce((s, u) => s + u.x / T, 0) / zicht.length, cz = zicht.reduce((s, u) => s + u.y / T, 0) / zicht.length;
    const { camera, controls } = a.api, doel = new THREE.Vector3(cx, 0, cz), k = Math.min(1, dt * 1.5);
    const oud = controls.target.clone();
    controls.target.lerp(doel, k);
    camera.position.add(controls.target.clone().sub(oud));
  }
}

function toonKaart(a) {
  if (a.kaart) return;
  a.kaart = true;
  if (!a.info.kaart) { a.klaar(); return; } // beginfilmpje: meteen door naar de uitleg
  for (const w of a.wolkjes) w.el.remove();
  $('tussen').hidden = true;
  $('tussentekst').innerHTML = a.info.kaart.map((r) => `<p>${esc(r)}</p>`).join('');
  $('tussenkaart').hidden = false;
  $('tussenverder').onclick = () => { stop(); a.klaar(); };
}

export function stop() {
  const a = actief; if (!a) return;
  for (const w of a.wolkjes) w.el.remove();
  for (const e of a.acteurs) if (e.g) a.api.scene.remove(e.g);
  $('tussen').hidden = true; $('tussenkaart').hidden = true;
  actief = null; G.tussen = false;
}
