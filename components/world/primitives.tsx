"use client";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { forwardRef, Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createDriftMaterial, createPhotoMaterial, createSmokeMaterial, getContactTexture } from "./shaders";
import { envState } from "./env";
import { world } from "@/lib/world-store";

type V3 = [number, number, number];

/* ------------------------------------------------------------------ */
/* Deterministic randomness so compositions are art-directed, not noisy */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Photogrammetry rock with seasonal grading                            */
export interface RockProps {
  url: string;
  position?: V3;
  rotation?: V3;
  scale?: number | V3;
  tint?: string;
  roughness?: number;
  metalness?: number;
  env?: number;
  /** Move the model so that its highest vertex sits exactly at `position`. */
  anchorTop?: boolean;
  shadows?: boolean;
  clearcoat?: number;
  /** Brightens the scanned albedo beyond white, for pale stone. */
  lift?: number;
}

export const Rock = forwardRef<THREE.Group, RockProps>(function Rock(
  { url, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, tint = "#ffffff", roughness = 1, metalness = 0, env = 1, anchorTop = false, shadows = true, clearcoat = 0, lift = 1 },
  ref,
) {
  const { scene } = useGLTF(url);
  const shapeKey = JSON.stringify([rotation, scale]);
  const object = useMemo(() => {
    const root = scene.clone(true);
    const tintColor = new THREE.Color(tint);
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const src = mesh.material as THREE.MeshStandardMaterial;
      let m: THREE.MeshStandardMaterial;
      if (clearcoat > 0) {
        const p = new THREE.MeshPhysicalMaterial();
        THREE.MeshStandardMaterial.prototype.copy.call(p, src);
        p.clearcoat = clearcoat;
        p.clearcoatRoughness = 0.18;
        m = p;
      } else m = src.clone();
      m.color.copy(tintColor).multiplyScalar(lift);
      m.roughness = roughness;
      m.metalness = metalness;
      m.envMapIntensity = env;
      // scans are open shells: render both faces so no hole ever shows through
      m.side = THREE.DoubleSide;
      m.shadowSide = THREE.FrontSide;
      mesh.material = m;
      mesh.castShadow = shadows;
      mesh.receiveShadow = shadows;
    });
    const holder = new THREE.Group();
    holder.add(root);
    if (Array.isArray(scale)) root.scale.set(...scale);
    else root.scale.setScalar(scale);
    root.rotation.set(...rotation);
    holder.updateMatrixWorld(true);
    if (anchorTop) {
      const top = new THREE.Vector3(0, -Infinity, 0);
      const v = new THREE.Vector3();
      root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const pos = mesh.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
          if (v.y > top.y) top.copy(v);
        }
      });
      root.position.sub(top);
    }
    return holder;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, tint, roughness, metalness, env, anchorTop, shadows, clearcoat, shapeKey, lift]);
  return <primitive ref={ref} object={object} position={position} />;
});

/* ------------------------------------------------------------------ */
/* Surface sampling: lets bottles and ingredients truly rest on stone   */
export function makeSurface(target: THREE.Object3D, origin: THREE.Vector3) {
  target.updateWorldMatrix(true, true);
  const ray = new THREE.Raycaster();
  const from = new THREE.Vector3();
  const down = new THREE.Vector3(0, -1, 0);
  const height = (x: number, z: number) => {
    from.set(origin.x + x, origin.y + 60, origin.z + z);
    ray.set(from, down);
    const hit = ray.intersectObject(target, true)[0];
    return hit ? hit.point.y - origin.y : null;
  };
  /** Find the flattest stable spot for a footprint near (x,z). */
  const seat = (x: number, z: number, radius = 0.6, fw = 0.28, fd = 0.18): V3 => {
    let best: V3 = [x, height(x, z) ?? 0, z];
    let bestScore = Infinity;
    const steps = 9;
    for (let i = 0; i < steps; i++)
      for (let j = 0; j < steps; j++) {
        const cx = x + ((i / (steps - 1)) * 2 - 1) * radius;
        const cz = z + ((j / (steps - 1)) * 2 - 1) * radius;
        const hs = [height(cx, cz), height(cx - fw, cz - fd), height(cx + fw, cz - fd), height(cx - fw, cz + fd), height(cx + fw, cz + fd)];
        if (hs.some((h) => h === null)) continue;
        const vals = hs as number[];
        const spread = Math.max(...vals) - Math.min(...vals);
        const dist = Math.hypot(cx - x, cz - z);
        const score = spread * 3 + dist * 0.15 - vals[0] * 1.2;
        if (score < bestScore) {
          bestScore = score;
          best = [cx, (Math.max(...vals) + Math.min(...vals)) / 2 - 0.004, cz];
        }
      }
    return best;
  };
  return { height, seat };
}

