// De spelregels: kaart, paden, werkers, gebouwen, gevechten, golven, winnen en verliezen.
// Overgenomen uit de 2D-versie (orkenstorm.html). Posities van mannetjes zijn in pixels (32 per tegel),
// gebouwen staan op tegels (x, y = linkerbovenhoek). De 3D-weergave rekent dat om.

import { UNIT, BLD, DIFF, LEVELS } from './data.js';
import { unitSay, speak, pick, nieuweStem, sHorn, sDone, sChop, sGold, sHout, sHit, sArrow, sBuild, sClick, sNee, sWin, noise } from './geluid.js';

export const T = 32;

export const G = {
  state: 'titel', lvl: 0, L: null, map: null, MW: 0, MH: 0, trees: {}, mineG: {}, units: [], blds: [], explored: null,
  res: { goud: 0, hout: 0 }, sel: [], selB: null, place: null, msg: '', msgT: 0, t: 0, fx: [], nextWave: 0, waveN: 0,
  lastAlert: -999, poke: { id: -1, n: 0, t: 0 }, unlocked: 1, paused: false, diff: 1, lostMsg: '', uid: 1,
  levelVersie: 0, mapVersie: 0,
};
try { G.unlocked = +localStorage.getItem('orkenstorm3d_lvl') || 1; } catch (e) {}
try { const d = localStorage.getItem('orkenstorm3d_diff'); if (d !== null) G.diff = +d; } catch (e) {}

export function zetMoeilijkheid(i) { G.diff = i; try { localStorage.setItem('orkenstorm3d_diff', i); } catch (e) {} }

export function say(m, d = 120) { G.msg = m; G.msgT = d; }

export const S = {
  count: (k) => G.blds.filter((b) => b.k == k && b.done).length,
  huts: () => G.blds.filter((b) => b.k == 'orkhut').length,
  orcs: () => G.units.filter((u) => u.side == 'o').length,
};

export function loadLevel(i) {
  const L = LEVELS[i];
  G.lvl = i; G.L = L; G.MH = L.map.length; G.MW = L.map[0].length;
  G.map = L.map.map((r) => r.split('')); G.trees = {}; G.mineG = {};
  for (let y = 0; y < G.MH; y++) for (let x = 0; x < G.MW; x++) {
    if (G.map[y][x] == 'T') G.trees[x + ',' + y] = 30;
    if (G.map[y][x] == 'M') { const k = minesKey(x, y); if (!(k in G.mineG)) G.mineG[k] = 2000; }
  }
  const D = DIFF[G.diff];
  G.units = []; G.blds = []; G.sel = []; G.selB = null; G.place = null; G.fx = [];
  G.res = { goud: Math.round(L.goud * D.res / 10) * 10, hout: Math.round(L.hout * D.res / 10) * 10 };
  G.t = 0; G.waveN = 0; G.nextWave = L.waves ? Math.round(L.waves.first * D.wave) : 0; G.paused = false;
  G.explored = Array.from({ length: G.MH }, () => Array(G.MW).fill(false));
  for (const [k, x, y] of L.b) addBld(k, x, y, 1);
  for (const [x, y] of L.huts) addBld('orkhut', x, y, 1);
  for (const [k, x, y] of L.u) addUnit(k, x, y);
  for (const [k, x, y] of L.o) { const u = addUnit(k, x, y); u.home = { x: u.x, y: u.y }; }
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
  if (c == 'W' || c == 'M') return true;
  if (c == 'T' && G.trees[x + ',' + y] > 0) return true;
  return !!bldAt(x, y);
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
  const [tx, ty] = u.path[0], gx = tx * T + T / 2, gy = ty * T + T / 2, dx = gx - u.x, dy = gy - u.y, d = Math.hypot(dx, dy), sp = UNIT[u.k].spd;
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
  if (tg.side == 'o' && by && G.units.includes(by)) { for (const o of G.units) if (o.side == 'o' && o.st != 'attack' && dist(o, tg) < 4 * T) cmdAttack(o, by); }
  if (tg.side == 'h' && by && G.units.includes(by)) { const c = tg.w ? center(tg) : tg; for (const u of G.units) if (u.side == 'h' && u.k != 'werker' && u.st == 'idle' && dist(u, c) < 10 * T) cmdAttack(u, by); }
  if (tg.side == 'h' && G.t - G.lastAlert > 600) { G.lastAlert = G.t; sHorn(); say('Je dorp wordt aangevallen!', 150); }
  if (tg.w) {
    if (tg.hp <= 0) {
      G.blds.splice(G.blds.indexOf(tg), 1);
      const c = center(tg);
      for (let i = 0; i < 14; i++) G.fx.push({ x: c.x + (Math.random() - 0.5) * tg.w * T, y: c.y + (Math.random() - 0.5) * tg.h * T, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2, h: 0, l: 50, c: '#7a6a5a' });
      noise(0.5, 0.1, 300); if (G.selB == tg) G.selB = null;
    }
  } else if (tg.hp <= 0) {
    G.units.splice(G.units.indexOf(tg), 1); G.sel = G.sel.filter((s) => s != tg);
    G.fx.push({ x: tg.x, y: tg.y, l: 90, grave: tg.side }); noise(0.2, 0.06, 500);
  }
}

