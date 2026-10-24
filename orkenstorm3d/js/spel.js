// De spelregels: kaart, paden, werkers, gebouwen, gevechten, golven, winnen en verliezen.
// Overgenomen uit de 2D-versie (orkenstorm.html). Posities van mannetjes zijn in pixels (32 per tegel),
// gebouwen staan op tegels (x, y = linkerbovenhoek). De 3D-weergave rekent dat om.

import { UNIT, BLD, DIFF, LEVELS } from './data.js';
import { unitSay, speak, pick, nieuweStem, nieuweZak, snd, sHorn, sDone, sChop, sGold, sHout, sHit, sArrow, sBuild, sClick, sNee, sWin, noise } from './geluid.js';

export const T = 32;

export const G = {
  state: 'titel', lvl: 0, L: null, map: null, MW: 0, MH: 0, trees: {}, mineG: {}, units: [], blds: [], explored: null,
  res: { goud: 0, hout: 0 }, sel: [], selB: null, place: null, msg: '', msgT: 0, t: 0, fx: [], nextWave: 0, waveN: 0,
  lastAlert: -999, poke: { id: -1, n: 0, t: 0 }, multi: false, unlocked: 1, paused: false, diff: 1, lostMsg: '', uid: 1,
  levelVersie: 0, mapVersie: 0, freed: true, saved: true,
};
// Voortgang per speler (de naam kies je op de startpagina). Zonder eigen voortgang begin je met wat er al
// op dit toestel stond, zodat er niets verloren gaat.
let spelerNaam = '';
try { spelerNaam = localStorage.getItem('speler') || ''; } catch (e) {}
export const speler = () => spelerNaam;
const sleutel = (k) => (spelerNaam ? `${k}:${spelerNaam}` : k);
function lees(k) { try { const v = localStorage.getItem(sleutel(k)); return v !== null ? v : localStorage.getItem(k); } catch (e) { return null; } }
function bewaar(k, v) { try { localStorage.setItem(sleutel(k), v); } catch (e) {} }
G.unlocked = +lees('orkenstorm3d_lvl') || 1;
// het beginfilmpje van een level speelt vanzelf alleen de eerste keer
export const introGezien = (i) => lees('orkenstorm3d_intro' + i) == '1';
export const zetIntroGezien = (i) => bewaar('orkenstorm3d_intro' + i, '1');
{ const d = lees('orkenstorm3d_diff'); if (d !== null) G.diff = +d; }

export function zetMoeilijkheid(i) { G.diff = i; bewaar('orkenstorm3d_diff', i); }

export function say(m, d = 120) { G.msg = m; G.msgT = d; }

export const S = {
  count: (k) => G.blds.filter((b) => b.k == k && b.done).length,
  huts: () => G.blds.filter((b) => b.k == 'orkhut').length,
  towers: () => G.blds.filter((b) => b.k == 'orktoren').length,
  orcs: () => G.units.filter((u) => u.side == 'o').length,
  vrij: () => G.freed,
  camps: () => G.blds.filter((b) => b.k == 'roverkamp').length,
  gered: () => G.saved, // level 6: de rovers bij de abdij zijn verjaagd
  belegeraars: () => G.units.filter((u) => u.siege).length,
  morvan: () => G.units.find((u) => u.k == 'morvan'),
  priesters: () => G.units.filter((u) => u.k == 'orkpriester').length,
  tempel: () => G.blds.find((b) => b.k == 'tempel'),
  zwartvuist: () => G.units.find((u) => u.k == 'zwartvuist'),
  verdieping: () => Math.max(1, ...G.units.filter((u) => u.side == 'h' && u.k != 'watergeest').map((u) => verdieping(u))), // level 7: de hoogste verdieping waar iemand van jou is
  start: () => G.start || {},
  // voor de voortgang in procenten (level 4): hoe dicht je bij Sir Lodewijk bent, en hij bij de trap
  naarHeld: () => {
    const h = G.units.find((u) => u.k == 'held'); if (!h) return 0;
    const d = Math.min(...G.units.filter((u) => u.side == 'h' && u.k != 'held').map((u) => dist(u, h)), 1e9);
    if (!G.start.dHeld) G.start.dHeld = d;
    return Math.max(0, Math.min(1, 1 - d / G.start.dHeld));
  },
  naarTrap: () => {
    const h = G.units.find((u) => u.k == 'held' && u.side == 'h'); if (!h) return 0;
    let d = 1e9; for (let y = 0; y < G.MH; y++) for (let x = 0; x < G.MW; x++) if (G.map[y][x] == 'E') d = Math.min(d, Math.hypot(h.x - (x + 0.5) * T, h.y - (y + 0.5) * T));
    if (!G.start.dTrap) G.start.dTrap = d;
    return Math.max(0, Math.min(1, 1 - d / G.start.dTrap));
  },
  heldVrij: () => G.units.some((u) => u.k == 'held' && u.side == 'h'),
  heldUit: () => G.units.some((u) => { // Sir Lodewijk staat op of naast de trap
    if (u.k != 'held' || u.side != 'h') return false;
    const [x, y] = tileOf(u);
    for (let j = y - 1; j <= y + 1; j++) for (let i = x - 1; i <= x + 1; i++) if (G.map[j] && G.map[j][i] == 'E') return true;
    return false;
  }),
};

// Level 7 (de toren): de kaart heeft drie verdiepingen onder elkaar; mannetjes vechten alleen op hun eigen verdieping
export function verdieping(o) {
  const fl = G.L && G.L.floors; if (!fl) return 1;
  const y = o.w ? o.y : o.y / T;
  for (let i = 0; i < fl.length; i++) if (y >= fl[i]) return i + 1;
  return fl.length;
}
const zelfde = (a, b) => !G.L.tower || verdieping(a) == verdieping(b);

export function loadLevel(i) {
  const L = LEVELS[i];
  G.lvl = i; G.L = L; G.MH = L.map.length; G.MW = L.map[0].length;
  G.map = L.map.map((r) => r.split('')); G.trees = {}; G.mineG = {};
  for (let y = 0; y < G.MH; y++) for (let x = 0; x < G.MW; x++) {
    if (G.map[y][x] == 'T') G.trees[x + ',' + y] = 30;
    if (G.map[y][x] == 'M') { const k = minesKey(x, y); if (!(k in G.mineG)) G.mineG[k] = (L.mineCap && L.mineCap[k]) || 2000; }
  }
  G.mineMax = { ...G.mineG }; G.bijnaLeeg = {};
  const D = DIFF[G.diff];
  G.units = []; G.blds = []; G.sel = []; G.selB = null; G.place = null; G.fx = []; G.multi = false; G.tussen = false; G.regens = []; G.gif = []; G.cast = null; G.trapSprong = null;
  nieuweZak();
  G.res = { goud: Math.round(L.goud * D.res / 10) * 10, hout: Math.round(L.hout * D.res / 10) * 10 };
  G.t = 0; G.waveN = 0; G.nextWave = L.waves ? Math.round(L.waves.first * D.wave) : 0; G.paused = false;
  G.explored = Array.from({ length: G.MH }, () => Array(G.MW).fill(false));
  for (const [k, x, y] of L.b) addBld(k, x, y, 1);
  for (const [x, y] of L.huts) { const h = addBld('orkhut', x, y, 1); if (L.hutHp) h.hp = h.max = L.hutHp; }
  for (const [x, y] of L.otowers || []) addBld('orktoren', x, y, 1);
  G.freed = !L.kooi;
  for (const [x, y] of L.kooi || []) addBld('kooi', x, y, 1);
  G.saved = !L.siege;
  for (const [x, y] of L.camps || []) addBld('roverkamp', x, y, 1);
  for (const [k, x, y] of L.ob || []) addBld(k, x, y, 1); // gebouwen van de vijand (de tempel)
  for (const [k, x, y] of L.u) addUnit(k, x, y);
  for (const [k, x, y, f] of L.o) { const u = addUnit(k, x, y); u.home = { x: u.x, y: u.y }; if (f == 'raid') { u.raid = 1; u.st = 'raid'; u.siege = 1; } } // siege: belegert de abdij
  if (L.held) { const h = addUnit('held', L.held[0], L.held[1]); h.side = 'n'; h.hp = 35; h.captive = 1; h.rolstoel = false; h.voice = { lang: 'nl', pitch: 0.6 }; }
  G.start = { huts: L.huts.length, towers: (L.otowers || []).length, orcs: L.o.length, camps: (L.camps || []).length, belegeraars: L.o.filter((o) => o[3] == 'raid').length }; G.beste = 0; // voor het scorebord: hoe ver je komt
  G.lostMsg = ''; reveal(); G.state = 'brief'; G.msg = ''; G.msgT = 0;
  G.levelVersie++; G.mapVersie++;
}

