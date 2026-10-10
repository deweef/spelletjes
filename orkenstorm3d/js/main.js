// De 3D-weergave, camera, muis/toetsen en het scherm met knoppen.

import * as THREE from 'three';
import { OrbitControls } from '../lib/OrbitControls.js';
import { UNIT, BLD, DIFF, LEVELS, BINNENKORT, LAND } from './data.js';
import { G, T, loadLevel, update, klik, muisBouw, train, startPlace, stopKeuze, canPlace, canAfford, food, isExp, tileOf, center, statusTekst, zetMoeilijkheid, S, kiesAlle, kiesGroep, haalWeg } from './spel.js';
import * as M from './modellen.js';
import { unlock, primeVoice, stemAan, zetStem, sClick, loadVoices, VOX } from './geluid.js';

const $ = (id) => document.getElementById(id);
const isTouch = matchMedia('(pointer: coarse)').matches;

// ---------- renderer en scène ----------
const renderer = new THREE.WebGLRenderer({ antialias: !isTouch, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('wereld').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#9fd3f0');
scene.fog = new THREE.Fog('#9fd3f0', 28, 60);

const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 200);
camera.position.set(12, 14, 30);

const hemel = new THREE.HemisphereLight('#dff1ff', '#56703a', 1.6);
scene.add(hemel);
const zon = new THREE.DirectionalLight('#fff3dc', 2.4);
zon.castShadow = true;
zon.shadow.mapSize.set(isTouch ? 1024 : 2048, isTouch ? 1024 : 2048);
zon.shadow.bias = -0.0005;
zon.shadow.normalBias = 0.02;
scene.add(zon, zon.target);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.12;
controls.screenSpacePanning = false;
controls.minDistance = 6;
controls.maxDistance = 32;
controls.minPolarAngle = 0.25;
controls.maxPolarAngle = 1.2;
controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
controls.rotateSpeed = 0.6;
controls.panSpeed = 1.2;

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// tegel (x, y) in het spel -> midden van de tegel in 3D (x, z)
const wx = (px) => px / T, wz = (py) => py / T;

// ---------- de wereld van een level opbouwen ----------
let wereld = null, gebouwdVersie = -1, kaartVersie = -1;
let grond = null, grondCanvas = null, grondTex = null;
let bomen = null; // { keys, basis, lagen (per soort de InstancedMeshes), stronken, weg, schud }
let wolken = null; // { mesh, schaal: Float32Array, pos: [] }
const mijnen = []; // { key, goud }
const pickables = [];

function gooiWeg(obj) {
  obj.traverse((o) => {
    if (o.isMesh || o.isInstancedMesh) {
      if (o.userData.eigenGeo) o.geometry.dispose();
      if (o.userData.eigenMat) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
    }
  });
}

function rnd(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

function tekenGrond() {
  const c = grondCanvas.getContext('2d'), S = 16, r = rnd(7);
  for (let y = 0; y < G.MH; y++) for (let x = 0; x < G.MW; x++) {
    const t = G.map[y][x], v = r();
    let kleur;
    if (G.L.dungeon) kleur = t == '#' || t == 't' ? '#2d2520' : t == 'E' ? '#c9b27a' : v < 0.33 ? '#7a6a58' : v < 0.66 ? '#74644f' : '#806f5c';
    else if (t == 'W' || t == '=') kleur = '#3a7bbf';
    else if (t == 'M') kleur = '#8d8170';
    else if (t == 'T') kleur = v < 0.5 ? '#4d7a33' : '#517f36';
    else if (t == 's') kleur = '#7d6a45';
    else kleur = v < 0.33 ? '#6aa84f' : v < 0.66 ? '#70ad53' : '#66a34b';
    c.fillStyle = kleur; c.fillRect(x * S, y * S, S, S);
    if (G.L.dungeon) { if (t == '.' && v > 0.85) { c.fillStyle = '#5f5142'; c.fillRect(x * S + 3, y * S + 4, 4, 3); c.fillRect(x * S + 10, y * S + 9, 3, 3); } continue; }
    if (t == '.' && v > 0.8) { c.fillStyle = '#86c063'; c.fillRect(x * S + 4 + (v * 37 % 6), y * S + 5, 2, 3); c.fillRect(x * S + 9, y * S + 9 + (v * 51 % 4), 2, 3); }
    if (t == '.' && v < 0.04) { c.fillStyle = '#f4e27a'; c.fillRect(x * S + 7, y * S + 7, 2, 2); }
  }
  // zandrand langs het water
  for (let y = 0; y < G.MH; y++) for (let x = 0; x < G.MW; x++) {
    if (G.map[y][x] == 'W' || G.map[y][x] == '=') continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (G.map[y + dy] && (G.map[y + dy][x + dx] == 'W' || G.map[y + dy][x + dx] == '=')) {
        c.fillStyle = '#d9c78c';
        c.fillRect(x * S + (dx == 1 ? S - 4 : 0), y * S + (dy == 1 ? S - 4 : 0), dx ? 4 : S, dy ? 4 : S);
      }
    }
  }
  grondTex.needsUpdate = true;
}

// Muren, fakkels, de trap naar buiten en wat tonnen en banieren in de Donkere Mijnen
function bouwKerker(groep) {
  const { MW, MH } = G, r = rnd(31);
  const muren = [], fakkels = [], trap = [], vloer = [];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const t = G.map[y][x];
    if (t == '#' || t == 't') muren.push([x, y]); else vloer.push([x, y]);
    if (t == 't') fakkels.push([x, y]);
    if (t == 'E') trap.push([x, y]);
  }
  const m4 = new THREE.Matrix4();
  for (const d of M.kerkerMuur()) {
    const im = new THREE.InstancedMesh(d.geo, d.mat, muren.length);
    muren.forEach(([x, y], i) => im.setMatrixAt(i, m4.makeTranslation(x + 0.5, 0, y + 0.5)));
    im.castShadow = true; im.receiveShadow = true; groep.add(im);
  }
  for (const [x, y] of fakkels) {
    const f = M.maakFakkel(); f.position.set(x + 0.5, 1.1, y + 0.5); groep.add(f);
    const licht = new THREE.PointLight('#ffb35a', 6, 6, 1.4); licht.position.set(x + 0.5, 1.7, y + 0.5); groep.add(licht);
  }
  for (const [x, y] of trap) { const s = M.maakTrap(); s.position.set(x + 0.5, 0, y + 0.5); groep.add(s); }
  // een paar tonnen en banieren tegen de muren (alleen versiering)
  const tegenMuur = vloer.filter(([x, y]) => G.map[y][x] == '.' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => G.map[y + dy] && G.map[y + dy][x + dx] == '#'));
  for (let i = 0; i < 10 && tegenMuur.length; i++) {
    const [x, y] = tegenMuur.splice(Math.floor(r() * tegenMuur.length), 1)[0];
    const ding = M.maakKerkerDing(i % 3 == 0 ? 'banier' : 'ton');
    const [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([dx, dy]) => G.map[y + dy][x + dx] == '#');
    ding.position.set(x + 0.5 + dx * 0.3, 0, y + 0.5 + dy * 0.3); ding.rotation.y = Math.atan2(-dx, -dy);
    groep.add(ding);
  }
}

