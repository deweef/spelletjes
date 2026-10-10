// Geluidjes en stemmen (Nederlands, Engels, Duits). Overgenomen uit de 2D-versie.

let ac = null;
export function unlock() {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state != 'running') ac.resume();
    if (!ac._ok) { const b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(0); ac._ok = 1; }
  } catch (e) {}
}

export function snd(f, d, type = 'square', v = 0.05, slide = 0, delay = 0) {
  if (!ac) return;
  try {
    const o = ac.createOscillator(), g = ac.createGain(), n = ac.currentTime + delay;
    o.type = type; o.frequency.setValueAtTime(f, n);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, n + d);
    g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(0.001, n + d);
    o.connect(g).connect(ac.destination); o.start(n); o.stop(n + d + 0.02);
  } catch (e) {}
}

export function noise(d, v = 0.06, f = 1200, delay = 0) {
  if (!ac) return;
  try {
    const n = ac.currentTime + delay, b = ac.createBuffer(1, Math.max(1, ac.sampleRate * d | 0), ac.sampleRate), a = b.getChannelData(0);
    for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / a.length);
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = b; fl.type = 'bandpass'; fl.frequency.value = f; g.gain.value = v;
    s.connect(fl).connect(g).connect(ac.destination); s.start(n);
  } catch (e) {}
}

export const sChop = () => noise(0.08, 0.07, 900);
export const sGold = () => { snd(1568, 0.08, 'triangle', 0.04); snd(2093, 0.1, 'triangle', 0.035, 0, 0.05); };
export const sHout = () => snd(400, 0.06, 'triangle', 0.04);
export const sHit = () => { noise(0.06, 0.08, 3000); snd(300, 0.05, 'square', 0.02, 150); };
export const sArrow = () => noise(0.12, 0.04, 4000);
export const sDone = () => [523, 659, 784].forEach((f, i) => snd(f, 0.18, 'triangle', 0.05, 0, i * 0.08));
export const sHorn = () => { snd(196, 0.6, 'sawtooth', 0.05); snd(247, 0.6, 'sawtooth', 0.035, 0, 0.05); };
export const sBuild = () => { noise(0.05, 0.06, 600); noise(0.05, 0.06, 600, 0.15); };
export const sClick = () => snd(700, 0.04, 'triangle', 0.03);
export const sNee = () => snd(150, 0.15, 'square', 0.04);
export const sWin = () => [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => snd(f, 0.2, 'triangle', 0.06, 0, i * 0.1));

// ---------- stemmen ----------
let voiceOn = true;
try { voiceOn = localStorage.getItem('orkenstorm_stem') != 'uit'; } catch (e) {}
export const stemAan = () => voiceOn;
export function zetStem(aan) { voiceOn = aan; try { localStorage.setItem('orkenstorm_stem', aan ? 'aan' : 'uit'); } catch (e) {} }

let lastSpeak = 0;
const LANGS = { nl: 'nl-NL', en: 'en-GB', de: 'de-DE', it: 'it-IT' };
export const VOX = { nl: null, en: null, de: null, it: null };
let voicePrimed = false;

export function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices(); if (!vs.length) return;
  const L = (v) => v.lang.replace('_', '-').toLowerCase();
  const find = (...codes) => { for (const c of codes) { const v = vs.find((x) => L(x) == c && x.localService !== false) || vs.find((x) => L(x) == c); if (v) return v; } return null; };
  VOX.nl = find('nl-nl', 'nl-be') || vs.find((v) => L(v).startsWith('nl')) || null;
  VOX.en = find('en-gb', 'en-us', 'en-au', 'en-ie') || vs.find((v) => L(v).startsWith('en')) || null;
  VOX.de = find('de-de', 'de-at', 'de-ch') || vs.find((v) => L(v).startsWith('de')) || null;
  VOX.it = find('it-it', 'it-ch') || vs.find((v) => L(v).startsWith('it')) || null;
}
if ('speechSynthesis' in window) {
  loadVoices();
  try { speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch (e) { speechSynthesis.onvoiceschanged = loadVoices; }
}

export function primeVoice() {
  if (voicePrimed || !('speechSynthesis' in window)) return;
  voicePrimed = true;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) {}
}

export function speak(t, pitch = 1, lang = 'nl', force) {
  if (!voiceOn || !('speechSynthesis' in window)) return;
  const n = Date.now(); if (!force && n - lastSpeak < 300) return; lastSpeak = n; loadVoices();
  try {
    const u = new SpeechSynthesisUtterance(t); u.lang = LANGS[lang]; const v = VOX[lang]; if (v) u.voice = v;
    u.pitch = pitch; u.rate = 1.1; u.volume = 1;
    const go = () => { try { speechSynthesis.resume(); speechSynthesis.speak(u); } catch (e) {} };
    if (speechSynthesis.speaking || speechSynthesis.pending) { speechSynthesis.cancel(); setTimeout(go, 80); } else go();
  } catch (e) {}
}

