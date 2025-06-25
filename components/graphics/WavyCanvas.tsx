"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";
import { cn } from "@/lib/utils";

// ------------------- ElevenLabs Colored Orb Shaders -------------------
// Gradient color presets (we'll default to the "neutral" palette)
// Each stop references a CSS variable so colors follow the design system.
// Fallback hex values ensure the wave still renders if the variable is missing.
const GRADIENT_BLUE = [
  { cssVar: "--color-1", fallback: "#ffffff", alpha: 1, position: 0 },
  { cssVar: "--color-2", fallback: "#ffffff", alpha: 1, position: 0.2 },
  { cssVar: "--color-3", fallback: "#ffffff", alpha: 1, position: 0.3 },
  { cssVar: "--color-4", fallback: "#ffffff", alpha: 1, position: 0.7 },
  { cssVar: "--color-5", fallback: "#ffffff", alpha: 1, position: 0.8 },
  { cssVar: "--color-3", fallback: "#ffffff", alpha: 1, position: 0.9 },
  { cssVar: "--color-1", fallback: "#ffffff", alpha: 1, position: 1 },
] as const;

// Shader taken verbatim from ElevenLabs bundle
const vertexShader = /* glsl */ `#define GLSLIFY 1
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289((x * 34.0 + 10.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec3 perturbNormal(vec3 normal, float noise) {
  return normalize(normal + noise);
}

// Classic Perlin noise, periodic variant
float pnoise(vec3 P, vec3 rep) {
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

uniform float uTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uDensity;
varying vec2 vUv;

void main() {
  vUv = uv;
  float displacement = uAmplitude * pnoise(position * uDensity + uTime * uSpeed, vec3(10.0));
  vec3 newPosition = position + normal * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = /* glsl */ `#define GLSLIFY 1
struct GradientStop {
  vec4 color;
  float position;
};

#define NUM_GRADIENT_STOPS (7)
#define TEXTURE_NOISE_OPACITY (0.006)

varying vec2 vUv;
uniform float uGradientRepeat;
uniform GradientStop uGradientStops[NUM_GRADIENT_STOPS];

void setGradientColor(GradientStop colors[NUM_GRADIENT_STOPS], float factor, out vec4 finalColor) {
  int index = 0;
  float repeatedFactor = fract(factor * uGradientRepeat);

  for (int i = 0; i < NUM_GRADIENT_STOPS - 1; i++) {
    GradientStop currentColor = colors[i];
    if (currentColor.position <= repeatedFactor) {
      index = i;
    }
  }

  GradientStop currentColor = colors[index];
  GradientStop nextColor = colors[index + 1];
  float range = nextColor.position - currentColor.position;
  float lerpFactor = smoothstep(0.0, 1.0, (repeatedFactor - currentColor.position) / range);

  finalColor.rgb = mix(currentColor.color.rgb, nextColor.color.rgb, lerpFactor);
  finalColor.a = mix(currentColor.color.a, nextColor.color.a, lerpFactor);
}

float random(vec2 p) {
  vec2 K1 = vec2(
    23.14069263277926, // e^pi (Gelfond's constant)
    2.665144142690225 // 2^sqrt(2) (Gelfond—Schneider constant)
  );
  return fract(cos(dot(p, K1)) * 12345.6789);
}

void main() {
  vec4 finalColor;
  vec2 uvScreen = gl_FragCoord.xy;

  setGradientColor(uGradientStops, vUv.y, finalColor);

  finalColor.rgb += random(uvScreen) * TEXTURE_NOISE_OPACITY;

  gl_FragColor = finalColor;
}
`;

// Build a drei shaderMaterial with all expected uniforms so TS intellisense works
const WavyShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uAmplitude: 0.2,
    uDensity: 1.1,
    uSpeed: 0.02,
    uGradientRepeat: 3,
    uGradientStops: [],
  },
  vertexShader,
  fragmentShader
);

extend({ WavyShaderMaterial });

type WavyMaterialImpl = THREE.ShaderMaterial & {
  uniforms: {
    uTime: { value: number };
  };
};

function Wave() {
  const materialRef = useRef<WavyMaterialImpl>(null!);
  const { viewport } = useThree();
  const planeWidth = viewport.width;
  const planeHeight = viewport.height;

  // Build gradient stops uniform once
  const gradientStops = useRef(
    GRADIENT_BLUE.map((g) => {
      // Resolve CSS var (e.g. "--color-1") to an HSL string like "hsl(210 100% 63%)"
      let cssValue = "";
      if (typeof window !== "undefined") {
        cssValue = getComputedStyle(document.documentElement)
          .getPropertyValue(g.cssVar)
          .trim();
      }
      // Variable is stored as "H S L" – convert to full hsl() for THREE.Color.
      let colorStr: string;
      if (cssValue) {
        // Convert CSS4 space-separated HSL "210 100% 63%" → "210,100%,63%" so THREE can parse.
        const csv = cssValue.replace(/\s+/g, ",");
        colorStr = `hsl(${csv})`;
      } else {
        colorStr = g.fallback;
      }
      const threeCol = new THREE.Color(colorStr).convertLinearToSRGB();
      return {
        color: new THREE.Vector4(threeCol.r, threeCol.g, threeCol.b, g.alpha),
        position: g.position,
      };
    })
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh rotation={[Math.PI / 2, -Math.PI, 0]}>
      <planeGeometry args={[planeWidth, planeHeight, 128, 64]} />
      {/* @ts-ignore */}
      <wavyShaderMaterial
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
        uGradientStops={gradientStops.current}
      />
    </mesh>
  );
}

export default function WavyCanvas({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none w-full h-[1200px]",
        className
      )}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Wave />
      </Canvas>
    </div>
  );
}
