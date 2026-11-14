"use client";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Water } from "three/examples/jsm/objects/Water.js";
import { STATIONS, STATION_WINDOWS, type StationKey } from "@/lib/journey";
import { world } from "@/lib/world-store";
import { FRAGRANCES } from "@/lib/fragrances";
import { envState } from "./env";
import { Dunes, Ridges } from "./Landscape";
import { AmberResin, CrystalCluster, Drift, Ground, LightShafts, makeSurface, Photo, Rock, Saffron, Scatter, Smoke } from "./primitives";

type V3 = [number, number, number];
const M = (n: string) => `/models/${n}.glb`;
const N = (n: string) => `/img/notes/${n}.webp`;
const B = (slug: string) => `/img/bottles/flacon-${slug}.webp`;
/** Seat a photographic flacon: a hair below the measured surface so the glass base meets the stone. */
const sit = (p: V3, d = 0.018): V3 => [p[0], p[1] - d, p[2]];

/** Renders a station only while the journey is near it. */
function Station({ name, children }: { name: StationKey; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const [a, b] = STATION_WINDOWS[name];
    if (ref.current) ref.current.visible = world.t >= a && world.t <= b;
  });
  return (
    <group ref={ref} position={STATIONS[name].toArray()}>
      {children}
    </group>
  );
}

type Surface = ReturnType<typeof makeSurface>;
/** Measures the plinth after mount so products sit on real stone, not on guessed coordinates. */
function usePlinth(name: StationKey) {
  const ref = useRef<THREE.Group>(null);
  const [surface, setSurface] = useState<Surface | null>(null);
  useLayoutEffect(() => {
    if (ref.current) setSurface(makeSurface(ref.current, STATIONS[name]));
  }, [name]);
  return { ref, surface };
}
/** A point on the stone. `sink` nestles the object into the surface so nothing hovers. */
const rest = (s: Surface, b: V3, dx: number, dz: number, sink = 0): V3 => [b[0] + dx, (s.height(b[0] + dx, b[2] + dz) ?? b[1]) - sink, b[2] + dz];

/* ================================================================== */
/* ACT I — Arrival                                                     */
export function Arrival() {
  const { ref, surface } = usePlinth("hero");
  const seat = useMemo(() => surface?.seat(0, 0, 0.9, 0.2, 0.2), [surface]);
  return (
    <Station name="hero">
      <group ref={ref}>
        <Rock url={M("namaqualand_cliff_01")} anchorTop scale={1.05} rotation={[0, 0.6, 0]} tint="#f7ece2" roughness={1} env={1.1} lift={1.7} />
      </group>
      {seat && <Photo url={B("house")} height={1.2} position={sit(seat)} sweep castShadow contact={1.05} />}
      <Ridges
        center={[0, -8, -6]}
        layers={[
          { radius: 62, height: 20, base: 0.18, amp: 0.6, freq: 7, colorTop: "#cdbcc4", colorBottom: "#e9dcdb", sharp: 0.9, snow: 0.35, seed: 3 },
          { radius: 95, height: 30, base: 0.2, amp: 0.65, freq: 6, colorTop: "#d8cad0", colorBottom: "#eee3e0", sharp: 1, snow: 0.5, seed: 9 },
        ]}
      />
      {/* weightless stones — the surreal signature of the house */}
      <Float speed={0.8} rotationIntensity={0.25} floatIntensity={0.6}>
        <Rock url={M("rock_09")} position={[-4.2, 2.3, -3.5]} rotation={[0.3, 1.2, 0.2]} scale={16} tint="#efe6de" />
      </Float>
      <Float speed={0.6} rotationIntensity={0.2} floatIntensity={0.5}>
        <Rock url={M("stone_01")} position={[4.6, 3.2, -7]} rotation={[0.2, 0.4, 0.1]} scale={14} tint="#efe6de" />
      </Float>
      <Float speed={1} rotationIntensity={0.3} floatIntensity={0.4}>
        <Rock url={M("moon_rock_03")} position={[2.7, 1.6, -2.2]} rotation={[0.5, 0.2, 0.9]} scale={4} tint="#ede4dc" />
      </Float>
      <Drift kind="dust" count={90} area={[16, 8, 16]} position={[0, 1, -2]} size={0.035} fall={-0.05} sway={0.5} colorA="#fff1e6" colorB="#ffd2c2" opacity={0.7} />
    </Station>
  );
}