/* ------------------------------------------------------------------ */
/* Photographic card: bottles and botanicals                            */
export interface PhotoProps {
  url: string;
  height: number;
  position: V3;
  sweep?: boolean;
  bob?: number;
  seed?: number;
  /** "yaw" keeps the card upright; "full" faces the camera completely. */
  facing?: "yaw" | "full" | "fixed";
  rotationY?: number;
  tilt?: number;
  castShadow?: boolean;
  contact?: number;
  graded?: boolean;
  opacity?: number;
  renderOrder?: number;
  anchor?: "bottom" | "center";
}

/** Each photograph streams in on its own, so one texture never stalls the whole world. */
export function Photo(props: PhotoProps) {
  return (
    <Suspense fallback={null}>
      <PhotoInner {...props} />
    </Suspense>
  );
}

const NOTE_IMAGES = ["peony", "jasmine", "citrus", "neroli", "fig", "iris", "wood"];
if (typeof window !== "undefined") NOTE_IMAGES.forEach((n) => { useTexture.preload(`/img/notes/${n}.webp`); useTexture.preload(`/img/notes/${n}-blur.webp`); });

function PhotoInner({ url, height, position, sweep = false, bob = 0, seed = 0, facing = "yaw", rotationY = 0, tilt = 0, castShadow = false, contact = 0, graded = true, opacity = 1, renderOrder = 0, anchor = "bottom" }: PhotoProps) {
  const tex = useTexture(url);
  const gl = useThree((s) => s.gl);
  useLayoutEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.needsUpdate = true;
  }, [tex, gl]);
  const img = tex.image as { width: number; height: number };
  const aspect = img.width / img.height;
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(height * aspect, height);
    if (anchor === "bottom") g.translate(0, height / 2, 0);
    return g;
  }, [height, aspect, anchor]);
  const mat = useMemo(() => {
    const m = createPhotoMaterial(tex, { sweep });
    m.uniforms.map.value = tex;
    m.uniforms.opacity.value = opacity;
    return m;
  }, [tex, sweep, opacity]);
  const depthMat = useMemo(
    () => new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 }),
    [tex],
  );
  const mesh = useRef<THREE.Mesh>(null);
  const holder = useRef<THREE.Group>(null);
  const wp = useMemo(() => new THREE.Vector3(), []);
  const r = useMemo(() => rng(seed * 997 + 13)(), [seed]);

  useFrame(({ camera, clock }) => {
    const m = mesh.current;
    const h = holder.current;
    if (!m || !h) return;
    const t = clock.elapsedTime;
    if (bob) {
      m.position.y = Math.sin(t * 0.55 + r * 6.28) * bob;
      m.rotation.z = Math.sin(t * 0.37 + r * 3.1) * bob * 0.6;
    }
    if (facing !== "fixed") {
      h.getWorldPosition(wp);
      const yaw = Math.atan2(camera.position.x - wp.x, camera.position.z - wp.z);
      h.rotation.y = yaw + rotationY;
      if (facing === "full") {
        const dy = camera.position.y - wp.y;
        const dist = Math.hypot(camera.position.x - wp.x, camera.position.z - wp.z);
        h.rotation.x = -Math.atan2(dy, dist) * 0.9;
      }
    }
    if (graded) mat.uniforms.tint.value.copy(envState.tint);
    if (sweep) {
      // the sweep follows the journey: each scroll beat drags a glint across the glass
      mat.uniforms.sweep.value = ((world.t * 9 + t * 0.06) % 1) * 3.2 - 0.9;
    }
  });

  return (
    <group position={position}>
      <group ref={holder} rotation={[0, rotationY, tilt]}>
        <mesh ref={mesh} geometry={geom} material={mat} castShadow={castShadow} customDepthMaterial={depthMat} renderOrder={renderOrder} />
      </group>
      {contact > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} renderOrder={-1}>
          <planeGeometry args={[height * aspect * 1.35 * contact, height * aspect * 0.75 * contact]} />
          <meshBasicMaterial map={getContactTexture()} transparent depthWrite={false} color="#000" opacity={0.75} />
        </mesh>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Drifting particles                                                   */
export function Drift({ kind, count, area, position = [0, 0, 0], size, fall, sway, colorA, colorB, opacity = 1, seed = 1, wind }: {
  kind: "petal" | "leaf" | "snow" | "dust" | "streak";
  wind?: V3;
  count: number;
  area: V3;
  position?: V3;
  size: number;
  fall: number;
  sway: number;
  colorA: string;
  colorB: string;
  opacity?: number;
  seed?: number;
}) {
  const n = world.mobile ? Math.ceil(count * 0.5) : count;
  const geom = useMemo(() => {
    const base = new THREE.PlaneGeometry(1, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    g.attributes.position = base.attributes.position;
    g.attributes.uv = base.attributes.uv;
    const r = rng(seed);
    const b = new Float32Array(n * 3);
    const s = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      b[i * 3] = (r() - 0.5) * area[0];
      b[i * 3 + 1] = (r() - 0.5) * area[1];
      b[i * 3 + 2] = (r() - 0.5) * area[2];
      s[i * 4] = r();
      s[i * 4 + 1] = r();
      s[i * 4 + 2] = r();
      s[i * 4 + 3] = r();
    }
    g.setAttribute("aBase", new THREE.InstancedBufferAttribute(b, 3));
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(s, 4));
    g.instanceCount = n;
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Math.max(...area));
    return g;
  }, [n, area, seed]);
  const mat = useMemo(() => {
    const m = createDriftMaterial(kind, colorA, colorB);
    m.uniforms.uArea.value.set(...area);
    m.uniforms.uSize.value = size;
    m.uniforms.uFall.value = fall;
    m.uniforms.uSway.value = sway;
    m.uniforms.uOpacity.value = opacity;
    if (wind) m.uniforms.uWind.value.set(...wind);
    if (kind === "streak") m.blending = THREE.AdditiveBlending;
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, colorA, colorB, area, size, fall, sway, opacity, wind?.join(",")]);
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = world.reducedMotion ? 0 : clock.elapsedTime;
  });
  return <mesh geometry={geom} material={mat} position={position} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Crystals — hexagonal prisms with pyramidal terminations              */
