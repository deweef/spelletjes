// Kenney-modellen (CC0, kenney.nl) laden en klaarzetten.
// De bestanden staan in ../assets/<pakket>/, elk pakket met zijn eigen Textures/colormap.png.

import * as THREE from 'three';
import { GLTFLoader } from '../lib/loaders/GLTFLoader.js';
import * as SkeletonUtils from '../lib/utils/SkeletonUtils.js';

const LIJST = [
  'dungeon/character-human', 'dungeon/character-orc', 'dungeon/weapon-sword', 'dungeon/weapon-spear', 'dungeon/shield-round',
  'forest/character-archer', 'forest/weapon-bow', 'forest/tree', 'forest/tree-high',
  'castle/tower-square-base', 'castle/tower-square-mid', 'castle/tower-square-mid-windows', 'castle/tower-square-roof',
  'castle/tower-square-top-roof-high', 'castle/wall', 'castle/wall-doorway', 'castle/gate', 'castle/flag',
  'castle/tree-large', 'castle/tree-small', 'castle/tree-trunk',
  'survival/tool-axe', 'survival/tool-hammer', 'survival/tool-pickaxe',
  'characters/wheelchair',
];

const glb = {};
export let klaar = false;

export async function laad() {
  const loader = new GLTFLoader();
  await Promise.all(LIJST.map(async (n) => {
    const g = await loader.loadAsync(new URL('../assets/' + n + '.glb', import.meta.url).href);
    g.scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    glb[n] = g;
  }));
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
const FIGUUR = { werker: 'dungeon/character-human', soldaat: 'dungeon/character-human', boog: 'forest/character-archer', ork: 'dungeon/character-orc', speerork: 'dungeon/character-orc' };
export function figuur(k) {
  const bron = glb[FIGUUR[k] || FIGUUR.werker];
  const model = SkeletonUtils.clone(bron.scene);
  model.traverse((o) => { if (o.isMesh) o.frustumCulled = false; }); // botten bewegen buiten de doos
  const mixer = new THREE.AnimationMixer(model);
  const acties = {};
  for (const clip of bron.animations) acties[clip.name] = mixer.clipAction(clip);
  return { model, mixer, acties, bot: (n) => model.getObjectByName(n) };
}
