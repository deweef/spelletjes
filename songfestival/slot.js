// Het slot op de liedjeslijst: geheim.js bevat de lijst versleuteld (AES-GCM) met een vaste sleutel. Die sleutel staat in elke
// QR-code (achter het #, dat wordt nooit naar de server gestuurd) en, versleuteld met het wachtwoord, ook in geheim.js voor de printpagina.
// Wie alleen de site of de code leest, ziet dus geen liedjes. Werkt in de browser en in Node (zelfde WebCrypto).
const SLOT = (() => {
  const C = globalThis.crypto.subtle;
  const naar64 = (b) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const van64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
  const tekst = new TextEncoder(), lees = new TextDecoder();
  const aes = (ruw) => C.importKey('raw', ruw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  async function dicht(sleutel64, ding) { const iv = crypto.getRandomValues(new Uint8Array(12)); const d = await C.encrypt({ name: 'AES-GCM', iv }, await aes(van64(sleutel64)), tekst.encode(JSON.stringify(ding))); return { iv: naar64(iv), data: naar64(d) }; }
  async function open(sleutel64, blok) { const d = await C.decrypt({ name: 'AES-GCM', iv: van64(blok.iv) }, await aes(van64(sleutel64)), van64(blok.data)); return JSON.parse(lees.decode(d)); }
  async function uitWachtwoord(ww, zout) { const basis = await C.importKey('raw', tekst.encode(ww), 'PBKDF2', false, ['deriveBits']); return naar64(await C.deriveBits({ name: 'PBKDF2', salt: van64(zout), iterations: 150000, hash: 'SHA-256' }, basis, 256)); }
  return {
    naar64, van64, dicht, open,
    // de lijst met de sleutel uit een QR-code
    lijst: (sleutel64) => open(sleutel64, GEHEIM.lijst),
    // de sleutel uit het wachtwoord (voor de printpagina); geeft een fout bij een verkeerd wachtwoord
    sleutel: async (ww) => open(await uitWachtwoord(ww, GEHEIM.sleutel.zout), GEHEIM.sleutel),
    uitWachtwoord,
  };
})();
if (typeof module == 'object') module.exports = SLOT;
