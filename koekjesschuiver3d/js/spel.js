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
const straal = (c) => (c < 10 ? KR : c < 20 ? 0.5 : 0.52);
const dikte = (c) => (c < 10 ? KH : c == 13 ? 0.24 : c < 20 ? 0.2 : 0.16);

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
    else if (code == 3) { zacht('#ffd84a', '#d89a18'); g.fillStyle = '#fff4b0'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? c * 0.25 : c * 0.55; g.lineTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr); } g.fill(); }
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
// gewone koekjes en figuren hebben een bolle, aflopende rand (geen opstaand randje); het plaatje ligt er van boven op
function bolKoek(r, h) {
  const p = [[0, 1], [0.62, 1], [0.8, 0.9], [0.92, 0.68], [0.985, 0.36], [1, 0]];
  const pts = [...p, ...p.slice(0, -1).reverse().map(([a, b]) => [a, -b])].reverse().map(([a, b]) => new THREE.Vector2(a * r, b * h / 2));
  const g = new THREE.LatheGeometry(pts, 40), pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, 0.5 + pos.getX(i) / (2 * r), 0.5 - pos.getZ(i) / (2 * r));
  return g;
}
const koekGeo = (code) => {
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
  scene.fog.color.set(thema.mist); tekenLucht(); sneeuw.visible = !!thema.sneeuw;
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
  const a = sneeuw.geometry.attributes.position;
  for (let i = 0; i < a.count; i++) { let y = a.getY(i) - dt * (0.5 + (i % 7) * 0.08); if (y < -2) y += 10; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t + i) * dt * 0.1); }
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
world.addContactMaterial(new CANNON.ContactMaterial(matKoek, matTafel, { friction: 0.15, restitution: 0.01 }));
world.addContactMaterial(new CANNON.ContactMaterial(matKoek, matKoek, { friction: 0.12, restitution: 0.01 }));
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
  const body = new CANNON.Body({ mass: code >= 10 ? 1.3 : 1, material: matKoek, shape: new CANNON.Cylinder(r, r, h, code == 11 ? 3 : 10), linearDamping: 0.12, angularDamping: 0.85 }); // veel draaidemping: koekjes blijven plat liggen
  body.position.set(x, y, z);
  if (q) body.quaternion.set(q[0], q[1], q[2], q[3]); else body.quaternion.setFromEuler(0, Math.random() * 6, 0);
  body.sleepSpeedLimit = 0.12; body.sleepTimeLimit = 0.8;
  world.addBody(body);
  const mesh = new THREE.Mesh(koekGeo(code), code < 10 || code >= 20 ? materialen(code)[1] : materialen(code)); mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh);
  const k = { code, body, mesh, geteld: false };
  body.addEventListener('collide', (e) => { const v = Math.abs(e.contact.getImpactVelocityAlongNormal()); if (v > 2.5 && Math.random() < 0.3) sTik(v * 0.01); });
  koekjes.push(k); return k;
}
function weg(k) { world.removeBody(k.body); scene.remove(k.mesh); koekjes.splice(koekjes.indexOf(k), 1); }
function randCookie() { const r = Math.random(); return r < 0.04 ? 3 : r < 0.24 ? 2 : r < 0.44 ? 1 : 0; }

// ---------- toestand ----------
let modus = 'menu', vrij = null, wedBest = 0, stilT = 0; // menu, vrij, wedstrijd of einde
let munten = 0, muntenTotaal = 0, gekocht = ['bakkerij'], themaId = 'bakkerij', ingestuurd = {};
let supply = 40, score = 0, best = 0, coll = [0, 0, 0, 0, 0], found = [0, 0, 0, 0, 0, 0, 0, 0], wonTotal = 0, goldWon = 0, powersUsed = [], badges = [];
let goldQ = 0, rainQ = 0, wallT = 0, regen = 0, t = 0, laatsteVal = -1, mikX = 0;
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
    const alles = { best, found, wonTotal, goldWon, powersUsed, badges, munten, muntenTotaal, gekocht, thema: themaId, ingestuurd, wedBest };
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
    ({ supply, score, best = 0, coll = coll, found = found, wonTotal = 0, goldWon = 0, powersUsed = [], badges = [], munten = 0, muntenTotaal = munten, gekocht = ['bakkerij'], thema: themaId = 'bakkerij', ingestuurd = {}, wedBest = 0 } = s);
    for (const [x, y, z, qx, qy, qz, qw, c] of s.c) nieuwKoekje(c, x, y + 0.01, z, [qx, qy, qz, qw]);
    return true;
  } catch (e) { return false; }
}
function opnieuw() {
  for (const k of [...koekjes]) weg(k);
  supply = 40; score = 0; coll = [0, 0, 0, 0, 0]; goldQ = rainQ = 0; zetMuurtjes(false); wallT = 0;
  vulTafel(); bewaar(); tekenHud(true);
}