function bouwWereld() {
  if (wereld) { scene.remove(wereld); gooiWeg(wereld); }
  for (const [, m] of uMesh) scene.remove(m.g); uMesh.clear();
  for (const m of stervend) scene.remove(m.g); stervend.length = 0;
  for (const [, m] of bMesh) scene.remove(m.g); bMesh.clear();
  for (const [, m] of fxMesh) scene.remove(m); fxMesh.clear();
  wereld = new THREE.Group(); scene.add(wereld);
  pickables.length = 0; mijnen.length = 0;
  const { MW, MH } = G;

  // grond met een getekende tegelkaart
  grondCanvas = document.createElement('canvas'); grondCanvas.width = MW * 16; grondCanvas.height = MH * 16;
  grondTex = new THREE.CanvasTexture(grondCanvas); grondTex.colorSpace = THREE.SRGBColorSpace; grondTex.magFilter = THREE.NearestFilter;
  grond = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: grondTex }));
  grond.position.set(MW / 2, 0, MH / 2); grond.receiveShadow = true; grond.userData = { eigenGeo: 1, eigenMat: 1 };
  wereld.add(grond);
  tekenGrond(); kaartVersie = G.mapVersie;
  // licht en lucht: buiten zonnig, in de mijnen warm en schemerig (maar niet eng)
  const kerker = !!G.L.dungeon;
  scene.background.set(kerker ? '#1d1712' : '#9fd3f0'); scene.fog.color.set(kerker ? '#1d1712' : '#9fd3f0');
  scene.fog.near = kerker ? 22 : 28; scene.fog.far = kerker ? 48 : 60;
  hemel.color.set(kerker ? '#ffe2b8' : '#dff1ff'); hemel.groundColor.set(kerker ? '#4a3626' : '#56703a'); hemel.intensity = kerker ? 1.25 : 1.6;
  zon.intensity = kerker ? 1.1 : 2.4;
  const rand = new THREE.Mesh(new THREE.PlaneGeometry(220, 220).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: kerker ? '#241d18' : '#4b7a32' }));
  rand.position.set(MW / 2, -0.02, MH / 2); rand.receiveShadow = true; rand.userData = { eigenGeo: 1, eigenMat: 1 };
  wereld.add(rand);

  // water
  const waterTegels = [];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (G.map[y][x] == 'W' || G.map[y][x] == '=') waterTegels.push([x, y]);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (G.map[y][x] == '=') { const br = M.maakBrug(); br.position.x = x + 0.5; br.position.z = y + 0.5; wereld.add(br); }
  if (waterTegels.length) {
    const water = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshLambertMaterial({ color: '#4a9be0', transparent: true, opacity: 0.85 }), waterTegels.length);
    const m4 = new THREE.Matrix4();
    waterTegels.forEach(([x, y], i) => { m4.makeTranslation(x + 0.5, 0.04, y + 0.5); water.setMatrixAt(i, m4); });
    water.userData = { eigenGeo: 1, eigenMat: 1, water: 1 };
    wereld.add(water);
  }

  // bomen (in de kaart om te hakken, plus een rand sierbomen erbuiten)
  const keys = Object.keys(G.trees);
  const sier = [];
  const r = rnd(11);
  for (let y = -4; y < MH + 4; y++) for (let x = -4; x < MW + 4; x++) {
    if (x >= 0 && y >= 0 && x < MW && y < MH) continue;
    if (!kerker && r() < 0.75) sier.push([x, y]);
  }
  const alle = [...keys.map((k) => k.split(',').map(Number)), ...sier];
  // elke boom krijgt een soort; per soort en per deel één InstancedMesh
  const soorten = M.boomSoorten();
  const perSoort = soorten.map(() => []);
  const basis = [];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
  alle.forEach(([x, y], i) => {
    const si = Math.floor(r() * soorten.length), s = 0.85 + r() * 0.35;
    ps.set(x + 0.5 + (r() - 0.5) * 0.25, 0, y + 0.5 + (r() - 0.5) * 0.25);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 6.28);
    sc.set(s, s * (0.9 + r() * 0.25), s);
    basis.push({ p: ps.clone(), q: q.clone(), s: sc.clone(), si, idx: perSoort[si].length });
    perSoort[si].push(i);
  });
  const lagen = soorten.map((delen, si) => delen.map((d) => {
    const im = new THREE.InstancedMesh(d.geo, d.mat, Math.max(1, perSoort[si].length));
    im.count = perSoort[si].length;
    perSoort[si].forEach((i, j) => { const b = basis[i]; m4.compose(b.p, b.q, b.s); im.setMatrixAt(j, m4); });
    im.castShadow = true; im.receiveShadow = true;
    im.userData = { bomen: perSoort[si].map((i) => (i < keys.length ? keys[i] : null)) };
    wereld.add(im); pickables.push(im);
    return im;
  }));
  const stronken = M.stronkDelen().map((d) => {
    const im = new THREE.InstancedMesh(d.geo, d.mat, Math.max(1, keys.length));
    m4.makeScale(0, 0, 0); for (let i = 0; i < keys.length; i++) im.setMatrixAt(i, m4);
    im.castShadow = true; wereld.add(im); return im;
  });
  bomen = { keys, basis, lagen, stronken, weg: new Array(keys.length).fill(false), schud: new Float32Array(keys.length) };

  // goudmijnen
  for (const key in G.mineG) {
    const [x, y] = key.split(',').map(Number);
    const m = M.maakMijn(); m.g.position.set(x + 1, 0, y + 1);
    m.g.userData.pick = { mijn: [x, y] };
    wereld.add(m.g); pickables.push(m.g); mijnen.push({ key, goud: m.goud });
  }

  if (kerker) bouwKerker(wereld);

  // wolken boven onontdekt gebied (in de mijnen: donkere rook)
  const wpos = [];
  const r2 = rnd(23);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) wpos.push({ x, y, ox: (r2() - 0.5) * 0.4, oz: (r2() - 0.5) * 0.4, s: 1 + r2() * 0.5, h: 1.7 + r2() * 0.6, f: r2() * 6.28 });
  const wm = new THREE.InstancedMesh(M.wolk(), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), wpos.length);
  const kl = new THREE.Color();
  wpos.forEach((w, i) => { kl.setHSL(kerker ? 0.07 : 0.6, kerker ? 0.12 : 0.15, kerker ? 0.16 + r2() * 0.05 : 0.9 + r2() * 0.1); wm.setColorAt(i, kl); });
  wm.userData = { eigenGeo: 1, eigenMat: 1 };
  wereld.add(wm);
  const schaal = new Float32Array(wpos.length);
  wpos.forEach((w, i) => { schaal[i] = isExp(w.x, w.y) ? 0 : 1; });
  wolken = { mesh: wm, schaal, pos: wpos };

  // zon en schaduw over de hele kaart
  const cx = MW / 2, cz = MH / 2, R = Math.max(MW, MH) * 0.75;
  zon.position.set(cx - 12, 22, cz + 10); zon.target.position.set(cx, 0, cz);
  Object.assign(zon.shadow.camera, { left: -R, right: R, top: R, bottom: -R, near: 1, far: 70 });
  zon.shadow.camera.updateProjectionMatrix();

  // camera naar het kasteel
  const k = G.blds.find((b) => b.k == 'kasteel');
  const eigen = G.units.filter((u) => u.side == 'h'); // zonder kasteel: midden van je groep
  const kx = k ? k.x + k.w / 2 : eigen.reduce((a, u) => a + u.x / T, 0) / eigen.length, kz = k ? k.y + k.h / 2 : eigen.reduce((a, u) => a + u.y / T, 0) / eigen.length;
  controls.target.set(kx + 2, 0, kz - 2);
  camera.position.set(kx + 2, 11, kz + 8);
  controls.update();
  gebouwdVersie = G.levelVersie;
}