/* ================================================================== */
/* ACT II — Spring                                                     */
export function Spring() {
  const { ref, surface } = usePlinth("spring");
  const b = useMemo(() => surface?.seat(0, 0, 0.8, 0.3, 0.16), [surface]);
  return (
    <Station name="spring">
      <group ref={ref}>
        <Rock url={M("rock_moss_set_01")} anchorTop scale={0.8} rotation={[0, 0.4, 0]} tint="#f2f4ea" roughness={1} env={0.7} />
      </group>
      {b && surface && (
        <>
          <Photo url={B("aubade")} height={1.04} position={sit(b)} sweep castShadow contact={1.05} />
          {/* notes resting around the flacon */}
          <Photo url={N("peony")} height={0.4} position={rest(surface, b, -0.58, 0.2, 0.06)} castShadow seed={1} contact={0.6} />
          <Photo url={N("peony")} height={0.28} position={rest(surface, b, 0.5, -0.36, 0.04)} castShadow seed={2} rotationY={0.3} contact={0.5} />
          <Rock url={M("food_pears_asian_01")} position={rest(surface, b, 0.6, -0.05, 0.015)} scale={3.2} rotation={[0, 0.8, 0]} />
          <Photo url={N("jasmine")} height={0.26} position={rest(surface, b, -1.02, -0.12, 0.04)} seed={3} castShadow contact={0.4} />
          <Photo url={N("jasmine")} height={0.2} position={rest(surface, b, 0.98, 0.42, 0.03)} seed={4} castShadow contact={0.4} />
                    {/* a few suspended blossoms for depth */}
          <Photo url={N("peony")} height={0.3} position={[1.5, 1.45, -0.9]} bob={0.06} seed={5} anchor="center" facing="full" />
          <Photo url={N("jasmine")} height={0.22} position={[-1.35, 1.75, -1.6]} bob={0.05} seed={6} anchor="center" facing="full" />
          <Photo url={N("peony-blur")} height={0.8} position={[-2.0, 0.15, 2.7]} bob={0.03} seed={7} anchor="center" graded={false} />
          <Photo url={N("jasmine-blur")} height={0.7} position={[2.5, 0.9, 2.4]} bob={0.03} seed={8} anchor="center" graded={false} />
        </>
      )}
      <Rock url={M("fern_02")} position={[-3.2, -1.15, 0.8]} scale={1.1} rotation={[0, 0.5, 0]} tint="#cfe0b6" />
      <Rock url={M("fern_02")} position={[3.4, -1.25, -0.6]} scale={1.3} rotation={[0, 2.4, 0]} tint="#cfe0b6" />
      <Rock url={M("fern_02")} position={[-1.2, -1.35, -2.6]} scale={1.2} rotation={[0, 4.1, 0]} tint="#cfe0b6" />
      <Rock url={M("rock_moss_set_02")} position={[-9, -1.3, -9]} scale={1.3} rotation={[0, 0.9, 0]} tint="#eef2e4" />
      <Rock url={M("rock_moss_set_01")} position={[10, -1.4, -13]} scale={1.6} rotation={[0, 2.2, 0]} tint="#eef2e4" shadows={false} />
      <Rock url={M("rock_moss_set_02")} position={[-2, -1.6, -24]} scale={2.6} rotation={[0, 0.2, 0]} tint="#e4e9da" shadows={false} />
      <Ground position={[0, -1.45, -10]} color="#a3b48b" amp={2.4} seed={4} />
      <Ridges
        center={[0, -1.6, 0]}
        layers={[
          { radius: 40, height: 9, base: 0.25, amp: 0.55, freq: 9, colorTop: "#9fae86", colorBottom: "#b7c29d", seed: 2 },
          { radius: 58, height: 15, base: 0.22, amp: 0.6, freq: 7, colorTop: "#b4bd9e", colorBottom: "#cdd2b8", sharp: 0.3, seed: 5 },
          { radius: 86, height: 24, base: 0.2, amp: 0.7, freq: 5, colorTop: "#c9c9b8", colorBottom: "#dfd8cc", sharp: 0.6, seed: 8 },
        ]}
      />
      <Drift kind="petal" count={150} area={[16, 7, 16]} position={[0, 1.6, 0]} size={0.075} fall={0.16} sway={0.7} colorA="#fbe3e1" colorB="#e9a7ae" />
      <Drift kind="dust" count={60} area={[12, 5, 12]} position={[0, 1.2, 0]} size={0.03} fall={-0.03} sway={0.4} colorA="#fff6e8" colorB="#f9e0d8" opacity={0.6} seed={8} />
      <LightShafts position={[2, 3, -4]} rotation={[0, 0, -0.45]} color="#fff2df" opacity={0.07} length={16} />
    </Station>
  );
}

