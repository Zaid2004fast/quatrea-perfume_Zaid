import * as THREE from "three";

/** Photographic cut-out rendered as an upright card that receives fog, a seasonal grade and a light sweep. */
export function createPhotoMaterial(map: THREE.Texture, opts: { sweep?: boolean } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        map: { value: null },
        tint: { value: new THREE.Vector3(1, 1, 1) },
        opacity: { value: 1 },
        sweep: { value: -2 },
        sweepStrength: { value: opts.sweep ? 1 : 0 },
        lift: { value: 0 },
      },
    ]),
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform vec3 tint;
      uniform float opacity;
      uniform float sweep;
      uniform float sweepStrength;
      uniform float lift;
      varying vec2 vUv;
      #include <fog_pars_fragment>
      void main() {
        vec4 c = texture2D(map, vUv);
        if (c.a < 0.02) discard;
        vec3 col = c.rgb * tint + lift;
        // diagonal light sweep across the glass, restrained and soft
        float d = (vUv.x * 0.55 + vUv.y) - sweep;
        float band = exp(-d * d * 140.0) * 0.55 + exp(-d * d * 18.0) * 0.08;
        col += band * sweepStrength * c.a * vec3(1.0, 0.97, 0.92);
        gl_FragColor = vec4(col, c.a * opacity);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
    transparent: true,
    fog: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
}