function minesKey(x, y) { // linkerbovenhoek van de mijn
  while (x > 0 && G.map[y][x - 1] == 'M') x--;
  while (y > 0 && G.map[y - 1][x] == 'M') y--;
  return x + ',' + y;
}

function addUnit(k, tx, ty) {
  const d = UNIT[k], hm = d.side == 'o' ? DIFF[G.diff].hp : 1;
  const u = { id: G.uid++, voice: d.side == 'h' ? nieuweStem(k) : null, k, side: d.side, x: tx * T + T / 2, y: ty * T + T / 2,
    hp: Math.round(d.hp * hm), max: Math.round(d.hp * hm), st: 'idle', path: null, cd: 0, carry: null, swing: 0 };
  if (d.side == 'h' && k != 'genezer' && k != 'held' && k != 'ridder' && k != 'watergeest' && Math.random() < 1 / 6) u.rolstoel = true;
  if (k == 'magier') u.mana = 50; // toverkracht, groeit langzaam tot 100 // af en toe rijdt er iemand in een rolstoel
  G.units.push(u); return u;
}

function addBld(k, x, y, done) {
  const d = BLD[k];
  const b = { id: G.uid++, k, side: d.side, x, y, w: d.w, h: d.h, hp: done ? d.hp : Math.max(1, d.hp * 0.1), max: d.hp, done: !!done, prog: done ? 1 : 0, q: [], qp: 0, cd: 0 };
  G.blds.push(b); return b;
}

export function food() {
  let cap = 0, use = 0;
  for (const b of G.blds) if (b.side == 'h' && b.done && BLD[b.k].food) cap += BLD[b.k].food;
  for (const u of G.units) if (u.side == 'h') use++;
  for (const b of G.blds) use += b.q.length;
  return { cap, use };
}

// ---------- kaart ----------
export function blocked(x, y) {
  if (x < 0 || y < 0 || x >= G.MW || y >= G.MH) return true;
  const c = G.map[y][x];
  if (c == 'W' || c == 'M' || c == '#' || c == 't' || c == 'L') return true; // L = lava
  if (c == 'T' && G.trees[x + ',' + y] > 0) return true;
  const b = bldAt(x, y); return !!b && b.k != 'weg'; // over een weg in aanbouw kun je gewoon lopen
}
export function bldAt(x, y) { return G.blds.find((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h); }

function astar(sx, sy, goals) { // goals: set van "x,y"
  if (!goals.size) return null;
  const key = (x, y) => x + ',' + y;
  const open = [[sx, sy]], g = {}, f = {}, from = {};
  g[key(sx, sy)] = 0;
  const hx = [...goals].map((s) => s.split(',').map(Number));
  const h = (x, y) => Math.min(...hx.map(([a, b]) => Math.max(Math.abs(a - x), Math.abs(b - y))));
  f[key(sx, sy)] = h(sx, sy);
  const closed = new Set(); let it = 0;
  while (open.length && it++ < 7000) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (f[key(...open[i])] < f[key(...open[bi])]) bi = i;
    const [x, y] = open.splice(bi, 1)[0], k = key(x, y);
    if (goals.has(k)) { const p = [[x, y]]; let c = k; while (from[c]) { c = from[c]; p.unshift(c.split(',').map(Number)); } p.shift(); return p; }
    closed.add(k);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = x + dx, ny = y + dy, nk = key(nx, ny);
      if (closed.has(nk)) continue;
      if (blocked(nx, ny) && !goals.has(nk)) continue;
      if (dx && dy && (blocked(x + dx, y) || blocked(x, y + dy))) continue;
      const ng = g[k] + (dx && dy ? 1.41 : 1);
      if (g[nk] === undefined || ng < g[nk]) {
        g[nk] = ng; f[nk] = ng + h(nx, ny); from[nk] = k;
        if (!open.some((o) => o[0] == nx && o[1] == ny)) open.push([nx, ny]);
      }
    }
  }
  return null;
}

export const tileOf = (u) => [Math.floor(u.x / T), Math.floor(u.y / T)];
function ringAround(x, y, w, h) {
  const s = new Set();
  for (let i = x - 1; i <= x + w; i++) for (let j = y - 1; j <= y + h; j++) {
    if (i >= x && i < x + w && j >= y && j < y + h) continue;
    if (!blocked(i, j)) s.add(i + ',' + j);
  }
  return s;
}
function goTo(u, goals) {
  const [sx, sy] = tileOf(u);
  if (goals.has(sx + ',' + sy)) { u.path = []; return true; }
  const p = astar(sx, sy, goals); u.path = p; return !!p;
}
function moveAlong(u) {
  if (!u.path || !u.path.length) return true;
  const [tx, ty] = u.path[0], gx = tx * T + T / 2, gy = ty * T + T / 2, dx = gx - u.x, dy = gy - u.y, d = Math.hypot(dx, dy);
  const onder = G.map[Math.floor(u.y / T)] && G.map[Math.floor(u.y / T)][Math.floor(u.x / T)]; // moeras: half zo snel, weg: sneller
  const sp = UNIT[u.k].spd * (u.tempo || 1) * (onder == 'r' ? 1.45 : onder == 'm' ? 0.55 : 1);
  if (blocked(tx, ty) && u.path.length > 1) { u.path = null; return false; }
  if (d <= sp) { u.x = gx; u.y = gy; u.path.shift(); return !u.path.length; }
  u.x += dx / d * sp; u.y += dy / d * sp; return false;
}
function reveal() {
  for (const o of [...G.units.filter((u) => u.side == 'h'), ...G.blds.filter((b) => b.side == 'h')]) {
    const cx = o.w ? o.x + o.w / 2 : o.x / T, cy = o.w ? o.y + o.h / 2 : o.y / T, r = (o.w ? 4 : UNIT[o.k].sight) + 0.5;
    for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++)
      if (x >= 0 && y >= 0 && x < G.MW && y < G.MH && (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) G.explored[y][x] = true;
  }
}
export const isExp = (x, y) => x >= 0 && y >= 0 && x < G.MW && y < G.MH && G.explored[y][x];

// ---------- gedrag ----------
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const center = (b) => ({ x: (b.x + b.w / 2) * T, y: (b.y + b.h / 2) * T });
function targetDist(u, tg) {
  if (tg.w) { const c = center(tg), hw = tg.w * T / 2, hh = tg.h * T / 2; const dx = Math.max(0, Math.abs(u.x - c.x) - hw), dy = Math.max(0, Math.abs(u.y - c.y) - hh); return Math.hypot(dx, dy); }
  return dist(u, tg);
}
function alive(o) { return o.w ? G.blds.includes(o) : G.units.includes(o); }

function damage(tg, n, by) {
  if (by && by.side == 'o') n *= DIFF[G.diff].dmg;
  tg.hp -= n;
  if (tg.side == 'o' && by && G.units.includes(by)) { for (const o of G.units) if (o.side == 'o' && o.st != 'attack' && dist(o, tg) < 4 * T && zelfde(o, by)) cmdAttack(o, by); }
  if (tg.side == 'h' && by && G.units.includes(by)) { const c = tg.w ? center(tg) : tg; for (const u of G.units) if (u.side == 'h' && u.k != 'werker' && u.st == 'idle' && dist(u, c) < 10 * T && zelfde(u, by)) cmdAttack(u, by); }
  if (tg.side == 'h' && G.t - G.lastAlert > 600) { G.lastAlert = G.t; sHorn(); say(G.L.dungeon ? 'Je groep wordt aangevallen!' : G.L.army ? 'Je leger wordt aangevallen!' : G.L.keep ? 'De abdij wordt aangevallen!' : 'Je dorp wordt aangevallen!', 150); }
  if (tg.w) {
    if (tg.hp <= 0) {
      G.blds.splice(G.blds.indexOf(tg), 1);
      const c = center(tg);
      for (let i = 0; i < 14; i++) G.fx.push({ x: c.x + (Math.random() - 0.5) * tg.w * T, y: c.y + (Math.random() - 0.5) * tg.h * T, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2, h: 0, l: 50, c: '#7a6a5a' });
      noise(0.5, 0.1, 300); if (G.selB == tg) G.selB = null;
      if (tg.k == 'kooi') bevrijd(tg);
    }
  } else if (tg.hp <= 0) {
    G.units.splice(G.units.indexOf(tg), 1); G.sel = G.sel.filter((s) => s != tg);
    G.fx.push({ x: tg.x, y: tg.y, l: 90, grave: tg.side }); noise(0.2, 0.06, 500);
  }
}