// ---------- mannetjes, gebouwen en effecten bijwerken ----------
const uMesh = new Map(), bMesh = new Map(), fxMesh = new Map();
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3();
let schaduw = null, schaduwK = null;

function maakBalk(breed) {
  const g = new THREE.Group();
  const achter = new THREE.Mesh(new THREE.PlaneGeometry(breed + 0.04, 0.09), new THREE.MeshBasicMaterial({ color: 0x1a1a1a, depthTest: false, transparent: true, opacity: 0.8 }));
  const voor = new THREE.Mesh(new THREE.PlaneGeometry(breed, 0.06).translate(breed / 2, 0, 0), new THREE.MeshBasicMaterial({ color: 0x5ee05a, depthTest: false, transparent: true }));
  voor.position.x = -breed / 2; voor.position.z = 0.001;
  achter.renderOrder = 10; voor.renderOrder = 11;
  g.add(achter, voor); g.userData.voor = voor;
  return g;
}
function zetBalk(balk, frac, side) {
  const v = balk.userData.voor;
  v.scale.x = Math.max(0.001, frac);
  v.material.color.set(side == 'o' ? 0xe0574c : frac > 0.5 ? 0x5ee05a : frac > 0.25 ? 0xf0c040 : 0xe0574c);
  // altijd recht naar de camera, ook als het mannetje gedraaid staat
  balk.parent.getWorldQuaternion(tmpQ2).invert();
  balk.quaternion.copy(tmpQ2).multiply(camera.quaternion);
}
const tmpQ2 = new THREE.Quaternion();

function syncMannetjes(nu) {
  const gezien = new Set();
  for (const u of G.units) {
    gezien.add(u.id);
    let m = uMesh.get(u.id);
    if (!m) {
      m = M.maakMannetje(u.k, u.side, u.voice && u.voice.lang, u.rolstoel);
      m.g.scale.multiplyScalar(1.3);
      m.balk = maakBalk(0.5); m.balk.position.y = 1.05; m.g.add(m.balk);
      m.px = u.x; m.py = u.y; m.rot = u.side == 'o' ? 0 : Math.PI; m.loop = 0;
      m.g.rotation.y = m.rot;
      scene.add(m.g); uMesh.set(u.id, m);
    }
    const [tx, ty] = tileOf(u);
    m.g.visible = !u.hidden && (u.side == 'h' || isExp(tx, ty));
    m.g.position.set(wx(u.x), 0, wz(u.y));
    const dx = u.x - m.px, dy = u.y - m.py, beweegt = Math.abs(dx) + Math.abs(dy) > 0.05;
    let doel = null;
    if (beweegt) doel = Math.atan2(dx, dy);
    else if (u.st == 'attack' && u.tg) { const c = u.tg.w ? center(u.tg) : u.tg; doel = Math.atan2(c.x - u.x, c.y - u.y); }
    else if (u.st == 'wood' && u.kijk) doel = Math.atan2(u.kijk.x - u.x, u.kijk.y - u.y);
    else if (u.st == 'build' && u.bezig && u.tg) { const c = center(u.tg); doel = Math.atan2(c.x - u.x, c.y - u.y); }
    if (doel !== null) {
      let d = doel - m.rot; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      m.rot += d * 0.25; m.g.rotation.y = m.rot;
    }
    m.px = u.x; m.py = u.y;
    const gekozen = G.sel.includes(u);
    if (m.kenney) animeer(m, u, beweegt, gekozen);
    else poppetje(m, u, beweegt);
    if (m.p.hout) { m.p.hout.visible = u.carry == 'hout'; m.p.goud.visible = u.carry == 'goud'; }
    m.p.ring.visible = gekozen;
    m.gekozen = gekozen;
    m.balk.visible = gekozen || u.hp < u.max;
    if (m.balk.visible) zetBalk(m.balk, u.hp / u.max, u.side);
  }
  for (const [id, m] of uMesh) if (!gezien.has(id)) {
    uMesh.delete(id);
    if (m.kenney && m.acties.die) { // eerst omvallen, dan weg
      m.balk.visible = false; m.p.ring.visible = false;
      speel(m, 'die', true); m.weg = nu + 1600; stervend.push(m);
    } else scene.remove(m.g);
  }
  for (let i = stervend.length - 1; i >= 0; i--) if (nu > stervend[i].weg) { scene.remove(stervend[i].g); stervend.splice(i, 1); }
}