let crystalGeom: THREE.BufferGeometry | null = null;
function getCrystalGeometry() {
  if (crystalGeom) return crystalGeom;
  const body = new THREE.CylinderGeometry(0.42, 0.5, 2, 6, 1, false);
  const tip = new THREE.ConeGeometry(0.42, 0.7, 6, 1);
  tip.translate(0, 1.35, 0);
  const g = mergeGeometries([body.toNonIndexed(), tip.toNonIndexed()])!;
  g.translate(0, 1, 0);
  g.computeVertexNormals();
  crystalGeom = g;
  return g;
}

export function CrystalCluster({ position, scale = 1, count = 7, seed = 1, color = "#c9dcff", rotation = [0, 0, 0] as V3 }: { position: V3; scale?: number; count?: number; seed?: number; color?: string; rotation?: V3 }) {
  const geom = getCrystalGeometry();
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.08,
        metalness: 0.15,
        envMapIntensity: 2.6,
        specularIntensity: 1,
        flatShading: true,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        transparent: true,
        opacity: 0.78,
        emissive: new THREE.Color("#233a5e"),
        emissiveIntensity: 0.35,
      }),
    [color],
  );
  const items = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + r() * 0.6;
      const lean = 0.15 + r() * 0.55;
      const s = (i === 0 ? 1 : 0.35 + r() * 0.55) * scale;
      return {
        pos: [Math.cos(a) * 0.18 * scale * (i ? 1 : 0), 0, Math.sin(a) * 0.18 * scale * (i ? 1 : 0)] as V3,
        rot: [Math.sin(a) * lean, r() * Math.PI, -Math.cos(a) * lean] as V3,
        s: [s * 0.32, s, s * 0.32] as V3,
      };
    });
  }, [count, seed, scale]);
  return (
    <group position={position} rotation={rotation}>
      {items.map((it, i) => (
        <mesh key={i} geometry={geom} material={mat} position={it.pos} rotation={it.rot} scale={it.s} castShadow />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Organic resin / pebbles via displaced icosahedra                     */
function displacedIco(radius: number, detail: number, seed: number, amount: number, freq: number) {
  const g = new THREE.IcosahedronGeometry(radius, detail);
  const r = rng(seed);
  const o = [r() * 10, r() * 10, r() * 10];
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n =
      Math.sin(v.x * freq + o[0]) * Math.cos(v.y * freq * 1.3 + o[1]) * 0.5 +
      Math.sin(v.z * freq * 0.9 + o[2] + v.x * 2) * 0.35 +
      Math.sin((v.x + v.y + v.z) * freq * 2.7) * 0.15;
    v.multiplyScalar(1 + n * amount);
    v.y *= 0.72;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export function AmberResin({ items }: { items: { position: V3; size: number; seed: number }[] }) {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#c9620f",
        roughness: 0.2,
        emissive: new THREE.Color("#a8480a"),
        emissiveIntensity: 0.55,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
        envMapIntensity: 1.8,
      }),
    [],
  );
  const geoms = useMemo(() => items.map((it) => displacedIco(it.size, 4, it.seed, 0.32, 5.5 / it.size * 0.1)), [items]);
  return (
    <>
      {items.map((it, i) => (
        <mesh key={i} geometry={geoms[i]} material={mat} position={it.position} rotation={[0, it.seed, 0]} castShadow />
      ))}
    </>
  );
}

/** Small scattered things: salt crystals, peppercorns. Instanced and seated on a surface function. */
export function Scatter({ kind, count, center, radius, surface, seed = 3, size }: {
  kind: "salt" | "pepper";
  count: number;
  center: [number, number];
  radius: number;
  surface: (x: number, z: number) => number | null;
  seed?: number;
  size: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geom = useMemo(() => (kind === "salt" ? new THREE.BoxGeometry(1, 1, 1) : displacedIco(1, 2, seed, 0.12, 9)), [kind, seed]);
  const mat = useMemo(
    () =>
      kind === "salt"
        ? new THREE.MeshPhysicalMaterial({ color: "#fbf9f4", roughness: 0.25, clearcoat: 0.8, envMapIntensity: 1.8 })
        : new THREE.MeshStandardMaterial({ color: "#1c1612", roughness: 0.62, envMapIntensity: 0.8 }),
    [kind],
  );
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const r = rng(seed);
    const d = new THREE.Object3D();
    let placed = 0;
    for (let i = 0; i < count * 3 && placed < count; i++) {
      const a = r() * Math.PI * 2;
      const rad = Math.sqrt(r()) * radius;
      const x = center[0] + Math.cos(a) * rad * 1.4;
      const z = center[1] + Math.sin(a) * rad;
      const y = surface(x, z);
      if (y === null) continue;
      const s = size * (0.55 + r() * 0.9);
      d.position.set(x, y + s * 0.35, z);
      d.rotation.set(r() * 3, r() * 3, r() * 3);
      d.scale.set(s, s * (kind === "salt" ? 0.8 + r() * 0.4 : 1), s);
      d.updateMatrix();
      m.setMatrixAt(placed++, d.matrix);
    }
    m.count = placed;
    m.instanceMatrix.needsUpdate = true;
  }, [count, center, radius, surface, seed, size, kind]);
  return <instancedMesh ref={ref} args={[geom, mat, count]} castShadow receiveShadow />;
}

/** Fine crimson saffron threads. */
export function Saffron({ position, seed = 5 }: { position: V3; seed?: number }) {
  const geoms = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 9 }, () => {
      const a = r() * Math.PI * 2;
      const len = 0.09 + r() * 0.07;
      const pts = [
        new THREE.Vector3(0, 0.004, 0),
        new THREE.Vector3(Math.cos(a) * len * 0.5, 0.012 + r() * 0.01, Math.sin(a) * len * 0.5),
        new THREE.Vector3(Math.cos(a + 0.4) * len, 0.004, Math.sin(a + 0.4) * len),
      ];
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.0045, 5);
    });
  }, [seed]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b0230c", roughness: 0.45, emissive: "#3a0700" }), []);
  return (
    <group position={position}>
      {geoms.map((g, i) => (
        <mesh key={i} geometry={g} material={mat} position={[(i % 3) * 0.02, 0, Math.floor(i / 3) * 0.02]} castShadow />
      ))}
    </group>
  );
}

