"use client";
import * as THREE from "three";
import { useMemo } from "react";
import { rng } from "./primitives";

type V3 = [number, number, number];

/* ------------------------------------------------------------------ */
/* Distant mountain ranges: painted silhouettes on an inward-facing arc. */
/* They read as atmospheric depth and can never show a torn scan edge.   */
export interface RidgeLayer {
  radius: number;
  height: number;
  /** Silhouette baseline and amplitude, as fractions of the layer height. */
  base: number;
  amp: number;
  freq: number;
  colorTop: string;
  colorBottom: string;
  /** 0 = rolling hills, 1 = sharp alpine peaks. */
  sharp?: number;
  /** 0 = flat-topped mesas off, 1 = strong terraces (canyon country). */
  mesa?: number;
  snow?: number;
  seed?: number;
}

const RIDGE_VERT = /* glsl */ `
  varying vec2 vUv;
  varying float vFogDepth;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFogDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;

const RIDGE_FRAG = /* glsl */ `
  uniform vec3 uTop, uBottom, fogColor;
  uniform float uBase, uAmp, uFreq, uSeed, uSharp, uMesa, uSnow, fogDensity, uFogScale;
  varying vec2 vUv;
  varying float vFogDepth;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
  float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 6; i++) { s += a * noise(p); p *= 2.02; a *= 0.5; } return s; }
  void main() {
    float x = vUv.x * uFreq + uSeed;
    float soft = fbm(vec2(x, uSeed * 1.7));
    float sharp = 1.0 - abs(fbm(vec2(x * 1.3, uSeed)) * 2.0 - 1.0);
    float n = mix(soft, sharp * 0.9 + soft * 0.25, uSharp);
    if (uMesa > 0.0) n = mix(n, floor(n * 4.0 + 0.5) / 4.0 + (n - floor(n * 4.0 + 0.5) / 4.0) * 0.25, uMesa);
    float ridge = uBase + pow(n, 1.35) * uAmp;
    float edge = fwidth(vUv.y) * 1.5;
    float a = 1.0 - smoothstep(ridge - edge, ridge + edge, vUv.y);
    if (a < 0.01) discard;
    float t = clamp(vUv.y / max(ridge, 0.001), 0.0, 1.0);
    vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, t));
    // erosion striation and gentle relief so the range never looks flat
    float relief = fbm(vec2(vUv.x * uFreq * 9.0, vUv.y * 26.0 + uSeed));
    col *= 0.88 + 0.16 * relief;
    col *= 0.94 + 0.08 * fbm(vec2(vUv.x * uFreq * 2.5 + 7.0, vUv.y * 4.0));
    if (uSnow > 0.0) {
      float cap = smoothstep(ridge - 0.22 - relief * 0.1, ridge - 0.02, vUv.y) * smoothstep(0.62, 0.85, n) * (0.6 + 0.4 * relief);
      col = mix(col, vec3(0.9, 0.93, 0.98), cap * uSnow);
    }
    float f = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth * uFogScale);
    col = mix(col, fogColor, clamp(f, 0.0, 1.0));
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }`;

function RidgeArc({ layer: raw, center, arc, rotation }: { layer: RidgeLayer; center: V3; arc: number; rotation: number }) {
  // ranges sit low on the horizon with broad, slow silhouettes — mountains, not bands
  const layer = useMemo(() => ({ ...raw, height: raw.height * 0.62, freq: raw.freq * 0.5 }), [raw]);
  const geom = useMemo(() => new THREE.CylinderGeometry(layer.radius, layer.radius, layer.height, 160, 1, true, -arc / 2, arc), [layer.radius, layer.height, arc]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uTop: { value: new THREE.Color(layer.colorTop) },
            uBottom: { value: new THREE.Color(layer.colorBottom) },
            uBase: { value: layer.base },
            uAmp: { value: layer.amp },
            uFreq: { value: layer.freq },
            uSeed: { value: layer.seed ?? 1 },
            uSharp: { value: layer.sharp ?? 0 },
            uMesa: { value: layer.mesa ?? 0 },
            uSnow: { value: layer.snow ?? 0 },
            uFogScale: { value: 0.32 },
          },
        ]),
        vertexShader: RIDGE_VERT,
        fragmentShader: RIDGE_FRAG,
        side: THREE.BackSide,
        transparent: true,
        fog: true,
        depthWrite: true,
      }),
    [layer],
  );
  return <mesh geometry={geom} material={mat} position={[center[0], center[1] + layer.height / 2, center[2]]} rotation={[0, rotation, 0]} renderOrder={-5} />;
}

/** Several ranges, near to far, centred behind the stage. `facing` turns the arc to sit behind the camera's view. */
export function Ridges({ layers, center = [0, -2, 0], arc = Math.PI * 1.35, facing = 0 }: { layers: RidgeLayer[]; center?: V3; arc?: number; facing?: number }) {
  // a cylinder's theta 0 points along +z; rotate by PI so the arc sits behind the stage (towards -z)
  return (
    <group>
      {layers.map((l, i) => (
        <RidgeArc key={i} layer={l} center={center} arc={arc} rotation={Math.PI + facing} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Dunes: wind-carved crests with fine ripples, calm under the stage.    */
let rippleTex: THREE.Texture | null = null;
function getRipples() {
  if (rippleTex) return rippleTex;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const img = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      const w = Math.sin((y + Math.sin(x * 0.05) * 6 + Math.sin(x * 0.013 + 1.3) * 10) * 0.2) * 0.5 + 0.5;
      const v = Math.pow(w, 1.6) * 200 + Math.random() * 30;
      const i = (y * 256 + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  rippleTex = new THREE.CanvasTexture(c);
  rippleTex.wrapS = rippleTex.wrapT = THREE.RepeatWrapping;
  rippleTex.repeat.set(70, 70);
  return rippleTex;
}

export function Dunes({ position, color = "#c98352", size = 180, seed = 4 }: { position: V3; color?: string; size?: number; seed?: number }) {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, 220, 220);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const r = rng(seed);
    const o = [r() * 40, r() * 40];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const warp = Math.sin(x * 0.031 + o[0]) * 6 + Math.sin(z * 0.024 + o[1]) * 8;
      const d = x * 0.86 + z * 0.5 + warp;
      // asymmetric dune profile: long windward slope, steep slip face
      const ph = (((d * 0.06) % 1) + 1) % 1;
      const crest = ph < 0.78 ? Math.pow(ph / 0.78, 1.6) : Math.pow(1 - (ph - 0.78) / 0.22, 2.2);
      const swell = Math.sin(x * 0.012 + z * 0.017 + o[0]) * 0.5 + 0.5;
      let h = crest * (2.6 + swell * 3.2) + Math.sin(x * 0.11 + z * 0.07) * 0.15;
      const dist = Math.hypot(x, z);
      h *= THREE.MathUtils.smoothstep(dist, 6, 26);
      p.setY(i, h);
    }
    g.computeVertexNormals();
    return g;
  }, [size, seed]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 1, bumpMap: getRipples(), bumpScale: 1.4, envMapIntensity: 0.5 }), [color]);
  return <mesh geometry={geom} material={mat} position={position} receiveShadow />;
}
