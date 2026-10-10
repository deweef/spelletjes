// Kenney-modellen (CC0, kenney.nl) laden en klaarzetten.
// De bestanden staan in ../assets/<pakket>/, elk pakket met zijn eigen Textures/colormap.png.

import * as THREE from 'three';
import { GLTFLoader } from '../lib/loaders/GLTFLoader.js';
import * as SkeletonUtils from '../lib/utils/SkeletonUtils.js';

const LIJST = [
  'dungeon/character-human', 'dungeon/character-orc', 'dungeon/weapon-sword', 'dungeon/weapon-spear', 'dungeon/shield-round',
  'forest/character-archer', 'forest/weapon-bow', 'forest/tree', 'forest/tree-high',
  'castle/tower-square-base', 'castle/tower-square-mid', 'castle/tower-square-mid-windows', 'castle/tower-square-roof',
  'castle/tower-square-top-roof-high', 'castle/wall', 'castle/gate', 'castle/flag',
  'castle/tree-large', 'castle/tree-small', 'castle/tree-trunk',
  'survival/tool-axe',
  'characters/wheelchair',
  // boerderij, kazerne, mijn, steigers en pijlen
  'forest/building-roof', 'forest/patch-dirt', 'forest/plant', 'forest/fence', 'forest/tent', 'forest/target', 'forest/weapon-arrow',
  'castle/tower-slant-roof', 'castle/wall-narrow-wood', 'castle/siege-ballista', 'castle/flag-banner-long',
  'dungeon/wood-support', 'dungeon/rocks', 'dungeon/chest', 'dungeon/coin',
  'survival/rock-a', 'survival/rock-b', 'survival/rock-c',
  // level 2: wachttoren, orkenhut, bruggen
  'castle/tower-hexagon-base', 'castle/tower-hexagon-mid', 'castle/tower-hexagon-roof',
  'survival/tent-canvas', 'survival/campfire-pit', 'survival/fence-fortified', 'forest/bridge',
  // level 3: gevangenis
  'dungeon/wood-structure', 'castle/metal-gate',
  // level 4: de Donkere Mijnen
  'graveyard/character-skeleton', 'graveyard/lantern-candle', 'dungeon/wall', 'dungeon/stairs', 'dungeon/barrel', 'dungeon/banner', 'characters/aid-crutch',
];

const glb = {};
export let klaar = false;

// Laadt in groepjes van 6 tegelijk, met tot 3 pogingen per bestand (haperend internet op een telefoon)
export async function laad() {
  const loader = new GLTFLoader();
  const een = async (n) => {
    for (let poging = 1; ; poging++) {
      try {
        const g = await loader.loadAsync(new URL('../assets/' + n + '.glb', import.meta.url).href);
        g.scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        glb[n] = g; return;
      } catch (e) {
        if (poging >= 3) throw e;
        await new Promise((r) => setTimeout(r, 400 * poging));
      }
    }
  };
  const wachtrij = [...LIJST];
  await Promise.all(Array.from({ length: 6 }, async () => { while (wachtrij.length) await een(wachtrij.shift()); }));
  klaar = true;
}

// een losse kopie van een model (zonder botten)
export const stuk = (n) => glb[n].scene.clone(true);

// geometrie en materiaal met de vaste plaatsing erin, voor InstancedMesh (bomen)
const delenCache = {};
export function delen(n) {
  if (delenCache[n]) return delenCache[n];
  const s = glb[n].scene; s.updateMatrixWorld(true);
  const uit = [];
  s.traverse((o) => { if (o.isMesh) uit.push({ geo: o.geometry.clone().applyMatrix4(o.matrixWorld), mat: o.material }); });
  return (delenCache[n] = uit);
}

// een mannetje met botten en animaties (lopen, aanvallen, omvallen, rolstoel, ...)
const FIGUUR = { werker: 'dungeon/character-human', soldaat: 'dungeon/character-human', genezer: 'dungeon/character-human', held: 'dungeon/character-human',
  boog: 'forest/character-archer', ork: 'dungeon/character-orc', speerork: 'dungeon/character-orc', skelet: 'graveyard/character-skeleton' };
export function figuur(k) {
  const bron = glb[FIGUUR[k] || FIGUUR.werker];
  const model = SkeletonUtils.clone(bron.scene);
  model.traverse((o) => { if (o.isMesh) o.frustumCulled = false; }); // botten bewegen buiten de doos
  const mixer = new THREE.AnimationMixer(model);
  const acties = {};
  for (const clip of bron.animations) acties[clip.name] = mixer.clipAction(clip);
  return { model, mixer, acties, bot: (n) => model.getObjectByName(n) };
}