// Trap omhoog: wie erop stapt, staat meteen op de volgende verdieping (een beetje naast elkaar)
function trap(u) {
  if (u.tp > 0) { u.tp--; return; }
  const [tx, ty] = tileOf(u), st = G.L.stairs.find((q) => q.from[0] == tx && q.from[1] == ty);
  if (!st) return;
  const n = G.units.filter((o) => o.side == 'h' && tileOf(o)[0] <= st.to[0] && tileOf(o)[0] >= st.to[0] - 2 && Math.abs(tileOf(o)[1] - st.to[1]) < 2).length;
  let ax = st.to[0] - (n % 3), ay = st.to[1] - Math.floor(n / 3) % 2;
  if (blocked(ax, ay)) { ax = st.to[0]; ay = st.to[1]; }
  u.x = ax * T + T / 2; u.y = ay * T + T / 2; u.path = null; u.st = 'idle'; u.tg = null; u.tp = 60;
  snd(660, 0.12, 'triangle', 0.05, 990);
  if (G.t - (G.trapMelding || -999) > 60) { G.trapMelding = G.t; say('Verdieping ' + st.naar + '!', 120); }
  if (G.sel.includes(u)) G.trapSprong = { x: u.x, y: u.y, t: G.t }; // de camera gaat mee naar boven
}

// Tovenaar: vuurregen (80 toverkracht, je kiest daarna een plek) en een waterwezen oproepen (60)
export function tovenaar() { return G.sel.filter((u) => u.k == 'magier').sort((a, b) => b.mana - a.mana)[0]; }
export function vuurregen() {
  const m = tovenaar(); if (!m) return;
  if (m.mana < 80) { say('Te weinig toverkracht (80 nodig).'); sNee(); return; }
  G.cast = { spell: 'vuur', m }; G.place = null; sClick();
  say('Klik op de plek waar de vuurregen moet vallen.', 300);
}
export function roepWater() {
  const m = tovenaar(); if (!m) return;
  if (m.mana < 60) { say('Te weinig toverkracht (60 nodig).'); sNee(); return; }
  m.mana -= 60;
  const [mx, my] = tileOf(m), plek = [[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0]].map(([dx, dy]) => [mx + dx, my + dy]).find(([x, y]) => !blocked(x, y));
  const w = addUnit('watergeest', plek[0], plek[1]); w.ttl = 60 * 45; w.voice = null;
  for (let i = 0; i < 14; i++) G.fx.push({ x: w.x + (Math.random() - 0.5) * 20, y: w.y, vx: (Math.random() - 0.5), vy: -1, h: 6, l: 30, c: '#9fd3ff' });
  snd(300, 0.5, 'sine', 0.06, 700); say('Een waterwezen vecht 45 seconden met je mee!', 150);
}

// De gevangenis is kapot: vier werkers komen vrij
function bevrijd(b) {
  G.freed = true;
  const ring = [...ringAround(b.x, b.y, b.w, b.h)];
  const vrij = [];
  for (let i = 0; i < 4; i++) { const [x, y] = (ring[i * 2] || ring[0]).split(',').map(Number); vrij.push(addUnit('werker', x, y)); }
  [523, 659, 784, 1046].forEach((f, i) => snd(f, 0.2, 'triangle', 0.06, 0, i * 0.1));
  say('De werkers zijn vrij! Stuur ze terug naar het dorp om te werken.', 300);
  const u = vrij[0];
  setTimeout(() => speak({ nl: 'Dank u, heer!', en: 'Thank you, my lord!', de: 'Danke schön!', it: 'Grazie mille!', fr: 'Merci beaucoup!' }[u.voice.lang], 1.3, u.voice.lang), 400);
}

function nearestEnemy(u, range) {
  let best = null, bd = range;
  for (const e of G.units) if (e.side != u.side && e.side != 'n' && zelfde(u, e)) { const d = dist(u, e); if (d < bd && (u.side == 'o' || isExp(...tileOf(e)))) { bd = d; best = e; } }
  for (const b of G.blds) if (b.side != u.side && b.k != 'weg') { const d = targetDist(u, b); if (d < bd) { bd = d; best = b; } }
  return best;
}
function attackGoals(tg) { if (tg.w) return ringAround(tg.x, tg.y, tg.w, tg.h); const [x, y] = tileOf(tg); return new Set([x + ',' + y]); }
function cmdAttack(u, tg) { u.st = 'attack'; u.tg = tg; u.path = null; u.repath = 0; }
function cmdMove(u, tx, ty) { u.st = 'move'; u.tg = null; if (blocked(tx, ty)) { u.path = null; goTo(u, ringAround(tx, ty, 1, 1)); } else goTo(u, new Set([tx + ',' + ty])); }
function nearestTree(x, y) {
  let best = null, bd = 1e9;
  for (const k in G.trees) if (G.trees[k] > 0) {
    const [tx, ty] = k.split(',').map(Number);
    if (!isExp(tx, ty)) continue;
    const d = (tx - x) ** 2 + (ty - y) ** 2;
    if (d < bd && ringAround(tx, ty, 1, 1).size) { bd = d; best = [tx, ty]; }
  }
  return best;
}
// Nieuwe mannetjes komen op het vakje naast het gebouw waar nog het minst staat (liefst aan de voorkant)
function vrijePlek(b) {
  let best = null, bs = 1e9;
  for (const k of ringAround(b.x, b.y, b.w, b.h)) {
    const [x, y] = k.split(',').map(Number);
    const n = G.units.filter((u) => tileOf(u)[0] == x && tileOf(u)[1] == y).length;
    const score = n * 10 + (y >= b.y + b.h ? 0 : 1) + Math.abs(x - (b.x + (b.w - 1) / 2)) * 0.1;
    if (score < bs) { bs = score; best = [x, y]; }
  }
  return best;
}

// Mannetjes die niets te doen hebben schuiven zachtjes opzij, zodat ze niet in elkaar staan
function uitElkaar() {
  const us = G.units;
  for (let i = 0; i < us.length; i++) {
    const a = us[i]; if (a.hidden) continue;
    for (let j = i + 1; j < us.length; j++) {
      const b = us[j]; if (b.hidden) continue;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
      if (d >= 16) continue;
      const nx = d > 0.01 ? dx / d : Math.cos(i + j), ny = d > 0.01 ? dy / d : Math.sin(i + j), duw = (16 - d) * 0.06;
      for (const [u, f] of [[a, -1], [b, 1]]) {
        if (u.st != 'idle' || (u.path && u.path.length)) continue; // alleen wie niets te doen heeft schuift opzij
        const x = u.x + nx * duw * f, y = u.y + ny * duw * f;
        if (!blocked(Math.floor(x / T), Math.floor(y / T))) { u.x = x; u.y = y; }
      }
    }
  }
}

// Sir Lodewijk zit gevangen tot er iemand van jou vlak bij hem is; dan worden de skeletten wakker
function gevangenRidder(u) {
  if (!G.units.some((o) => o.side == 'h' && dist(o, u) < 1.8 * T)) return;
  u.side = 'h'; u.captive = 0; sDone();
  say('Sir Lodewijk is bevrijd! Maar pas op: de skeletten worden wakker!', 300);
  for (const [ax, ay] of (G.L.ambush || []).slice(0, G.diff == 0 ? 3 : 5)) {
    if (!blocked(ax, ay)) { const z = addUnit('skelet', ax, ay); z.home = { x: z.x, y: z.y }; }
  }
  setTimeout(sHorn, 1200);
  speak(pick(['Eindelijk! Dank u wel!', 'At last! Thank you!', 'Endlich! Danke!', 'Finalmente! Grazie!', 'Enfin! Merci!']), 0.6, 'nl');
}

// De genezer maakt elke paar tellen het meest gewonde mannetje vlakbij weer wat beter
function genezen(u) {
  if (G.t % 50) return;
  const w = G.units.filter((o) => o.side == 'h' && o.hp < o.max && dist(o, u) < 4 * T).sort((a, b) => a.hp / a.max - b.hp / b.max)[0];
  if (!w) return;
  w.hp = Math.min(w.max, w.hp + 8); u.deel = 30;
  for (let i = 0; i < 6; i++) G.fx.push({ x: w.x + (Math.random() - 0.5) * 14, y: w.y + (Math.random() - 0.5) * 14, vx: (Math.random() - 0.5) * 0.6, vy: -0.8 - Math.random(), h: 10, l: 30, c: '#9ef08a' });
  snd(1200, 0.12, 'sine', 0.03, 1600);
}

