import * as THREE from "three";
import { clamp01, lerp, smoothstep } from "./ranges";
import { scene1Variant } from "@/config/site";
import { TAB_C, TAB_N } from "./floor-layout";

type V3 = [number, number, number];

/** World anchors (units are roughly metres). The camera flies down through these in order. */
export const FORGE: V3 = [0, -24, -46];
export const BUILD: V3 = [0, -24, -78];
export const CITY: V3 = [0, -24, -118];

export interface CameraKey {
  t: number;
  pos: V3;
  look: V3;
  fov: number;
}

/**
 * Eased camera path. Positions and look-at targets are Catmull-Rom splines through these keys;
 * `t` is story progress. Scene boundaries (0.2 / 0.4 / 0.6 / 0.85) line up with the keys.
 */
/** "office" variant (the original Scene 1: floating clutter). Unchanged. */
export const KEYS: CameraKey[] = [
  // 1. CHAOS: slow drift forward through floating clutter
  { t: 0.0, pos: [0, 0.6, 11], look: [0, 0, -8], fov: 46 },
  { t: 0.08, pos: [1.6, 0.9, 3.5], look: [0, 0, -14], fov: 46 },
  { t: 0.15, pos: [-1.2, 0.3, -9], look: [0, -1, -24], fov: 46 },
  { t: 0.2, pos: [0, -1.5, -19], look: [0, -9, -33], fov: 46 },
  // 2. THE FORGE: drop to the anvil
  { t: 0.265, pos: [0, -12, -28], look: [0, -20.8, -46], fov: 45 },
  { t: 0.325, pos: [3.6, -20.9, -36.3], look: [0, -20.5, -46], fov: 44 },
  { t: 0.395, pos: [-3.4, -20.9, -36.6], look: [0, -20.5, -46], fov: 44 },
  // 3. BUILD OUTPUT: the terminal and the extruding panels
  { t: 0.44, pos: [0, -22.2, -56], look: [0, -23.4, -78], fov: 46 },
  { t: 0.52, pos: [0, -23.3, -66.5], look: [0, -23.5, -78], fov: 46 },
  { t: 0.6, pos: [0, -23.5, -73.5], look: [0, -23.5, -92], fov: 46 },
  // 4. PRODUCT CITY: through the screen, then pull back to an isometric view
  { t: 0.645, pos: [0, -22.6, -92], look: [0, -23.4, -112], fov: 42 },
  { t: 0.7, pos: [11, -14.5, -97], look: [0, -23.4, -118], fov: 34 },
  { t: 0.78, pos: [24, -2, -94], look: [0, -23.3, -118], fov: 26 },
  // 5. LIVE
  { t: 0.88, pos: [26, 2, -92], look: [0, -22.6, -118], fov: 26 },
  { t: 1.0, pos: [24.5, 5.5, -93.5], look: [0, -22, -118], fov: 27 },
];


const at = (d: number): V3 => [TAB_C[0] + TAB_N[0] * d, TAB_C[1] + TAB_N[1] * d, TAB_C[2] + TAB_N[2] * d];

/**
 * "factory" variant: THE FLOOR (0 - 0.2) then the dive through the manager's tablet into the Forge.
 * Everything from t = 0.265 on is shared with the office variant, so Scenes 2 (after the arrival), 3, 4, 5 are untouched.
 *  0.00-0.04  high on the gantry, looking down the hall
 *  0.04-0.10  dolly low: inventory (left), production (right), QC (centre back)
 *  0.10-0.16  3/4 view of the manager as the questions pile up
 *  0.16-0.20  swing round behind his shoulder and dive through the tablet screen
 *  0.20-0.265 fall through the dark to the anvil (the hall is hidden once the screen has filled the view)
 */
export const FACTORY_KEYS: CameraKey[] = [
  { t: 0.0, pos: [0, 10.5, 14.5], look: [0, 0.5, -22], fov: 50 },
  { t: 0.04, pos: [0.8, 8.2, 11], look: [0, 1.2, -14], fov: 49 },
  { t: 0.055, pos: [-3.0, 2.6, 4.2], look: [-3.2, 2.3, -8], fov: 52 },
  { t: 0.075, pos: [2, 2.1, 2.4], look: [2.6, 2.0, -8], fov: 52 },
  { t: 0.1, pos: [1.7, 2.1, -0.8], look: [0.9, 2.0, -11], fov: 50 },
  { t: 0.13, pos: [4.6, 2.5, -12.5], look: [0, 1.7, -5], fov: 47 },
  { t: 0.16, pos: [2.6, 2.7, -11.2], look: [0, 1.8, -5.2], fov: 45 },
  { t: 0.17, pos: [3.0, 2.5, -5.8], look: [0, 1.8, -5.3], fov: 45 },
  { t: 0.182, pos: at(2.4), look: TAB_C, fov: 44 },
  { t: 0.194, pos: at(0.75), look: TAB_C, fov: 44 },
  { t: 0.2, pos: at(0.26), look: TAB_C, fov: 45 },
  { t: 0.208, pos: at(-0.5), look: [TAB_C[0] - TAB_N[0] * 2.5, TAB_C[1] - TAB_N[1] * 2.5, TAB_C[2] - TAB_N[2] * 2.5], fov: 46 },
  { t: 0.228, pos: [0, -4.5, -14], look: [0, -13, -34], fov: 46 },
  ...KEYS.filter((k) => k.t >= 0.265),
];

function makePath(keys: CameraKey[]) {
  const posCurve = new THREE.CatmullRomCurve3(
    keys.map((k) => new THREE.Vector3(...k.pos)),
    false,
    "centripetal",
  );
  const lookCurve = new THREE.CatmullRomCurve3(
    keys.map((k) => new THREE.Vector3(...k.look)),
    false,
    "centripetal",
  );
  const ts = keys.map((k) => k.t);
  return (p: number, pos: THREE.Vector3, look: THREE.Vector3): number => {
    const x = clamp01(p);
    let i = 0;
    while (i < ts.length - 2 && x > ts[i + 1]) i++;
    const f = ease(clamp01((x - ts[i]) / (ts[i + 1] - ts[i])));
    const u = (i + f) / (keys.length - 1);
    posCurve.getPoint(u, pos);
    lookCurve.getPoint(u, look);
    return lerp(keys[i].fov, keys[i + 1].fov, f);
  };
}

/** mild ease: keeps momentum through the keys instead of stopping at each one */
const ease = (f: number) => lerp(f, smoothstep(f), 0.4);

const sampleOffice = makePath(KEYS);
const sampleFactory = makePath(FACTORY_KEYS);

/** Writes the camera position + look target for progress `p` and returns the field of view. */
export function sampleCamera(p: number, pos: THREE.Vector3, look: THREE.Vector3): number {
  return (scene1Variant === "factory" ? sampleFactory : sampleOffice)(p, pos, look);
}