// Kenney-animaties: lopen, rusten, hakken/bouwen/vechten, theedrinken en "ja!" als je hem kiest
function speel(m, naam, eenmaal) {
  const a = m.acties[naam]; if (!a) return;
  if (m.huidig === a && !eenmaal) return;
  a.reset();
  a.setLoop(eenmaal ? THREE.LoopOnce : THREE.LoopRepeat, eenmaal ? 1 : Infinity);
  a.clampWhenFinished = !!eenmaal;
  a.fadeIn(0.15).play();
  if (m.huidig && m.huidig !== a) m.huidig.fadeOut(0.15);
  m.huidig = a;
  m.eenmaalTot = eenmaal ? performance.now() + a.getClip().duration * 1000 * 0.9 : 0;
}
function animeer(m, u, beweegt, gekozen) {
  const nu = performance.now();
  if (u.captive) { speel(m, 'sit'); return; } // Sir Lodewijk zit gevangen
  if (u.rolstoel) { speel(m, beweegt ? 'wheelchair-move-forward' : 'wheelchair-sit'); return; }
  if (u.swing > (m.vorigeSwing || 0)) speel(m, u.st == 'build' ? 'interact-right' : 'attack-melee-right', true);
  m.vorigeSwing = u.swing;
  if (gekozen && !m.gekozen && !beweegt && u.st == 'idle') speel(m, 'emote-yes', true);
  if (nu < m.eenmaalTot) return;
  if (u.thee > 0 || u.deel > 0) speel(m, 'holding-left');
  else speel(m, beweegt ? 'walk' : 'idle');
}

// eigen blokjespoppetje (als de Kenney-modellen niet geladen zijn)
function poppetje(m, u, beweegt) {
    m.loop = beweegt ? m.loop + 0.28 : m.loop * 0.8;
    const sw = beweegt ? Math.sin(m.loop) * 0.6 : 0;
    m.p.beenL.rotation.x = sw; m.p.beenR.rotation.x = -sw;
    // thee drinken of pizza uitdelen met links
    const linksDoel = u.thee > 0 ? -2.3 : u.deel > 0 ? -1.3 : -sw * 0.7;
    m.p.armL.rotation.x += (linksDoel - m.p.armL.rotation.x) * 0.3;
    m.lijf.position.y = beweegt ? Math.abs(Math.sin(m.loop)) * 0.03 : 0;
    // zwaaien met bijl/zwaard
    if (u.swing > 0) m.p.armR.rotation.x = -Math.sin((12 - u.swing) / 12 * Math.PI) * 1.7 - 0.3;
    else m.p.armR.rotation.x = beweegt ? sw * 0.7 : 0;
}
const stervend = [];

function syncGebouwen(nu) {
  const gezien = new Set();
  for (const b of G.blds) {
    gezien.add(b.id);
    let m = bMesh.get(b.id);
    if (!m) {
      m = M.maakGebouw(b.k, b.w, b.h);
      m.g.position.set(b.x + b.w / 2, 0, b.y + b.h / 2);
      m.g.userData.pick = { bld: b };
      m.balk = maakBalk(Math.min(1.6, b.w * 0.5)); m.balk.position.y = { kasteel: 3.1, toren: 4.4, orkhut: 1.8, kooi: 2.6 }[b.k] || 2.0; m.g.add(m.balk);
      scene.add(m.g); bMesh.set(b.id, m); pickables.push(m.g);
    }
    m.g.visible = b.side == 'h' || isExp(b.x, b.y);
    m.steiger.visible = !b.done;
    m.model.scale.y = b.done ? 1 : 0.12 + 0.88 * b.prog;
    m.keus.visible = G.selB == b;
    m.balk.visible = G.selB == b || b.hp < b.max;
    if (m.balk.visible) zetBalk(m.balk, b.hp / b.max, b.side);
    m.model.traverse((o) => { if (o.userData.vlag) o.rotation.y = Math.sin(nu / 300 + b.id) * 0.3; });
  }
  for (const [id, m] of bMesh) if (!gezien.has(id)) {
    scene.remove(m.g); bMesh.delete(id);
    const i = pickables.indexOf(m.g); if (i >= 0) pickables.splice(i, 1);
  }
  // schaduw bij het kiezen van een bouwplek
  if (G.place && G.place.x >= 0) {
    if (schaduwK != G.place.k) {
      if (schaduw) scene.remove(schaduw.g);
      const d = BLD[G.place.k]; schaduw = M.maakSchaduw(G.place.k, d.w, d.h); schaduwK = G.place.k; scene.add(schaduw.g);
    }
    const d = BLD[G.place.k];
    schaduw.g.visible = true;
    schaduw.g.position.set(G.place.x + d.w / 2, 0, G.place.y + d.h / 2);
    schaduw.vlak.material.color.set(canPlace(G.place.k, G.place.x, G.place.y) ? 0x7dff7a : 0xff2a1a);
  } else if (schaduw) schaduw.g.visible = false;
}