function hall() { return G.blds.find((b) => (b.k == 'kasteel' || b.k == 'abdij') && b.done); }

// Elke werker heeft door zijn land iets extra's (zie LAND in data.js)
export const land = (u) => u.voice && u.voice.lang;
function pizzaPauze(u) { // Italiaan deelt pizza uit: geneest mannetjes vlakbij
  if ((G.t + u.id * 37) % 180) return;
  const ziek = G.units.filter((o) => o.side == 'h' && o.hp < o.max && dist(o, u) < 2.2 * T);
  if (!ziek.length) return;
  for (const o of ziek) {
    o.hp = Math.min(o.max, o.hp + 4);
    for (let i = 0; i < 5; i++) G.fx.push({ x: o.x + (Math.random() - 0.5) * 14, y: o.y + (Math.random() - 0.5) * 14, vx: (Math.random() - 0.5) * 0.4, vy: -0.8 - Math.random() * 0.6, h: 10, l: 35, c: '#9ef08a' });
  }
  u.deel = 40;
  if (Math.random() < 0.3) unitSay(u, 'extra');
}

export function update() {
  G.t++;
  if (G.t % 30 == 0 && G.L.procent && !G.tussen) G.beste = Math.max(G.beste, Math.min(99, Math.round(G.L.procent(S))));
  const L = G.L;
  if (G.t % 10 == 0) reveal();
  // gebouwen
  for (const b of [...G.blds]) {
    if (b.q.length) {
      b.qp++; const k = b.q[0];
      if (b.qp >= UNIT[k].time) {
        const plek = vrijePlek(b);
        if (plek) { addUnit(k, plek[0], plek[1]); sDone(); say(UNIT[k].n + ' is klaar!', 90); }
        b.q.shift(); b.qp = 0;
      }
    }
    if ((b.k == 'toren' || b.k == 'orktoren') && b.done && !G.tussen) {
      const D = BLD[b.k];
      if (b.cd > 0) b.cd--;
      else {
        const c = center(b), tg = G.units.filter((u) => u.side != b.side && u.side != 'n' && !u.hidden).find((u) => dist(u, c) < D.rng);
        if (tg) { b.cd = D.cd; G.fx.push({ x: c.x, y: c.y, tx: tg.x, ty: tg.y, l: 24, l0: 24, arrow: 1, hoog: 1 }); damage(tg, D.dmg, b.side == 'o' ? { side: 'o' } : null); sArrow(); }
      }
    }
  }
  // eenheden
  for (const u of [...G.units]) {
    if (!G.units.includes(u)) continue;
    const d = UNIT[u.k];
    if (u.cd > 0) u.cd--;
    if (u.deel > 0) u.deel--;
    if (u.k == 'magier' && G.t % 20 == 0 && u.mana < 100) u.mana++;
    if (u.ttl !== undefined && --u.ttl <= 0) { // het opgeroepen waterwezen lost op
      G.units.splice(G.units.indexOf(u), 1); G.sel = G.sel.filter((s) => s != u);
      for (let i = 0; i < 10; i++) G.fx.push({ x: u.x + (Math.random() - 0.5) * 16, y: u.y, vx: (Math.random() - 0.5), vy: -1, h: 6, l: 25, c: '#9fd3ff' });
      continue;
    }
    if (G.L.stairs && u.side == 'h' && !G.tussen) trap(u);
    if (u.side == 'o') { if (!G.tussen) orcBrain(u); }
    else if (u.side == 'n') { gevangenRidder(u); continue; }
    else if (u.k == 'werker' && land(u) == 'it') pizzaPauze(u);
    else if (u.k == 'genezer') genezen(u);
    if (u.side == 'h' && !G.tussen && u.st == 'idle' && u.k != 'werker' && u.k != 'genezer') {
      const e = (u.k == 'katapult' && G.blds.find((b) => b.side == 'o' && targetDist(u, b) < d.sight * T && isExp(b.x, b.y))) || nearestEnemy(u, d.sight * T);
      if (e) cmdAttack(u, e);
    }
    if (u.st == 'move') { if (!u.path || moveAlong(u)) { u.st = 'idle'; u.path = null; } }
    else if (u.st == 'attack') {
      const tg = u.tg;
      if (!tg || !alive(tg)) { u.st = u.side == 'o' && u.raid ? 'raid' : 'idle'; u.tg = null; continue; }
      const td = targetDist(u, tg);
      if (td <= d.rng) {
        u.path = null;
        if (u.cd <= 0) {
          u.cd = d.cd; u.swing = 12;
          const tx = tg.w ? center(tg).x : tg.x, ty = tg.w ? center(tg).y : tg.y;
          if (d.splash) { // katapult: steen die alles in de buurt raakt, gebouwen extra hard
            G.fx.push({ x: u.x, y: u.y, tx, ty, l: 40, rock: 1 }); noise(0.3, 0.08, 300);
            const geraakt = [...G.units.filter((e) => e.side != u.side && e.side != 'n' && Math.hypot(e.x - tx, e.y - ty) < 36), ...G.blds.filter((b) => b.side != u.side && targetDist({ x: tx, y: ty }, b) < 36)];
            for (const e of geraakt) if (e.hp > 0) damage(e, d.dmg * (e.w ? d.bld || 1 : 1), u);
          } else {
            if (d.fire) { G.fx.push({ x: u.x, y: u.y, tx, ty, l: 16, l0: 16, vuur: 1 }); snd(220, 0.25, 'sawtooth', 0.04, 90); }
            else if (d.rng > 40) { G.fx.push({ x: u.x, y: u.y, tx, ty, l: 12, arrow: 1 }); sArrow(); } else sHit();
            damage(tg, d.dmg, u);
          }
        }
      } else {
        if (!u.path || --u.repath <= 0) {
          u.repath = 30;
          if (!goTo(u, attackGoals(tg))) { // geen weg: dan maar door de dichtstbijzijnde muur heen
            const wk = u.side == 'h' ? 'orkmuur' : 'muur', doel = tg.w ? center(tg) : tg;
            const wl = G.blds.filter((b) => b.k == wk).sort((a, c) => targetDist(u, a) + targetDist(doel, a) - (targetDist(u, c) + targetDist(doel, c)))[0];
            if (wl && wl != tg && goTo(u, attackGoals(wl))) { u.tg = wl; u.fail = 0; }
            else if (++u.fail > 2) { u.fail = 0; u.st = 'idle'; u.tg = null; u.path = null; continue; }
          } else u.fail = 0;
        }
        if (u.path && u.path.length) moveAlong(u);
        else {
          const cx = tg.w ? Math.max(tg.x * T, Math.min((tg.x + tg.w) * T, u.x)) : tg.x, cy = tg.w ? Math.max(tg.y * T, Math.min((tg.y + tg.h) * T, u.y)) : tg.y;
          const dx = cx - u.x, dy = cy - u.y, dd = Math.hypot(dx, dy) || 1;
          u.x += dx / dd * d.spd; u.y += dy / dd * d.spd;
        }
      }
    } else if (u.st == 'wood' || u.st == 'gold' || u.st == 'build') workerBrain(u);
    if (u.swing > 0) u.swing--;
  }
  uitElkaar();
  if (G.tussen) { for (const f of G.fx) { f.l--; if (f.vx !== undefined) { f.x += f.vx; f.h -= f.vy; f.vy += 0.05; } } G.fx = G.fx.filter((f) => f.l > 0); return; } // tijdens een tussenstukje: alleen lopen
  // golven (vanaf level 2)
  if (L.siege && !G.saved && !G.units.some((u) => u.siege)) { // alle belegeraars zijn verjaagd
    G.saved = true; G.res.goud += 400; G.res.hout += 100; G.nextWave = Math.max(G.nextWave, G.t + 1800); sDone();
    say('De abdij is gered! De monniken geven je 400 goud en 100 hout. Train er soldaten en genezers.', 400);
    speak(pick(['Gered! Dank u wel!', 'Saved! Thank you!', 'Gerettet! Danke!', 'Salvi! Grazie!', 'Sauvés! Merci!']), 0.8, 'nl');
  }
  if (L.waves && S.huts() + S.camps() > 0 && G.saved && G.t >= G.nextWave) {
    G.nextWave = G.t + Math.round(L.waves.every * DIFF[G.diff].wave); G.waveN++;
    const huts = G.blds.filter((b) => b.k == 'orkhut' || b.k == 'roverkamp'), soort = L.waves.units;
    const n = Math.max(1, Math.min(1 + G.waveN, 4) + DIFF[G.diff].extra);
    for (let i = 0; i < n; i++) {
      const h = huts[i % huts.length], ring = [...ringAround(h.x, h.y, h.w, h.h)];
      if (!ring.length) continue;
      const [x, y] = ring[i % ring.length].split(',').map(Number);
      const o = addUnit(L.waves.cat && i == 0 && G.waveN % 3 == 0 ? 'orkkatapult' : soort ? soort[i % soort.length] : i % 3 == 2 ? 'speerork' : 'ork', x, y); o.raid = 1; o.st = 'raid'; // cat: elke derde golf een orkenkatapult
    }
    sHorn(); say((soort ? 'De rovers vallen aan!' : 'De orks vallen aan!') + ' (golf ' + G.waveN + ')', 180);
  }
  if (L.tower && G.t % 900 == 0) { // Morvan roept demonen op als je dichtbij komt
    const m = S.morvan();
    if (m && G.units.some((h) => h.side == 'h' && dist(h, m) < 9 * T && zelfde(h, m)) && G.units.filter((o) => o.k == 'demoon').length < 7) {
      for (let i = 0; i < 2; i++) {
        const [mx, my] = tileOf(m), x = blocked(mx - 1 - i, my + 1) ? mx : mx - 1 - i, y = blocked(x, my + 1) ? my : my + 1;
        const dm = addUnit('demoon', x, y); dm.home = { x: dm.x, y: dm.y };
        for (let k = 0; k < 10; k++) G.fx.push({ x: dm.x + (Math.random() - 0.5) * 20, y: dm.y, vx: (Math.random() - 0.5), vy: -1, h: 8, l: 30, c: '#c86bff' });
      }
      say('Morvan roept demonen op!', 120); snd(200, 0.5, 'sawtooth', 0.06, 90);
    }
  }
  if (L.graves && G.t % 30 == 0) { // orkpriesters laten skeletten uit de graven (g) opstaan als je leger dichtbij is
    for (const pr of G.units.filter((u) => u.k == 'orkpriester')) {
      pr.raiseT = (pr.raiseT || 0) + 30;
      if (pr.raiseT < 540 || !G.units.some((h) => h.side == 'h' && dist(h, pr) < 13 * T) || G.units.filter((o) => o.k == 'skelet').length >= 20) continue;
      pr.raiseT = 0;
      const [px0, py0] = tileOf(pr); let best = null, bd = 1e9;
      for (let y = 0; y < G.MH; y++) for (let x = 0; x < G.MW; x++) if (G.map[y][x] == 'g') { const dd = (x - px0) ** 2 + (y - py0) ** 2; if (dd < bd && dd < 100) { bd = dd; best = [x, y]; } }
      if (!best) continue;
      for (let q = 0; q < 2; q++) {
        const z = addUnit('skelet', blocked(best[0] + q, best[1]) ? best[0] : best[0] + q, best[1]); z.home = { x: z.x, y: z.y };
        for (let k = 0; k < 12; k++) G.fx.push({ x: z.x + (Math.random() - 0.5) * 16, y: z.y, vx: (Math.random() - 0.5), vy: -1.2, h: 4, l: 30, c: '#7aff6a' });
      }
      G.graafOpen = { k: best[0] + ',' + best[1], t: G.t };
      snd(150, 0.5, 'sawtooth', 0.05, 60);
      if (G.t - (G.opstaanMelding || -999) > 600) { G.opstaanMelding = G.t; say('Een orkpriester laat skeletten uit hun graf opstaan!', 150); }
    }
  }
  if (L.heksen && G.t % 30 == 0) { // orkenheksen: elke 13 s een demon, elke 10 s een gifwolk op je mannetjes vlakbij
    for (const hx of G.units.filter((u) => u.k == 'orkheks')) {
      hx.sT = (hx.sT || 0) + 30; hx.pT = (hx.pT || 0) + 30;
      const dichtbij = G.units.filter((h) => h.side == 'h' && dist(h, hx) < 7 * T);
      if (hx.sT >= 780 && dichtbij.length && G.units.filter((o) => o.k == 'demoon').length < 8) {
        hx.sT = 0; const [x0, y0] = tileOf(hx), x = blocked(x0 + 1, y0) ? x0 : x0 + 1;
        const dm = addUnit('demoon', x, y0); dm.home = { x: dm.x, y: dm.y };
        for (let k = 0; k < 10; k++) G.fx.push({ x: dm.x + (Math.random() - 0.5) * 20, y: dm.y, vx: (Math.random() - 0.5), vy: -1, h: 8, l: 30, c: '#c86bff' });
        snd(200, 0.5, 'sawtooth', 0.05, 90);
      }
      if (hx.pT >= 600 && dichtbij.length) {
        hx.pT = 0; const tg = dichtbij[Math.floor(Math.random() * dichtbij.length)];
        G.gif.push({ x: tg.x, y: tg.y, t: 180 }); say('Een orkenheks roept een gifwolk op! Loop eruit!', 120); snd(90, 0.6, 'sawtooth', 0.04, 60);
      }
    }
  }
  for (const g of G.gif) { g.t--; if (g.t % 30 == 0) for (const h of G.units.filter((h) => h.side == 'h' && Math.hypot(h.x - g.x, h.y - g.y) < 44)) damage(h, 4, null); }
  G.gif = G.gif.filter((g) => g.t > 0);
  for (const rn of G.regens) { // vuurregen: elke paar tellen een vuurbal uit de lucht
    rn.t--;
    if (rn.t % 12 == 0) {
      const ax = rn.x + (Math.random() - 0.5) * 90, ay = rn.y + (Math.random() - 0.5) * 90;
      G.fx.push({ x: ax, y: ay, l: 18, l0: 18, meteoor: 1 });
      for (const e of [...G.units.filter((e) => e.side == 'o' && Math.hypot(e.x - ax, e.y - ay) < 30), ...G.blds.filter((b) => b.side == 'o' && targetDist({ x: ax, y: ay }, b) < 20)]) if (e.hp > 0) damage(e, 12, null);
      noise(0.15, 0.05, 500);
    }
  }
  G.regens = G.regens.filter((r) => r.t > 0);
  for (const f of G.fx) { f.l--; if (f.vx !== undefined) { f.x += f.vx; f.h -= f.vy; f.vy += 0.05; } }
  G.fx = G.fx.filter((f) => f.l > 0);
  if (G.msgT > 0) G.msgT--;
  // winst en verlies
  if (L.tower || L.army) { if (!G.units.some((u) => u.side == 'h' && u.k != 'watergeest')) { G.lostMsg = 'Je hele groep is verslagen...'; G.state = 'verloren'; sHorn(); return; } }
  else if (L.dungeon) {
    const h = G.units.find((u) => u.k == 'held');
    if (!h) { G.lostMsg = 'Sir Lodewijk is gesneuveld...'; G.state = 'verloren'; sHorn(); return; }
    if (!G.units.some((u) => u.side == 'h' && u.k != 'held') && h.side == 'n') { G.lostMsg = 'Je hele groep is verslagen...'; G.state = 'verloren'; sHorn(); return; }
  } else if (L.keep) { if (!G.blds.some((b) => b.k == L.keep)) { G.lostMsg = 'De abdij is verwoest...'; G.state = 'verloren'; sHorn(); return; } }
  else if (!G.blds.some((b) => b.k == 'kasteel')) { G.lostMsg = 'Het kasteel is gevallen...'; G.state = 'verloren'; sHorn(); return; }
  if (!G.freed && !G.units.some((u) => u.side == 'h')) { G.lostMsg = 'Je hele leger is verslagen...'; G.state = 'verloren'; sHorn(); return; }
  if (L.win(S)) {
    G.state = 'gewonnen'; G.unlocked = Math.max(G.unlocked, G.lvl + 2);
    bewaar('orkenstorm3d_lvl', G.unlocked);
    sWin(); speak(pick(['Overwinning!', 'Victory!', 'Sieg!']), 1, 'nl');
  }
}

