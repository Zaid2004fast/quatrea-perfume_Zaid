"use client";
import * as THREE from "three";
import { Cloud, Clouds } from "@react-three/drei";
import { world } from "@/lib/world-store";

/**
 * Cloud banks are the transitions between worlds, as in the reference film:
 * the camera dives through a sea of cloud into spring, and every later season
 * is reached through its own atmospheric membrane.
 */
export function Atmosphere() {
  const m = world.mobile;
  const seg = (n: number) => Math.ceil(n * (m ? 0.35 : 0.5));
  return (
    <Clouds material={THREE.MeshLambertMaterial} texture="/img/fx/cloud1.webp" limit={m ? 140 : 240} frustumCulled={false}>
      {/* ACT I — the sea of cloud beneath the arrival stone */}
      <Cloud seed={1} segments={seg(46)} bounds={[22, 1.6, 9]} volume={16} position={[0, -4.6, -2]} color="#f6efe9" fade={20} speed={0.08} opacity={0.95} />
      <Cloud seed={2} segments={seg(36)} bounds={[26, 1.8, 10]} volume={18} position={[-6, -5.2, -16]} color="#f3ebe4" fade={20} speed={0.06} />
      <Cloud seed={3} segments={seg(36)} bounds={[26, 1.8, 10]} volume={18} position={[10, -5.4, -24]} color="#f1e8e1" fade={20} speed={0.06} />
      <Cloud seed={4} segments={seg(30)} bounds={[30, 2, 10]} volume={20} position={[0, -6, -36]} color="#eee4dc" fade={24} speed={0.05} />
      <Cloud seed={5} segments={seg(18)} bounds={[16, 1.4, 6]} volume={11} position={[0, -4.3, 10]} color="#f6efe9" fade={14} speed={0.07} />
      {/* low mist hugging the spring meadow and finale stone */}
      <Cloud seed={21} segments={seg(18)} bounds={[22, 0.6, 8]} volume={8} position={[6, -11.2, -55]} color="#f3ebe4" fade={12} speed={0.04} opacity={0.6} />
      <Cloud seed={22} segments={seg(24)} bounds={[24, 1, 10]} volume={12} position={[0, -12.4, -250]} color="#f1e9e2" fade={12} speed={0.05} opacity={0.85} />
    </Clouds>
  );
}
