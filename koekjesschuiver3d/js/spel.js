// Koekjesschuiver 3D: dezelfde spelregels als koekjesschuiver.html, maar met echte 3D-natuurkunde (cannon-es),
// zodat koekjes op elkaar stapelen. Minder, grotere koekjes dan in 2D: rustiger en elk koekje telt meer.
// Eenheden: 1 = een flinke koekjesbreedte/2. De tafel loopt van x = -HB tot HB, de voorrand ligt op z = VOOR.

import * as THREE from 'three';
import * as CANNON from 'cannon';

const $ = (id) => document.getElementById(id);
const HB = 3, VOOR = 3, ZIJ_EIND = 1.4, KR = 0.45, KH = 0.13;
const MUUR_VOOR = -2.3; // voorkant van de vaste achterwand boven de schuif
const SCHUIF = { midden: -2.85, slag: 1.15, w: 1.6, half: 2, hoog: 0.7 }; // schuif heen en weer
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
const straal = (c) => (c < 10 ? KR : c < 20 ? 0.5 : 0.52);
const dikte = (c) => (c < 10 ? KH : c == 13 ? 0.24 : c < 20 ? 0.2 : 0.16);

// ---------- geluid ----------
let ac = null;
function unlock() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state != 'running') ac.resume(); } catch (e) {} }
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
  try { const u = new SpeechSynthesisUtterance('Likkie-likkie!'); u.lang = 'nl-NL'; u.pitch = 1.9; u.rate = 1.15; const v = speechSynthesis.getVoices().find((v) => v.lang && v.lang.startsWith('nl')); if (v) u.voice = v; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
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
function pasAan() {
  const w = innerWidth, h = innerHeight, asp = w / h;
  renderer.setSize(w, h); camera.aspect = asp;
  const ver = asp < 1 ? 11.5 / asp ** 0.6 : 11; // op een smal scherm verder weg, zodat de tafel past
  camera.position.set(0, ver * 0.78, ver * 0.62 + 0.8); camera.lookAt(0, -0.3, -0.2);
  camera.updateProjectionMatrix();
}
addEventListener('resize', pasAan); pasAan();
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
    if (code == 0) { rondje('#d99a4e'); rondje('#e8b469', c * 0.8); spikkels('#4a2a14', 14, 12); }
    else if (code == 1) { rondje('#d99a4e'); rondje('#f6a3c0', c * 0.82); for (let i = 0; i < 26; i++) { g.fillStyle = ['#fff', '#7fd0f0', '#ffe14d', '#9ae07a'][i % 4]; const a = r() * 7, d = r() * c * 0.7; g.save(); g.translate(c + Math.cos(a) * d, c + Math.sin(a) * d); g.rotate(r() * 3); g.fillRect(-9, -3, 18, 6); g.restore(); } }
    else if (code == 2) { rondje('#5a3420'); rondje('#6b4028', c * 0.82); spikkels('#f4ead6', 13, 11); }
    else if (code == 3) { rondje('#e8a820'); rondje('#ffd84a', c * 0.84); g.fillStyle = '#fff4b0'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? c * 0.25 : c * 0.55; g.lineTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr); } g.fill(); }
    else if (code == 10) { rondje('#f2a0c0'); g.strokeStyle = '#ffd0e0'; g.lineWidth = 16; g.beginPath(); for (let a = 0; a < 18; a += 0.2) g.lineTo(c + Math.cos(a) * a * 6, c + Math.sin(a) * a * 6); g.stroke(); rondje('#e8203a', c * 0.2); }
    else if (code == 11) { rondje('#f6e7c8'); g.fillStyle = '#7a2a5a'; g.beginPath(); g.moveTo(c, c); g.arc(c, c, c * 0.9, -2.2, -0.9); g.fill(); spikkels('#fff', 8, 10); }
    else if (code == 12) { rondje('#f6f0e2'); g.fillStyle = '#2a1a12'; g.beginPath(); g.arc(c, c, c * 0.96, Math.PI / 2, Math.PI * 1.5); g.fill(); }
    else if (code == 13) { rondje('#8ad8c0'); rondje('#b8f0e0', c * 0.7); }
    else if (code == 14) { g.fillStyle = '#fbf3e6'; g.fillRect(0, 0, w, w); g.strokeStyle = '#e8b0c0'; g.lineWidth = 10; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(0, i * w / 4); g.lineTo(w, i * w / 4); g.stroke(); } rondje('#e8203a', c * 0.16); }
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
const SIDE = { 0: '#c8843a', 1: '#c8843a', 2: '#4a2a18', 3: '#d89a18', 10: '#f0e0d0', 11: '#e8d0a0', 12: '#cfc4b0', 13: '#f0e8d8', 14: '#fbf3e6' };
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
const koekGeo = (code) => { const k = straal(code) + '_' + dikte(code) + (code == 11 ? 'd' : ''); return geoCache[k] || (geoCache[k] = new THREE.CylinderGeometry(straal(code), straal(code), dikte(code), code == 11 ? 3 : 32)); };