function orcBrain(u) {
  const d = UNIT[u.k];
  if (u.st == 'attack') {
    if (!u.raid && u.home && dist(u, u.home) > 9 * T) { u.st = 'move'; u.tg = null; goTo(u, new Set([Math.floor(u.home.x / T) + ',' + Math.floor(u.home.y / T)])); }
    return;
  }
  const e = nearestEnemy(u, (u.raid ? 3 : d.sight) * T);
  if (e) { cmdAttack(u, e); return; }
  if (u.raid) {
    const h = hall(); if (!h) return;
    if (u.st != 'raid' || !u.path) {
      u.st = 'raid';
      if ((!u.path || !u.path.length) && !goTo(u, ringAround(h.x, h.y, h.w, h.h))) { // muren in de weg: sla het dichtstbijzijnde gebouw
        const w = G.blds.filter((b) => b.side == 'h').sort((a, c) => targetDist(u, a) - targetDist(u, c))[0];
        if (w) { cmdAttack(u, w); return; }
      }
    }
    if (u.path && moveAlong(u)) cmdAttack(u, h);
    return;
  }
  if (u.home && dist(u, u.home) > T * 1.5 && u.st == 'idle') { u.st = 'move'; goTo(u, new Set([Math.floor(u.home.x / T) + ',' + Math.floor(u.home.y / T)])); }
}

