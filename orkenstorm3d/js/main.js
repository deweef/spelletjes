// De 3D-weergave, camera, muis/toetsen en het scherm met knoppen.

import * as THREE from 'three';
import { OrbitControls } from '../lib/OrbitControls.js';
import { UNIT, BLD, DIFF, LEVELS, BINNENKORT } from './data.js';
import { G, T, loadLevel, update, klik, muisBouw, train, startPlace, stopKeuze, canPlace, canAfford, food, isExp, tileOf, center, statusTekst, zetMoeilijkheid, S } from './spel.js';
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

scene.add(new THREE.HemisphereLight('#dff1ff', '#56703a', 1.6));
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
let bomen = null; // { stam, kruin1, kruin2, stronk, keys: [], weg: [] }
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
    if (t == 'W') kleur = '#3a7bbf';
    else if (t == 'M') kleur = '#8d8170';
    else if (t == 'T') kleur = v < 0.5 ? '#4d7a33' : '#517f36';
    else if (t == 's') kleur = '#7d6a45';
    else kleur = v < 0.33 ? '#6aa84f' : v < 0.66 ? '#70ad53' : '#66a34b';
    c.fillStyle = kleur; c.fillRect(x * S, y * S, S, S);
    if (t == '.' && v > 0.8) { c.fillStyle = '#86c063'; c.fillRect(x * S + 4 + (v * 37 % 6), y * S + 5, 2, 3); c.fillRect(x * S + 9, y * S + 9 + (v * 51 % 4), 2, 3); }
    if (t == '.' && v < 0.04) { c.fillStyle = '#f4e27a'; c.fillRect(x * S + 7, y * S + 7, 2, 2); }
  }
  // zandrand langs het water
  for (let y = 0; y < G.MH; y++) for (let x = 0; x < G.MW; x++) {
    if (G.map[y][x] == 'W') continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (G.map[y + dy] && G.map[y + dy][x + dx] == 'W') {
        c.fillStyle = '#d9c78c';
        c.fillRect(x * S + (dx == 1 ? S - 4 : 0), y * S + (dy == 1 ? S - 4 : 0), dx ? 4 : S, dy ? 4 : S);
      }
    }
  }
  grondTex.needsUpdate = true;
}