function zetBoom(i, m) {
  const b = bomen.basis[i];
  for (const im of bomen.lagen[b.si]) { im.setMatrixAt(b.idx, m); im.instanceMatrix.needsUpdate = true; }
}

function syncWereld(nu) {
  // omgehakte bomen weghalen
  if (kaartVersie != G.mapVersie) {
    kaartVersie = G.mapVersie;
    bomen.keys.forEach((k, i) => {
      if (!bomen.weg[i] && !(G.trees[k] > 0)) {
        bomen.weg[i] = true;
        const b = bomen.basis[i];
        zetBoom(i, tmpM.compose(b.p, b.q, tmpS.set(0, 0, 0)));
        for (const im of bomen.stronken) { im.setMatrixAt(i, tmpM.compose(b.p, b.q, tmpS.set(1, 1, 1))); im.instanceMatrix.needsUpdate = true; }
      }
    });
    tekenGrond();
  }
  // boom schudt bij een bijlslag
  if (G.hak && G.hak.t != bomen.laatsteHak) {
    bomen.laatsteHak = G.hak.t;
    const i = bomen.keys.indexOf(G.hak.k); if (i >= 0) bomen.schud[i] = 1;
  }
  bomen.schud.forEach((s, i) => {
    if (s <= 0 || bomen.weg[i]) return;
    const nieuw = Math.max(0, s - 0.06); bomen.schud[i] = nieuw;
    const b = bomen.basis[i];
    tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.sin(nieuw * 20) * 0.08 * nieuw).premultiply(b.q);
    zetBoom(i, tmpM.compose(b.p, tmpQ, b.s));
  });
  // lege mijn: geen goud meer te zien
  for (const m of mijnen) m.goud.visible = G.mineG[m.key] > 0;
  // wolken trekken weg waar je komt
  const w = wolken, tq = new THREE.Quaternion();
  for (let i = 0; i < w.pos.length; i++) {
    const p = w.pos[i], doel = isExp(p.x, p.y) ? 0 : 1;
    w.schaal[i] += (doel - w.schaal[i]) * 0.09;
    const s = w.schaal[i] < 0.02 ? 0 : w.schaal[i] * p.s;
    tmpP.set(p.x + 0.5 + p.ox, p.h + Math.sin(nu / 1500 + p.f) * 0.08 + (1 - w.schaal[i]) * 0.8, p.y + 0.5 + p.oz);
    tmpS.set(s, s * 0.7, s);
    tmpM.compose(tmpP, tq, tmpS); w.mesh.setMatrixAt(i, tmpM);
  }
  w.mesh.instanceMatrix.needsUpdate = true;
}

const ringGeo = new THREE.RingGeometry(0.2, 0.28, 24).rotateX(-Math.PI / 2);
const deeltjeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);

function syncEffecten() {
  const gezien = new Set();
  for (const f of G.fx) {
    gezien.add(f);
    let m = fxMesh.get(f);
    if (!m) {
      if (f.arrow) m = M.maakPijl();
      else if (f.ring) m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: f.ring, transparent: true }));
      else if (f.grave) m = M.kenneyKlaar() ? new THREE.Group() : M.maakGraf(f.grave); // Kenney-mannetjes vallen zelf om
      else m = new THREE.Mesh(deeltjeGeo, M.mat(f.c || '#7a6a5a'));
      fxMesh.set(f, m); scene.add(m);
    }
    if (f.arrow) {
      const p = 1 - f.l / 12, h0 = f.hoog ? 3.0 : 0.5;
      const x = wx(f.x + (f.tx - f.x) * p), z = wz(f.y + (f.ty - f.y) * p), y = h0 + (0.4 - h0) * p + Math.sin(p * Math.PI) * 0.5;
      m.position.set(x, y, z); m.lookAt(wx(f.tx), 0.4, wz(f.ty));
    } else if (f.ring) {
      m.position.set(wx(f.x), 0.04, wz(f.y)); const s = 1 + (20 - f.l) / 20; m.scale.set(s, 1, s); m.material.opacity = f.l / 20;
    } else if (f.grave) {
      m.position.set(wx(f.x), 0, wz(f.y)); m.visible = f.grave == 'h' || isExp(...tileOf(f));
      if (f.l < 20) m.scale.setScalar(f.l / 20);
    } else {
      m.position.set(wx(f.x), Math.max(0.04, f.h / T + 0.4), wz(f.y)); m.rotation.x += 0.1; m.rotation.y += 0.13;
    }
  }
  for (const [f, m] of fxMesh) if (!gezien.has(f)) { scene.remove(m); if (f.ring) m.material.dispose(); fxMesh.delete(f); }
}

// ---------- muis en aanraken ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), grondVlak = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), v3 = new THREE.Vector3();

function zetRay(cx, cy) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return r;
}
function grondTegel() {
  if (!ray.ray.intersectPlane(grondVlak, v3)) return null;
  const x = Math.floor(v3.x), y = Math.floor(v3.z);
  return x >= 0 && y >= 0 && x < G.MW && y < G.MH ? { x, y } : null;
}

function kies(cx, cy) {
  const r = zetRay(cx, cy);
  const g = grondTegel();
  // mannetjes: dichtstbijzijnde op het scherm
  let unit = null, bd = isTouch ? 34 : 24;
  for (const u of G.units) {
    const m = uMesh.get(u.id); if (!m || !m.g.visible) continue;
    v3.set(wx(u.x), 0.5, wz(u.y)).project(camera);
    const sx = (v3.x + 1) / 2 * r.width, sy = (1 - v3.y) / 2 * r.height;
    const d = Math.hypot(sx - (cx - r.left), sy - (cy - r.top));
    if (d < bd) { bd = d; unit = u; }
  }
  let tx = g ? g.x : -1, ty = g ? g.y : -1, bld = null;
  for (const h of ray.intersectObjects(pickables, true)) {
    let o = h.object;
    if (o.isInstancedMesh && o.userData.bomen) {
      const k = o.userData.bomen[h.instanceId];
      if (k && G.trees[k] > 0) { [tx, ty] = k.split(',').map(Number); break; }
      continue;
    }
    while (o && !(o.userData && o.userData.pick)) o = o.parent;
    if (!o || !o.visible) continue;
    const pk = o.userData.pick;
    if (pk.bld) { if (G.blds.includes(pk.bld)) { bld = pk.bld; tx = bld.x; ty = bld.y; break; } continue; }
    if (pk.mijn) { [tx, ty] = pk.mijn; break; }
  }
  return { unit, bld, tx, ty, gx: g ? g.x : -1, gy: g ? g.y : -1 };
}