// een gebouw waar een werker aan kan werken: nog niet af, of af maar beschadigd (repareren)
const teDoen = (b) => alive(b) && (!b.done || b.hp < b.max);
const HERSTEL = 0.4; // een gebouw helemaal repareren kost 40% van wat het bouwen kostte

function nextBuild(u) {
  u.path = null;
  while (u.bq && u.bq.length) { const n = u.bq.shift(); if (teDoen(n)) { u.st = 'build'; u.tg = n; return; } }
  u.st = 'idle'; u.tg = null;
  if (u.job) { const j = u.job; u.job = null; u.st = j.st; u.tg = j.tg; }
}

function workerBrain(u) {
  const h = hall();
  if (u.st == 'build') {
    const b = u.tg;
    if (!b || !teDoen(b)) { if (b && b.done && u.bezig == b) say(BLD[b.k].n + ' is weer helemaal heel!', 100); nextBuild(u); return; }
    if (targetDist(u, b) > T * 0.8) { if (!u.path || !u.path.length) { if (!goTo(u, ringAround(b.x, b.y, b.w, b.h))) { u.st = 'idle'; return; } } moveAlong(u); return; }
    u.path = null; u.bezig = b;
    const tempo = land(u) == 'de' ? 1.3 : 1;
    if (b.done) { // repareren: half zo snel als bouwen, en het kost een beetje goud en hout
      const erbij = Math.min(b.max - b.hp, tempo * b.max / (BLD[b.k].time || 600) / 2), c = BLD[b.k].cost || [b.max / 4, b.max / 8]; // kasteel en abdij hebben geen prijs
      const k = b.herstelKost = b.herstelKost || [0, 0];
      k[0] += c[0] * HERSTEL * erbij / b.max; k[1] += c[1] * HERSTEL * erbij / b.max;
      const nu = [Math.floor(k[0]), Math.floor(k[1])];
      if (!canAfford(nu)) { say('Niet genoeg goud of hout om verder te repareren.', 150); u.bq = []; nextBuild(u); return; }
      pay(nu); k[0] -= nu[0]; k[1] -= nu[1];
      b.hp = Math.min(b.max, b.hp + erbij);
      if (G.t % 30 == 0) { u.swing = 12; sBuild(); }
      return;
    }
    b.prog += tempo / BLD[b.k].time; b.hp = Math.min(b.max, b.hp + tempo * b.max / BLD[b.k].time);
    if (G.t % 30 == 0) { u.swing = 12; sBuild(); }
    if (b.prog >= 1 && b.k == 'weg') { // een stukje weg wordt deel van de kaart
      G.map[b.y][b.x] = 'r'; G.mapVersie++; G.blds.splice(G.blds.indexOf(b), 1); snd(500, 0.06, 'triangle', 0.03); nextBuild(u); return;
    }
    if (b.prog >= 1) { b.done = true; b.hp = b.max; sDone(); say(BLD[b.k].n + ' is klaar!', 100); if (land(u) == 'de' && Math.random() < 0.5) setTimeout(() => unitSay(u, 'extra'), 700); nextBuild(u); }
    return;
  }
  // hout of goud terugbrengen
  if (u.carry) {
    if (!h) { u.st = 'idle'; return; }
    if (targetDist(u, h) > T * 0.8) { if (!u.path || !u.path.length) { if (!goTo(u, ringAround(h.x, h.y, h.w, h.h))) { u.st = 'idle'; return; } } moveAlong(u); return; }
    const extra = u.carry == 'goud' && land(u) == 'nl' ? 2 : 0;
    G.res[u.carry] += 10 + extra; if (u.carry == 'goud') sGold(); else sHout();
    if (extra && Math.random() < 0.15) unitSay(u, 'extra');
    u.carry = null; u.path = null; return;
  }
  if (land(u) == 'en') { // af en toe theepauze
    if (u.thee > 0) { u.thee--; u.path = null; return; }
    if (u.theeKlok === undefined) u.theeKlok = 1800 + Math.random() * 1200;
    if (!u.inMine && --u.theeKlok <= 0) { u.theeKlok = 2400 + Math.random() * 1200; u.thee = 150; u.hidden = false; unitSay(u, 'extra'); return; }
  }
  if (u.st == 'wood') {
    let [tx, ty] = u.tg;
    if (!(G.trees[tx + ',' + ty] > 0)) {
      const n = nearestTree(tx, ty);
      if (!n) { u.st = 'idle'; say('Er is geen bos meer in de buurt.', 100); return; }
      u.tg = n; [tx, ty] = n; u.path = null;
    }
    if (Math.max(Math.abs(Math.floor(u.x / T) - tx), Math.abs(Math.floor(u.y / T) - ty)) > 1) {
      if (!u.path || !u.path.length) {
        if (!goTo(u, ringAround(tx, ty, 1, 1))) { const n = nearestTree(tx + 3, ty + 3); if (n && (n[0] != tx || n[1] != ty)) u.tg = n; else u.st = 'idle'; return; }
      }
      moveAlong(u); return;
    }
    u.path = null; u.kijk = { x: tx * T + T / 2, y: ty * T + T / 2 }; u.work = (u.work || 0) + 1;
    if (u.work % 30 == 0) { sChop(); u.swing = 12; G.hak = { k: tx + ',' + ty, t: G.t }; }
    if (u.work >= (land(u) == 'en' ? 115 : 150)) {
      u.work = 0; G.trees[tx + ',' + ty] -= 10;
      if (G.trees[tx + ',' + ty] <= 0) { G.map[ty][tx] = 's'; G.mapVersie++; }
      u.carry = 'hout';
    }
    return;
  }
  if (u.st == 'gold') {
    let k = u.tg;
    if (!(G.mineG[k] > 0)) { // mijn leeg: naar de dichtstbijzijnde mijn die nog goud heeft
      const [ux, uy] = tileOf(u);
      const nk = Object.keys(G.mineG).filter((m) => G.mineG[m] > 0 && isExp(...m.split(',').map(Number)))
        .sort((a, b) => { const [ax, ay] = a.split(',').map(Number), [bx, by] = b.split(',').map(Number); return (ax - ux) ** 2 + (ay - uy) ** 2 - ((bx - ux) ** 2 + (by - uy) ** 2); })[0];
      if (!nk) { u.st = 'idle'; say('Alle bekende goudmijnen zijn leeg. Zoek een nieuwe mijn onder de wolken!', 200); return; }
      u.tg = k = nk; u.path = null;
      if (G.t - (G.mijnMelding || -999) > 300) { G.mijnMelding = G.t; say('De mijn is leeg: de werkers lopen naar de volgende mijn.', 180); }
    }
    const [mx, my] = k.split(',').map(Number);
    if (u.inMine) {
      u.inMine--;
      if (u.inMine == 0) {
        G.mineG[k] -= 10; u.carry = 'goud';
        if (G.mineG[k] <= Math.min(300, G.mineMax[k] * 0.2) && G.mineG[k] > 0 && !G.bijnaLeeg[k]) { G.bijnaLeeg[k] = G.t; say('Een goudmijn raakt bijna leeg (' + G.mineG[k] + ' goud over)!', 200); snd(440, 0.2, 'triangle', 0.05, 330); }
        if (G.mineG[k] <= 0) { say('Een goudmijn is uitgeput.', 150); noise(0.4, 0.08, 300); }
        const ring = [...ringAround(mx, my, 2, 2)];
        if (ring.length) { const [x, y] = ring[0].split(',').map(Number); u.x = x * T + T / 2; u.y = y * T + T / 2; }
        u.hidden = false;
      }
      return;
    }
    if (targetDist(u, { x: mx, y: my, w: 2, h: 2 }) > T * 0.8) { if (!u.path || !u.path.length) { if (!goTo(u, ringAround(mx, my, 2, 2))) { u.st = 'idle'; return; } } moveAlong(u); return; }
    u.path = null; u.inMine = land(u) == 'fr' ? 60 : 100; u.hidden = true;
  }
}