// ---------- spelen ----------
function laatVallen(x, gratis) {
  if (!gratis) {
    if (supply <= 0) { snd(150, 0.15, 'square', 0.04); return; }
    if (t - laatsteVal < 0.15) return;
    laatsteVal = t; supply--; stilT = 0;
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
  stilT = 0;
  const c = k.code, p = schermPunt(k.body.position.x, 0, VOOR);
  if (c >= 20) {
    const i = c - 20; found[i]++; score += 50; if (modus != 'wedstrijd') supply += 2; sRoep(); roep(KAR[i].roep); verdien(3, p.x, p.y - 50);
    springers.push({ code: c, t: 0, x: k.body.position.x, groot: !!KAR[i].spring });
    if (KAR[i].spring) likkie();
  } else if (c >= 10) {
    const i = c - 10; coll[i]++; score += 25; sPrize(); pop(TREATS[i].n + '!', p.x, p.y - 20, 'goud'); verdien(1, p.x, p.y - 50);
    if (coll[i] == 3) pop(TREATS[i].p + ' klaar!', innerWidth / 2, innerHeight - 110, 'goud');
  } else {
    const v = c == 3 ? 10 : 1; score += v; wonTotal++; if (c == 3) goldWon++; if (modus != 'wedstrijd') supply += c == 3 ? 3 : 1; // in een wedstrijd krijg je geen koekjes terug pop('+' + v, p.x, p.y - 20, c == 3 ? 'goud' : ''); sWin(c == 3); if (c == 3) verdien(1, p.x, p.y - 50);
  }
  checkBadges(); tekenHud(true);
}
function verdien(n, x, y) { munten += n; muntenTotaal += n; if (x != null) setTimeout(() => pop('+' + n + ' 🪙', x, y, 'goud'), 250); setTimeout(() => snd(1568, 0.08, 'square', 0.03), 250); tekenHud(); }
let weggevallen = 0;
function verloren(k) { weggevallen++; stilT = 0; const p = schermPunt(k.body.position.x, 0, k.body.position.z); pop('weg', p.x, p.y, 'weg'); snd(200, 0.25, 'sine', 0.04, 90); }
let toastRij = [];
function checkBadges() {
  const add = (id) => { if (badges.includes(id)) return; badges.push(id); munten += 10; muntenTotaal += 10; toastRij.push(BADGES.find((b) => b.id == id)); bewaar(); };
  found.forEach((v, i) => { if (v) add('kar' + i); });
  if (wonTotal >= 1) add('eerste'); if (wonTotal >= 100) add('honderd'); if (wonTotal >= 500) add('vijfhonderd'); if (goldWon >= 5) add('goud');
  if (coll.some((c) => c >= 3) || powersUsed.length) add('set'); if (powersUsed.length >= 5) add('krachten'); if (found.every(Boolean)) add('meester');
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
function pop(tekst, x, y, soort = '') { const el = document.createElement('div'); el.className = 'pop ' + soort; el.textContent = tekst; el.style.left = x + 'px'; el.style.top = y + 'px'; $('pops').appendChild(el); setTimeout(() => el.remove(), 1200); }
function roep(tekst) { const el = document.createElement('div'); el.className = 'roep'; el.textContent = tekst; $('pops').appendChild(el); setTimeout(() => el.remove(), 2300); }
let hudSleutel = '';
function tekenHud(forceer) {
  $('voorraad').textContent = supply; $('punten').textContent = score;
  $('badgetal').textContent = badges.length + '/' + BADGES.length; $('munten').textContent = munten + ' 🪙';
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
  $('badgetel').textContent = badges.length + ' van de ' + BADGES.length + ' verdiend';
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
  supply = 50; score = 0; coll = [0, 0, 0, 0, 0]; goldQ = rainQ = 0; zetMuurtjes(false); wallT = 0; stilT = 0;
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
function terugNaarVrij() { for (const k of [...koekjes]) weg(k); goldQ = rainQ = 0; zetMuurtjes(false); wallT = 0; if (!laad()) vulTafel(); $('wedlabel').hidden = true; document.body.classList.remove('wed'); tekenHud(true); }
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
  tekenSpringers(echt); tekenToast(echt); sneeuwStap(echt);
  const fase = Math.floor(nu / 350); for (const l of lampjes) l.material = (l.userData.i + fase) % 3 ? KM.lampAan : KM.lampUit;
  renderer.render(scene, camera);
}
requestAnimationFrame(lus);
window.__test = { likkie, world, get koekjes() { return koekjes; }, laatVallen, gebruikKracht, stap, autoInsturen, naarMenu, startWedstrijd, eindeWedstrijd, speel, get modus() { return modus; }, get toestand() { return { wedBest, muntenTotaal, ingestuurd, best, weggevallen, supply, score, coll, found, badges, wonTotal, munten, gekocht, themaId }; }, zetMunten: (n) => { munten = n; tekenHud(); }, zetFound: (f) => { found = f; }, zetColl: (c) => { coll = c; tekenHud(true); } };
