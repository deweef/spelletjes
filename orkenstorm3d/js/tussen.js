// Tussenstukjes tussen de levels: een groepje van je eigen mannetjes trekt verder, en onderweg gaat er van
// alles mis (enkel verstuikt, plassen in het bos, een eekhoorn, en per land een eigen grap). Daarna een
// tekstkaart naar het volgende level. De gegevens per overgang staan bij het level in data.js (`tussen`).

import * as THREE from 'three';
import { G, T, stuur, klaarVoorFilmpje, blocked } from './spel.js';
import { speak } from './geluid.js';

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
  // de groep: soldaten eerst, dan werkers; een paar werkers blijven thuis
  const soldaten = eigen.filter((u) => u.k != 'werker'), werkers = eigen.filter((u) => u.k == 'werker');
  const groep = [...soldaten.slice(0, 3), ...werkers.slice(0, Math.max(2, werkers.length - 1))].slice(0, 7);
  const uitgang = info.uitgang;
  for (const u of groep) { u.tempo = 1.25; stuur(u, uitgang[0], uitgang[1]); }

  // wie krijgt welke grap (er blijft altijd minstens één over die aankomt)
  const vrij = [...groep], plan = [];
  const neem = (soort) => { // elke grap hooguit één keer per filmpje
    if (plan.some(([, s]) => s == soort)) return;
    const g = GRAPPEN[soort]; const i = vrij.findIndex(g.past); if (i < 0) return; plan.push([vrij.splice(i, 1)[0], soort]);
  };
  const landen = ['nl', 'de', 'fr', 'en', 'it'].sort(() => Math.random() - 0.5);
  neem('enkel'); for (const l of landen) if (plan.length < 2) neem(l);
  neem('plassen'); for (const l of landen) if (plan.length < 4) neem(l);
  neem('eekhoorn');
  while (plan.length >= groep.length && plan.length) vrij.push(plan.pop()[0]);

  const a = actief = { api, info, klaar, t: 0, taken: [], wolkjes: [], acteurs: [], groep, aankomers: vrij, thuis, uitgang, kaart: false };
  const f = hulpjes(a);
  f.verteller(info.begin);
  plan.forEach(([u, soort], i) => f.later(2.5 + i * 2.6, () => {
    const g = GRAPPEN[soort];
    const zin = g.zin[taal(u)] || g.zin.nl || Object.values(g.zin)[0];
    f.wolkje(u, zin); f.zeg(u, zin); f.verteller(g.verteller);
    g.doe(u, f);
  }));
  f.later(16, () => f.verteller(info.eind));
  f.later(24, () => toonKaart(a));
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
  for (const w of a.wolkjes) w.el.remove();
  $('tussen').hidden = true;
  $('tussentekst').innerHTML = a.info.kaart.map((r) => `<p>${esc(r)}</p>`).join('');
  $('tussenkaart').hidden = false;
  $('tussenverder').onclick = () => { stop(); a.klaar(); };
}

export function stop() {
  const a = actief; if (!a) return;
  for (const w of a.wolkjes) w.el.remove();
  for (const e of a.acteurs) a.api.scene.remove(e.g);
  $('tussen').hidden = true; $('tussenkaart').hidden = true;
  actief = null; G.tussen = false;
}