/** Incense smoke card. */
export function Smoke({ position, height = 1.6 }: { position: V3; height?: number }) {
  const mat = useMemo(() => createSmokeMaterial(), []);
  const ref = useRef<THREE.Mesh>(null);
  const wp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock, camera }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    const m = ref.current;
    if (!m) return;
    m.getWorldPosition(wp);
    m.rotation.y = Math.atan2(camera.position.x - wp.x, camera.position.z - wp.z);
  });
  return (
    <mesh ref={ref} position={[position[0], position[1] + height / 2, position[2]]} material={mat}>
      <planeGeometry args={[height * 0.45, height]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Ground: softly undulating terrain that dissolves into fog           */
export function Ground({ position, color, size = 140, roughness = 0.95, amp = 1.2, metalness = 0, seed = 2, clearcoat = 0 }: { position: V3; color: string; size?: number; roughness?: number; amp?: number; metalness?: number; seed?: number; clearcoat?: number }) {
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, 128, 128);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    const r = rng(seed);
    const o = [r() * 50, r() * 50];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const d = Math.hypot(x, z);
      const h =
        (Math.sin(x * 0.09 + o[0]) * Math.cos(z * 0.07 + o[1]) * 0.6 + Math.sin(x * 0.21 + z * 0.17) * 0.25 + Math.sin(z * 0.5 + x * 0.1) * 0.08) * amp;
      // keep the stage area calm, let hills rise in the distance
      p.setY(i, h * THREE.MathUtils.smoothstep(d, 4, 30) * (1 + d * 0.03));
    }
    g.computeVertexNormals();
    return g;
  }, [size, amp, seed]);
  return (
    <mesh geometry={geom} position={position} receiveShadow>
      {clearcoat > 0 ? (
        <meshPhysicalMaterial color={color} roughness={roughness} metalness={metalness} clearcoat={clearcoat} clearcoatRoughness={0.3} envMapIntensity={0.8} />
      ) : (
        <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} envMapIntensity={0.5} />
      )}
    </mesh>
  );
}