let neer = null;
const kader = $('kader');
// Shift (of Ctrl) + slepen met links: rechthoek om mannetjes trekken in plaats van de camera draaien
renderer.domElement.addEventListener('pointerdown', (e) => {
  unlock(); primeVoice();
  const mod = e.ctrlKey || e.metaKey || e.shiftKey;
  neer = { x: e.clientX, y: e.clientY, mod, type: e.pointerType, knop: e.button, kader: mod && e.button == 0 && e.pointerType == 'mouse' && G.state == 'spel' && !G.place };
  if (neer.kader) controls.enabled = false;
}, true);
renderer.domElement.addEventListener('pointermove', (e) => {
  if (G.place && e.pointerType == 'mouse' && G.state == 'spel') { zetRay(e.clientX, e.clientY); const g = grondTegel(); if (g) muisBouw(g.x, g.y); }
  if (neer && neer.kader && Math.hypot(e.clientX - neer.x, e.clientY - neer.y) > 6) {
    Object.assign(kader.style, { left: Math.min(e.clientX, neer.x) + 'px', top: Math.min(e.clientY, neer.y) + 'px', width: Math.abs(e.clientX - neer.x) + 'px', height: Math.abs(e.clientY - neer.y) + 'px' });
    kader.hidden = false;
  }
});
function eindKader(e, d) { // geeft true als er een rechthoek getrokken is
  controls.enabled = true; kader.hidden = true;
  if (Math.hypot(e.clientX - d.x, e.clientY - d.y) <= 6) return false; // gewone Ctrl/Shift-klik
  const neer = d;
  const x1 = Math.min(e.clientX, neer.x), x2 = Math.max(e.clientX, neer.x), y1 = Math.min(e.clientY, neer.y), y2 = Math.max(e.clientY, neer.y);
  const r = renderer.domElement.getBoundingClientRect();
  const binnen = G.units.filter((u) => {
    const m = uMesh.get(u.id); if (!m || !m.g.visible) return false;
    v3.set(wx(u.x), 0.5, wz(u.y)).project(camera);
    const sx = r.left + (v3.x + 1) / 2 * r.width, sy = r.top + (1 - v3.y) / 2 * r.height;
    return sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2;
  });
  kiesGroep(binnen, false); tekenPaneel(true);
  return true;
}
addEventListener('pointerup', (e) => { if (neer && neer.kader) { eindKader(e, neer); neer = null; } }); // losgelaten buiten het spelveld
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!neer) return;
  const d = neer; neer = null;
  if (d.kader && eindKader(e, d)) return;
  if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return; // dat was slepen
  if (d.knop == 2) { if (G.place) { G.place = null; G.msgT = 0; } return; }
  if (d.knop != 0) return;
  const p = kies(e.clientX, e.clientY);
  p.mod = d.mod; p.touch = d.type != 'mouse';
  klik(p);
  tekenPaneel(true);
});
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

const toetsen = new Set();
addEventListener('keydown', (e) => {
  if (e.code == 'KeyP' && G.state == 'spel') zetPauze(!G.paused);
  if (e.code == 'Escape') { stopKeuze(); tekenPaneel(true); }
  toetsen.add(e.code);
});
addEventListener('keyup', (e) => toetsen.delete(e.code));
addEventListener('blur', () => toetsen.clear());

function camSchuif() {
  let fx = 0, fz = 0;
  if (toetsen.has('ArrowUp') || toetsen.has('KeyW')) fz -= 1;
  if (toetsen.has('ArrowDown') || toetsen.has('KeyS')) fz += 1;
  if (toetsen.has('ArrowLeft') || toetsen.has('KeyA')) fx -= 1;
  if (toetsen.has('ArrowRight') || toetsen.has('KeyD')) fx += 1;
  if (!fx && !fz) return;
  const vooruit = new THREE.Vector3().subVectors(controls.target, camera.position).setY(0).normalize();
  const rechts = new THREE.Vector3().crossVectors(vooruit, camera.up).normalize();
  const stap = vooruit.multiplyScalar(-fz * 0.25).add(rechts.multiplyScalar(fx * 0.25));
  controls.target.add(stap); camera.position.add(stap);
}
function camBinnenKaart() {
  const t = controls.target, ox = t.x, oz = t.z;
  t.x = Math.max(0, Math.min(G.MW, t.x)); t.z = Math.max(0, Math.min(G.MH, t.z)); t.y = 0;
  camera.position.x += t.x - ox; camera.position.z += t.z - oz;
}

// ---------- scherm: bovenbalk, paneel en menu's ----------
function zetPauze(aan) { G.paused = aan; $('pauze').hidden = !aan; }
$('pauzeknop').onclick = () => { if (G.state == 'spel') zetPauze(!G.paused); };
$('verder').onclick = () => zetPauze(false);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const prijs = (c) => `<span class="prijs">${c[0] ? `<i class="goud"></i>${c[0]}` : ''} ${c[1] ? `<i class="hout"></i>${c[1]}` : ''}</span>`;