// ---------- opdrachten van de speler ----------
export function canAfford(c) { return G.res.goud >= c[0] && G.res.hout >= c[1]; }
function pay(c) { G.res.goud -= c[0]; G.res.hout -= c[1]; }

export function train(b, k) {
  const c = UNIT[k].cost;
  if (UNIT[k].needs && !UNIT[k].needs.every((n) => S.count(n))) { say('Bouw eerst een smederij en een houtzagerij.'); sNee(); return; }
  if (b.k == 'abdij' && !G.saved) { say('De abdij wordt belegerd: verjaag eerst de rovers!'); sNee(); return; }
  if (k == 'werker' && !G.freed) { say('Er zijn geen werkers meer in het dorp: bevrijd eerst de gevangenen!'); sNee(); return; }
  if (b.q.length >= 5) { say('De wachtrij is vol (5).'); return; }
  if (!canAfford(c)) { say('Niet genoeg goud of hout.'); sNee(); return; }
  const f = food();
  if (f.use >= f.cap) { say('Te weinig voedsel: bouw eerst een boerderij.'); sNee(); return; }
  pay(c); b.q.push(k); sClick();
  if (b.q.length > 1) say(UNIT[k].n + ' staat in de wachtrij (' + b.q.length + ').', 80);
}

export function startPlace(k, touch) {
  const c = BLD[k].cost;
  if (!canAfford(c)) { say('Niet genoeg goud of hout voor een ' + BLD[k].n.toLowerCase() + '.'); sNee(); return; }
  G.place = { k, x: -1, y: -1 }; G.vorigeMuur = null;
  const w = G.sel.find((u) => u.k == 'werker');
  if (touch && w) { G.place.x = Math.floor(w.x / T) + 1; G.place.y = Math.floor(w.y / T) - 1; }
  say(touch ? 'Sleep de schaduw naar de goede plek en tik op ✔ Bouw hier (of op de schaduw).' : 'Beweeg de muis naar de plek en klik om te bouwen. Rechts klikken of Escape = stoppen.', 400);
}

export function canPlace(k, x, y) {
  const d = BLD[k];
  for (let j = y; j < y + d.h; j++) for (let i = x; i < x + d.w; i++) {
    if (!isExp(i, j) || blocked(i, j) || bldAt(i, j) || G.map[j][i] == '=') return false;
    const c = G.map[j][i];
    if (k == 'weg' ? !'.ms'.includes(c) : c == 'm' || c == 'b') return false; // in het moeras alleen wegen; op de zwarte rots niets
    if (G.units.some((u) => u.side == 'o' && tileOf(u)[0] == i && tileOf(u)[1] == j)) return false;
  }
  return true;
}

// muis beweegt tijdens het bouwen: schaduw volgt
export function muisBouw(gx, gy) {
  if (!G.place) return;
  const d = BLD[G.place.k];
  G.place.x = gx - Math.floor((d.w - 1) / 2); G.place.y = gy - Math.floor((d.h - 1) / 2);
}

// Voor de tussenstukjes: een mannetje ergens heen laten lopen, en klaarzetten voor het filmpje
export function stuur(u, tx, ty) { cmdMove(u, tx, ty); }
export function plaats(k, tx, ty) { return addUnit(k, tx, ty); } // een mannetje neerzetten (tussenstukje)
export function klaarVoorFilmpje() {
  G.tussen = true; G.sel = []; G.selB = null; G.place = null; G.msgT = 0;
  G.units = G.units.filter((u) => u.side == 'h');
  for (const u of G.units) { u.st = 'idle'; u.path = null; u.tg = null; u.carry = null; u.hidden = false; u.inMine = 0; u.thee = 0; u.job = null; u.bq = []; }
  for (const r of G.explored) r.fill(true); // de mist trekt op
}

// de knop ✔ Bouw hier (aanraakscherm): bouwen waar de schaduw nu staat
export function bouwHier() {
  if (!G.place || G.place.x < 0) return;
  const d = BLD[G.place.k];
  klik({ gx: G.place.x + Math.floor((d.w - 1) / 2), gy: G.place.y + Math.floor((d.h - 1) / 2), touch: true });
}
export function stopKeuze() { G.cast = null; G.place = null; G.sel = []; G.selB = null; G.multi = false; }

// knoppen "Alle werkers" en "Alle soldaten"
export function kiesAlle(soldaten) {
  if (G.state != 'spel') return;
  G.selB = null; G.place = null;
  G.sel = G.units.filter((u) => u.side == 'h' && (soldaten == 'groep' || (soldaten ? u.k != 'werker' : u.k == 'werker')));
  if (G.sel.length) { sClick(); unitSay(G.sel[0], 'samen'); } else say(soldaten ? 'Je hebt nog geen soldaten. Bouw een kazerne!' : 'Je hebt geen werkers. Train ze in het kasteel.');
}
// een rechthoek over de mannetjes getrokken
export function kiesGroep(lijst, erbij) {
  const eigen = lijst.filter((u) => u.side == 'h');
  if (!eigen.length) return;
  G.selB = null; G.place = null;
  G.sel = erbij ? [...new Set([...G.sel, ...eigen])] : eigen;
  sClick(); unitSay(eigen[0], eigen.length > 1 ? 'samen' : eigen[0].k == 'werker' ? 'werker' : 'krijger');
}
// één soort uit de keuze halen
export function haalWeg(k) { G.sel = G.sel.filter((u) => u.k != k); if (!G.sel.length) G.multi = false; sClick(); }

function assignBuild(w, b) {
  if (w.st == 'build' && w.tg && teDoen(w.tg) && w.tg != b) { (w.bq = w.bq || []).push(b); return; }
  if (w.st == 'wood' || w.st == 'gold') w.job = { st: w.st, tg: w.tg };
  w.st = 'build'; w.tg = b; w.path = null; w.hidden = false; w.inMine = 0;
}

function selectUnit(u) {
  G.selB = null; G.sel = [u]; sClick();
  const p = G.poke;
  if (p.id == u.id && G.t - p.t < 120) p.n++; else p.n = 1;
  p.id = u.id; p.t = G.t;
  if (p.n >= 5) { unitSay(u, 'prik'); p.n = 0; return; }
  unitSay(u, u.k == 'werker' ? 'werker' : u.k == 'boog' ? 'boog' : 'krijger');
}