function nearestEnemy(u, range) {
  let best = null, bd = range;
  for (const e of G.units) if (e.side != u.side) { const d = dist(u, e); if (d < bd && (u.side == 'o' || isExp(...tileOf(e)))) { bd = d; best = e; } }
  for (const b of G.blds) if (b.side != u.side) { const d = targetDist(u, b); if (d < bd) { bd = d; best = b; } }
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
function hall() { return G.blds.find((b) => b.k == 'kasteel' && b.done); }

export function update() {
  G.t++;
  const L = G.L;
  if (G.t % 10 == 0) reveal();
  // gebouwen
  for (const b of [...G.blds]) {
    if (b.q.length) {
      b.qp++; const k = b.q[0];
      if (b.qp >= UNIT[k].time) {
        const ring = [...ringAround(b.x, b.y, b.w, b.h)];
        if (ring.length) { const [x, y] = ring[Math.floor(ring.length / 2)].split(',').map(Number); addUnit(k, x, y); sDone(); say(UNIT[k].n + ' is klaar!', 90); }
        b.q.shift(); b.qp = 0;
      }
    }
    if (b.k == 'toren' && b.done) {
      const D = BLD[b.k];
      if (b.cd > 0) b.cd--;
      else {
        const c = center(b), tg = G.units.filter((u) => u.side != b.side && !u.hidden).find((u) => dist(u, c) < D.rng);
        if (tg) { b.cd = D.cd; G.fx.push({ x: c.x, y: c.y, tx: tg.x, ty: tg.y, l: 12, arrow: 1, hoog: 1 }); damage(tg, D.dmg, null); sArrow(); }
      }
    }
  }
  // eenheden
  for (const u of [...G.units]) {
    if (!G.units.includes(u)) continue;
    const d = UNIT[u.k];
    if (u.cd > 0) u.cd--;
    if (u.side == 'o') orcBrain(u);
    else if (u.st == 'idle' && u.k != 'werker') { const e = nearestEnemy(u, d.sight * T); if (e) cmdAttack(u, e); }
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
          if (d.rng > 40) { G.fx.push({ x: u.x, y: u.y, tx, ty, l: 12, arrow: 1 }); sArrow(); } else sHit();
          damage(tg, d.dmg, u);
        }
      } else {
        if (!u.path || --u.repath <= 0) { u.repath = 30; goTo(u, attackGoals(tg)); }
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
  // golven (vanaf level 2)
  if (L.waves && S.huts() > 0 && G.t >= G.nextWave) {
    G.nextWave = G.t + Math.round(L.waves.every * DIFF[G.diff].wave); G.waveN++;
    const huts = G.blds.filter((b) => b.k == 'orkhut');
    const n = Math.max(1, Math.min(1 + G.waveN, 4) + DIFF[G.diff].extra);
    for (let i = 0; i < n; i++) {
      const h = huts[i % huts.length], ring = [...ringAround(h.x, h.y, h.w, h.h)];
      if (!ring.length) continue;
      const [x, y] = ring[i % ring.length].split(',').map(Number);
      const o = addUnit(i % 3 == 2 ? 'speerork' : 'ork', x, y); o.raid = 1; o.st = 'raid';
    }
    sHorn(); say('De orks vallen aan! (golf ' + G.waveN + ')', 180);
  }
  for (const f of G.fx) { f.l--; if (f.vx !== undefined) { f.x += f.vx; f.h -= f.vy; f.vy += 0.05; } }
  G.fx = G.fx.filter((f) => f.l > 0);
  if (G.msgT > 0) G.msgT--;
  // winst en verlies
  if (!G.blds.some((b) => b.k == 'kasteel')) { G.lostMsg = 'Het kasteel is gevallen...'; G.state = 'verloren'; sHorn(); return; }
  if (L.win(S)) {
    G.state = 'gewonnen'; G.unlocked = Math.max(G.unlocked, G.lvl + 2);
    try { localStorage.setItem('orkenstorm3d_lvl', G.unlocked); } catch (e) {}
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
    if (u.st != 'raid' || !u.path) { u.st = 'raid'; if (!u.path || !u.path.length) goTo(u, ringAround(h.x, h.y, h.w, h.h)); }
    if (u.path && moveAlong(u)) cmdAttack(u, h);
    return;
  }
  if (u.home && dist(u, u.home) > T * 1.5 && u.st == 'idle') { u.st = 'move'; goTo(u, new Set([Math.floor(u.home.x / T) + ',' + Math.floor(u.home.y / T)])); }
}

function nextBuild(u) {
  u.path = null;
  while (u.bq && u.bq.length) { const n = u.bq.shift(); if (alive(n) && !n.done) { u.st = 'build'; u.tg = n; return; } }
  u.st = 'idle'; u.tg = null;
  if (u.job) { const j = u.job; u.job = null; u.st = j.st; u.tg = j.tg; }
}

function workerBrain(u) {
  const h = hall();
  if (u.st == 'build') {
    const b = u.tg;
    if (!b || !alive(b) || b.done) { nextBuild(u); return; }
    if (targetDist(u, b) > T * 0.8) { if (!u.path || !u.path.length) { if (!goTo(u, ringAround(b.x, b.y, b.w, b.h))) { u.st = 'idle'; return; } } moveAlong(u); return; }
    u.path = null; u.bezig = b;
    b.prog += 1 / BLD[b.k].time; b.hp = Math.min(b.max, b.hp + b.max / BLD[b.k].time);
    if (G.t % 30 == 0) { u.swing = 12; sBuild(); }
    if (b.prog >= 1) { b.done = true; b.hp = b.max; sDone(); say(BLD[b.k].n + ' is klaar!', 100); nextBuild(u); }
    return;
  }
  // hout of goud terugbrengen
  if (u.carry) {
    if (!h) { u.st = 'idle'; return; }
    if (targetDist(u, h) > T * 0.8) { if (!u.path || !u.path.length) { if (!goTo(u, ringAround(h.x, h.y, h.w, h.h))) { u.st = 'idle'; return; } } moveAlong(u); return; }
    G.res[u.carry] += 10; if (u.carry == 'goud') sGold(); else sHout();
    u.carry = null; u.path = null; return;
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
    if (u.work >= 150) {
      u.work = 0; G.trees[tx + ',' + ty] -= 10;
      if (G.trees[tx + ',' + ty] <= 0) { G.map[ty][tx] = 's'; G.mapVersie++; }
      u.carry = 'hout';
    }
    return;
  }
  if (u.st == 'gold') {
    const k = u.tg, [mx, my] = k.split(',').map(Number);
    if (!(G.mineG[k] > 0)) { u.st = 'idle'; say('De mijn is leeg!', 100); return; }
    if (u.inMine) {
      u.inMine--;
      if (u.inMine == 0) {
        G.mineG[k] -= 10; u.carry = 'goud';
        const ring = [...ringAround(mx, my, 2, 2)];
        if (ring.length) { const [x, y] = ring[0].split(',').map(Number); u.x = x * T + T / 2; u.y = y * T + T / 2; }
        u.hidden = false;
      }
      return;
    }
    if (targetDist(u, { x: mx, y: my, w: 2, h: 2 }) > T * 0.8) { if (!u.path || !u.path.length) { if (!goTo(u, ringAround(mx, my, 2, 2))) { u.st = 'idle'; return; } } moveAlong(u); return; }
    u.path = null; u.inMine = 100; u.hidden = true;
  }
}

// ---------- opdrachten van de speler ----------
export function canAfford(c) { return G.res.goud >= c[0] && G.res.hout >= c[1]; }
function pay(c) { G.res.goud -= c[0]; G.res.hout -= c[1]; }

export function train(b, k) {
  const c = UNIT[k].cost;
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
  G.place = { k, x: -1, y: -1 };
  const w = G.sel.find((u) => u.k == 'werker');
  if (touch && w) { G.place.x = Math.floor(w.x / T) + 1; G.place.y = Math.floor(w.y / T) - 1; }
  say(touch ? 'Tik op de kaart om de schaduw te verplaatsen, tik nog een keer op de schaduw om te bouwen.' : 'Beweeg de muis naar de plek en klik om te bouwen. Rechts klikken of Escape = stoppen.', 400);
}

export function canPlace(k, x, y) {
  const d = BLD[k];
  for (let j = y; j < y + d.h; j++) for (let i = x; i < x + d.w; i++) {
    if (!isExp(i, j) || blocked(i, j)) return false;
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

export function stopKeuze() { G.place = null; G.sel = []; G.selB = null; }

function assignBuild(w, b) {
  if (w.st == 'build' && w.tg && alive(w.tg) && !w.tg.done && w.tg != b) { (w.bq = w.bq || []).push(b); return; }
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
  if (G.place) {
    if (gx < 0) return;
    const d = BLD[G.place.k];
    let bx = gx - Math.floor((d.w - 1) / 2), by = gy - Math.floor((d.h - 1) / 2);
    const onGhost = G.place.x >= 0 && gx >= G.place.x && gx < G.place.x + d.w && gy >= G.place.y && gy < G.place.y + d.h;
    if (p.touch && !onGhost) {
      G.place.x = bx; G.place.y = by;
      say(canPlace(G.place.k, bx, by) ? 'Tik nog een keer op de schaduw om te bouwen.' : 'Daar kan het niet: kies een vrije plek die je al ontdekt hebt.', 240);
      sClick(); return;
    }
    if (onGhost) { bx = G.place.x; by = G.place.y; }
    if (!canPlace(G.place.k, bx, by)) { say('Daar kan het niet: kies een vrije plek die je al ontdekt hebt.'); sNee(); return; }
    pay(d.cost);
    const b = addBld(G.place.k, bx, by, 0);
    const ws = G.sel.filter((u) => u.k == 'werker');
    for (const w of ws) assignBuild(w, b);
    const queued = ws.some((w) => w.bq && w.bq.includes(b));
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
    } else { G.selB = null; G.sel = []; say(enemy.w ? 'Een orkenhut. Stuur er soldaten op af!' : 'Een ork! Pas op.'); }
    return;
  }
  if (hitU && hitU.side == 'h') {
    if (p.mod && G.sel.length) {
      G.selB = null;
      if (G.sel.includes(hitU)) G.sel = G.sel.filter((s) => s != hitU);
      else { G.sel.push(hitU); unitSay(hitU, hitU.k == 'werker' ? 'werker' : 'krijger'); }
      sClick(); return;
    }
    selectUnit(hitU); return;
  }
  if (hitB && hitB.side == 'h') {
    const ws = G.sel.filter((u) => u.k == 'werker');
    if (!hitB.done && ws.length) { for (const w of ws) { w.bq = []; w.st = 'idle'; assignBuild(w, hitB); } say('De werker gaat verder met bouwen.', 100); sClick(); return; }
    G.sel = []; G.selB = hitB; sClick(); return;
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
  G.sel.forEach((u, i) => {
    const ox = [0, 1, -1, 0, 0, 1, -1, 1, -1][i % 9], oy = [0, 0, 0, 1, -1, 1, 1, -1, -1][i % 9];
    let ax = gx + ox, ay = gy + oy;
    if (blocked(ax, ay)) { ax = gx; ay = gy; }
    cmdMove(u, ax, ay); u.job = null; u.hidden = false; u.inMine = 0;
  });
  sClick(); G.fx.push({ x: wx, y: wy, l: 20, ring: '#f6dfa8' });
  if (Math.random() < 0.5) unitSay(G.sel[0], G.sel[0].k == 'werker' ? 'werkerGo' : 'krijgerGo');
}

export function statusTekst(u) {
  if (u.hidden) return 'is in de mijn';
  if (u.carry) return u.carry == 'goud' ? 'brengt goud naar het kasteel' : 'brengt hout naar het kasteel';
  return { idle: 'staat te wachten', move: 'loopt', wood: 'hakt hout', gold: 'gaat goud halen', build: 'bouwt', attack: 'valt aan', raid: 'valt aan' }[u.st] || '';
}