/* ================================================================== */
/* ACT III — Summer                                                    */
function Sea() {
  const normals = useTexture("/img/fx/waternormals.jpg");
  const water = useMemo(() => {
    normals.wrapS = normals.wrapT = THREE.RepeatWrapping;
    const w = new Water(new THREE.PlaneGeometry(420, 420), {
      textureWidth: 256,
      textureHeight: 256,
      waterNormals: normals,
      sunDirection: new THREE.Vector3(0, 1, 0),
      sunColor: 0xffe6b8,
      waterColor: 0x0b6f78,
      distortionScale: 2.2,
      fog: true,
    });
    w.rotation.x = -Math.PI / 2;
    (w.material as THREE.ShaderMaterial).uniforms.size.value = 3.2;
    return w;
  }, [normals]);
  useFrame((_, dt) => {
    const u = (water.material as THREE.ShaderMaterial).uniforms;
    u.time.value += world.reducedMotion ? 0 : dt * 0.32;
    u.sunDirection.value.copy(envState.sunDir);
    u.sunColor.value.copy(envState.sun);
  });
  return <primitive object={water} position={[0, -1.05, -40]} />;
}

export function Summer() {
  const { ref, surface } = usePlinth("summer");
  const b = useMemo(() => surface?.seat(0, 0, 0.8, 0.3, 0.16), [surface]);
  return (
    <Station name="summer">
      <group ref={ref}>
        <Rock url={M("namaqualand_boulder_02")} anchorTop scale={[2.3, 1.15, 2.3]} rotation={[0, -0.3, 0]} tint="#fff6e6" roughness={0.95} env={1} />
      </group>
      {b && surface && (
        <>
          <Photo url={B("azur")} height={1.04} position={sit(b)} sweep castShadow contact={1.05} />
          <Rock url={M("lemon")} position={rest(surface, b, 0.55, 0.22, -0.13)} scale={3.6} rotation={[1.3, 0.4, 0]} tint="#fff3b8" />
          <Rock url={M("food_lime_01")} position={rest(surface, b, 0.8, -0.08, 0.01)} scale={4.6} rotation={[0.3, 2.5, 0.2]} tint="#f4ffcf" />
          <Photo url={N("citrus")} height={0.3} position={rest(surface, b, -0.6, 0.2, 0.045)} castShadow seed={11} contact={0.5} />
          <Photo url={N("neroli")} height={0.25} position={rest(surface, b, -0.98, -0.2, 0.04)} castShadow seed={12} contact={0.4} />
          <Photo url={N("neroli")} height={0.19} position={rest(surface, b, 0.18, 0.5, 0.03)} castShadow seed={17} rotationY={0.3} contact={0.4} />
          <Rock url={M("lambis_shell")} position={rest(surface, b, -0.3, 0.55, 0.01)} scale={2.6} rotation={[0, 2.3, 0]} />
          <Scatter kind="salt" count={46} center={[b[0] + 0.35, b[2] + 0.42]} radius={0.3} surface={surface.height} size={0.024} />
          <Photo url={N("neroli")} height={0.24} position={[1.45, 1.55, -0.8]} bob={0.06} seed={13} anchor="center" facing="full" />
          <Photo url={N("citrus")} height={0.22} position={[-1.5, 1.25, -1.4]} bob={0.05} seed={14} anchor="center" facing="full" rotationY={0.4} />
          <Photo url={N("neroli-blur")} height={0.7} position={[2.4, 0.55, 2.5]} bob={0.03} seed={15} anchor="center" graded={false} />
          <Photo url={N("citrus-blur")} height={0.6} position={[-2.3, 0.0, 2.3]} bob={0.03} seed={16} anchor="center" graded={false} />
        </>
      )}
      <Rock url={M("namaqualand_boulder_05")} position={[-4.6, -0.9, -3.5]} scale={2.8} rotation={[0, 0.7, 0]} tint="#fff4e2" />
      <Rock url={M("namaqualand_boulder_02")} position={[5.8, -0.6, -7]} scale={3.2} rotation={[0.1, 2.1, 0]} tint="#fff4e2" />
      <Ridges
        center={[0, -1.15, 0]}
        layers={[
          { radius: 48, height: 9, base: 0.12, amp: 0.7, freq: 6, colorTop: "#e3cfae", colorBottom: "#cdb38c", mesa: 0.35, seed: 4 },
          { radius: 72, height: 15, base: 0.1, amp: 0.75, freq: 4.5, colorTop: "#e9dcc2", colorBottom: "#dbc7a6", mesa: 0.25, seed: 11 },
          { radius: 110, height: 22, base: 0.08, amp: 0.6, freq: 3.5, colorTop: "#efe3cd", colorBottom: "#e6d7bc", sharp: 0.3, seed: 17 },
        ]}
      />
      <Sea />
      <Drift kind="dust" count={100} area={[14, 6, 14]} position={[0, 1.2, 0]} size={0.032} fall={-0.04} sway={0.6} colorA="#fff2c4" colorB="#ffd889" opacity={0.75} seed={21} />
    </Station>
  );
}

