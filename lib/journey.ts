import * as THREE from "three";

/**
 * The whole site lives in one continuous world. Every scene is a "station"
 * laid out along a descending path; the camera travels between them through
 * atmospheric membranes (cloud, sun haze, amber dust, night mist).
 */
export const STATIONS = {
  hero: new THREE.Vector3(0, 0, 0),
  spring: new THREE.Vector3(6, -10, -45),
  summer: new THREE.Vector3(-4, -10, -95),
  autumn: new THREE.Vector3(5, -10, -145),
  winter: new THREE.Vector3(-3, -10, -195),
  finale: new THREE.Vector3(0, -10, -245),
} as const;
export type StationKey = keyof typeof STATIONS;

/** Journey windows in which each station must be rendered. */
export const STATION_WINDOWS: Record<StationKey, [number, number]> = {
  hero: [0, 0.14],
  spring: [0.1, 0.36],
  summer: [0.32, 0.58],
  autumn: [0.54, 0.8],
  winter: [0.76, 0.96],
  finale: [0.92, 1.01],
};

type V3 = [number, number, number];
interface CamKey {
  t: number;
  pos: V3;
  target: V3;
  /** Composition shift (-1..1): positive pushes the subject to the right of frame. */
  shift: number;
}

const at = (s: StationKey, o: V3): V3 => [STATIONS[s].x + o[0], STATIONS[s].y + o[1], STATIONS[s].z + o[2]];

export const CAMERA_KEYS: CamKey[] = [
  // ACT I — Arrival: a monumental stone above a sea of cloud
  { t: 0.0, pos: at("hero", [1.3, 1.25, 8.4]), target: at("hero", [0, 0.35, 0]), shift: 0.5 },
  { t: 0.045, pos: at("hero", [-0.7, 1.0, 5.2]), target: at("hero", [0, 0.6, 0]), shift: 0.35 },
  { t: 0.085, pos: at("hero", [-1.6, 0.8, 2.0]), target: at("hero", [0.6, -0.4, -5]), shift: 0 },
  // descent through the cloud sea
  { t: 0.115, pos: [1.5, -4.4, -13], target: [4.5, -8.5, -34], shift: 0 },
  { t: 0.145, pos: at("spring", [-2.5, 2.0, 15]), target: at("spring", [0, 0.4, 0]), shift: -0.2 },
  // ACT II — Spring
  { t: 0.18, pos: at("spring", [-3.4, 1.5, 8.2]), target: at("spring", [0, 0.45, 0]), shift: -0.45 },
  { t: 0.24, pos: at("spring", [-1.0, 0.72, 3.9]), target: at("spring", [0, 0.5, 0]), shift: -0.42 },
  { t: 0.29, pos: at("spring", [2.5, 0.85, 3.0]), target: at("spring", [0, 0.5, 0]), shift: 0.38 },
  { t: 0.325, pos: at("spring", [4.4, 2.8, -5]), target: at("spring", [-5, 1.2, -30]), shift: 0 },
  // golden haze
  { t: 0.35, pos: [0.5, -7.2, -72], target: at("summer", [0, 0.5, 0]), shift: 0 },
  // ACT III — Summer
  { t: 0.38, pos: at("summer", [5.2, 1.3, 11]), target: at("summer", [0, 0.45, 0]), shift: 0.45 },
  { t: 0.46, pos: at("summer", [1.15, 0.7, 4.0]), target: at("summer", [0, 0.5, 0]), shift: 0.42 },
  { t: 0.51, pos: at("summer", [-2.7, 0.6, 2.9]), target: at("summer", [0, 0.5, 0]), shift: -0.38 },
  { t: 0.545, pos: at("summer", [-4.8, 2.6, -5]), target: at("summer", [8, 1, -30]), shift: 0 },
  // amber dust
  { t: 0.57, pos: [0.5, -7.4, -121], target: at("autumn", [0, 0.5, 0]), shift: 0 },
  // ACT IV — Autumn
  { t: 0.6, pos: at("autumn", [-4.2, 1.9, 11]), target: at("autumn", [0, 0.45, 0]), shift: -0.45 },
  { t: 0.68, pos: at("autumn", [-1.1, 0.78, 4.0]), target: at("autumn", [0, 0.5, 0]), shift: -0.42 },
  { t: 0.725, pos: at("autumn", [2.6, 1.0, 3.0]), target: at("autumn", [0, 0.5, 0]), shift: 0.38 },
  { t: 0.76, pos: at("autumn", [4.2, 3.0, -5]), target: at("autumn", [-7, 1, -30]), shift: 0 },
  // night mist
  { t: 0.785, pos: [1, -7.2, -170], target: at("winter", [0, 0.5, 0]), shift: 0 },
  // ACT V — Winter
  { t: 0.815, pos: at("winter", [4.2, 1.7, 11]), target: at("winter", [0, 0.45, 0]), shift: 0.45 },
  { t: 0.865, pos: at("winter", [1.1, 0.75, 4.0]), target: at("winter", [0, 0.5, 0]), shift: 0.42 },
  { t: 0.905, pos: at("winter", [-2.6, 0.95, 3.0]), target: at("winter", [0, 0.5, 0]), shift: -0.36 },
  { t: 0.935, pos: at("winter", [-1.2, 3.0, -6]), target: at("finale", [0, 0.5, 0]), shift: 0 },
  // ACT VI — Finale: close on the four, then the long pull-back
  { t: 0.965, pos: at("finale", [0, 0.8, 3.6]), target: at("finale", [0, 0.4, 0]), shift: 0 },
  { t: 1.0, pos: at("finale", [0, 1.5, 6.6]), target: at("finale", [0, 1.15, 0]), shift: 0 },
];