let paneelSleutel = '';
function tekenPaneel(forceer) {
  const sel = G.sel, b = G.selB, ws = sel.filter((u) => u.k == 'werker');
  const sleutel = JSON.stringify([G.multi, sel.map((u) => u.id), b && b.id, b && b.done, b && b.q, G.place && G.place.k, G.L && G.L.bouw.map((k) => canAfford(BLD[k].cost)),
    ['werker', 'soldaat', 'boog'].map((k) => canAfford(UNIT[k].cost))]);
  if (!forceer && sleutel == paneelSleutel) return vulPaneel();
  paneelSleutel = sleutel;
  const p = $('paneel');
  let h = '';
  const meervoud = (k, n) => n + ' ' + (n > 1 ? { werker: 'werkers', soldaat: 'soldaten', boog: 'boogschutters' }[k] || UNIT[k].n.toLowerCase() : UNIT[k].n.toLowerCase());
  h += `<div class="kiesbalk">${G.L && G.L.dungeon ? '<button data-alle="groep">Hele groep</button>' : '<button data-alle="0">Alle werkers</button><button data-alle="1">Alle soldaten</button>'}<button data-meer class="${G.multi ? 'actief' : ''}">${G.multi ? '✓ Meer kiezen' : '+ Meer kiezen'}</button>${sel.length || b ? '<button data-los>✕ Loslaten</button>' : ''}</div>`;
  if (sel.length == 1) {
    const u = sel[0], l = LAND[u.voice && u.voice.lang];
    h += `<div class="kop"><b>${esc(UNIT[u.k].n)}</b><span id="pstatus"></span></div><div class="hp"><div id="php"></div></div>`;
    if (l) h += `<div class="land"><b>${esc(l.n)}</b>${u.k == 'werker' ? ` met ${esc(l.ding)}: ${esc(l.effect.charAt(0).toLowerCase() + l.effect.slice(1))}` : ''}${u.rolstoel ? ' · rijdt in een rolstoel' : ''}</div>`;
  } else if (sel.length > 1) {
    const tel = {}; for (const u of sel) tel[u.k] = (tel[u.k] || 0) + 1;
    h += `<div class="kop"><b>${sel.length} gekozen</b></div><div class="groep">${Object.entries(tel).map(([k, n]) => `<button data-weg="${k}" title="Haal ze uit de keuze">${esc(meervoud(k, n))} <span>✕</span></button>`).join('')}</div>`;
  }
  if (ws.length && G.L) {
    h += '<div class="knoppen">' + G.L.bouw.map((k) => `<button data-bouw="${k}" class="${canAfford(BLD[k].cost) ? '' : 'duur'} ${G.place && G.place.k == k ? 'actief' : ''}">Bouw ${esc(BLD[k].n.toLowerCase())}${prijs(BLD[k].cost)}</button>`).join('') + '</div>';
  }
  if (b) {
    h += `<div class="kop"><b>${esc(BLD[b.k].n)}</b><span id="pstatus"></span></div><div class="hp"><div id="php"></div></div>`;
    if (b.done && b.side == 'h') {
      const kan = Object.keys(UNIT).filter((k) => UNIT[k].from && UNIT[k].from.includes(b.k));
      if (kan.length) h += '<div class="knoppen">' + kan.map((k) => `<button data-train="${k}" class="${canAfford(UNIT[k].cost) ? '' : 'duur'}">${esc(UNIT[k].n)}${prijs(UNIT[k].cost)}</button>`).join('') + '</div>';
      if (b.q.length) h += `<div class="rij">${b.q.map((k, i) => `<span class="${i ? '' : 'nu'}">${esc(UNIT[k].n)}${i ? '' : '<i id="qbalk"></i>'}</span>`).join('')}</div>`;
    }
  }
  if (!sel.length && !b) h += '<div class="tip">Klik op een mannetje of gebouw.<br>Ctrl/Shift-klik: meer kiezen of weer weghalen.<br>Shift + slepen: een rechthoek om mannetjes trekken.</div>';
  p.innerHTML = h;
  p.querySelectorAll('[data-alle]').forEach((el) => el.onclick = () => { unlock(); kiesAlle(el.dataset.alle == 'groep' ? 'groep' : el.dataset.alle == '1'); tekenPaneel(true); });
  p.querySelector('[data-meer]').onclick = () => { G.multi = !G.multi; sClick(); if (G.multi) { G.msg = isTouch ? 'Tik op meer mannetjes om ze toe te voegen of weg te halen.' : 'Klik op meer mannetjes om ze toe te voegen of weg te halen (of houd Ctrl ingedrukt).'; G.msgT = 200; } tekenPaneel(true); };
  const los = p.querySelector('[data-los]'); if (los) los.onclick = () => { stopKeuze(); sClick(); tekenPaneel(true); };
  p.querySelectorAll('[data-weg]').forEach((el) => el.onclick = () => { haalWeg(el.dataset.weg); tekenPaneel(true); });
  p.querySelectorAll('[data-bouw]').forEach((el) => el.onclick = () => { unlock(); startPlace(el.dataset.bouw, isTouch); tekenPaneel(true); });
  p.querySelectorAll('[data-train]').forEach((el) => el.onclick = () => { unlock(); if (G.selB) train(G.selB, el.dataset.train); tekenPaneel(true); });
  vulPaneel();
}
function vulPaneel() {
  const st = $('pstatus'), hp = $('php'), qb = $('qbalk');
  const u = G.sel.length == 1 ? G.sel[0] : null, b = G.selB;
  if (u) { if (st) st.textContent = statusTekst(u); if (hp) hp.style.width = (u.hp / u.max * 100) + '%'; }
  if (b) {
    if (st) st.textContent = b.done ? (b.q.length ? 'traint ' + UNIT[b.q[0]].n.toLowerCase() : BLD[b.k].food ? 'geeft voedsel voor ' + BLD[b.k].food : b.k == 'toren' ? 'schiet op orks in de buurt' : '') : 'wordt gebouwd: ' + Math.floor(b.prog * 100) + '%';
    if (hp) hp.style.width = (b.hp / b.max * 100) + '%';
    if (qb && b.q.length) qb.style.width = (b.qp / UNIT[b.q[0]].time * 100) + '%';
  }
}