/* ================================================================== */
/* ACT IV — Autumn                                                     */
export function Autumn() {
  const { ref, surface } = usePlinth("autumn");
  const b = useMemo(() => surface?.seat(0, 0, 0.8, 0.3, 0.16), [surface]);
  return (
    <Station name="autumn">
      <group ref={ref}>
        <Rock url={M("namaqualand_boulder_05")} anchorTop scale={3.3} rotation={[0, 0.3, 0]} tint="#e7a578" roughness={0.95} env={0.8} />
      </group>
      {b && surface && (
        <>
          <Photo url={B("velours")} height={1.04} position={sit(b)} sweep castShadow contact={1.05} />
          <Photo url={N("fig")} height={0.36} position={rest(surface, b, -0.62, 0.18, 0.05)} castShadow seed={31} contact={0.6} />
          <Photo url={N("fig")} height={0.24} position={rest(surface, b, 0.42, 0.5, 0.035)} castShadow seed={36} rotationY={0.4} contact={0.5} />
          {/* cedarwood: photoscanned dry branches */}
          <Rock url={M("dry_branches_medium_01")} position={rest(surface, b, 0.85, 0.05, 0.02)} scale={0.62} rotation={[0, 0.9, 0]} tint="#e9b48a" />
          <AmberResin
            items={[
              { position: rest(surface, b, 0.1, 0.5, -0.03), size: 0.07, seed: 3 },
              { position: rest(surface, b, -0.12, 0.6, -0.02), size: 0.045, seed: 7 },
              { position: rest(surface, b, -1.0, -0.15, -0.03), size: 0.06, seed: 11 },
            ]}
          />
          <Saffron position={rest(surface, b, -0.3, 0.42)} />
          <Photo url={N("fig")} height={0.26} position={[1.55, 1.5, -1]} bob={0.06} seed={33} anchor="center" facing="full" />
          <Photo url={N("fig-blur")} height={0.75} position={[-2.2, 0.25, 2.6]} bob={0.03} seed={34} anchor="center" graded={false} />
          <Photo url={N("wood-blur")} height={0.4} position={[2.4, 0.95, 2.3]} bob={0.03} seed={35} anchor="center" graded={false} />
        </>
      )}
      <Rock url={M("namaqualand_boulder_02")} position={[3.6, -1.3, -2.6]} scale={1.4} rotation={[0, 1.4, 0]} tint="#d79066" />
      <Rock url={M("namaqualand_boulder_05")} position={[-4.2, -1.45, -3.4]} scale={2} rotation={[0, 2.1, 0]} tint="#d48a5e" />
      <Dunes position={[0, -1.6, -6]} color="#c7814f" seed={9} />
      <Ridges
        center={[0, -1.8, 0]}
        layers={[
          { radius: 55, height: 12, base: 0.12, amp: 0.75, freq: 5, colorTop: "#b5603a", colorBottom: "#c97f50", mesa: 0.9, seed: 6 },
          { radius: 85, height: 20, base: 0.1, amp: 0.7, freq: 3.6, colorTop: "#c27350", colorBottom: "#d4936a", mesa: 0.8, seed: 13 },
          { radius: 130, height: 30, base: 0.08, amp: 0.55, freq: 2.8, colorTop: "#d69072", colorBottom: "#e0a982", mesa: 0.6, seed: 21 },
        ]}
      />
      <Drift kind="leaf" count={60} area={[16, 7, 16]} position={[0, 1.8, 0]} size={0.11} fall={0.2} sway={0.7} colorA="#c4561f" colorB="#7a1f1c" wind={[0.9, 0, 0.2]} />
      <Drift kind="dust" count={140} area={[18, 2.2, 18]} position={[0, -0.6, 0]} size={0.028} fall={0.02} sway={0.2} colorA="#f3c08a" colorB="#e39a62" opacity={0.85} seed={44} wind={[2.4, 0.15, 0.5]} />
      <Drift kind="streak" count={50} area={[20, 1.4, 18]} position={[0, -0.9, 0]} size={0.05} fall={0} sway={0.1} colorA="#f2c799" colorB="#e8ad7a" opacity={0.35} seed={45} wind={[3.2, 0, 0.6]} />
      <LightShafts position={[4, 3, -5]} rotation={[0, 0, 0.6]} color="#ffb070" opacity={0.09} length={18} count={6} seed={4} />
    </Station>
  );
}