// de kast: tafel, schuif, wanden, glas en een bordje
function bouwKast() {
  const metaal = canvasTex((g, w) => { g.fillStyle = '#d6dbe2'; g.fillRect(0, 0, w, w); g.fillStyle = '#b8bec8'; for (let y = 8; y < w; y += 20) for (let x = (y / 20 % 2) * 10 + 8; x < w; x += 20) { g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); } }, 128, 128);
  metaal.wrapS = metaal.wrapT = THREE.RepeatWrapping; metaal.repeat.set(5, 8);
  const tafel = new THREE.Mesh(new THREE.BoxGeometry(HB * 2, 0.2, 10), new THREE.MeshStandardMaterial({ map: metaal, roughness: 0.45, metalness: 0.5 }));
  tafel.position.set(0, -0.1, VOOR - 5); tafel.receiveShadow = true; scene.add(tafel);
  const goud = new THREE.MeshStandardMaterial({ color: '#e8b830', roughness: 0.3, metalness: 0.8 });
  const rand = new THREE.Mesh(new THREE.BoxGeometry(HB * 2 + 0.3, 0.12, 0.16), goud); rand.position.set(0, 0.0, VOOR + 0.06); scene.add(rand);
  // de schuif: rood met een gouden bies
  const schuif = new THREE.Group();
  const blok = new THREE.Mesh(new THREE.BoxGeometry(HB * 2, SCHUIF.hoog, SCHUIF.half * 2), new THREE.MeshStandardMaterial({ map: metaal, roughness: 0.5, metalness: 0.4, color: '#ffe8e8' }));
  blok.castShadow = blok.receiveShadow = true; schuif.add(blok);
  const voorkant = new THREE.Mesh(new THREE.BoxGeometry(HB * 2, SCHUIF.hoog, 0.06), new THREE.MeshStandardMaterial({ color: '#c8323c', roughness: 0.5 }));
  voorkant.position.z = SCHUIF.half + 0.03; schuif.add(voorkant);
  const bies = new THREE.Mesh(new THREE.BoxGeometry(HB * 2, 0.06, 0.08), goud); bies.position.set(0, SCHUIF.hoog / 2 - 0.03, SCHUIF.half + 0.04); schuif.add(bies);
  scene.add(schuif);
  // achterwand met bordje
  const bord = canvasTex((g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#c8323c'); gr.addColorStop(1, '#8a1a22'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff4dc'; for (let i = 0; i < 16; i++) { g.globalAlpha = 0.15; g.fillRect(i * 64, 0, 32, h); } g.globalAlpha = 1;
    g.fillStyle = '#ffe07a'; g.font = 'bold 120px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Koekjesschuiver', w / 2, h * 0.45);
    g.font = 'bold 54px Georgia'; g.fillStyle = '#fff4dc'; g.fillText('vers uit de oven', w / 2, h * 0.78);
    for (let i = 0; i < 18; i++) { g.fillStyle = i % 2 ? '#ffe07a' : '#fff'; g.beginPath(); g.arc(30 + i * 56, 22, 9, 0, 7); g.fill(); }
  }, 1024, 340);
  const wand = new THREE.Mesh(new THREE.BoxGeometry(HB * 2 + 0.4, 3.4, 0.3), [0, 1, 2, 3].map(() => new THREE.MeshStandardMaterial({ color: '#8a1a22' })).concat([new THREE.MeshStandardMaterial({ map: bord, roughness: 0.6 }), new THREE.MeshStandardMaterial({ color: '#8a1a22' })]));
  wand.position.set(0, SCHUIF.hoog + 0.02 + 1.7, MUUR_VOOR - 0.15); wand.castShadow = true; scene.add(wand);
  // glazen zijwanden met gouden stijlen
  const glas = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1, depthWrite: false });
  for (const s of [-1, 1]) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, ZIJ_EIND + 6), glas); g.position.set(s * (HB + 0.08), 0.8, (ZIJ_EIND - 6) / 2); scene.add(g);
    for (const z of [ZIJ_EIND, -1.5, MUUR_VOOR]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.7, 0.12), goud); p.position.set(s * (HB + 0.1), 0.85, z); p.castShadow = true; scene.add(p); }
  }
  // opvangbak onder de voorrand
  const bak = new THREE.Mesh(new THREE.BoxGeometry(HB * 2 + 0.6, 0.6, 1.4), new THREE.MeshStandardMaterial({ color: '#5a1218', roughness: 0.6 }));
  bak.position.set(0, -1.6, VOOR + 0.9); scene.add(bak);
  const licht = new THREE.Mesh(new THREE.BoxGeometry(HB * 2 + 0.4, 0.05, 0.3), new THREE.MeshBasicMaterial({ color: '#ffd86a' }));
  licht.position.set(0, -1.28, VOOR + 0.4); scene.add(licht);
  // tegelvloer en wat gezelligheid in de verte
  const vloer = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#6a1a22', roughness: 0.9 }));
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
world.addContactMaterial(new CANNON.ContactMaterial(matKoek, matTafel, { friction: 0.22, restitution: 0.01 }));
world.addContactMaterial(new CANNON.ContactMaterial(matKoek, matKoek, { friction: 0.16, restitution: 0.01 }));
function vast(hx, hy, hz, x, y, z, type = CANNON.Body.STATIC) {
  const b = new CANNON.Body({ mass: 0, type, material: matTafel, shape: new CANNON.Box(new CANNON.Vec3(hx, hy, hz)) });
  b.position.set(x, y, z); world.addBody(b); return b;
}
vast(HB, 0.1, 5, 0, -0.1, VOOR - 5); // tafel
vast(HB + 0.2, 1.7, 0.15, 0, SCHUIF.hoog + 0.02 + 1.7, MUUR_VOOR - 0.15); // achterwand boven de schuif
for (const s of [-1, 1]) vast(0.1, 2, (ZIJ_EIND + 7) / 2, s * (HB + 0.1), 1.5, (ZIJ_EIND - 7) / 2); // zijwanden
const muurtjes = [-1, 1].map((s) => { const b = vast(0.1, 0.5, (VOOR - ZIJ_EIND) / 2, s * (HB + 0.1), 0.5, (VOOR + ZIJ_EIND) / 2); world.removeBody(b); return b; });
const schuifBody = vast(HB, SCHUIF.hoog / 2, SCHUIF.half, 0, SCHUIF.hoog / 2, SCHUIF.midden, CANNON.Body.KINEMATIC);

