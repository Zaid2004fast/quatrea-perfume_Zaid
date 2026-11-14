"use client";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { activeStation, sampleCamera, sampleEnv, STATIONS } from "@/lib/journey";
import { world } from "@/lib/world-store";
import { envState } from "./env";
import { SKY_FRAG, SKY_VERT } from "./shaders";

const pos = new THREE.Vector3();
const tgt = new THREE.Vector3();
const focus = new THREE.Vector3();
const focusSmooth = new THREE.Vector3(0, 0, 0);

export function Rig() {
  const { camera, scene, size } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sky = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const shiftSmooth = useRef(0);

  const fog = useMemo(() => new THREE.FogExp2("#e6d8cd", 0.02), []);
  useLayoutEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  const skyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          top: { value: new THREE.Color() },
          horizon: { value: new THREE.Color() },
          bottom: { value: new THREE.Color() },
          sunColor: { value: new THREE.Color() },
          sunDir: { value: new THREE.Vector3(0, 1, 0) },
          fogColor: { value: new THREE.Color() },
          veil: { value: 0 },
          time: { value: 0 },
        },
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  );

  useLayoutEffect(() => {
    const l = sun.current;
    if (!l) return;
    scene.add(l.target);
    l.shadow.mapSize.set(1536, 1536);
    const c = l.shadow.camera as THREE.OrthographicCamera;
    c.left = -4.5;
    c.right = 4.5;
    c.top = 4.5;
    c.bottom = -4.5;
    c.near = 1;
    c.far = 90;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    l.shadow.radius = 5;
    return () => {
      scene.remove(l.target);
    };
  }, [scene]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    // 1. advance journey time towards its target — this is the camera's "dolly"
    const k = 1 - Math.exp(-dt * (world.reducedMotion ? 12 : world.follow));
    world.t += (world.targetT - world.t) * k;
    if (Math.abs(world.targetT - world.t) < 1e-5) world.t = world.targetT;

    // 2. camera on its spline
    let shift = sampleCamera(world.t, pos, tgt);
    if (world.mode === "focus") shift = world.targetFrame;
    shiftSmooth.current += (shift - shiftSmooth.current) * (1 - Math.exp(-dt * 3));

    // 3. subtle hand-held parallax from the pointer
    const pk = 1 - Math.exp(-dt * 2.2);
    pointer.current.x += (world.pointer.x - pointer.current.x) * pk;
    pointer.current.y += (world.pointer.y - pointer.current.y) * pk;
    const drift = world.reducedMotion ? 0 : 1;
    const right = new THREE.Vector3().subVectors(tgt, pos).cross(cam.up).normalize();
    pos.addScaledVector(right, pointer.current.x * 0.16 * drift);
    pos.y += pointer.current.y * 0.09 * drift;
    if (!world.reducedMotion) pos.y += Math.sin(state.clock.elapsedTime * 0.35) * 0.025;

    cam.position.copy(pos);
    cam.lookAt(tgt);

    const aspect = size.width / size.height;
    const portrait = aspect < 0.9;
    const fov = portrait ? 50 : aspect < 1.3 ? 42 : 35;
    if (cam.fov !== fov) cam.fov = fov;
    cam.filmGauge = 35;
    cam.filmOffset = portrait ? 0 : -shiftSmooth.current * 35 * 0.42;
    cam.near = 0.05;
    cam.far = 700;
    cam.updateProjectionMatrix();

    // 4. environment
    sampleEnv(world.t, envState);
    fog.color.copy(envState.fog);
    fog.density = envState.density;
    const u = skyMat.uniforms;
    u.top.value.copy(envState.skyTop);
    u.horizon.value.copy(envState.skyHorizon);
    u.bottom.value.copy(envState.skyBottom);
    u.sunColor.value.copy(envState.sun);
    u.sunDir.value.copy(envState.sunDir);
    u.fogColor.value.copy(envState.fog);
    u.veil.value = THREE.MathUtils.smoothstep(envState.density, 0.045, 0.16);
    u.time.value = state.clock.elapsedTime;
    if (sky.current) sky.current.position.copy(cam.position);

    // 5. lights follow the active stage so shadows stay crisp where they matter
    focus.copy(STATIONS[activeStation(world.t)]);
    focusSmooth.lerp(focus, 1 - Math.exp(-dt * 4));
    const l = sun.current;
    if (l) {
      l.color.copy(envState.sun);
      l.intensity = envState.sunIntensity;
      l.position.copy(focusSmooth).addScaledVector(envState.sunDir, 40);
      l.target.position.copy(focusSmooth);
      l.target.updateMatrixWorld();
    }
    if (hemi.current) {
      hemi.current.color.copy(envState.hemiSky);
      hemi.current.groundColor.copy(envState.hemiGround);
      hemi.current.intensity = envState.hemi;
    }
    scene.environmentIntensity = envState.env;
  });

  return (
    <>
      <mesh ref={sky} material={skyMat} frustumCulled={false} renderOrder={-10}>
        <sphereGeometry args={[500, 48, 24]} />
      </mesh>
      <directionalLight ref={sun} castShadow={!world.mobile} />
      <hemisphereLight ref={hemi} />
    </>
  );
}