/* ================================================================== */
/* ACT V — Winter                                                      */
export function Winter() {
  const { ref, surface } = usePlinth("winter");
  const b = useMemo(() => surface?.seat(0, 0, 0.8, 0.3, 0.16), [surface]);
  return (
    <Station name="winter">
      <group ref={ref}>
        <Rock url={M("moon_rock_01")} anchorTop scale={22} rotation={[0, 0.2, 0]} tint="#22262f" roughness={0.42} env={1.4} clearcoat={0.9} />
      </group>
      {b && surface && (
        <>
          <Photo url={B("givre")} height={1.04} position={sit(b)} sweep castShadow contact={1.05} />
          <Photo url={N("iris")} height={0.46} position={rest(surface, b, 0.6, 0.12, 0.06)} castShadow seed={41} contact={0.5} />
          <Photo url={N("iris")} height={0.3} position={rest(surface, b, -0.95, -0.2, 0.04)} castShadow seed={45} rotationY={0.4} contact={0.4} />
          {/* sandalwood */}
          <Rock url={M("dry_branches_medium_01")} position={rest(surface, b, -0.7, 0.25, 0.02)} scale={0.55} rotation={[0, 2.4, 0]} tint="#d9c2a0" />
          <Scatter kind="pepper" count={34} center={[b[0] + 0.12, b[2] + 0.45]} radius={0.26} surface={surface.height} size={0.024} seed={9} />
          <Smoke position={[b[0] - 0.9, b[1], b[2] - 0.6]} height={1.9} />
          <Photo url={N("iris")} height={0.32} position={[-1.55, 1.6, -1.1]} bob={0.05} seed={43} anchor="center" facing="full" />
          <Photo url={N("iris-blur")} height={0.8} position={[2.3, 0.3, 2.5]} bob={0.03} seed={44} anchor="center" graded={false} opacity={0.85} />
        </>
      )}
      <CrystalCluster position={[-1.55, -0.55, 0.5]} scale={0.55} seed={2} />
      <CrystalCluster position={[1.7, -0.75, -0.6]} scale={0.8} seed={5} count={6} />
      <CrystalCluster position={[-5, -1.4, -5]} scale={2.1} seed={8} count={8} />
      <CrystalCluster position={[6, -1.5, -8.5]} scale={2.8} seed={13} count={9} />
      <CrystalCluster position={[-10, -1.8, -16]} scale={4} seed={21} count={7} />
      <CrystalCluster position={[2.4, -1.4, 2.6]} scale={0.7} seed={34} count={5} />
      <Rock url={M("moon_rock_06")} position={[-3.6, -1.2, -1.4]} scale={30} rotation={[0, 1, 0]} tint="#1c2029" roughness={0.45} clearcoat={0.8} />
      <Rock url={M("moon_rock_03")} position={[4.4, -1.3, -3.2]} scale={36} rotation={[0, 2.2, 0]} tint="#1c2029" roughness={0.45} clearcoat={0.8} />
      <Ground position={[0, -1.25, -10]} color="#141a26" roughness={0.3} amp={1.2} seed={12} clearcoat={1} />
      <Ridges
        center={[0, -1.4, 0]}
        layers={[
          { radius: 50, height: 14, base: 0.15, amp: 0.75, freq: 6, colorTop: "#3a4762", colorBottom: "#1d2536", sharp: 1, snow: 1, seed: 7 },
          { radius: 80, height: 24, base: 0.12, amp: 0.8, freq: 4.5, colorTop: "#4c5b78", colorBottom: "#26304a", sharp: 1, snow: 1, seed: 15 },
          { radius: 125, height: 36, base: 0.1, amp: 0.7, freq: 3.4, colorTop: "#5f6f8d", colorBottom: "#323e58", sharp: 1, snow: 0.9, seed: 23 },
        ]}
      />
      <Drift kind="snow" count={260} area={[18, 8, 18]} position={[0, 2, 0]} size={0.022} fall={0.3} sway={0.25} colorA="#ffffff" colorB="#cfe0ff" opacity={0.9} wind={[1.4, 0, 0.35]} />
      <Drift kind="streak" count={70} area={[20, 5, 18]} position={[0, 0.8, 0]} size={0.045} fall={0} sway={0.15} colorA="#e4eeff" colorB="#b9cdf0" opacity={0.28} seed={71} wind={[4.2, 0, 0.9]} />
      <Drift kind="dust" count={26} area={[22, 1.2, 18]} position={[0, -0.7, 0]} size={1.1} fall={0} sway={0.3} colorA="#c9d6ec" colorB="#9fb2d2" opacity={0.07} seed={72} wind={[1.1, 0, 0.25]} />
    </Station>
  );
}

