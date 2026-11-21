// Muziek met echte instrumenten voor de spelletjes (16 nov). Uitleg en afspraken: CLAUDE.md, kopje "Muziek in de spellen".
// Geluiden: klank/<instrument>.json (FluidR3 GM-soundfont van Frank Wen, CC BY 3.0: noem hem in het spel, zie klank/LEESMIJ.md).
// Een lied = { noten: 'E4:1 A4:1 -:2 …', bas: 'A2:8 …' (optioneel), tempo: seconden per tel }. Muziek.speel arrangeert het zelf in een stijl.
//   await Muziek.laadStijl('italiaans', ctx)   instrumenten van een stijl laden (eenmalig, daarna in het geheugen; de service worker bewaart ze offline)
//   Muziek.speel(ctx, lied, t0, stijl) -> eindtijd   (alleen als Muziek.klaar(stijl); anders eerst laadStijl)
//   Muziek.stop(ctx, 1.5)                    alle muziek uitfaden (effecten niet)
//   const d = await Muziek.laadLied('klank/liedjes/funiculi.json'); Muziek.speelMidi(ctx, d, t0, stijl)   een echt MIDI-bestand met al zijn sporen
//   Muziek.effect(ctx, 'deurbel' | 'bel' | 'applaus' | 'telefoon') -> true als het lukte (anders zelf een piepje doen)
//   Muziek.noot(ctx, instrument, midi, t, duur, volume) / Muziek.slag(ctx, 'kick'|'snare'|'hihat'|'tamboerijn', t, volume): losse noten voor eigen muziek
const Muziek = (() => {
  const BASIS = (document.currentScript && document.currentScript.src.replace(/js\/muziek\.js.*$/, '')) || './';
  const STIJL = {
    italiaans: { mel: 'accordion', leads: ['accordion', 'mandoline', 'violin'], bas: 'acoustic_bass', akk: 'acoustic_guitar_nylon', pad: 'string_ensemble_1', soort: 'hoempa' },
    rock: { mel: 'overdriven_guitar', bas: 'electric_bass_pick', akk: 'distortion_guitar', soort: 'rock' },
    volks: { mel: 'clarinet', bas: 'tuba', akk: 'accordion', soort: 'volks' },
    klassiek: { mel: 'violin', bas: 'cello', akk: 'acoustic_grand_piano', pad: 'string_ensemble_1', soort: 'klassiek' },
    effecten: { fx: ['tubular_bells', 'glockenspiel', 'applause', 'telephone_ring'] },
  };
  const echt = (i) => i == 'mandoline' ? 'acoustic_guitar_nylon' : i; // mandoline = de nylongitaar, getokkeld (tremolo)
  const instr = (s) => { const S = STIJL[s]; return S.fx || [...new Set([S.mel, ...(S.leads || []), S.bas, S.akk, S.pad].filter(Boolean).map(echt))]; };
  const KLANK = {}, laden = {}, bussen = new WeakMap();
  function laad(ins, ctx) {
    if (!laden[ins]) laden[ins] = fetch(BASIS + 'klank/' + ins + '.json').then((r) => r.json()).then(async (j) => { const s = {};
      await Promise.all(Object.entries(j).map(async ([m, b64]) => { const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); s[m] = await ctx.decodeAudioData(bin.buffer); }));
      KLANK[ins] = s; return true; }).catch(() => { delete laden[ins]; return false; });
    return laden[ins];
  }
  const laadStijl = (stijl, ctx) => ctx ? Promise.all(instr(stijl).map((i) => laad(i, ctx))).then((r) => r.every(Boolean)) : Promise.resolve(false);
  const klaar = (stijl) => instr(stijl).every((i) => KLANK[i]);
  const midi = (n) => { const m = n.match(/^([A-G])(#?)(\d)$/); return ({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]]) + (m[2] ? 1 : 0) + (+m[3] + 1) * 12; };
  function bus(ctx) { // muziek (uit te faden) en effecten -> compressor -> volume; galm van zelfgemaakte ruis
    if (bussen.has(ctx)) return bussen.get(ctx);
    const muz = ctx.createGain(), fx = ctx.createGain(), comp = ctx.createDynamicsCompressor(), galm = ctx.createConvolver(), nat = ctx.createGain(), vol = ctx.createGain();
    const n = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
    galm.buffer = ir; nat.gain.value = 0.22; vol.gain.value = 2;
    const rem = ctx.createDynamicsCompressor(); rem.threshold.value = -4; rem.knee.value = 0; rem.ratio.value = 20; rem.attack.value = 0.001; rem.release.value = 0.12; // begrenzer: nooit kraken
    muz.connect(comp); muz.connect(galm).connect(nat).connect(comp); fx.connect(comp); comp.connect(vol).connect(rem).connect(ctx.destination);
    const ruis = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), rd = ruis.getChannelData(0); for (let i = 0; i < rd.length; i++) rd[i] = Math.random() * 2 - 1;
    const b = { muz, fx, ruis, bronnen: [] }; bussen.set(ctx, b); return b;
  }
  function noot(ctx, uit, ins, m, t, dur, vol, los = 0.25) { // dichtstbijzijnde opgenomen noot, verschoven naar de goede hoogte
    const S_ = KLANK[ins]; if (!S_) return; let beste = null, af = 99; for (const k in S_) { const d = Math.abs(m - k); if (d < af) { af = d; beste = k; } }
    const b = ctx.createBufferSource(), gn = ctx.createGain(); b.buffer = S_[beste]; b.playbackRate.value = 2 ** ((m - beste) / 12);
    gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(vol, t + 0.012); gn.gain.setValueAtTime(vol, t + Math.max(0.02, dur)); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur + los);
    b.connect(gn).connect(uit); b.start(t); b.stop(t + dur + los + 0.05); if (uit == bus(ctx).muz) bus(ctx).bronnen.push(b); // effecten faden niet mee uit
  }
  function slag(ctx, soort, t, vol, uit) { // drums en tamboerijn, zelf gemaakt (de soundfont heeft geen drumstel)
    const B = bus(ctx), gn = ctx.createGain(); gn.connect(uit || B.muz);
    if (soort == 'kick') { const o = ctx.createOscillator(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.28); o.connect(gn); o.start(t); o.stop(t + 0.3); B.bronnen.push(o); return; }
    const r = ctx.createBufferSource(), f = ctx.createBiquadFilter(); r.buffer = B.ruis; const lang = { snare: 0.16, hihat: 0.045, tamboerijn: 0.11 }[soort];
    f.type = soort == 'snare' ? 'bandpass' : 'highpass'; f.frequency.value = { snare: 1900, hihat: 7500, tamboerijn: 5500 }[soort];
    gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + lang); r.connect(f).connect(gn); r.start(t, Math.random() * 0.5); r.stop(t + lang + 0.02); B.bronnen.push(r);
    if (soort == 'snare') { const o = ctx.createOscillator(), g2 = ctx.createGain(); o.frequency.value = 190; g2.gain.setValueAtTime(vol * 0.6, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.08); o.connect(g2).connect(uit || B.muz); o.start(t); o.stop(t + 0.1); }
  }
  const NAAM = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  function harmoniseer(L) { // geen bas in het lied? Zelf akkoorden kiezen: toonsoort zoeken, dan per maat het akkoord dat het best bij de melodie past
    if (L._bas !== undefined) return L._bas;
    const mel = []; let u = 0; for (const st of L.noten.split(' ')) { const [n, d] = st.split(':'); if (n != '-') mel.push([u, +d, midi(n) % 12]); u += +d; }
    if (!mel.length) return (L._bas = null);
    const maat = L.maat || (L.tempo < 0.22 ? 8 : 4), GROOT = [0, 2, 4, 5, 7, 9, 11], KLEIN = [0, 2, 3, 5, 7, 8, 10], laatste = mel[mel.length - 1][2];
    let toon = 0, mineur = false, beste = -1; // toonsoort: meeste melodie in de toonladder, slotnoot = grondtoon telt mee
    for (let g = 0; g < 12; g++) for (const mi of [false, true]) { const ladder = (mi ? KLEIN : GROOT).map((x) => (x + g) % 12);
      let sc = mel.reduce((a, [, d, p]) => a + (ladder.includes(p) ? d : -d), 0) + (laatste == g ? 4 : 0) + (mel[0][2] == g || mel[0][2] == (g + 7) % 12 ? 1 : 0) - (mi ? 0.5 : 0);
      if (sc > beste) { beste = sc; toon = g; mineur = mi; } }
    // akkoorden van de toonsoort: [grondtoon (halve tonen boven de toon), terts], met een kleine voorkeur voor I, IV, V
    const AKK = mineur ? [[0, 3, 2], [5, 3, 1], [7, 4, 1.5], [8, 4, 0.5], [3, 4, 0.5], [10, 4, 0.3]] : [[0, 4, 2], [5, 4, 1], [7, 4, 1.5], [9, 3, 0.5], [2, 3, 0.3], [4, 3, 0.2]];
    const uit = []; for (let a = 0; a < u; a += maat) { const stuk = mel.filter(([s0, d]) => s0 < a + maat && s0 + d > a);
      let kies = AKK[0], ks = -1e9; const slot = a + maat >= u;
      for (const ak of AKK) { const r = (toon + ak[0]) % 12, tonen = [r, (r + ak[1]) % 12, (r + 7) % 12];
        let sc = ak[2] * 0.3; for (const [s0, d, p] of stuk) { const w = Math.min(s0 + d, a + maat) - Math.max(s0, a), sterk = s0 <= a ? 1.6 : 1; sc += tonen.includes(p) ? w * sterk : -w * 0.8 * sterk; }
        if (slot && ak[0] == 0) sc += 5; if (sc > ks) { ks = sc; kies = ak; } }
      const r = (toon + kies[0]) % 12, m = 40 + ((r - 4 + 12) % 12); uit.push(NAAM[m % 12] + (Math.floor(m / 12) - 1) + ':' + Math.min(maat, u - a)); } // bas tussen E2 en D#3
    return (L._bas = uit.join(' '));
  }
  function speel(ctx, L, t0, stijl = 'italiaans', lead) { // lead = solist (anders: L.lead, of willekeurig uit STIJL.leads)
    const S = STIJL[stijl] || STIJL.italiaans, B = bus(ctx), tel = L.tempo, mel = [], uit = ctx.createGain();
    uit.gain.value = { hoempa: 1, klassiek: 1.1, rock: 0.42, volks: 0.45 }[S.soort] || 1; uit.connect(B.muz); // alle stijlen ongeveer even hard
    B.muz.gain.cancelScheduledValues(t0); B.muz.gain.setValueAtTime(1, t0);
    const mv = { hoempa: 0.42, rock: 0.3, volks: 0.4, klassiek: 0.38 }[S.soort] || 0.4;
    const solo = lead || L.lead || (S.leads ? S.leads[Math.floor(Math.random() * S.leads.length)] : S.mel); speel.laatste = solo;
    const sv = { mandoline: 0.85, violin: 0.8 }[solo] || 1; // even hard als de accordeon
    let t = t0; for (const st of L.noten.split(' ')) { const [n, d] = st.split(':'), dur = +d * tel; if (n != '-') { const m = midi(n); mel.push([t, t + dur, m]);
        if (solo == 'mandoline') { const tik = 0.075; for (let tt = 0; tt < dur * 0.95 - 0.01; tt += tik) noot(ctx, uit, 'acoustic_guitar_nylon', m + 12, t + tt, Math.min(tik, dur - tt), mv * sv * (tt ? 0.75 : 1), 0.06); } // snelle tokkel, een octaaf hoger
        else noot(ctx, uit, solo, m, t, dur * 0.95, mv * sv, S.soort == 'klassiek' || solo == 'violin' ? 0.3 : 0.18); } t += dur; }
    const eind = t, basLijn = L.bas || harmoniseer(L); if (!basLijn) return eind;
    t = t0; for (const st of basLijn.split(' ')) { const [n, d] = st.split(':'), tellen = +d, dur = tellen * tel;
      if (n != '-') { const r = midi(n), pc = new Set(mel.filter(([a, b]) => a < t + dur && b > t).map(([, , m]) => (m - r + 120) % 12));
        const terts = pc.has(4) ? 4 : pc.has(3) ? 3 : null, hoog = (m) => m < 50 ? m + 12 : m, akk = [r + 12, ...(terts ? [r + 12 + terts] : []), r + 19, r + 24].map(hoog);
        if (S.pad) { noot(ctx, uit, S.pad, r + 12, t, dur * 0.98, 0.1, 0.4); noot(ctx, uit, S.pad, r + 19, t, dur * 0.98, 0.07, 0.4); }
        if (S.soort == 'klassiek') noot(ctx, uit, S.bas, r + 12, t, dur * 0.97, 0.22, 0.3); // cello houdt de grondtoon aan
        for (let k = 0; k < tellen; k++) { const tt = t + k * tel;
          if (S.soort == 'hoempa' || S.soort == 'volks') {
            if (k % 2 == 0) noot(ctx, uit, S.bas, k % 4 == 2 ? r + 7 : r, tt, tel * 0.9, S.soort == 'volks' ? 0.5 : 0.4, 0.12); // hoempa: grondtoon, kwint
            else { akk.forEach((m, i) => noot(ctx, uit, S.akk, m, tt + i * 0.012, tel * 0.6, S.soort == 'volks' ? 0.1 : 0.16, 0.15)); if (S.soort == 'volks') slag(ctx, 'tamboerijn', tt, 0.08, uit); } }
          else if (S.soort == 'rock') { // powerchords, bas op elke tel, drums
            noot(ctx, uit, S.bas, r, tt, tel * 0.85, 0.42, 0.06);
            if (k % 2 == 0) [r + 12, r + 19, r + 24].map(hoog).forEach((m) => noot(ctx, uit, S.akk, m, tt, tel * 1.8, 0.09, 0.1));
            slag(ctx, k % 4 == 0 ? 'kick' : k % 4 == 2 ? 'snare' : 'hihat', tt, k % 4 == 0 ? 0.4 : k % 4 == 2 ? 0.24 : 0.07, uit); if (k % 4 != 1 && k % 4 != 3) slag(ctx, 'hihat', tt, 0.06, uit); }
          else { const arp = [r + 12, r + 12 + (terts || 7), r + 19, r + 24].map(hoog); noot(ctx, uit, S.akk, arp[k % 4] + 12, tt, tel * 1.5, 0.16, 0.5); } } } // piano: gebroken akkoord
      t += dur; }
    return Math.max(eind, t);
  }
  function stop(ctx, fade = 1.2) { const B = bussen.get(ctx); if (!B) return; const nu = ctx.currentTime; B.stilTot = nu + fade; B.muz.gain.cancelScheduledValues(nu); B.muz.gain.setValueAtTime(B.muz.gain.value, nu); B.muz.gain.linearRampToValueAtTime(0.0001, nu + fade);
    const weg = B.bronnen; B.bronnen = []; setTimeout(() => { weg.forEach((b) => { try { b.stop(); } catch (e) {} }); }, fade * 1000 + 50); }
  function effect(ctx, naam) {
    if (!ctx || !klaar('effecten')) return false; const fx = bus(ctx).fx, t = ctx.currentTime + 0.02;
    if (naam == 'deurbel') { noot(ctx, fx, 'tubular_bells', 76, t, 0.5, 0.35, 1.2); noot(ctx, fx, 'tubular_bells', 72, t + 0.45, 0.8, 0.35, 1.6); }
    else if (naam == 'bel') noot(ctx, fx, 'glockenspiel', 96, t, 0.2, 0.3, 0.9);
    else if (naam == 'applaus') noot(ctx, fx, 'applause', 60, t, 2.4, 0.5, 1.2);
    else if (naam == 'telefoon') noot(ctx, fx, 'telephone_ring', 60, t, 1.1, 0.25, 0.2);
    else return false;
    return true;
  }
  // losse noten en slagen, voor muziek die het spel zelf maat voor maat maakt (zoals de race in Pizzabaas): gaat via de muziekbus (stop faadt ze uit)
  function weerAan(ctx) { const B = bus(ctx); if (B.stilTot && ctx.currentTime > B.stilTot) { B.stilTot = 0; B.muz.gain.cancelScheduledValues(0); B.muz.gain.setValueAtTime(1, ctx.currentTime); } return B; } // na een stop weer hoorbaar
  const losseNoot = (ctx, ins, m, t, dur, vol, los) => noot(ctx, weerAan(ctx).muz, ins, m, t, dur, vol, los);
  const losseSlag = (ctx, soort, t, vol) => { weerAan(ctx); slag(ctx, soort, t, vol); }; // 'kick' | 'snare' | 'hihat' | 'tamboerijn'
  // ---------- echte MIDI-bestanden (klank/liedjes/<naam>.json, gemaakt met extra/midi_naar_json.py) ----------
  // Elk spoor krijgt een rol: solo (hoogste melodie), tweede stem, akkoorden (veel noten tegelijk), bas (laagste), drums; per stijl een instrument.
  const ROL = {
    italiaans: { tweede: 'accordion', akk: 'acoustic_guitar_nylon', bas: 'acoustic_bass', pad: 'string_ensemble_1' },
    rock: { tweede: 'overdriven_guitar', akk: 'distortion_guitar', bas: 'electric_bass_pick' },
    volks: { tweede: 'accordion', akk: 'accordion', bas: 'tuba' },
    klassiek: { tweede: 'cello', akk: 'acoustic_grand_piano', bas: 'cello', pad: 'string_ensemble_1' },
  };
  const liedjes = {};
  const laadLied = (url) => liedjes[url] || (liedjes[url] = fetch(BASIS + url).then((r) => r.json()).catch(() => { delete liedjes[url]; return null; }));
  function rollen(data) { // spoor -> rol
    const sp = data.sporen.map((s, i) => ({ i, s, akkoord: s.noten.filter((n, j) => j && Math.abs(n[0] - s.noten[j - 1][0]) < 0.02).length / s.noten.length }));
    const rol = {}, mel = sp.filter((x) => !x.s.drum).sort((a, b) => b.s.hoog - a.s.hoog);
    sp.filter((x) => x.s.drum).forEach((x) => rol[x.i] = 'drum');
    mel.forEach((x, k) => rol[x.i] = k == 0 ? 'solo' : (k == mel.length - 1 && x.s.hoog < 52 && mel.length > 1) ? 'bas' : x.akkoord > 0.4 ? 'akk' : 'tweede');
    return rol;
  }
  function speelMidi(ctx, data, t0, stijl = 'italiaans', lead) { // -> eindtijd
    const S = STIJL[stijl] || STIJL.italiaans, R = ROL[stijl] || ROL.italiaans, B = bus(ctx), uit = ctx.createGain();
    uit.gain.value = { hoempa: 1, klassiek: 1.1, rock: 0.45, volks: 0.5 }[S.soort] || 1; uit.connect(B.muz); B.muz.gain.cancelScheduledValues(t0); B.muz.gain.setValueAtTime(1, t0);
    const solo = lead || (S.leads ? S.leads[Math.floor(Math.random() * S.leads.length)] : S.mel); speel.laatste = solo;
    const rol = rollen(data), sterk = { solo: 0.42, tweede: 0.34, akk: 0.13, bas: 0.42, drum: 0.3 };
    data.sporen.forEach((sp, i) => { const r = rol[i];
      for (const [st, du, m, v] of sp.noten) { const t = t0 + st, vol = sterk[r] * (0.4 + 0.8 * v);
        if (r == 'drum') { slag(ctx, m == 35 || m == 36 ? 'kick' : m == 38 || m == 40 ? 'snare' : 'hihat', t, vol * (m < 37 ? 1.2 : 0.5), uit); continue; }
        let ins = r == 'solo' ? solo : R[r] || S.akk;
        if (ins == solo && r != 'solo' && R.pad) ins = R.pad; // tweede stem niet op hetzelfde instrument als de solist
        if (ins == 'mandoline') { const tik = 0.075; for (let tt = 0; tt < du * 0.95 - 0.01; tt += tik) noot(ctx, uit, 'acoustic_guitar_nylon', m + 12, t + tt, Math.min(tik, du - tt), vol * 0.85 * (tt ? 0.75 : 1), 0.06); }
        else noot(ctx, uit, ins, r == 'bas' && m > 52 ? m - 12 : m, t, Math.max(0.05, du * 0.97), vol * (ins == 'violin' ? 0.8 : 1), r == 'akk' ? 0.25 : 0.2); } });
    return t0 + data.duur;
  }
  return { STIJL, laadStijl, klaar, speel, laadLied, speelMidi, rollen, solist: () => speel.laatste, stop, effect, midi, harmoniseer, noot: losseNoot, slag: losseSlag };
})();
