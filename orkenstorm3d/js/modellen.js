// Zelfgemaakte 3D-modellen van eenvoudige blokjes en kegels.
// Later kunnen hier de Kenney-modellen (GLB) voor in de plaats komen: de rest van het spel
// gebruikt alleen maakMannetje, maakGebouw, maakMijn en de boom- en wolkvormen.
// Eén tegel is 1 bij 1 in de 3D-wereld. Voorkant van een model = richting +z.

import * as THREE from 'three';
import * as K from './kenney.js';
export { laad as laadKenney } from './kenney.js';
export const kenneyKlaar = () => K.klaar;

const mats = {};
export function mat(c) { return mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c, flatShading: true })); }

const geos = {};
function geo(key, maak) { return geos[key] || (geos[key] = maak()); }

function mesh(g, c, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(g, mat(c));
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  return m;
}
export const doos = (w, h, d, c, x, y, z) => mesh(geo(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)), c, x, y, z);
export const cil = (rt, rb, h, c, x, y, z, s = 8) => mesh(geo(`c${rt},${rb},${h},${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s)), c, x, y, z);
export const kegel = (r, h, c, x, y, z, s = 8) => mesh(geo(`k${r},${h},${s}`, () => new THREE.ConeGeometry(r, h, s)), c, x, y, z);
export const bol = (r, c, x, y, z, det = 0) => mesh(geo(`s${r},${det}`, () => new THREE.IcosahedronGeometry(r, det)), c, x, y, z);
const steen = (r, c, x, y, z) => mesh(geo(`d${r}`, () => new THREE.DodecahedronGeometry(r, 0)), c, x, y, z);

// zadeldak: driehoek over de breedte (x), nok loopt van links naar rechts
function dak(w, h, d, c, x, y, z) {
  return mesh(geo(`dak${w},${h},${d}`, () => {
    const s = new THREE.Shape();
    s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.lineTo(-d / 2, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
    g.translate(0, 0, -w / 2); g.rotateY(Math.PI / 2);
    return g;
  }), c, x, y, z);
}

// ---------- mannetjes ----------
const HUID = '#f1c27d';
const KLEDING = {
  werker: { romp: '#a0703c', broek: '#5b4630' },
  soldaat: { romp: '#2f5fb3', broek: '#3b3b48' },
  boog: { romp: '#3d7d3a', broek: '#4d3b2a' },
  ork: { romp: '#6b4a2b', broek: '#3e2d1c', huid: '#5f9e3c' },
  speerork: { romp: '#7a5530', broek: '#3e2d1c', huid: '#6aab45' },
};

export function maakMannetje(k, side, land, rolstoel) {
  if (K.klaar) return kenneyMannetje(k, side, land, rolstoel);
  const kl = KLEDING[k] || KLEDING.werker;
  const huid = kl.huid || HUID;
  const g = new THREE.Group();
  const lijf = new THREE.Group(); g.add(lijf);
  const p = {};
  // benen draaien vanuit de heup
  for (const [naam, x] of [['beenL', -0.07], ['beenR', 0.07]]) {
    const been = new THREE.Group(); been.position.set(x, 0.26, 0);
    been.add(doos(0.09, 0.26, 0.1, kl.broek, 0, -0.13, 0));
    been.add(doos(0.1, 0.05, 0.13, '#3a2a1c', 0, -0.24, 0.015));
    lijf.add(been); p[naam] = been;
  }
  lijf.add(doos(0.3, 0.3, 0.19, kl.romp, 0, 0.41, 0));
  lijf.add(doos(0.31, 0.05, 0.2, '#4a3520', 0, 0.29, 0)); // riem
  lijf.add(bol(0.115, huid, 0, 0.67, 0, 1));
  // armen draaien vanuit de schouder
  for (const [naam, x] of [['armL', -0.2], ['armR', 0.2]]) {
    const arm = new THREE.Group(); arm.position.set(x, 0.54, 0);
    arm.add(doos(0.08, 0.25, 0.08, kl.romp, 0, -0.11, 0));
    arm.add(bol(0.045, huid, 0, -0.25, 0));
    lijf.add(arm); p[naam] = arm;
  }
  const hand = (arm, ding) => { ding.position.y -= 0.25; arm.add(ding); return ding; };

  if (k == 'werker') {
    lijf.add(kegel(0.2, 0.12, '#e0c068', 0, 0.8, 0, 10)); // strohoed
    const bijl = new THREE.Group();
    bijl.add(doos(0.03, 0.34, 0.03, '#7a5230', 0, 0, 0.1));
    bijl.add(doos(0.02, 0.1, 0.12, '#b8c0c8', 0, 0.14, 0.17));
    bijl.rotation.x = Math.PI / 2; hand(p.armR, bijl);
    // lading: blok hout of goudklomp
    p.hout = cil(0.06, 0.06, 0.34, '#8b5a2b', 0, 0.5, -0.16, 7); p.hout.rotation.z = Math.PI / 2; lijf.add(p.hout);
    p.goud = steen(0.08, '#f2c53d', 0, 0.48, -0.15); lijf.add(p.goud);
    // iets uit zijn land in de linkerhand
    if (LANDDING[land]) { const d = LANDDING[land](); d.position.set(0, -0.27, 0.07); d.scale.setScalar(1.4); p.armL.add(d); p.ding = d; }
  } else if (k == 'soldaat') {
    lijf.add(cil(0.125, 0.13, 0.1, '#9aa3ad', 0, 0.75, 0, 10));
    lijf.add(kegel(0.13, 0.1, '#9aa3ad', 0, 0.85, 0, 10));
    const zwaard = new THREE.Group();
    zwaard.add(doos(0.03, 0.38, 0.015, '#d6dde3', 0, 0.02, 0.21));
    zwaard.add(doos(0.12, 0.025, 0.03, '#c9a33a', 0, -0.06, 0.04));
    zwaard.rotation.x = Math.PI / 2; hand(p.armR, zwaard);
    const schild = doos(0.04, 0.26, 0.22, '#2f5fb3', -0.05, 0.1, 0.02); p.armL.add(schild);
    p.armL.add(bol(0.03, '#e8c547', -0.075, -0.1, 0.02));
    schild.position.set(-0.05, -0.14, 0.02);
  } else if (k == 'boog') {
    lijf.add(kegel(0.14, 0.2, '#2e5f2c', 0, 0.82, -0.01, 8)); // kap
    const boog = mesh(geo('boog', () => new THREE.TorusGeometry(0.2, 0.014, 4, 12, Math.PI)), '#7a5230');
    boog.rotation.y = Math.PI / 2; boog.position.set(-0.02, -0.25, 0.05); p.armL.add(boog);
    lijf.add(cil(0.05, 0.05, 0.26, '#6b4a2b', 0.07, 0.48, -0.13, 6)); // pijlkoker
  } else if (k == 'ork' || k == 'speerork') {
    g.scale.setScalar(1.18);
    lijf.add(doos(0.03, 0.05, 0.03, '#fffbe8', -0.05, 0.6, 0.1)); // slagtanden
    lijf.add(doos(0.03, 0.05, 0.03, '#fffbe8', 0.05, 0.6, 0.1));
    lijf.add(doos(0.17, 0.025, 0.02, '#c0392b', 0, 0.7, 0.11)); // boze wenkbrauwen
    lijf.add(doos(0.34, 0.12, 0.22, '#5a4a3a', 0, 0.52, 0)); // schouderstuk
    if (k == 'ork') {
      const bijl = new THREE.Group();
      bijl.add(doos(0.035, 0.42, 0.035, '#5a3b20', 0, 0, 0.12));
      bijl.add(doos(0.02, 0.16, 0.16, '#7d858c', 0, 0.16, 0.22));
      bijl.rotation.x = Math.PI / 2; hand(p.armR, bijl);
    } else {
      const speer = new THREE.Group();
      speer.add(doos(0.025, 0.7, 0.025, '#5a3b20', 0, 0, 0.1));
      speer.add(kegel(0.035, 0.12, '#9aa3ad', 0, 0.4, 0.1, 5));
      speer.rotation.x = Math.PI / 2.4; hand(p.armR, speer);
    }
  }
  // keuzering onder de voeten
  p.ring = new THREE.Mesh(geo('ring', () => new THREE.RingGeometry(0.24, 0.3, 24).rotateX(-Math.PI / 2)),
    new THREE.MeshBasicMaterial({ color: side == 'o' ? 0xe0574c : 0x7dff7a, transparent: true, opacity: 0.9 }));
  p.ring.position.y = 0.02; p.ring.visible = false; g.add(p.ring);
  return { g, lijf, p };
}

function keuzering(side) {
  const r = new THREE.Mesh(geo('ring', () => new THREE.RingGeometry(0.24, 0.3, 24).rotateX(-Math.PI / 2)),
    new THREE.MeshBasicMaterial({ color: side == 'o' ? 0xe0574c : 0x7dff7a, transparent: true, opacity: 0.9 }));
  r.position.y = 0.02; r.visible = false; return r;
}

// Kenney-mannetje: echte animaties, spullen vast aan de botten (arm-left, arm-right, head, torso).
// Het model is 0.76 hoog; de armen staan in de rustpose opzij (rechterarm naar -x).
function kenneyMannetje(k, side, land, rolstoel) {
  const f = K.figuur(k);
  const g = new THREE.Group(), lijf = new THREE.Group();
  g.add(lijf); lijf.add(f.model);
  const ork = side == 'o';
  lijf.scale.setScalar(ork ? 1.2 : 1.1);
  const armR = f.bot('arm-right'), armL = f.bot('arm-left'), hoofd = f.bot('head'), romp = f.bot('torso');
  const p = { ring: keuzering(side) };
  const inHand = (arm, ding, links) => { // ding staat rechtop (+y); in de hand wijst het naar voren
    const h = new THREE.Group(); h.position.set(links ? 0.23 : -0.23, -0.01, 0.02);
    ding.rotation.x = Math.PI / 2; h.add(ding); arm.add(h); return h;
  };
  if (k == 'werker') {
    const bijl = K.stuk('survival/tool-axe'); bijl.scale.setScalar(1.3); inHand(armR, bijl);
    const hoed = kegel(0.26, 0.13, '#e0c068', 0, 0.42, 0, 10); hoed.scale.set(1, 1, 0.9); hoofd.add(hoed);
    p.hout = cil(0.05, 0.05, 0.3, '#8b5a2b', 0, 0.14, -0.15, 7); p.hout.rotation.z = Math.PI / 2; romp.add(p.hout);
    p.goud = steen(0.06, '#f2c53d', 0, 0.14, -0.15); romp.add(p.goud);
    if (LANDDING[land]) { const d = LANDDING[land](); d.scale.setScalar(1.7); p.ding = inHand(armL, d, true); d.rotation.set(0, 0, 0); }
  } else if (k == 'soldaat') {
    inHand(armR, K.stuk('dungeon/weapon-sword'));
    const schild = K.stuk('dungeon/shield-round'); schild.scale.setScalar(0.8);
    const h = new THREE.Group(); h.position.set(0.2, 0, 0.06); h.add(schild); armL.add(h);
    const helm = new THREE.Group();
    helm.add(cil(0.21, 0.22, 0.12, '#9aa3ad', 0, 0.36, 0, 10)); helm.add(kegel(0.22, 0.12, '#9aa3ad', 0, 0.48, 0, 10));
    hoofd.add(helm);
  } else if (k == 'boog') {
    const boog = K.stuk('forest/weapon-bow'); const h = new THREE.Group(); h.position.set(0.23, 0, 0.02); boog.rotation.x = -0.2; h.add(boog); armL.add(h);
  } else if (k == 'ork') {
    const bijl = K.stuk('survival/tool-axe'); bijl.scale.setScalar(1.5); inHand(armR, bijl);
  } else if (k == 'speerork') {
    inHand(armR, K.stuk('dungeon/weapon-spear'));
  }
  if (rolstoel) {
    f.model.add(K.stuk('characters/wheelchair'));
  }
  g.add(p.ring);
  return { g, lijf, p, mixer: f.mixer, acties: f.acties, kenney: true };
}

// Wat werkers uit hun land meenemen
const LANDDING = {
  it() { // pizza
    const g = new THREE.Group();
    g.add(cil(0.13, 0.13, 0.025, '#e2b065', 0, 0, 0.06, 14));
    g.add(cil(0.11, 0.11, 0.03, '#d2412c', 0, 0.002, 0.06, 14));
    for (const [x, z] of [[0.05, 0.02], [-0.04, 0.05], [0.0, -0.05], [-0.06, -0.02], [0.06, 0.09], [-0.01, 0.12]]) g.add(cil(0.022, 0.022, 0.035, '#8a1f1a', x, 0.005, 0.06 + z - 0.04, 8));
    for (const [x, z] of [[0.02, 0.07], [-0.07, 0.07], [0.07, -0.0]]) g.add(doos(0.03, 0.036, 0.03, '#f4e7b0', x, 0.005, z));
    g.rotation.x = 0.15; return g;
  },
  nl() { // kaasje
    const g = new THREE.Group();
    g.add(cil(0.09, 0.09, 0.07, '#f2c230', 0, 0, 0.05, 12));
    g.add(cil(0.092, 0.092, 0.02, '#e3a91c', 0, 0, 0.05, 12));
    return g;
  },
  de() { // pul met schuim
    const g = new THREE.Group();
    g.add(cil(0.048, 0.044, 0.13, '#e8a524', 0, 0.06, 0.05, 10));
    g.add(bol(0.05, '#fffbe8', 0, 0.13, 0.05, 1));
    const oor = mesh(geo('oor', () => new THREE.TorusGeometry(0.03, 0.01, 4, 8, Math.PI)), '#f3c45a');
    oor.rotation.z = -Math.PI / 2; oor.position.set(0.048, 0.06, 0.05); g.add(oor);
    return g;
  },
  fr() { // stokbrood
    const g = new THREE.Group();
    const brood = cil(0.035, 0.035, 0.42, '#d9a352', 0, 0.12, 0.05, 8); brood.rotation.z = 0.25; g.add(brood);
    for (let i = -1; i <= 1; i++) { const sn = doos(0.04, 0.012, 0.03, '#f3dca0', 0.02 + i * 0.025, 0.12 + i * 0.1, 0.085); sn.rotation.z = 0.25 + 0.6; g.add(sn); }
    return g;
  },
  en() { // kopje thee op een schoteltje
    const g = new THREE.Group();
    g.add(cil(0.07, 0.07, 0.012, '#ffffff', 0, 0, 0.05, 12));
    g.add(cil(0.045, 0.035, 0.06, '#ffffff', 0, 0.035, 0.05, 10));
    g.add(cil(0.04, 0.04, 0.005, '#9a5b2a', 0, 0.064, 0.05, 10));
    g.add(doos(0.012, 0.03, 0.03, '#ffffff', 0.05, 0.035, 0.05));
    return g;
  },
};

// ---------- gebouwen ----------
const STEEN = '#bdb6aa', STEEN2 = '#9a9387', HOUT = '#8b5a2b', DONKER = '#2b2420';

function vlag(kleur, x, y, z) {
  const g = new THREE.Group();
  g.add(cil(0.02, 0.02, 0.6, '#5a3b20', 0, 0.3, 0, 5));
  const v = doos(0.3, 0.18, 0.015, kleur, 0.16, 0.5, 0); v.userData.vlag = true; g.add(v);
  g.position.set(x, y, z); return g;
}

const MODEL = {
  kasteel() {
    const g = new THREE.Group();
    g.add(doos(2.5, 1.0, 2.5, STEEN, 0, 0.5, 0));
    for (let i = -1; i <= 1; i += 0.5) { // kantelen
      g.add(doos(0.22, 0.2, 0.15, STEEN2, i * 1.1, 1.1, 1.18)); g.add(doos(0.22, 0.2, 0.15, STEEN2, i * 1.1, 1.1, -1.18));
      g.add(doos(0.15, 0.2, 0.22, STEEN2, 1.18, 1.1, i * 1.1)); g.add(doos(0.15, 0.2, 0.22, STEEN2, -1.18, 1.1, i * 1.1));
    }
    for (const [x, z] of [[-1.15, -1.15], [1.15, -1.15], [-1.15, 1.15], [1.15, 1.15]]) {
      g.add(cil(0.38, 0.42, 1.7, STEEN2, x, 0.85, z, 10));
      g.add(kegel(0.48, 0.7, '#3b64b5', x, 2.05, z, 10));
    }
    g.add(doos(1.1, 1.0, 1.1, STEEN, 0, 1.5, -0.2)); // donjon
    g.add(dak(1.25, 0.6, 1.25, '#3b64b5', 0, 2.0, -0.2));
    g.add(doos(0.6, 0.7, 0.1, DONKER, 0, 0.35, 1.26)); // poort
    g.add(doos(0.7, 0.08, 0.12, HOUT, 0, 0.72, 1.27));
    for (const x of [-0.6, 0.6]) g.add(doos(0.12, 0.2, 0.05, DONKER, x, 0.75, 1.26)); // ramen
    g.add(vlag('#e8c547', 0, 2.5, -0.2));
    return g;
  },
  boerderij() {
    const g = new THREE.Group();
    g.add(doos(1.05, 0.6, 0.8, '#efe4c8', -0.3, 0.3, -0.3));
    g.add(dak(1.15, 0.45, 0.95, '#c0462f', -0.3, 0.6, -0.3));
    g.add(doos(0.2, 0.36, 0.05, '#6b4226', -0.3, 0.18, 0.11)); // deur
    g.add(doos(0.16, 0.14, 0.05, '#7fb8e0', -0.66, 0.38, 0.11));
    g.add(doos(0.1, 0.3, 0.1, '#8a8580', 0.0, 0.95, -0.4)); // schoorsteen
    g.add(doos(0.75, 0.04, 0.7, '#6e4f2e', 0.45, 0.02, 0.45)); // akker
    for (let i = 0; i < 4; i++) g.add(doos(0.62, 0.12, 0.08, '#e3c04b', 0.45, 0.1, 0.18 + i * 0.18));
    g.add(bol(0.2, '#e8cf6a', 0.6, 0.15, -0.55, 0)); // hooiberg
    for (let i = 0; i < 5; i++) g.add(doos(0.04, 0.2, 0.04, '#9b6b3a', -0.85 + i * 0.12, 0.1, 0.85)); // hekje
    g.add(doos(0.55, 0.03, 0.03, '#9b6b3a', -0.61, 0.15, 0.85));
    return g;
  },
  kazerne() {
    const g = new THREE.Group();
    g.add(doos(2.2, 0.35, 1.5, STEEN2, 0, 0.175, -0.4)); // stenen voet
    g.add(doos(2.1, 0.6, 1.4, '#d8c39a', 0, 0.65, -0.4));
    for (const x of [-1.0, -0.35, 0.35, 1.0]) g.add(doos(0.08, 0.6, 0.05, '#6b4226', x, 0.65, 0.31)); // vakwerk
    g.add(doos(2.12, 0.07, 0.05, '#6b4226', 0, 0.92, 0.31));
    g.add(dak(2.35, 0.6, 1.65, '#8a2f2a', 0, 0.95, -0.4));
    g.add(doos(0.45, 0.55, 0.06, '#5a3b20', 0, 0.45, 0.32)); // deur
    g.add(doos(0.3, 0.3, 0.04, '#2f5fb3', -0.65, 0.65, 0.34)); // schild aan de muur
    g.add(doos(0.06, 0.4, 0.05, '#d6dde3', -0.65, 0.65, 0.37));
    g.add(doos(0.3, 0.06, 0.05, '#d6dde3', -0.65, 0.72, 0.37));
    // oefenpop
    g.add(cil(0.03, 0.03, 0.6, HOUT, 0.8, 0.3, 0.9, 6));
    g.add(doos(0.36, 0.04, 0.04, HOUT, 0.8, 0.45, 0.9));
    g.add(bol(0.11, '#e3c04b', 0.8, 0.66, 0.9, 0));
    g.add(doos(0.6, 0.04, 0.2, HOUT, -0.6, 0.3, 0.95)); // wapenrek
    for (let i = 0; i < 3; i++) g.add(doos(0.025, 0.5, 0.025, '#b8c0c8', -0.78 + i * 0.18, 0.4, 0.95));
    g.add(vlag('#2f5fb3', 1.05, 1.0, -0.4));
    return g;
  },
  toren() {
    const g = new THREE.Group();
    g.add(cil(0.55, 0.65, 1.8, STEEN, 0, 0.9, 0, 10));
    g.add(cil(0.7, 0.7, 0.2, STEEN2, 0, 1.9, 0, 10));
    g.add(kegel(0.75, 0.8, '#3b64b5', 0, 2.4, 0, 10));
    g.add(doos(0.3, 0.45, 0.06, DONKER, 0, 0.22, 0.62));
    return g;
  },
  kooi() {
    const g = new THREE.Group();
    for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) g.add(doos(0.12, 1.2, 0.12, HOUT, x, 0.6, z));
    for (let i = -3; i <= 3; i++) { g.add(doos(0.04, 1.1, 0.04, '#5a3b20', i * 0.24, 0.55, 0.8)); g.add(doos(0.04, 1.1, 0.04, '#5a3b20', i * 0.24, 0.55, -0.8)); g.add(doos(0.04, 1.1, 0.04, '#5a3b20', 0.8, 0.55, i * 0.24)); g.add(doos(0.04, 1.1, 0.04, '#5a3b20', -0.8, 0.55, i * 0.24)); }
    g.add(doos(1.8, 0.1, 1.8, HOUT, 0, 1.25, 0));
    return g;
  },
  orkhut() {
    const g = new THREE.Group();
    g.add(kegel(0.9, 1.2, '#7a5a38', 0, 0.6, 0, 7));
    g.add(doos(0.35, 0.4, 0.1, DONKER, 0, 0.2, 0.68));
    for (let i = 0; i < 5; i++) { const s = kegel(0.05, 0.4, '#e8e0c8', Math.cos(i * 1.3) * 0.75, 0.2, Math.sin(i * 1.3) * 0.75, 5); s.rotation.z = 0.4; g.add(s); }
    g.add(vlag('#7a1e1e', 0.5, 0.4, -0.3));
    return g;
  },
};

// Gebouw met steigers (zichtbaar zolang het gebouwd wordt) en een keuzevlak eronder
// Kasteel van 3x3 tegels uit de Castle Kit: vier hoektorens, muren, poort en een hoge donjon
function kenneyKasteel() {
  const g = new THREE.Group();
  const zet = (n, x, y, z, rot = 0) => { const m = K.stuk('castle/' + n); m.position.set(x, y, z); m.rotation.y = rot; g.add(m); return m; };
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { zet('tower-square-base', x, 0, z); zet('tower-square-mid', x, 1, z); zet('tower-square-roof', x, 2, z); }
  zet('wall', 0, 0, -1); zet('wall', -1, 0, 0, Math.PI / 2); zet('wall', 1, 0, 0, Math.PI / 2);
  zet('wall', 0, 0, 1); zet('gate', 0, 0, 1.5, Math.PI / 2);
  zet('tower-square-base', 0, 0, 0); zet('tower-square-mid-windows', 0, 1, 0); zet('tower-square-mid', 0, 2, 0); zet('tower-square-top-roof-high', 0, 3, 0);
  zet('flag', 0.3, 4.2, 0);
  return g;
}

function zetIn(g, n, x, y, z, rot = 0, schaal = 1) {
  const m = K.stuk(n); m.position.set(x, y, z); m.rotation.y = rot; m.scale.setScalar(schaal); g.add(m); return m;
}

// Boerderij (2x2): schuurtje met hooi, akkertjes met plantjes, hekje
function kenneyBoerderij() {
  const g = new THREE.Group();
  zetIn(g, 'forest/building-roof', -0.4, 0, -0.4, 0, 1.05);
  g.add(bol(0.24, '#e8cf6a', -0.45, 0.16, -0.4, 0)); // hooiberg onder het dak
  for (const [x, z] of [[0.48, -0.45], [0.48, 0.48], [-0.45, 0.48]]) {
    zetIn(g, 'forest/patch-dirt', x, 0, z, 0, 0.95);
    for (const [px, pz] of [[-0.22, -0.2], [0.18, -0.18], [-0.18, 0.2], [0.2, 0.2]]) zetIn(g, 'forest/plant', x + px, 0.06, z + pz, (px + pz) * 3, 0.9);
  }
  zetIn(g, 'forest/fence', -0.45, 0, 0.98, 0, 0.85); zetIn(g, 'forest/fence', 0.48, 0, 0.98, 0, 0.85);
  zetIn(g, 'forest/fence', 0.98, 0, 0.48, Math.PI / 2, 0.85); zetIn(g, 'forest/fence', 0.98, 0, -0.45, Math.PI / 2, 0.85);
  return g;
}

// Kazerne (3x3): legerkamp met wachttoren, houten muur, tent, kruisboog en schietschijf
function kenneyKazerne() {
  const g = new THREE.Group();
  zetIn(g, 'castle/tower-square-base', -1, 0, -1); zetIn(g, 'castle/tower-slant-roof', -1, 1, -1);
  zetIn(g, 'castle/wall-narrow-wood', 0, 0, -1); zetIn(g, 'castle/wall-narrow-wood', 1, 0, -1);
  zetIn(g, 'castle/flag-banner-long', 0.5, 0, -1.45, Math.PI / 2, 0.7);
  zetIn(g, 'forest/tent', 0.45, 0, -0.1, 0, 1.2);
  zetIn(g, 'castle/siege-ballista', -0.75, 0.13, 0.55, 0.4, 0.62);
  zetIn(g, 'forest/target', 0.95, 0, 0.85, -0.3, 1.1);
  return g;
}

// Wachttoren (2x2): zeshoekige toren met deur en blauw puntdak
function kenneyToren() {
  const g = new THREE.Group();
  zetIn(g, 'castle/tower-hexagon-base', 0, 0, 0, 0, 1.5);
  zetIn(g, 'castle/tower-hexagon-mid', 0, 1.31 * 1.5, 0, 0, 1.5);
  zetIn(g, 'castle/tower-hexagon-roof', 0, 1.77 * 1.5, 0, 0, 1.5);
  return g;
}

// Orkenhut (2x2): tentdoek met kampvuur, palissade en een rode orkenvlag
function kenneyOrkhut() {
  const g = new THREE.Group();
  zetIn(g, 'survival/tent-canvas', -0.1, 0, -0.2, 0.3, 2.6);
  zetIn(g, 'survival/campfire-pit', 0.45, 0, 0.55, 0, 2.2);
  for (const [x, z, r] of [[-0.95, -0.5, Math.PI / 2], [-0.95, 0.5, Math.PI / 2], [-0.5, -0.95, 0], [0.5, -0.95, 0], [0.95, -0.5, Math.PI / 2]]) zetIn(g, 'survival/fence-fortified', x, 0, z, r, 2);
  g.add(vlag('#7a1e1e', 0.7, 0, -0.6));
  return g;
}

// Gevangenis (2x2): houten frame met tralies; de gevangen werkers staan erin
function kenneyKooi() {
  const g = new THREE.Group();
  zetIn(g, 'dungeon/wood-structure', 0, 0, 0, 0, 1.75);
  for (const [x, z, r] of [[-0.85, -0.42, 0], [-0.85, 0.42, 0], [0.85, -0.42, 0], [0.85, 0.42, 0], [-0.42, -0.85, Math.PI / 2], [0.42, -0.85, Math.PI / 2], [-0.42, 0.85, Math.PI / 2], [0.42, 0.85, Math.PI / 2]]) {
    const t = zetIn(g, 'castle/metal-gate', x, 0, z, r, 1.2); t.scale.y = 2.1;
  }
  g.userData.mixers = [];
  for (const [x, z, r] of [[-0.4, -0.35, 0.3], [0.35, -0.3, -0.4], [-0.3, 0.38, 0.8], [0.38, 0.4, -0.9]]) {
    const m = kenneyMannetje('werker', 'h', null, false);
    m.p.hout.visible = false; m.p.goud.visible = false;
    m.g.position.set(x, 0, z); m.g.rotation.y = r; m.g.scale.setScalar(1.4);
    const a = m.acties[Math.random() < 0.5 ? 'idle' : 'emote-no']; a.play(); a.time = Math.random() * 2;
    g.add(m.g); g.userData.mixers.push(m.mixer);
  }
  return g;
}

const BOUW = { kasteel: kenneyKasteel, boerderij: kenneyBoerderij, kazerne: kenneyKazerne, toren: kenneyToren, orkhut: kenneyOrkhut, kooi: kenneyKooi };

// brug over één tegel water (loopt van noord naar zuid)
export function maakBrug() {
  if (K.klaar) { const b = K.stuk('forest/bridge'); b.rotation.y = Math.PI / 2; b.scale.set(1.3, 0.6, 1.3); b.position.y = -0.05; return b; }
  const g = new THREE.Group();
  g.add(doos(0.8, 0.08, 1.0, '#8a5a2b', 0, 0.06, 0));
  for (const x of [-0.42, 0.42]) g.add(doos(0.05, 0.25, 1.0, '#6b4226', x, 0.15, 0));
  return g;
}
const modelVoor = (k, w, h) => (K.klaar && BOUW[k] ? BOUW[k]() : MODEL[k] ? MODEL[k]() : doos(w * 0.8, 1, h * 0.8, STEEN, 0, 0.5, 0));

export function maakGebouw(k, w, h) {
  const g = new THREE.Group();
  const model = modelVoor(k, w, h);
  g.add(model);
  const steiger = new THREE.Group();
  if (K.klaar) { // houten stutten van Kenney langs voor- en achterkant
    for (const z of [-1, 1]) for (let x = -(w - 1) / 2; x <= (w - 1) / 2; x++) zetIn(steiger, 'dungeon/wood-support', x, 0, z * (h / 2 - 0.15), 0, 0.95);
  } else for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) steiger.add(cil(0.035, 0.035, 1.3, '#c9a26b', x * (w / 2 - 0.15), 0.65, z * (h / 2 - 0.15), 5));
  if (!K.klaar) for (const y of [0.45, 1.0]) {
    steiger.add(doos(w - 0.2, 0.04, 0.08, '#c9a26b', 0, y, h / 2 - 0.15));
    steiger.add(doos(0.08, 0.04, h - 0.2, '#c9a26b', w / 2 - 0.15, y, 0));
  }
  steiger.add(doos(w * 0.6, 0.06, h * 0.6, '#a07a4a', 0, 0.03, 0));
  steiger.visible = false; g.add(steiger);
  const keus = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.2, h + 0.2).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x7dff7a, transparent: true, opacity: 0.35, depthWrite: false }));
  keus.position.y = 0.025; keus.visible = false; g.add(keus);
  return { g, model, steiger, keus };
}

// Doorzichtige kopie voor het kiezen van een bouwplek
export function maakSchaduw(k, w, h) {
  const g = new THREE.Group();
  const model = modelVoor(k, w, h);
  const doorzicht = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false });
  model.traverse((o) => { if (o.isMesh) { o.material = doorzicht; o.castShadow = false; } });
  g.add(model);
  const vlak = new THREE.Mesh(new THREE.PlaneGeometry(w, h).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x7dff7a, transparent: true, opacity: 0.6, depthWrite: false }));
  vlak.position.y = 0.03; g.add(vlak);
  return { g, vlak };
}

// ---------- goudmijn (2 bij 2) ----------
export function maakMijn() {
  if (K.klaar) return kenneyMijn();
  const g = new THREE.Group();
  const rots = [[-0.5, 0.35, -0.45, 0.55], [0.4, 0.3, -0.5, 0.5], [0, 0.55, -0.25, 0.6], [-0.65, 0.2, 0.2, 0.35], [0.65, 0.22, 0.15, 0.38], [0, 0.25, -0.75, 0.4]];
  rots.forEach(([x, y, z, r], i) => { const s = steen(r, i % 2 ? '#8f8a84' : '#a39d95', x, y, z); s.rotation.set(i, i * 2, 0); g.add(s); });
  g.add(doos(0.5, 0.5, 0.3, '#1d1813', 0, 0.25, 0.32)); // ingang
  g.add(doos(0.08, 0.6, 0.08, HOUT, -0.3, 0.3, 0.48));
  g.add(doos(0.08, 0.6, 0.08, HOUT, 0.3, 0.3, 0.48));
  g.add(doos(0.72, 0.09, 0.1, HOUT, 0, 0.62, 0.48));
  const goud = new THREE.Group();
  const klompen = [[-0.45, 0.7, -0.2], [0.35, 0.62, -0.3], [0.05, 1.0, -0.2], [-0.62, 0.42, 0.35], [0.6, 0.48, 0.3], [0.15, 0.85, -0.55]];
  for (const [x, y, z] of klompen) { const s = steen(0.085, '#f7c932', x, y, z); s.castShadow = false; goud.add(s); }
  g.add(goud);
  // karretje met goud
  g.add(doos(0.32, 0.16, 0.22, '#6b4226', 0.55, 0.14, 0.7));
  g.add(steen(0.09, '#f7c932', 0.55, 0.25, 0.7));
  for (const x of [0.43, 0.67]) { const wiel = cil(0.06, 0.06, 0.26, '#3a2a1c', x, 0.06, 0.7, 8); wiel.rotation.x = Math.PI / 2; g.add(wiel); }
  return { g, goud };
}

function kenneyMijn() {
  const g = new THREE.Group();
  zetIn(g, 'dungeon/rocks', 0, 0, -0.15, 0, 1.9);
  zetIn(g, 'survival/rock-c', -0.55, 0.3, -0.5, 0.5, 1.5);
  zetIn(g, 'survival/rock-b', 0.5, 0.25, -0.55, 2, 1.4);
  zetIn(g, 'survival/rock-a', -0.7, 0, 0.45, 1, 1.2);
  zetIn(g, 'survival/rock-a', 0.1, 0.75, -0.4, 3, 1.1);
  g.add(doos(0.5, 0.55, 0.3, '#1d1813', 0, 0.27, 0.55)); // donkere ingang
  zetIn(g, 'dungeon/wood-support', 0, 0, 0.7, 0, 0.7);
  zetIn(g, 'dungeon/chest', 0.62, 0.05, 0.62, -0.5, 0.75);
  const goud = new THREE.Group();
  for (const [x, y, z] of [[-0.45, 0.85, -0.3], [0.35, 0.7, -0.4], [0.05, 1.2, -0.35], [-0.65, 0.4, 0.35], [0.55, 0.55, -0.1], [0.2, 0.95, -0.65]]) {
    const st = steen(0.09, '#f7c932', x, y, z); st.castShadow = false; goud.add(st);
  }
  const munt = zetIn(goud, 'dungeon/coin', 0.62, 0.32, 0.62, 0.3, 0.6); munt.rotation.x = -0.6;
  g.add(goud);
  return { g, goud };
}

// pijl van Kenney (wijst langs +z), of een staafje
export function maakPijl() {
  if (K.klaar) { const p = K.stuk('forest/weapon-arrow'); p.scale.setScalar(0.9); return p; }
  return new THREE.Mesh(geo('pijl', () => new THREE.CylinderGeometry(0.012, 0.012, 0.35, 4).rotateX(Math.PI / 2)), new THREE.MeshBasicMaterial({ color: 0x5a3b20 }));
}

// ---------- vormen voor bomen en wolken (voor InstancedMesh) ----------
// Boomsoorten voor de InstancedMesh: elke soort is een lijst delen { geo, mat }
let soortenCache = null;
export function boomSoorten() {
  if (soortenCache) return soortenCache;
  if (K.klaar) soortenCache = ['forest/tree', 'forest/tree-high', 'castle/tree-large', 'castle/tree-small', 'forest/tree'].map((n) => K.delen(n));
  else soortenCache = [[{ geo: boomStam(), mat: mat('#7a5230') }, { geo: boomKruin1(), mat: mat('#4e8a3a') }, { geo: boomKruin2(), mat: mat('#5a9a44') }]];
  return soortenCache;
}
export function stronkDelen() { return K.klaar ? K.delen('castle/tree-trunk') : [{ geo: stronk(), mat: mat('#8b6a40') }]; }
export const boomStam = () => new THREE.CylinderGeometry(0.07, 0.1, 0.42, 6).translate(0, 0.21, 0);
export const boomKruin1 = () => new THREE.ConeGeometry(0.44, 0.75, 7).translate(0, 0.72, 0);
export const boomKruin2 = () => new THREE.ConeGeometry(0.32, 0.6, 7).translate(0, 1.08, 0);
export const stronk = () => new THREE.CylinderGeometry(0.09, 0.11, 0.12, 7).translate(0, 0.06, 0);
export const wolk = () => new THREE.IcosahedronGeometry(0.62, 1);

// grafsteentje
export function maakGraf(side) {
  const g = new THREE.Group();
  if (side == 'o') { g.add(bol(0.1, '#e8e0c8', 0, 0.08, 0)); g.add(doos(0.3, 0.04, 0.05, '#e8e0c8', 0, 0.03, 0.1)); }
  else { g.add(doos(0.16, 0.24, 0.06, '#8d8a85', 0, 0.12, 0)); g.add(doos(0.22, 0.04, 0.12, '#6b6a65', 0, 0.02, 0.04)); }
  return g;
}
