"use client";
import * as THREE from "three";
import { Suspense, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { FRAGRANCES } from "@/lib/fragrances";
import { makeSurface, Photo, Rock } from "@/components/world/primitives";
import { WorldDirector } from "@/components/shell/WorldDirector";

/** Internal product-photography studio used to render the flacon images shown across the site. */
const SET: Record<string, { stone: string; tint: string; note: string; bg: string; juice: string; name: string; design: string }> = {
  aubade: { stone: "namaqualand_boulder_05", tint: "#c9cfae", note: "peony", bg: "#ecd9d3", juice: FRAGRANCES[0].juice, name: "Aubade", design: "aubade" },
  azur: { stone: "namaqualand_boulder_05", tint: "#fff6e6", note: "neroli", bg: "#f1e2c6", juice: FRAGRANCES[1].juice, name: "Azur", design: "azur" },
  velours: { stone: "namaqualand_boulder_05", tint: "#e3a074", note: "fig", bg: "#d9b29a", juice: FRAGRANCES[2].juice, name: "Velours", design: "velours" },
  givre: { stone: "moon_rock_01", tint: "#2a2e37", note: "iris", bg: "#c9d0db", juice: FRAGRANCES[3].juice, name: "Givre", design: "givre" },
  house: { stone: "namaqualand_boulder_05", tint: "#f2e4dc", note: "jasmine", bg: "#e7d6cf", juice: "#e6c987", name: "L’Essence", design: "house" },
};

function Scene({ id }: { id: string }) {
  const s = SET[id] ?? SET.aubade;
  const plinth = useRef<THREE.Group>(null);
  const [seat, setSeat] = useState<[number, number, number] | null>(null);
  const [note, setNote] = useState<[number, number, number] | null>(null);
  useLayoutEffect(() => {
    if (!plinth.current) return;
    const surf = makeSurface(plinth.current, new THREE.Vector3());
    const p = surf.seat(0, 0, 0.5, 0.3, 0.16);
    setSeat(p);
    setNote([p[0] + 0.42, (surf.height(p[0] + 0.42, p[2] + 0.22) ?? p[1]) - 0.04, p[2] + 0.22]);
  }, []);
  // frame every flacon the same way: centred, with air above the cap and a band of stone below
  const camera = useThree((st) => st.camera);
  useLayoutEffect(() => {
    if (!seat) return;
    camera.position.set(seat[0] + 0.12, seat[1] + 0.66, seat[2] + 4.3);
    camera.lookAt(seat[0] + 0.04, seat[1] + 0.47, seat[2]);
    camera.updateProjectionMatrix();
  }, [seat, camera]);
  const frames = useRef(0);
  useFrame(() => {
    if (seat && ++frames.current === 40) (window as unknown as { __studioReady: boolean }).__studioReady = true;
  });
  const scale = s.stone === "rock_moss_set_01" ? 0.42 : s.stone === "moon_rock_01" ? 13 : 1.9;
  const bg = useMemo(() => new THREE.Color(s.bg), [s.bg]);
  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 5, 11]} />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.4} color="#fff3e2" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 14, 1]} />
        <Lightformer intensity={2} color="#ffe6c8" position={[-5, 2, 3]} rotation={[0, Math.PI / 3, 0]} scale={[2.4, 8, 1]} />
        <Lightformer intensity={1.1} color="#dbe7ff" position={[6, 2, -2]} rotation={[0, -Math.PI / 2.6, 0]} scale={[2.4, 7, 1]} />
        <Lightformer intensity={0.6} color="#ffffff" position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[16, 16, 1]} />
      </Environment>
      <hemisphereLight args={["#fff6ee", "#6b5b52", 0.9]} />
      <directionalLight position={[-3, 5, 4]} intensity={2.4} color="#fff0de" castShadow shadow-mapSize={[2048, 2048]} shadow-radius={6} shadow-bias={-0.0004} />
      <group ref={plinth}>
        <Rock url={`/models/${s.stone}.glb`} anchorTop scale={scale} tint={s.tint} roughness={s.stone === "moon_rock_01" ? 0.4 : 1} clearcoat={s.stone === "moon_rock_01" ? 0.9 : 0} />
      </group>
      {seat && <Photo url={`/img/bottles/flacon-${s.design}.webp`} height={0.98} position={[seat[0], seat[1] - 0.015, seat[2]]} graded={false} castShadow contact={1} />}
      {note && <Photo url={`/img/notes/${s.note}.webp`} height={0.3} position={note} graded={false} castShadow contact={0.5} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={bg} />
      </mesh>
    </>
  );
}

function StudioInner() {
  const id = useSearchParams().get("d") ?? "aubade";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999 }}>
      <WorldDirector mode="hidden" />
      <Canvas
        shadows="percentage"
        dpr={1}
        camera={{ fov: 26, position: [0.35, 0.72, 3.3] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
        }}
      >
        <Suspense fallback={null}>
          <Scene id={id} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={null}>
      <StudioInner />
    </Suspense>
  );
}