const VOICES = {
  nl: { werker: ['Ja?', 'Tot uw dienst!', 'Wat moet ik doen?', 'Ja, heer?'], krijger: ['Klaar voor de strijd!', 'Ja, heer!', 'Voor de koning!'], boog: ['Pijl en boog klaar!', 'Ik zie alles!', 'Ja?'],
    werkerGo: ['Komt in orde!', 'Ik ga al!', 'Oké!'], krijgerGo: ['Op weg!', 'Begrepen!', 'Jawel!'], aanval: ['Ten aanval!', 'Voor de koning!', 'Aanvallen!'], werkerAanval: ['Euh... oké!', 'Moet dat echt?'],
    prik: ['Hou op met prikken!', 'Au! Niet zo duwen!'], bouw: ['Ik ga bouwen!', 'Aan het werk!'], hout: ['Hout hakken!', 'Op naar het bos!'], goud: ['Naar de mijn!', 'Goud zoeken!'], samen: ['Allemaal klaar!'] },
  en: { werker: ['Yes, sir?', 'Ready to work!', 'What is it?', 'My lord?'], krijger: ['Ready for battle!', 'Aye, sir!', 'For the king!'], boog: ['Bow ready!', 'I see everything!', 'Yes?'],
    werkerGo: ['Right away!', 'Okay!', 'Aye, sir!'], krijgerGo: ['On my way!', 'Understood!', 'Aye!'], aanval: ['Attack!', 'Charge!', 'For the king!'], werkerAanval: ['Uh... okay!', 'Do I have to?'],
    prik: ['Stop poking me!', 'Hey! That tickles!'], bouw: ['Building it now!', 'Work, work!'], hout: ['Chopping wood!', 'To the forest!'], goud: ['To the mine!', 'Gold, gold!'], samen: ['All ready!'] },
  de: { werker: ['Ja?', 'Zu Diensten!', 'Was soll ich tun?', 'Jawohl?'], krijger: ['Bereit zum Kampf!', 'Jawohl, Herr!', 'Für den König!'], boog: ['Bogen bereit!', 'Ich sehe alles!', 'Ja?'],
    werkerGo: ['Ich mache es!', 'Sofort!', 'Jawohl!'], krijgerGo: ['Unterwegs!', 'Verstanden!', 'Jawohl!'], aanval: ['Angriff!', 'Vorwärts!', 'Für den König!'], werkerAanval: ['Äh... na gut!', 'Muss das sein?'],
    prik: ['Hör auf mich zu stupsen!', 'He! Das kitzelt!'], bouw: ['Ich baue!', 'An die Arbeit!'], hout: ['Holz hacken!', 'Ab in den Wald!'], goud: ['Zur Mine!', 'Gold suchen!'], samen: ['Alle bereit!'],
    extra: ['Wunderbar!', 'Gründlich gebaut!', 'Fertig!'] },
  it: { werker: ['Sì?', 'Pronto!', 'Che cosa faccio?', 'Eccomi!'], krijger: ['Pronto per la battaglia!', 'Sì, signore!', 'Per il re!'], boog: ['Arco pronto!', 'Vedo tutto!', 'Sì?'],
    werkerGo: ['Subito!', 'Vado!', 'Va bene!'], krijgerGo: ['Andiamo!', 'Capito!', 'Sì!'], aanval: ["All'attacco!", 'Avanti!', 'Per il re!'], werkerAanval: ['Ehm... va bene!', 'Devo proprio?'],
    prik: ['Basta toccarmi!', 'Mamma mia, che fastidio!'], bouw: ['Costruisco!', 'Al lavoro!'], hout: ['Taglio la legna!', 'Al bosco!'], goud: ['Alla miniera!', 'Oro, oro!'], samen: ['Tutti pronti!'],
    extra: ['Pizza per tutti!', 'Mamma mia!', 'Mangia, mangia!'] },
};
VOICES.nl.extra = ['Zuinig, hè!', 'Weer wat extra goud!', 'Lekker kaasje!'];
VOICES.en.extra = ['Tea time!', 'Lovely cup of tea!', 'Splendid!'];

export const pick = (a) => a[Math.floor(Math.random() * a.length)];

// Elk mannetje komt uit Nederland, Engeland, Duitsland of Italië: om de beurt uit een geschudde zak,
// zodat de landen eerlijk verdeeld zijn (en niet toevallig iedereen Duits is).
export const LANDEN = ['nl', 'en', 'de', 'it'];
let zak = [];
export function nieuwLand() {
  if (!zak.length) { zak = [...LANDEN]; for (let i = zak.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [zak[i], zak[j]] = [zak[j], zak[i]]; } }
  return zak.pop();
}
export function nieuweZak() { zak = []; }

export function nieuweStem(k) {
  return { lang: nieuwLand(), pitch: k == 'werker' ? 0.9 + Math.random() * 0.8 : 0.45 + Math.random() * 0.7 };
}

// Een mannetje praat altijd zijn eigen taal. Heeft het toestel die stem niet, dan leest de standaardstem
// de zin voor (met een grappig accent).
export function unitSay(u, key) {
  if (!u) return;
  if (!u.voice) u.voice = nieuweStem(u.k);
  const v = VOICES[u.voice.lang];
  speak(pick(v[key] || v.werker), u.voice.pitch, u.voice.lang);
}