export const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
    gl_Position.z = gl_Position.w; // pin to far plane
  }`;

export const SKY_FRAG = /* glsl */ `
  uniform vec3 top;
  uniform vec3 horizon;
  uniform vec3 bottom;
  uniform vec3 sunColor;
  uniform vec3 sunDir;
  uniform vec3 fogColor;
  uniform float veil;
  uniform float time;
  varying vec3 vDir;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*noise(p); p*=2.03; a*=0.5; } return s; }

  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = h > 0.0
      ? mix(horizon, top, pow(smoothstep(0.0, 0.62, h), 0.8))
      : mix(horizon, bottom, smoothstep(0.0, -0.25, h));
    // sun glow and disc halo
    float s = max(dot(d, normalize(sunDir)), 0.0);
    col += sunColor * (pow(s, 6.0) * 0.18 + pow(s, 64.0) * 0.35 + pow(s, 900.0) * 1.2);
    // painterly high cloud streaks
    vec2 uv = d.xz / max(h + 0.18, 0.05);
    float c = fbm(uv * 0.55 + vec2(time * 0.004, 0.0));
    float streak = smoothstep(0.55, 0.85, c) * smoothstep(0.0, 0.25, h) * (1.0 - smoothstep(0.35, 0.8, h));
    col = mix(col, mix(horizon, vec3(1.0), 0.35), streak * 0.35);
    // atmospheric membranes swallow the sky too
    col = mix(col, fogColor, veil);
    // subtle dithering to kill banding
    col += (hash(gl_FragCoord.xy + time) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`;

/** Instanced drifting particles — petals, leaves, snow, dust. All motion lives in the vertex shader. */
export function createDriftMaterial(kind: "petal" | "leaf" | "snow" | "dust" | "streak", colorA: string, colorB: string) {
  const kinds = { petal: 0, leaf: 1, snow: 2, dust: 3, streak: 4 };
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uTime: { value: 0 },
        uArea: { value: new THREE.Vector3(10, 6, 10) },
        uSize: { value: 0.1 },
        uFall: { value: 0.2 },
        uSway: { value: 0.4 },
        uOpacity: { value: 1 },
        uColorA: { value: new THREE.Color(colorA) },
        uColorB: { value: new THREE.Color(colorB) },
        uKind: { value: kinds[kind] },
        uWind: { value: new THREE.Vector3() },
      },
    ]),
    vertexShader: /* glsl */ `
      attribute vec3 aBase;
      attribute vec4 aSeed;
      uniform float uTime, uSize, uFall, uSway, uKind;
      uniform vec3 uArea;
      uniform vec3 uWind;
      varying vec2 vUv;
      varying float vShade;
      varying float vSeed;
      #include <fog_pars_vertex>
      mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1,0,0, 0,c,s, 0,-s,c); }
      mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0,-s, 0,1,0, s,0,c); }
      mat3 rotZ(float a){ float c=cos(a), s=sin(a); return mat3(c,s,0, -s,c,0, 0,0,1); }
      void main() {
        vUv = uv;
        vSeed = aSeed.w;
        float t = uTime * (0.55 + aSeed.x * 0.6) + aSeed.y * 40.0;
        vec3 p = aBase;
        p.y = mod(aBase.y - uTime * uFall * (0.6 + aSeed.z * 0.8) + uArea.y * 0.5, uArea.y) - uArea.y * 0.5;
        p.x += sin(t * 0.7 + aSeed.z * 6.28) * uSway;
        p.z += cos(t * 0.53 + aSeed.x * 6.28) * uSway * 0.8;
        // wind carries everything along, wrapping inside the volume
        p += uWind * uTime * (0.7 + aSeed.x * 0.6);
        p.x = mod(p.x + uArea.x * 0.5, uArea.x) - uArea.x * 0.5;
        p.z = mod(p.z + uArea.z * 0.5, uArea.z) - uArea.z * 0.5;
        float size = uSize * (0.55 + aSeed.w * 0.9);
        vec4 mvPosition;
        if (uKind > 3.5) {
          vec3 dir = normalize(uWind + vec3(0.0001));
          vec3 local = dir * position.x * size * 16.0 + vec3(0.0, 1.0, 0.0) * position.y * size * 0.5;
          vShade = 1.0;
          mvPosition = modelViewMatrix * vec4(p + local, 1.0);
        } else if (uKind < 1.5) {
          mat3 r = rotY(t * 0.9) * rotX(t * 1.3 + aSeed.y * 3.0) * rotZ(aSeed.z * 6.28);
          vec3 local = r * vec3(position.xy * size * (uKind > 0.5 ? vec2(0.62, 1.0) : vec2(0.85, 1.0)), 0.0);
          vec3 n = r * vec3(0.0, 0.0, 1.0);
          vShade = 0.72 + 0.28 * abs(n.y);
          mvPosition = modelViewMatrix * vec4(p + local, 1.0);
        } else {
          vShade = 1.0;
          mvPosition = modelViewMatrix * vec4(p, 1.0);
          mvPosition.xy += position.xy * size;
        }
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA, uColorB;
      uniform float uKind, uOpacity;
      varying vec2 vUv;
      varying float vShade;
      varying float vSeed;
      #include <fog_pars_fragment>
      void main() {
        vec2 q = vUv * 2.0 - 1.0;
        float a; vec3 col;
        if (uKind > 3.5) {
          // a breath of wind: a thin luminous streak that fades at both ends
          a = smoothstep(1.0, 0.0, abs(q.y)) * smoothstep(1.0, 0.1, abs(q.x)) * (0.5 + 0.5 * vSeed);
          col = mix(uColorA, uColorB, vSeed);
        } else if (uKind < 0.5) {
          // petal: rounded teardrop with a soft notch and translucent edge
          float y = q.y * 0.5 + 0.5;
          float w = sin(y * 3.14159) * (0.55 + 0.45 * y);
          a = smoothstep(w, w - 0.12, abs(q.x)) * smoothstep(0.98, 0.9, y) * smoothstep(0.0, 0.08, y);
          a *= 1.0 - smoothstep(0.86, 1.0, y) * (1.0 - smoothstep(0.0, 0.16, abs(q.x))) * 0.9;
          col = mix(uColorB, uColorA, smoothstep(0.0, 0.9, y));
          col *= 0.92 + 0.12 * smoothstep(w, 0.0, abs(q.x));
        } else if (uKind < 1.5) {
          // leaf: pointed ellipse with a midrib
          float y = q.y * 0.5 + 0.5;
          float w = pow(sin(y * 3.14159), 0.9) * 0.82;
          a = smoothstep(w, w - 0.08, abs(q.x));
          float rib = smoothstep(0.035, 0.0, abs(q.x)) * 0.35;
          float veins = smoothstep(0.03, 0.0, abs(fract((y - abs(q.x) * 0.7) * 7.0) - 0.5) * 0.12) * 0.12;
          col = mix(uColorA, uColorB, vSeed) * (1.0 - rib - veins);
          // stem
          a = max(a, smoothstep(0.03, 0.0, abs(q.x)) * step(y, 0.08));
        } else if (uKind < 2.5) {
          float r = length(q);
          a = smoothstep(1.0, 0.25, r);
          col = mix(uColorA, uColorB, vSeed);
        } else {
          float r = length(q);
          a = pow(smoothstep(1.0, 0.0, r), 2.2);
          col = mix(uColorA, uColorB, vSeed);
        }
        if (a < 0.01) discard;
        gl_FragColor = vec4(col * vShade, a * uOpacity);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    fog: true,
    side: THREE.DoubleSide,
    blending: kind === "dust" ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

/** Curling incense smoke, a single soft card. */
export function createSmokeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 }, uColor: { value: new THREE.Color("#dfe7f4") }, uOpacity: { value: 0.5 } }]),
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      #include <fog_pars_vertex>
      void main(){
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position,1.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uOpacity; uniform vec3 uColor; varying vec2 vUv;
      #include <fog_pars_fragment>
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
      float fbm(vec2 p){ float a=0.5,s=0.0; for(int i=0;i<5;i++){ s+=a*noise(p); p*=2.1; a*=0.5;} return s; }
      void main(){
        vec2 uv = vUv;
        float t = uTime * 0.12;
        float bend = sin(uv.y * 5.0 - t * 4.0) * 0.08 * uv.y + (fbm(vec2(uv.y * 2.0, t)) - 0.5) * 0.35 * uv.y;
        float x = uv.x - 0.5 - bend;
        float width = mix(0.02, 0.32, pow(uv.y, 1.3));
        float core = exp(-x * x / (width * width * 0.5));
        float n = fbm(vec2(x * 6.0, uv.y * 3.0 - t * 3.0));
        float a = core * smoothstep(0.0, 0.12, uv.y) * smoothstep(1.0, 0.45, uv.y) * smoothstep(0.25, 0.8, n + core * 0.3);
        gl_FragColor = vec4(uColor, a * uOpacity);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    fog: true,
    side: THREE.DoubleSide,
  });
}

/** Soft radial contact shadow texture. */
let contactTex: THREE.Texture | null = null;
export function getContactTexture() {
  if (contactTex) return contactTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(0,0,0,0.85)");
  grd.addColorStop(0.35, "rgba(0,0,0,0.45)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  contactTex = new THREE.CanvasTexture(c);
  return contactTex;
}