// ---------- koekjes ----------
let koekjes = [];
function nieuwKoekje(code, x, y, z, q) {
  const r = straal(code), h = dikte(code);
  const body = new CANNON.Body({ mass: code >= 10 ? 1.3 : 1, material: matKoek, shape: new CANNON.Cylinder(r, r, h, code == 11 ? 3 : 10), linearDamping: 0.12, angularDamping: 0.85 }); // veel draaidemping: koekjes blijven plat liggen
  body.position.set(x, y, z);
  if (q) body.quaternion.set(q[0], q[1], q[2], q[3]); else body.quaternion.setFromEuler(0, Math.random() * 6, 0);
  body.sleepSpeedLimit = 0.12; body.sleepTimeLimit = 0.8;
  world.addBody(body);
  const mesh = new THREE.Mesh(koekGeo(code), materialen(code)); mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh);
  const k = { code, body, mesh, geteld: false };
  body.addEventListener('collide', (e) => { const v = Math.abs(e.contact.getImpactVelocityAlongNormal()); if (v > 2.5 && Math.random() < 0.3) sTik(v * 0.01); });
  koekjes.push(k); return k;
}
function weg(k) { world.removeBody(k.body); scene.remove(k.mesh); koekjes.splice(koekjes.indexOf(k), 1); }
function randCookie() { const r = Math.random(); return r < 0.04 ? 3 : r < 0.24 ? 2 : r < 0.44 ? 1 : 0; }