const posCurve = new THREE.CatmullRomCurve3(CAMERA_KEYS.map((k) => new THREE.Vector3(...k.pos)), false, "centripetal");
const tgtCurve = new THREE.CatmullRomCurve3(CAMERA_KEYS.map((k) => new THREE.Vector3(...k.target)), false, "centripetal");
const N = CAMERA_KEYS.length - 1;

function keyParam(t: number) {
  t = THREE.MathUtils.clamp(t, 0, 1);
  let i = 0;
  while (i < N - 1 && t > CAMERA_KEYS[i + 1].t) i++;
  const a = CAMERA_KEYS[i];
  const b = CAMERA_KEYS[i + 1];
  const f = THREE.MathUtils.clamp((t - a.t) / (b.t - a.t), 0, 1);
  // ease within each segment so the camera settles at keyframes
  const e = f * f * (3 - 2 * f);
  const lin = (i + f) / N;
  const eased = (i + e) / N;
  return { u: THREE.MathUtils.lerp(lin, eased, 0.55), i, f: e };
}

export function sampleCamera(t: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
  const { u, i, f } = keyParam(t);
  posCurve.getPoint(u, outPos);
  tgtCurve.getPoint(u, outTarget);
  return THREE.MathUtils.lerp(CAMERA_KEYS[i].shift, CAMERA_KEYS[i + 1].shift, f);
}

/* ------------------------------------------------------------------ */
/* Environment keyframes — sky, fog, sun and bottle grading per moment */

interface EnvKey {
  t: number;
  skyTop: string;
  skyHorizon: string;
  skyBottom: string;
  fog: string;
  density: number;
  sun: string;
  sunIntensity: number;
  sunDir: V3;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  env: number;
  tint: V3;
}

const dawn: Omit<EnvKey, "t"> = {
  skyTop: "#8b8aa2", skyHorizon: "#efdccb", skyBottom: "#eee0d3", fog: "#e6d8cd", density: 0.016,
  sun: "#ffd7b5", sunIntensity: 2.4, sunDir: [-0.55, 0.32, -0.75], hemiSky: "#e4dde6", hemiGround: "#857a7a", hemi: 0.9, env: 0.55, tint: [1, 0.99, 1],
};
const spring: Omit<EnvKey, "t"> = {
  skyTop: "#9fbcab", skyHorizon: "#f3dcd5", skyBottom: "#e8e3d1", fog: "#e6dcd2", density: 0.036,
  sun: "#fff0dd", sunIntensity: 2.6, sunDir: [0.45, 0.62, 0.55], hemiSky: "#f4ebe3", hemiGround: "#61734f", hemi: 1.0, env: 0.7, tint: [1.0, 1.0, 0.98],
};
const summer: Omit<EnvKey, "t"> = {
  skyTop: "#4aa9bf", skyHorizon: "#fbe8c6", skyBottom: "#f4dfb6", fog: "#f2e0bf", density: 0.017,
  sun: "#ffe1a1", sunIntensity: 3.4, sunDir: [-0.35, 0.5, -0.8], hemiSky: "#fff3d8", hemiGround: "#b39770", hemi: 1.05, env: 0.9, tint: [1.05, 1.01, 0.95],
};
const autumn: Omit<EnvKey, "t"> = {
  skyTop: "#4f1f2b", skyHorizon: "#f09a58", skyBottom: "#c0663a", fog: "#d4875a", density: 0.032,
  sun: "#ffad6a", sunIntensity: 3.2, sunDir: [0.65, 0.22, -0.72], hemiSky: "#f5b88a", hemiGround: "#401812", hemi: 0.75, env: 0.5, tint: [1.06, 0.95, 0.86],
};
const winter: Omit<EnvKey, "t"> = {
  skyTop: "#040914", skyHorizon: "#30425e", skyBottom: "#151c2a", fog: "#1b2537", density: 0.038,
  sun: "#bcd3ff", sunIntensity: 2.4, sunDir: [-0.45, 0.5, -0.72], hemiSky: "#51648a", hemiGround: "#080b12", hemi: 0.65, env: 0.5, tint: [0.84, 0.9, 1.04],
};
const finale: Omit<EnvKey, "t"> = {
  skyTop: "#89879e", skyHorizon: "#eedbc8", skyBottom: "#e8d7c8", fog: "#e1d3c7", density: 0.026,
  sun: "#ffe1c4", sunIntensity: 2.6, sunDir: [0.35, 0.55, 0.65], hemiSky: "#efe6e4", hemiGround: "#6d6260", hemi: 1.0, env: 0.7, tint: [1, 0.99, 0.98],
};
const haze = (base: Omit<EnvKey, "t">, fog: string, density: number): Omit<EnvKey, "t"> => ({
  ...base, fog, density, skyTop: fog, skyHorizon: fog, skyBottom: fog,
});