function bouwWereld() {
  if (wereld) { scene.remove(wereld); gooiWeg(wereld); }
  for (const [, m] of uMesh) scene.remove(m.g); uMesh.clear();
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
  const rand = new THREE.Mesh(new THREE.PlaneGeometry(220, 220).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#4b7a32' }));
  rand.position.set(MW / 2, -0.02, MH / 2); rand.receiveShadow = true; rand.userData = { eigenGeo: 1, eigenMat: 1 };
  wereld.add(rand);

  // water
  const waterTegels = [];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (G.map[y][x] == 'W') waterTegels.push([x, y]);
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
    if (r() < 0.75) sier.push([x, y]);
  }
  const alle = [...keys.map((k) => k.split(',').map(Number)), ...sier];
  const n = alle.length;
  const stamGeo = M.boomStam(), k1 = M.boomKruin1(), k2 = M.boomKruin2();
  const stam = new THREE.InstancedMesh(stamGeo, new THREE.MeshLambertMaterial({ color: '#7a5230', flatShading: true }), n);
  const kruin1 = new THREE.InstancedMesh(k1, new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), n);
  const kruin2 = new THREE.InstancedMesh(k2, new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), n);
  const strk = new THREE.InstancedMesh(M.stronk(), new THREE.MeshLambertMaterial({ color: '#8b6a40', flatShading: true }), keys.length || 1);
  const basis = [];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), kl = new THREE.Color();
  alle.forEach(([x, y], i) => {
    const s = 0.85 + r() * 0.4;
    ps.set(x + 0.5 + (r() - 0.5) * 0.25, 0, y + 0.5 + (r() - 0.5) * 0.25);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * 6.28);
    sc.set(s, s * (0.9 + r() * 0.3), s);
    m4.compose(ps, q, sc);
    stam.setMatrixAt(i, m4); kruin1.setMatrixAt(i, m4); kruin2.setMatrixAt(i, m4);
    basis.push({ p: ps.clone(), q: q.clone(), s: sc.clone() });
    kl.setHSL(0.27 + r() * 0.07, 0.45 + r() * 0.15, 0.27 + r() * 0.08);
    kruin1.setColorAt(i, kl); kl.offsetHSL(0, 0, 0.05); kruin2.setColorAt(i, kl);
    if (i < keys.length) { m4.compose(ps, q, new THREE.Vector3(0, 0, 0)); strk.setMatrixAt(i, m4); }
  });
  for (const im of [stam, kruin1, kruin2]) { im.castShadow = true; im.receiveShadow = true; im.userData = { eigenGeo: 1, eigenMat: 1, bomen: keys }; wereld.add(im); }
  strk.userData = { eigenGeo: 1, eigenMat: 1 }; strk.castShadow = true; wereld.add(strk);
  pickables.push(stam, kruin1, kruin2);
  bomen = { stam, kruin1, kruin2, strk, keys, basis, weg: new Array(keys.length).fill(false), schud: new Float32Array(keys.length) };

  // goudmijnen
  for (const key in G.mineG) {
    const [x, y] = key.split(',').map(Number);
    const m = M.maakMijn(); m.g.position.set(x + 1, 0, y + 1);
    m.g.userData.pick = { mijn: [x, y] };
    wereld.add(m.g); pickables.push(m.g); mijnen.push({ key, goud: m.goud });
  }

  // wolken boven onontdekt gebied
  const wpos = [];
  const r2 = rnd(23);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) wpos.push({ x, y, ox: (r2() - 0.5) * 0.4, oz: (r2() - 0.5) * 0.4, s: 1 + r2() * 0.5, h: 1.7 + r2() * 0.6, f: r2() * 6.28 });
  const wm = new THREE.InstancedMesh(M.wolk(), new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true }), wpos.length);
  wpos.forEach((w, i) => { kl.setHSL(0.6, 0.15, 0.9 + r2() * 0.1); wm.setColorAt(i, kl); });
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
  const kx = k ? k.x + k.w / 2 : MW / 2, kz = k ? k.y + k.h / 2 : MH / 2;
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
      m = M.maakMannetje(u.k, u.side);
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
    // lopen
    m.loop = beweegt ? m.loop + 0.28 : m.loop * 0.8;
    const sw = beweegt ? Math.sin(m.loop) * 0.6 : 0;
    m.p.beenL.rotation.x = sw; m.p.beenR.rotation.x = -sw;
    m.p.armL.rotation.x = -sw * 0.7;
    m.lijf.position.y = beweegt ? Math.abs(Math.sin(m.loop)) * 0.03 : 0;
    // zwaaien met bijl/zwaard
    if (u.swing > 0) m.p.armR.rotation.x = -Math.sin((12 - u.swing) / 12 * Math.PI) * 1.7 - 0.3;
    else m.p.armR.rotation.x = beweegt ? sw * 0.7 : 0;
    if (m.p.hout) { m.p.hout.visible = u.carry == 'hout'; m.p.goud.visible = u.carry == 'goud'; }
    const gekozen = G.sel.includes(u);
    m.p.ring.visible = gekozen;
    m.balk.visible = gekozen || u.hp < u.max;
    if (m.balk.visible) zetBalk(m.balk, u.hp / u.max, u.side);
  }
  for (const [id, m] of uMesh) if (!gezien.has(id)) { scene.remove(m.g); uMesh.delete(id); }
}