// ---------- toestand ----------
let supply = 40, score = 0, best = 0, coll = [0, 0, 0, 0, 0], found = [0, 0, 0, 0, 0, 0, 0, 0], wonTotal = 0, goldWon = 0, powersUsed = [], badges = [];
let goldQ = 0, rainQ = 0, wallT = 0, regen = 0, t = 0, laatsteVal = -1, mikX = 0;
const REGEN = 5, REGEN_MAX = 30, KEY = 'koekjesschuiver3d';
function schuifZ(tt) { return SCHUIF.midden + SCHUIF.slag * Math.sin(tt * SCHUIF.w); }
function vulTafel() { // minder, grotere koekjes dan in 2D; een paar al op elkaar gestapeld
  const dx = KR * 2 + 0.04, dz = dx * 0.87;
  let rij = 0;
  for (let z = 0.6; z < VOOR - KR; z += dz, rij++) for (let x = -HB + KR + 0.05 + (rij % 2) * dx / 2; x < HB - KR; x += dx) {
    if (Math.random() < 0.12) continue;
    nieuwKoekje(Math.random() < 0.03 ? 3 : [0, 0, 0, 1, 2][Math.floor(Math.random() * 5)], x + (Math.random() - 0.5) * 0.05, KH / 2 + 0.01, z);
  }
  for (let i = 0; i < 7; i++) nieuwKoekje(randCookie(), (Math.random() - 0.5) * 4.6, KH * 1.6 + 0.05, 0.8 + Math.random() * 1.6);
  for (let i = 0; i < 2; i++) nieuwKoekje(10 + Math.floor(Math.random() * 5), (Math.random() - 0.5) * 4, 0.6, 1 + Math.random() * 1.2);
  nieuwKoekje(20 + Math.floor(Math.random() * 8), (Math.random() - 0.5) * 3, 0.7, 1.2);
  for (let i = 0; i < 4; i++) nieuwKoekje(randCookie(), -2.2 + i * 1.45, SCHUIF.hoog + KH / 2 + 0.02, -2.0);
}
function bewaar() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ supply, score, best, coll, found, wonTotal, goldWon, powersUsed, badges,
      c: koekjes.filter((k) => !k.geteld && k.body.position.y > -0.3).map((k) => { const p = k.body.position, q = k.body.quaternion; return [p.x, p.y, p.z, q.x, q.y, q.z, q.w, k.code].map((v, i) => (i == 7 ? v : +v.toFixed(3))); }) }));
  } catch (e) {}
}
function laad() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY)); if (!s || !s.c || !s.c.length) return false;
    ({ supply, score, best = 0, coll = coll, found = found, wonTotal = 0, goldWon = 0, powersUsed = [], badges = [] } = s);
    for (const [x, y, z, qx, qy, qz, qw, c] of s.c) nieuwKoekje(c, x, y + 0.01, z, [qx, qy, qz, qw]);
    return true;
  } catch (e) { return false; }
}
function opnieuw() {
  for (const k of [...koekjes]) weg(k);
  supply = 40; score = 0; coll = [0, 0, 0, 0, 0]; found = [0, 0, 0, 0, 0, 0, 0, 0]; wonTotal = 0; goldWon = 0; powersUsed = []; badges = []; goldQ = rainQ = 0; zetMuurtjes(false); wallT = 0;
  vulTafel(); bewaar(); tekenHud(true);
}