/** Volumetric-feeling light shafts: additive gradient cards. */
export function LightShafts({ position, color, count = 5, seed = 9, length = 14, opacity = 0.12, rotation = [0, 0, 0] as V3 }: { position: V3; color: string; count?: number; seed?: number; length?: number; opacity?: number; rotation?: V3 }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
        fragmentShader: `uniform vec3 uColor; uniform float uOpacity; uniform float uTime; varying vec2 vUv;
          void main(){ float x = abs(vUv.x-0.5)*2.0; float a = smoothstep(1.0,0.0,x) * smoothstep(0.0,0.35,vUv.y) * smoothstep(1.0,0.55,vUv.y);
          a *= 0.75 + 0.25*sin(uTime*0.4 + vUv.y*3.0); gl_FragColor=vec4(uColor, a*uOpacity); }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [color, opacity],
  );
  const shafts = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({ x: (r() - 0.5) * 8, z: (r() - 0.5) * 6, w: 0.6 + r() * 1.6, rz: (r() - 0.5) * 0.15 }));
  }, [count, seed]);
  useFrame(({ clock }) => (mat.uniforms.uTime.value = clock.elapsedTime));
  return (
    <group position={position} rotation={rotation}>
      {shafts.map((s, i) => (
        <mesh key={i} position={[s.x, 0, s.z]} rotation={[0, i * 0.7, s.rz]} material={mat}>
          <planeGeometry args={[s.w, length]} />
        </mesh>
      ))}
    </group>
  );
}