/* ================================================================== */
/* ACT VI — Finale: the collection together                            */
export function Finale() {
  const { ref, surface } = usePlinth("finale");
  const seats = useMemo(() => {
    if (!surface) return null;
    const xs = [-1.35, -0.45, 0.45, 1.35];
    const zs = [-0.1, 0.1, 0.1, -0.1];
    return xs.map((x, i) => surface.seat(x, zs[i], 0.3, 0.2, 0.16));
  }, [surface]);
  const accents = ["peony", "citrus", "fig", "iris"];
  return (
    <Station name="finale">
      <group ref={ref}>
        <Rock url={M("namaqualand_boulder_02")} anchorTop scale={[3.1, 0.9, 2.6]} rotation={[0, 0.05, 0]} tint="#efe1d6" roughness={0.95} lift={1.35} />
      </group>
      {seats &&
        surface &&
        seats.map((p, i) => (
          <group key={i}>
            <Photo url={B(FRAGRANCES[i].slug)} height={0.86} position={sit(p)} sweep castShadow contact={0.95} />
            <Photo url={N(accents[i])} height={0.2} position={rest(surface, p, i < 2 ? -0.3 : 0.3, 0.3, 0.03)} castShadow seed={50 + i} contact={0.4} />
          </group>
        ))}
      <Float speed={0.7} floatIntensity={0.5} rotationIntensity={0.2}>
        <Rock url={M("rock_09")} position={[-3.8, 2.4, -3]} rotation={[0.3, 1.2, 0.2]} scale={14} tint="#e9d9d3" />
      </Float>
      <Float speed={0.5} floatIntensity={0.4} rotationIntensity={0.2}>
        <Rock url={M("stone_01")} position={[4, 2.9, -4.5]} rotation={[0.2, 0.4, 0.1]} scale={12} tint="#e9d9d3" />
      </Float>
      <Ridges
        center={[0, -3, -4]}
        layers={[
          { radius: 60, height: 16, base: 0.15, amp: 0.6, freq: 6, colorTop: "#cbb8b6", colorBottom: "#dfd0cb", sharp: 0.7, seed: 31 },
          { radius: 95, height: 26, base: 0.12, amp: 0.65, freq: 4.5, colorTop: "#d7c8c4", colorBottom: "#e8dcd6", sharp: 0.9, snow: 0.3, seed: 37 },
        ]}
      />
      <Drift kind="petal" count={40} area={[12, 6, 10]} position={[-2, 1.5, 0]} size={0.07} fall={0.15} sway={0.6} colorA="#fbe3e1" colorB="#e9a7ae" seed={61} />
      <Drift kind="leaf" count={24} area={[12, 6, 10]} position={[2, 1.5, 0]} size={0.1} fall={0.2} sway={0.8} colorA="#c4561f" colorB="#7a1f1c" seed={62} />
      <Drift kind="dust" count={90} area={[14, 6, 12]} position={[0, 1.2, 0]} size={0.032} fall={-0.03} sway={0.5} colorA="#fff1df" colorB="#ffd9b5" opacity={0.7} seed={63} />
    </Station>
  );
}