function syncGebouwen(nu) {
  const gezien = new Set();
  for (const b of G.blds) {
    gezien.add(b.id);
    let m = bMesh.get(b.id);
    if (!m) {
      m = M.maakGebouw(b.k, b.w, b.h);
      m.g.position.set(b.x + b.w / 2, 0, b.y + b.h / 2);
      m.g.userData.pick = { bld: b };
      m.balk = maakBalk(Math.min(1.6, b.w * 0.5)); m.balk.position.y = b.k == 'kasteel' ? 3.1 : 2.0; m.g.add(m.balk);
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

function syncWereld(nu) {
  // omgehakte bomen weghalen
  if (kaartVersie != G.mapVersie) {
    kaartVersie = G.mapVersie;
    bomen.keys.forEach((k, i) => {
      if (!bomen.weg[i] && !(G.trees[k] > 0)) {
        bomen.weg[i] = true;
        tmpM.compose(bomen.basis[i].p, bomen.basis[i].q, tmpS.set(0, 0, 0));
        bomen.stam.setMatrixAt(i, tmpM); bomen.kruin1.setMatrixAt(i, tmpM); bomen.kruin2.setMatrixAt(i, tmpM);
        tmpM.compose(bomen.basis[i].p, bomen.basis[i].q, tmpS.set(1, 1, 1)); bomen.strk.setMatrixAt(i, tmpM);
        for (const im of [bomen.stam, bomen.kruin1, bomen.kruin2, bomen.strk]) im.instanceMatrix.needsUpdate = true;
      }
    });
    tekenGrond();
  }
  // boom schudt bij een bijlslag
  if (G.hak && G.hak.t != bomen.laatsteHak) {
    bomen.laatsteHak = G.hak.t;
    const i = bomen.keys.indexOf(G.hak.k); if (i >= 0) bomen.schud[i] = 1;
  }
  let schudde = false;
  bomen.schud.forEach((s, i) => {
    if (s <= 0 || bomen.weg[i]) return;
    const nieuw = Math.max(0, s - 0.06); bomen.schud[i] = nieuw; schudde = true;
    const b = bomen.basis[i];
    tmpQ.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.sin(nieuw * 20) * 0.08 * nieuw).premultiply(b.q);
    tmpM.compose(b.p, tmpQ, b.s);
    bomen.stam.setMatrixAt(i, tmpM); bomen.kruin1.setMatrixAt(i, tmpM); bomen.kruin2.setMatrixAt(i, tmpM);
  });
  if (schudde) for (const im of [bomen.stam, bomen.kruin1, bomen.kruin2]) im.instanceMatrix.needsUpdate = true;
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

const pijlGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.35, 4).rotateX(Math.PI / 2);
const pijlMat = new THREE.MeshBasicMaterial({ color: 0x5a3b20 });
const ringGeo = new THREE.RingGeometry(0.2, 0.28, 24).rotateX(-Math.PI / 2);
const deeltjeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);

function syncEffecten() {
  const gezien = new Set();
  for (const f of G.fx) {
    gezien.add(f);
    let m = fxMesh.get(f);
    if (!m) {
      if (f.arrow) m = new THREE.Mesh(pijlGeo, pijlMat);
      else if (f.ring) m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: f.ring, transparent: true }));
      else if (f.grave) m = M.maakGraf(f.grave);
      else m = new THREE.Mesh(deeltjeGeo, M.mat(f.c || '#7a6a5a'));
      fxMesh.set(f, m); scene.add(m);
    }
    if (f.arrow) {
      const p = 1 - f.l / 12, h0 = f.hoog ? 1.8 : 0.5;
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
renderer.domElement.addEventListener('pointerdown', (e) => {
  unlock(); primeVoice();
  neer = { x: e.clientX, y: e.clientY, mod: e.ctrlKey || e.metaKey || e.shiftKey, type: e.pointerType, knop: e.button };
});
renderer.domElement.addEventListener('pointermove', (e) => {
  if (G.place && e.pointerType == 'mouse' && G.state == 'spel') { zetRay(e.clientX, e.clientY); const g = grondTegel(); if (g) muisBouw(g.x, g.y); }
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!neer) return;
  const d = neer; neer = null;
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
  const sleutel = JSON.stringify([sel.map((u) => u.id), b && b.id, b && b.done, b && b.q, G.place && G.place.k, G.L && G.L.bouw.map((k) => canAfford(BLD[k].cost)),
    ['werker', 'soldaat', 'boog'].map((k) => canAfford(UNIT[k].cost))]);
  if (!forceer && sleutel == paneelSleutel) return vulPaneel();
  paneelSleutel = sleutel;
  const p = $('paneel');
  let h = '';
  if (sel.length == 1) {
    const u = sel[0];
    h += `<div class="kop"><b>${esc(UNIT[u.k].n)}</b><span id="pstatus"></span></div><div class="hp"><div id="php"></div></div>`;
  } else if (sel.length > 1) {
    const tel = {}; for (const u of sel) tel[u.k] = (tel[u.k] || 0) + 1;
    h += `<div class="kop"><b>${sel.length} gekozen</b><span>${Object.entries(tel).map(([k, n]) => n + ' ' + UNIT[k].n.toLowerCase() + (n > 1 ? (k == 'werker' ? 's' : k == 'boog' ? 's' : 'en') : '')).join(', ')}</span></div>`;
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
  if (!h) h = '<div class="tip">Klik op een mannetje of gebouw.<br>Ctrl- of Shift-klik: meer mannetjes kiezen.</div>';
  p.innerHTML = h;
  p.querySelectorAll('[data-bouw]').forEach((el) => el.onclick = () => { unlock(); startPlace(el.dataset.bouw, isTouch); tekenPaneel(true); });
  p.querySelectorAll('[data-train]').forEach((el) => el.onclick = () => { unlock(); if (G.selB) train(G.selB, el.dataset.train); tekenPaneel(true); });
  vulPaneel();
}
function vulPaneel() {
  const st = $('pstatus'), hp = $('php'), qb = $('qbalk');
  const u = G.sel.length == 1 ? G.sel[0] : null, b = G.selB;
  if (u) { if (st) st.textContent = statusTekst(u); if (hp) hp.style.width = (u.hp / u.max * 100) + '%'; }
  if (b) {
    if (st) st.textContent = b.done ? (b.q.length ? 'traint ' + UNIT[b.q[0]].n.toLowerCase() : BLD[b.k].food ? 'geeft voedsel voor ' + BLD[b.k].food : '') : 'wordt gebouwd: ' + Math.floor(b.prog * 100) + '%';
    if (hp) hp.style.width = (b.hp / b.max * 100) + '%';
    if (qb && b.q.length) qb.style.width = (b.qp / UNIT[b.q[0]].time * 100) + '%';
  }
}

function tekenBalk() {
  const f = food();
  $('goud').textContent = G.res.goud;
  $('hout').textContent = G.res.hout;
  $('voedsel').textContent = f.use + '/' + f.cap;
  $('voedsel').parentElement.classList.toggle('vol', f.use >= f.cap);
  if (G.L) {
    const bf = Math.min(4, S.count('boerderij')), kz = Math.min(1, S.count('kazerne'));
    $('doel').innerHTML = `Doel: boerderijen <b>${bf}/4</b> · kazerne <b>${kz}/1</b>`;
  }
  const m = $('melding');
  if (G.msgT > 0 && G.msg) { m.textContent = G.msg; m.classList.add('zichtbaar'); } else m.classList.remove('zichtbaar');
}

// ---------- menu's ----------
function toon(id) { for (const s of ['titel', 'brief', 'einde']) $(s).hidden = s != id; $('hud').hidden = id != null; }

function tekenTitel() {
  toon('titel');
  const lijst = $('levels');
  lijst.innerHTML = LEVELS.map((l, i) => `<button class="level" data-lvl="${i}">${i + 1}. ${esc(l.naam)}${i < G.unlocked - 1 ? ' ✓' : ''}</button>`).join('') +
    BINNENKORT.map((n, i) => `<button class="level" disabled>${LEVELS.length + i + 1}. ${esc(n)} <small>komt nog</small></button>`).join('');
  lijst.querySelectorAll('[data-lvl]').forEach((el) => el.onclick = () => { unlock(); primeVoice(); sClick(); start(+el.dataset.lvl); });
  $('moeilijk').innerHTML = DIFF.map((d, i) => `<button data-diff="${i}" class="${G.diff == i ? 'actief' : ''}">${d.n}</button>`).join('');
  $('moeilijk').querySelectorAll('button').forEach((el) => el.onclick = () => { zetMoeilijkheid(+el.dataset.diff); sClick(); tekenTitel(); });
  $('stemknop').textContent = 'Stemmen: ' + (stemAan() ? 'aan' : 'uit');
  loadVoices();
  $('stemmen').textContent = 'Stemmen op dit toestel: ' + ['nl', 'en', 'de'].map((l) => l.toUpperCase() + (VOX[l] ? ' ✓' : ' ✗')).join('   ');
}
$('stemknop').onclick = () => { zetStem(!stemAan()); tekenTitel(); };

function start(i) {
  loadLevel(i);
  bouwWereld();
  $('briefnaam').textContent = G.L.naam;
  $('briefniveau').textContent = 'Level ' + (i + 1) + ' · ' + DIFF[G.diff].n;
  $('brieftekst').innerHTML = G.L.brief.map((r) => `<p>${esc(r)}</p>`).join('');
  $('briefdoel').textContent = 'Doel: ' + G.L.doel;
  toon('brief');
}
$('beginknop').onclick = () => { unlock(); primeVoice(); G.state = 'spel'; toon(null); zetPauze(false); tekenPaneel(true); };

function eindScherm() {
  const won = G.state == 'gewonnen';
  $('eindtitel').textContent = won ? 'Gewonnen!' : 'Verloren';
  $('eindtekst').textContent = won ? (G.lvl + 1 < LEVELS.length ? 'Op naar het volgende level!' : 'Knap gedaan! Level 2 in 3D komt binnenkort.') : G.lostMsg;
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
  renderer.render(scene, camera);
  if (G.state == 'spel' && nu - hudT > 100) { hudT = nu; tekenBalk(); tekenPaneel(false); }
}

// titelscherm met level 1 op de achtergrond
loadLevel(0); G.state = 'titel'; bouwWereld();
tekenTitel();
requestAnimationFrame(frame);
window.__test = { G, update, camera }; // handig om te testen