function tekenBalk() {
  const f = food();
  for (const id of ['goud', 'hout', 'voedsel']) $(id).parentElement.hidden = !!G.L.dungeon;
  $('goud').textContent = G.res.goud;
  $('hout').textContent = G.res.hout;
  $('voedsel').textContent = f.use + '/' + f.cap;
  $('voedsel').parentElement.classList.toggle('vol', f.use >= f.cap);
  if (G.L) {
    let tekst = 'Doel: ' + G.L.voortgang(S);
    if (G.L.waves && S.huts() > 0) tekst += ` · volgende aanval over <b>${Math.max(0, Math.ceil((G.nextWave - G.t) / 60))}s</b>`;
    $('doel').innerHTML = tekst;
  }
  const m = $('melding');
  if (G.msgT > 0 && G.msg) { m.textContent = G.msg; m.classList.add('zichtbaar'); } else m.classList.remove('zichtbaar');
}

// ---------- menu's ----------
function toon(id) { for (const s of ['titel', 'brief', 'einde']) $(s).hidden = s != id; $('hud').hidden = id != null; }

function tekenTitel() {
  toon('titel');
  const lijst = $('levels');
  lijst.innerHTML = LEVELS.map((l, i) => i < G.unlocked
    ? `<button class="level" data-lvl="${i}">${i + 1}. ${esc(l.naam)}${i < G.unlocked - 1 ? ' ✓' : ''}</button>`
    : `<button class="level" disabled>${i + 1}. ${esc(l.naam)} <small>win eerst level ${i}</small></button>`).join('') +
    BINNENKORT.map((n, i) => `<button class="level" disabled>${LEVELS.length + i + 1}. ${esc(n)} <small>komt nog</small></button>`).join('');
  lijst.querySelectorAll('[data-lvl]').forEach((el) => el.onclick = () => { unlock(); primeVoice(); sClick(); start(+el.dataset.lvl); });
  $('moeilijk').innerHTML = DIFF.map((d, i) => `<button data-diff="${i}" class="${G.diff == i ? 'actief' : ''}">${d.n}</button>`).join('');
  $('moeilijk').querySelectorAll('button').forEach((el) => el.onclick = () => { zetMoeilijkheid(+el.dataset.diff); sClick(); tekenTitel(); });
  $('stemknop').textContent = 'Stemmen: ' + (stemAan() ? 'aan' : 'uit');
  loadVoices();
  $('stemmen').textContent = 'Stemmen op dit toestel: ' + ['nl', 'en', 'de', 'it', 'fr'].map((l) => l.toUpperCase() + (VOX[l] ? ' ✓' : ' ✗')).join('   ');
}
$('stemknop').onclick = () => { zetStem(!stemAan()); tekenTitel(); };

function start(i) {
  loadLevel(i);
  bouwWereld();
  $('briefnaam').textContent = G.L.naam;
  $('briefniveau').textContent = 'Level ' + (i + 1) + ' · ' + DIFF[G.diff].n;
  $('brieftekst').innerHTML = G.L.brief.map((r) => `<p>${esc(r)}</p>`).join('');
  $('briefdoel').textContent = 'Doel: ' + G.L.doel;
  $('brieflanden').textContent = 'Je mannetjes komen uit Nederland, Engeland, Duitsland, Italië en Frankrijk. Klik op een werker om te zien wat hij extra kan!';
  toon('brief');
}
$('beginknop').onclick = () => { unlock(); primeVoice(); G.state = 'spel'; toon(null); zetPauze(false); tekenPaneel(true); };

function eindScherm() {
  const won = G.state == 'gewonnen';
  $('eindtitel').textContent = won ? 'Gewonnen!' : 'Verloren';
  $('eindtekst').textContent = won ? (G.lvl + 1 < LEVELS.length ? 'Op naar het volgende level!' : 'Knap gedaan! Level ' + (G.lvl + 2) + ' in 3D komt binnenkort.') : G.lostMsg;
  $('volgende').hidden = !(won && G.lvl + 1 < LEVELS.length);
  $('opnieuw').textContent = won ? 'Nog een keer' : 'Opnieuw proberen';
  toon('einde');
}
$('volgende').onclick = () => start(G.lvl + 1);
$('opnieuw').onclick = () => start(G.lvl);
$('naarmenu').onclick = () => { G.state = 'titel'; tekenTitel(); };
$('menuknop').onclick = () => { G.state = 'titel'; zetPauze(false); tekenTitel(); };

// ---------- de lus ----------
let acc = 0, vorige = performance.now(), hudT = 0, eindGetoond = false;
function frame(nu) {
  requestAnimationFrame(frame);
  const dt = Math.min(100, nu - vorige); vorige = nu;
  if (G.state == 'spel' && !G.paused) {
    acc += dt; let n = 0;
    while (acc >= 1000 / 60 && n < 5) { update(); acc -= 1000 / 60; n++; if (G.state != 'spel') break; }
    if (n == 5) acc = 0;
  } else acc = 0;
  if ((G.state == 'gewonnen' || G.state == 'verloren') && !eindGetoond) { eindGetoond = true; setTimeout(eindScherm, 900); }
  if (G.state == 'spel') eindGetoond = false;
  controls.autoRotate = G.state == 'titel';
  camSchuif(); controls.update(); camBinnenKaart();
  syncWereld(nu); syncGebouwen(nu); syncMannetjes(nu); syncEffecten();
  if (!G.paused) {
    const ds = dt / 1000;
    for (const [, m] of uMesh) if (m.mixer) m.mixer.update(ds);
    for (const m of stervend) m.mixer.update(ds);
    for (const [, m] of bMesh) for (const mx of m.model.userData.mixers || []) mx.update(ds); // gevangenen in de gevangenis
  }
  renderer.render(scene, camera);
  if (G.state == 'spel' && nu - hudT > 100) { hudT = nu; tekenBalk(); tekenPaneel(false); }
}

// titelscherm met level 1 op de achtergrond
// eerst de Kenney-modellen laden; lukt dat niet, dan de eigen blokjesmodellen
try { await M.laadKenney(); } catch (e) { console.warn('Kenney-modellen niet geladen, ik gebruik de eigen modellen.', e); }
$('laden').hidden = true;
loadLevel(0); G.state = 'titel'; bouwWereld();
tekenTitel();
requestAnimationFrame(frame);
window.__test = { G, update, camera, controls, uMesh, kies }; // handig om te testen