// Een klik/tik in de wereld. p = { unit, bld, tx, ty (wat er geraakt is), gx, gy (tegel op de grond), mod, touch }
export function klik(p) {
  if (G.state != 'spel' || G.paused) return;
  const { gx, gy } = p;
  const wx = gx * T + T / 2, wy = gy * T + T / 2;
  if (G.cast) { // vuurregen: waar moet hij vallen?
    const m = G.cast.m; G.cast = null;
    if (gx < 0 || !G.units.includes(m) || m.mana < 80) return;
    if (!isExp(gx, gy)) { say('Daar kun je niet zien: kies een plek die je hebt ontdekt.'); sNee(); return; }
    if (Math.hypot(wx - m.x, wy - m.y) > 9 * T) { say('Te ver weg voor de tovenaar (maximaal 9 vakjes).'); sNee(); return; }
    m.mana -= 80; G.regens.push({ x: wx, y: wy, t: 180 }); snd(120, 0.8, 'sawtooth', 0.06, 60); say('Vuurregen!', 90);
    return;
  }
  if (G.place) {
    if (gx < 0) return;
    const d = BLD[G.place.k];
    let bx = gx - Math.floor((d.w - 1) / 2), by = gy - Math.floor((d.h - 1) / 2);
    const onGhost = G.place.x >= 0 && gx >= G.place.x && gx < G.place.x + d.w && gy >= G.place.y && gy < G.place.y + d.h;
    const reeks = G.place.k == 'muur' || G.place.k == 'weg'; // muur en weg: stukje voor stukje
    const los = reeks && !p.touch; // met de muis zet je muurstukken met één klik neer; op een aanraakscherm ook met schaduw
    if (p.touch && !onGhost && !los) {
      G.place.x = bx; G.place.y = by;
      say(canPlace(G.place.k, bx, by) ? 'Tik op ✔ Bouw hier of nog een keer op de schaduw om te bouwen.' : 'Daar kan het niet: kies een vrije plek die je al ontdekt hebt.', 240);
      sClick(); return;
    }
    if (!los && (onGhost || (!p.touch && G.place.x >= 0))) { bx = G.place.x; by = G.place.y; } // met de muis: precies waar de schaduw staat
    if (!canPlace(G.place.k, bx, by)) { say('Daar kan het niet: kies een vrije plek die je al ontdekt hebt.'); sNee(); return; }
    pay(d.cost);
    const b = addBld(G.place.k, bx, by, 0);
    const ws = G.sel.filter((u) => u.k == 'werker');
    for (const w of ws) assignBuild(w, b);
    const queued = ws.some((w) => w.bq && w.bq.includes(b));
    if (reeks && canAfford(d.cost)) { // muur of weg: meteen door met het volgende stuk
      // op een aanraakscherm schuift de schaduw een vakje verder, in dezelfde richting als het vorige stuk
      const v = G.vorigeMuur, nx = v && Math.abs(bx - v.x) + Math.abs(by - v.y) == 1 ? [bx - v.x, by - v.y] : (G.muurRichting || [1, 0]);
      G.muurRichting = nx; G.vorigeMuur = { x: bx, y: by };
      G.place = p.touch ? { k: G.place.k, x: bx + nx[0], y: by + nx[1] } : { k: G.place.k, x: -1, y: -1 }; sBuild();
      say(p.touch ? 'Het volgende stuk staat klaar: sleep het en tik op ✔. Klaar? Tik op ✕.' : 'Klik op meer plekken voor ' + (G.place.k == 'weg' ? 'stukjes weg' : 'muurstukken') + '. Escape of rechts klikken = klaar.', 200);
      return;
    }
    G.place = null;
    say(queued ? 'Komt op de lijst: eerst wordt het vorige gebouw afgemaakt.' : ws.length ? 'De werker gaat bouwen.' : 'Kies een werker en klik op het gebouw om het af te bouwen.', 120);
    if (ws[0]) unitSay(ws[0], 'bouw');
    return;
  }
  const hitU = p.unit;
  const hitB = p.bld && isExp(p.bld.x, p.bld.y) ? p.bld : null;
  const enemy = hitU && hitU.side == 'o' ? hitU : (hitB && hitB.side == 'o' ? hitB : null);
  if (enemy) {
    if (G.sel.length) {
      for (const u of G.sel) cmdAttack(u, enemy);
      sClick(); unitSay(G.sel[0], G.sel[0].k == 'werker' ? 'werkerAanval' : 'aanval');
      G.fx.push({ x: enemy.w ? center(enemy).x : enemy.x, y: enemy.w ? center(enemy).y : enemy.y, l: 20, ring: '#e0574c' });
    } else { G.selB = null; G.sel = []; say(enemy.k == 'zwartvuist' ? 'Opperork Zwartvuist! Val hem met je hele leger tegelijk aan.' : enemy.k == 'orkheks' ? 'Een orkenheks: zij roept demonen en gifwolken op. Pak haar eerst!' : enemy.k == 'orkmuur' ? 'Een palissade. Sla er een gat in, of neem de poort!' : enemy.k == 'orkkatapult' ? 'Een orkenkatapult! Die schiet op je gebouwen: pak hem snel.' : enemy.k == 'tempel' ? 'De Tempel der Verdoemden! Je katapult doet daar veel schade.' : enemy.k == 'orkpriester' ? 'Een orkpriester: hij wekt de doden op. Pak hem snel!' : enemy.k == 'roverkamp' ? 'Een roverkamp. Stuur je soldaten erop af!' : enemy.k == 'rover' || enemy.k == 'roverboog' ? 'Een rover! Die zijn opgestookt door de orks.' : enemy.k == 'kooi' ? 'De gevangenis! Stuur je soldaten erop af om hem kapot te slaan.' : enemy.k == 'orktoren' ? 'Een orkentoren: die schiet pijlen. Stuur er ridders of een katapult op af!' : enemy.k == 'orkbaas' ? 'Een orkenbaas! Die is sterk, val hem met een groep aan.' : enemy.w ? 'Een orkenhut. Stuur er soldaten op af!' : 'Een ork! Pas op.'); }
    return;
  }
  if (hitU && hitU.side == 'n') { say('Sir Lodewijk! Stuur iemand naar hem toe om hem te bevrijden.', 150); return; }
  if (hitU && hitU.side == 'h') {
    if ((p.mod || G.multi) && G.sel.length) {
      G.selB = null;
      if (G.sel.includes(hitU)) G.sel = G.sel.filter((s) => s != hitU);
      else { G.sel.push(hitU); unitSay(hitU, hitU.k == 'werker' ? 'werker' : 'krijger'); }
      sClick(); return;
    }
    selectUnit(hitU); return;
  }
  if (hitB && hitB.side == 'h') {
    const ws = G.sel.filter((u) => u.k == 'werker');
    if (teDoen(hitB) && ws.length) {
      for (const w of ws) { w.bq = []; w.st = 'idle'; assignBuild(w, hitB); }
      if (hitB.done) { say((ws.length > 1 ? 'De werkers gaan' : 'De werker gaat') + (hitB.k == 'kasteel' ? ' het ' : ' de ') + BLD[hitB.k].n.toLowerCase() + ' repareren.', 120); unitSay(ws[0], 'bouw'); }
      else say('De werker gaat verder met bouwen.', 100);
      sClick(); return;
    }
    G.sel = []; G.selB = hitB; sClick(); return;
  }
  // klik op een mijn zonder werkers: hoeveel goud zit er nog in?
  if (p.tx >= 0 && G.map[p.ty][p.tx] == 'M' && isExp(p.tx, p.ty) && !G.sel.some((u) => u.k == 'werker')) {
    const k = minesKey(p.tx, p.ty); G.selB = null;
    say(G.mineG[k] > 0 ? 'Goudmijn: nog ' + G.mineG[k] + ' goud' : 'Deze goudmijn is leeg.', 150); sClick(); return;
  }
  if (!G.sel.length) { G.selB = null; return; }
  const { tx, ty } = p;
  if (tx < 0) return;
  const c = G.map[ty] && G.map[ty][tx];
  const ws = G.sel.filter((u) => u.k == 'werker');
  if (c == 'T' && G.trees[tx + ',' + ty] > 0 && isExp(tx, ty) && ws.length) {
    for (const w of ws) { w.st = 'wood'; w.tg = [tx, ty]; w.path = null; w.work = 0; w.hidden = false; w.inMine = 0; }
    for (const u of G.sel) if (u.k != 'werker') cmdMove(u, tx, ty);
    unitSay(ws[0], 'hout'); G.fx.push({ x: tx * T + T / 2, y: ty * T + T / 2, l: 20, ring: '#7ad37a' }); return;
  }
  if (c == 'M' && isExp(tx, ty) && ws.length) {
    const k = minesKey(tx, ty);
    for (const w of ws) { w.st = 'gold'; w.tg = k; w.path = null; }
    unitSay(ws[0], 'goud'); G.fx.push({ x: tx * T + T / 2, y: ty * T + T / 2, l: 20, ring: '#ffd23f' }); return;
  }
  if (gx < 0) return;
  // lopen: verspreid een beetje
  [...G.sel].sort((a, b) => (b.k == 'held') - (a.k == 'held')).forEach((u, i) => { // Sir Lodewijk krijgt het vakje waar je klikt
    const ox = [0, 1, -1, 0, 0, 1, -1, 1, -1][i % 9], oy = [0, 0, 0, 1, -1, 1, 1, -1, -1][i % 9];
    let ax = gx + ox, ay = gy + oy;
    if (blocked(ax, ay)) { ax = gx; ay = gy; }
    cmdMove(u, ax, ay); u.job = null; u.hidden = false; u.inMine = 0;
  });
  sClick(); G.fx.push({ x: wx, y: wy, l: 20, ring: '#f6dfa8' });
  if (Math.random() < 0.5) unitSay(G.sel[0], G.sel[0].k == 'werker' ? 'werkerGo' : 'krijgerGo');
}

export function statusTekst(u) {
  if (u.captive) return 'zit gevangen';
  if (u.thee > 0) return 'drinkt een kopje thee';
  if (u.hidden) return 'is in de mijn';
  if (u.carry) return u.carry == 'goud' ? 'brengt goud naar het kasteel' : 'brengt hout naar het kasteel';
  if (u.st == 'build' && u.tg && u.tg.done) return 'repareert';
  return { idle: 'staat te wachten', move: 'loopt', wood: 'hakt hout', gold: 'gaat goud halen', build: 'bouwt', attack: 'valt aan', raid: 'valt aan' }[u.st] || '';
}
