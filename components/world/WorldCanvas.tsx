"use client";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { setWorldUi, useWorldUi, world } from "@/lib/world-store";
import { Rig } from "./Rig";
import { Arrival, Autumn, Finale, Spring, Summer, Winter } from "./Stations";
import { Atmosphere } from "./Atmosphere";

/* Only what the opening shot needs blocks the loader; the rest streams in behind it. */
const FIRST = ["namaqualand_cliff_01", "rock_09", "stone_01", "moon_rock_03", "rock_moss_set_01", "food_pears_asian_01", "fern_02", "rock_moss_set_02"];
const LATER = ["namaqualand_boulder_02", "namaqualand_boulder_05", "lemon", "food_lime_01", "lambis_shell", "moon_rock_01", "moon_rock_06", "dry_branches_medium_01"];
FIRST.forEach((m) => useGLTF.preload(`/models/${m}.glb`));

function Ready() {
  const done = useRef(false);
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    gl.compileAsync(scene, camera).catch(() => {});
  }, [gl, scene, camera]);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => setWorldUi({ ready: true }));
  });
  return null;
}

/** Mounts the later seasons once the opening is on screen, so the first paint arrives fast. */
function Later() {
  const { ready } = useWorldUi();
  const [mount, setMount] = useState(false);
  useEffect(() => {
    if (!ready) return;
    LATER.forEach((m) => useGLTF.preload(`/models/${m}.glb`));
    useTexture.preload("/img/fx/waternormals.jpg");
    // build the later seasons after the opening title, or as soon as the visitor starts moving
    const go = () => setMount(true);
    const t = setTimeout(go, 5200);
    window.addEventListener("scroll", go, { once: true, passive: true });
    window.addEventListener("pointerdown", go, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", go);
      window.removeEventListener("pointerdown", go);
    };
  }, [ready]);
  if (!mount) return null;
  return (
    <>
      {[Summer, Autumn, Winter, Finale].map((S, i) => (
        <Suspense key={i} fallback={null}>
          <S />
        </Suspense>
      ))}
    </>
  );
}

function FrameGate() {
  const { visible } = useWorldUi();
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => setFrameloop(visible ? "always" : "never"), [visible, setFrameloop]);
  return null;
}

/** A soft studio: a warm key, a cool fill and a wide overhead softbox — what glass and gold want to reflect. */
function Studio() {
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer intensity={2.2} color="#fff3e2" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 14, 1]} />
      <Lightformer intensity={1.6} color="#ffe6c8" position={[-6, 3, 4]} rotation={[0, Math.PI / 3, 0]} scale={[3, 9, 1]} form="rect" />
      <Lightformer intensity={0.9} color="#cfe1ff" position={[7, 2, -3]} rotation={[0, -Math.PI / 2.6, 0]} scale={[3, 7, 1]} form="rect" />
      <Lightformer intensity={0.5} color="#f7f0ea" position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[16, 16, 1]} />
      <Lightformer intensity={0.7} color="#ffffff" position={[2, 4, 7]} scale={[2, 2, 1]} form="circle" />
    </Environment>
  );
}

export default function WorldCanvas() {
  const { visible } = useWorldUi();
  if (typeof window !== "undefined") {
    world.mobile = window.matchMedia("(max-width: 820px), (pointer: coarse)").matches;
    world.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    (window as unknown as { __world: typeof world }).__world = world;
  }
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      world.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      world.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="world-layer" data-visible={visible} aria-hidden>
      <Canvas
        dpr={[1, 1.25]}
        shadows={world.mobile ? false : "percentage"}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false, stencil: false }}
        camera={{ fov: 35, near: 0.05, far: 700, position: [1.3, 1.25, 8.4] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.02;
          gl.setClearColor("#e6d8cd");
        }}
      >
        <FrameGate />
        <Suspense fallback={null}>
          <Studio />
          <Rig />
          <Arrival />
          <Atmosphere />
          <Ready />
        </Suspense>
        <Suspense fallback={null}>
          <Spring />
        </Suspense>
        <Later />
      </Canvas>
    </div>
  );
}