export const ENV_KEYS: EnvKey[] = [
  { t: 0, ...dawn },
  { t: 0.085, ...dawn },
  { t: 0.122, ...haze(dawn, "#f2e8df", 0.2) },
  { t: 0.15, ...spring, density: 0.05 },
  { t: 0.175, ...spring },
  { t: 0.31, ...spring },
  { t: 0.348, ...haze(summer, "#fbe8be", 0.2) },
  { t: 0.38, ...summer },
  { t: 0.535, ...summer },
  { t: 0.568, ...haze(autumn, "#e49a5e", 0.2) },
  { t: 0.6, ...autumn },
  { t: 0.755, ...autumn },
  { t: 0.786, ...haze(winter, "#27314a", 0.2) },
  { t: 0.815, ...winter },
  { t: 0.93, ...winter },
  { t: 0.952, ...haze(finale, "#cdc2bb", 0.18) },
  { t: 0.975, ...finale },
  { t: 1, ...finale },
];

export interface EnvState {
  skyTop: THREE.Color;
  skyHorizon: THREE.Color;
  skyBottom: THREE.Color;
  fog: THREE.Color;
  density: number;
  sun: THREE.Color;
  sunIntensity: number;
  sunDir: THREE.Vector3;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemi: number;
  env: number;
  tint: THREE.Vector3;
}

export const createEnvState = (): EnvState => ({
  skyTop: new THREE.Color(), skyHorizon: new THREE.Color(), skyBottom: new THREE.Color(), fog: new THREE.Color(),
  density: 0, sun: new THREE.Color(), sunIntensity: 0, sunDir: new THREE.Vector3(), hemiSky: new THREE.Color(),
  hemiGround: new THREE.Color(), hemi: 0, env: 0, tint: new THREE.Vector3(),
});

const cA = new THREE.Color();
const cB = new THREE.Color();
const lerpC = (out: THREE.Color, a: string, b: string, f: number) => out.copy(cA.set(a)).lerp(cB.set(b), f);

export function sampleEnv(t: number, s: EnvState) {
  t = THREE.MathUtils.clamp(t, 0, 1);
  let i = 0;
  while (i < ENV_KEYS.length - 2 && t > ENV_KEYS[i + 1].t) i++;
  const a = ENV_KEYS[i];
  const b = ENV_KEYS[i + 1];
  let f = THREE.MathUtils.clamp((t - a.t) / (b.t - a.t || 1), 0, 1);
  f = f * f * (3 - 2 * f);
  lerpC(s.skyTop, a.skyTop, b.skyTop, f);
  lerpC(s.skyHorizon, a.skyHorizon, b.skyHorizon, f);
  lerpC(s.skyBottom, a.skyBottom, b.skyBottom, f);
  lerpC(s.fog, a.fog, b.fog, f);
  lerpC(s.sun, a.sun, b.sun, f);
  lerpC(s.hemiSky, a.hemiSky, b.hemiSky, f);
  lerpC(s.hemiGround, a.hemiGround, b.hemiGround, f);
  // fog density interpolates geometrically so membranes swell smoothly
  s.density = Math.exp(THREE.MathUtils.lerp(Math.log(a.density), Math.log(b.density), f));
  s.sunIntensity = THREE.MathUtils.lerp(a.sunIntensity, b.sunIntensity, f);
  s.hemi = THREE.MathUtils.lerp(a.hemi, b.hemi, f);
  s.env = THREE.MathUtils.lerp(a.env, b.env, f);
  s.sunDir.set(...a.sunDir).lerp(new THREE.Vector3(...b.sunDir), f).normalize();
  s.tint.set(...a.tint).lerp(new THREE.Vector3(...b.tint), f);
  return s;
}

/** Which station is the camera currently "in"? Used for shadow focus and HUD. */
export function activeStation(t: number): StationKey {
  if (t < 0.12) return "hero";
  if (t < 0.345) return "spring";
  if (t < 0.565) return "summer";
  if (t < 0.785) return "autumn";
  if (t < 0.95) return "winter";
  return "finale";
}