// ---------- spelen ----------
function laatVallen(x, gratis) {
  if (!gratis) {
    if (supply <= 0) { snd(150, 0.15, 'square', 0.04); return; }
    if (t - laatsteVal < 0.15) return;
    laatsteVal = t; supply--;
  }
  x = Math.max(-HB + KR + 0.08, Math.min(HB - KR - 0.08, x));
  let code = randCookie();
  if (goldQ > 0 && !gratis) { goldQ--; code = 3; }
  else if (!gratis && Math.random() < 1 / 18) { const nog = found.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0); code = 20 + (nog.length && Math.random() < 0.5 ? nog[Math.floor(Math.random() * nog.length)] : Math.floor(Math.random() * 8)); }
  else if (!gratis && Math.random() < 1 / 13) code = 10 + Math.floor(Math.random() * 5);
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
  const c = k.code, p = schermPunt(k.body.position.x, 0, VOOR);
  if (c >= 20) {
    const i = c - 20; found[i]++; score += 50; supply += 2; sRoep(); roep(KAR[i].roep);
    springers.push({ code: c, t: 0, x: k.body.position.x, groot: !!KAR[i].spring });
    if (KAR[i].spring) likkie();
  } else if (c >= 10) {
    const i = c - 10; coll[i]++; score += 25; sPrize(); pop(TREATS[i].n + '!', p.x, p.y - 20, 'goud');
    if (coll[i] == 3) pop(TREATS[i].p + ' klaar!', innerWidth / 2, innerHeight - 110, 'goud');
  } else {
    const v = c == 3 ? 10 : 1; score += v; wonTotal++; if (c == 3) goldWon++; supply += c == 3 ? 3 : 1; pop('+' + v, p.x, p.y - 20, c == 3 ? 'goud' : ''); sWin(c == 3);
  }
  checkBadges(); tekenHud(true);
}
function verloren(k) { const p = schermPunt(k.body.position.x, 0, k.body.position.z); pop('weg', p.x, p.y, 'weg'); snd(200, 0.25, 'sine', 0.04, 90); }
let toastRij = [];
function checkBadges() {
  const add = (id) => { if (badges.includes(id)) return; badges.push(id); toastRij.push(BADGES.find((b) => b.id == id)); bewaar(); };
  found.forEach((v, i) => { if (v) add('kar' + i); });
  if (wonTotal >= 1) add('eerste'); if (wonTotal >= 100) add('honderd'); if (wonTotal >= 500) add('vijfhonderd'); if (goldWon >= 5) add('goud');
  if (coll.some((c) => c >= 3) || powersUsed.length) add('set'); if (powersUsed.length >= 5) add('krachten'); if (found.every(Boolean)) add('meester');
}

// figuren springen na het winnen uit de bak omhoog (het likkoekje extra groot, recht naar je toe)
const springers = [];
function tekenSpringers(dt) {
  for (const s of [...springers]) {
    if (!s.mesh) { s.mesh = new THREE.Mesh(koekGeo(s.code), materialen(s.code)); scene.add(s.mesh); }
    s.t += dt;
    const f = Math.min(1, s.t / 0.9), hoog = s.groot ? 4.2 : 2.6;
    s.mesh.position.set(s.x * (1 - f), -0.6 + Math.sin(f * Math.PI * 0.5) * hoog + (s.t > 0.9 ? Math.abs(Math.sin(s.t * 6)) * 0.25 : 0), VOOR + 0.6 + f * (s.groot ? 2.2 : 1));
    s.mesh.rotation.set(Math.PI / 2.4, s.t * 5, 0);
    s.mesh.scale.setScalar(1 + f * (s.groot ? 2.2 : 1));
    if (s.t > (s.groot ? 2.6 : 1.6)) { scene.remove(s.mesh); springers.splice(springers.indexOf(s), 1); }
  }
}

// ---------- scherm: getallen, krachten, meldingen ----------
const v3 = new THREE.Vector3();
function schermPunt(x, y, z) { v3.set(x, y, z).project(camera); return { x: (v3.x + 1) / 2 * innerWidth, y: (1 - v3.y) / 2 * innerHeight }; }
function pop(tekst, x, y, soort = '') { const el = document.createElement('div'); el.className = 'pop ' + soort; el.textContent = tekst; el.style.left = x + 'px'; el.style.top = y + 'px'; $('pops').appendChild(el); setTimeout(() => el.remove(), 1200); }
function roep(tekst) { const el = document.createElement('div'); el.className = 'roep'; el.textContent = tekst; $('pops').appendChild(el); setTimeout(() => el.remove(), 2300); }
let hudSleutel = '';
function tekenHud(forceer) {
  $('voorraad').textContent = supply; $('punten').textContent = score;
  $('badgeknop').textContent = 'Badges ' + badges.length + '/' + BADGES.length;
  const s = coll.join(',');
  if (!forceer && s == hudSleutel) return; hudSleutel = s;
  $('krachten').innerHTML = TREATS.map((tr, i) => `<button data-k="${i}" class="${coll[i] >= 3 ? 'klaar' : ''}" title="${tr.d}">${tr.p}<i>${'●'.repeat(Math.min(3, coll[i]))}${'○'.repeat(Math.max(0, 3 - coll[i]))}</i><small>${tr.n}</small></button>`).join('');
  $('krachten').querySelectorAll('button').forEach((b) => b.onclick = (e) => { e.stopPropagation(); unlock(); gebruikKracht(+b.dataset.k); });
}
let toastT = 0;
function tekenToast(dt) {
  if (!toastRij.length) { $('toast').hidden = true; return; }
  if (toastT == 0) { sBadge(); $('toast').innerHTML = 'Badge verdiend!<b>' + toastRij[0].n + '</b>'; $('toast').hidden = false; }
  toastT += dt; if (toastT > 2.8) { toastRij.shift(); toastT = 0; }
}
$('badgeknop').onclick = () => {
  $('badgetel').textContent = badges.length + ' van de ' + BADGES.length + ' verdiend';
  $('badgelijst').innerHTML = BADGES.map((b) => `<div class="${badges.includes(b.id) ? '' : 'niet'}"><b>${badges.includes(b.id) ? '🏅 ' : ''}${b.n}</b>${b.d}</div>`).join('');
  $('badges').hidden = false;
};
$('badgesdicht').onclick = () => { $('badges').hidden = true; };
$('nieuwknop').onclick = () => { if (confirm('Opnieuw beginnen? Je punten, verzameling, badges en de tafel worden gewist.')) opnieuw(); };

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
renderer.domElement.addEventListener('pointerdown', (e) => { e.preventDefault(); unlock(); mik(e); laatVallen(mikX); $('tip').hidden = true; });
addEventListener('keydown', (e) => {
  if (e.code == 'Space') { e.preventDefault(); laatVallen(mikX); }
  if (e.code == 'ArrowLeft') mikX = Math.max(-HB + KR, mikX - 0.3);
  if (e.code == 'ArrowRight') mikX = Math.min(HB - KR, mikX + 0.3);
  const n = +e.key; if (n >= 1 && n <= 5) gebruikKracht(n - 1);
  if (e.code == 'KeyB') $('badges').hidden ? $('badgeknop').onclick() : ($('badges').hidden = true);
  if (e.code == 'Escape') $('badges').hidden = true;
});
addEventListener('pagehide', bewaar);
document.addEventListener('visibilitychange', () => { if (document.hidden) bewaar(); });

// ---------- de lus ----------
const TEGEL = location.hash == '#tegel'; // voor het plaatje op de startpagina
if (TEGEL) document.body.classList.add('tegel');
if (TEGEL || !laad()) vulTafel();
tekenHud(true);
$('laden').hidden = true;
let vorige = performance.now(), bewaarT = 0, regenT = 0, omvalT = 0;
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
    if (!k.geteld && p.y < -0.5) { k.geteld = true; if (p.z > VOOR - 0.3 && Math.abs(p.x) < HB + 0.1) gewonnen(k); else verloren(k); }
    if (p.y < -4) weg(k);
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
  if (supply < REGEN_MAX) { if ((regen += dt) >= REGEN) { regen = 0; supply++; tekenHud(); } } else regen = 0;
  if (score > best) best = score;
  if ((bewaarT += dt) > 3) { bewaarT = 0; bewaar(); }
}
function lus(nu) {
  requestAnimationFrame(lus);
  const echt = Math.min(0.05, (nu - vorige) / 1000); vorige = nu;
  stap(Math.max(1 / 120, echt));
  for (const k of koekjes) { k.mesh.position.copy(k.body.position); k.mesh.quaternion.copy(k.body.quaternion); }
  kast.schuif.position.set(0, SCHUIF.hoog / 2, schuifBody.position.z);
  spook.position.set(mikX, VAL_Y, VAL_Z); spook.rotation.y = nu / 600; spook.visible = supply > 0;
  tekenSpringers(echt); tekenToast(echt);
  renderer.render(scene, camera);
}
requestAnimationFrame(lus);
window.__test = { world, get koekjes() { return koekjes; }, laatVallen, gebruikKracht, stap, get toestand() { return { supply, score, coll, found, badges, wonTotal }; }, zetColl: (c) => { coll = c; tekenHud(true); } };
