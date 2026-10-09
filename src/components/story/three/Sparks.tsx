"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { onStrike, story } from "@/story/store";
import { drainSparks, emitSparks, type V3 } from "@/story/sparks-bus";
import { glowTexture, rng } from "@/story/textures";
import { FORGE, BUILD } from "@/story/camera-path";
import { byTier, useQuality } from "./quality";
import { scene1Variant } from "@/config/site";
import { WELD_POINT } from "@/story/floor-layout";

/** Where the anvil is struck (the flat heel of the anvil, clear of the DOM editor above it). */
export const ANVIL_STRIKE: V3 = [FORGE[0] + 2.0, FORGE[1] + 2.35, FORGE[2] + 0.25];

const HOT = new THREE.Color("#ffffff");
const CYAN = new THREE.Color("#4fd8f5");
const BLUE = new THREE.Color("#2347c5");

/**
 * Cyan sparks. White-hot at birth, cooling to brand cyan then royal blue as they fade.
 * (No orange: "heat" in this forge is cyan-white.)
 * One pooled THREE.Points object; bursts are queued by hammer strikes (see store.onStrike).
 */
export function Sparks() {
  const { tier } = useQuality();
  const camera = useThree((s) => s.camera);
  const max = byTier(tier, 160, 360, 600);
  const burstScale = byTier(tier, 0.5, 0.8, 1);

  const pool = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(max * 3).fill(9999), 3));
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(max * 3), 3));
    return {
      geo,
      vel: new Float32Array(max * 3),
      age: new Float32Array(max).fill(99),
      ttl: new Float32Array(max).fill(1),
      cursor: 0,
    };
  }, [max]);
  const map = useMemo(() => glowTexture(), []);
  const R = useMemo(() => rng(4242), []);
  const fwd = useRef(new THREE.Vector3());

  // translate hammer strikes into bursts at a sensible place for the current scene
  useEffect(
    () =>
      onStrike((power) => {
        const p = story.smooth;
        let origin: V3;
        let count = 34;
        let cone = 1.05;
        if (p >= 0.2 && p < 0.44) {
          origin = ANVIL_STRIKE;
          count = 46;
        } else if (p >= 0.44 && p < 0.6) {
          origin = [BUILD[0] + (R() - 0.5) * 7, BUILD[1] - 2.6, BUILD[2] + 0.4];
          count = 18;
        } else if (p < 0.2 && scene1Variant === "factory") {
          // the hall: every scroll tick throws a white-cyan burst off the welding station
          origin = [WELD_POINT[0], WELD_POINT[1], WELD_POINT[2]];
          count = 22;
          cone = 1.2;
        } else {
          camera.getWorldDirection(fwd.current);
          const o = camera.position.clone().addScaledVector(fwd.current, 9);
          origin = [o.x + (R() - 0.5) * 3, o.y - 1.6, o.z + (R() - 0.5) * 3];
          count = p < 0.2 ? 14 : 12;
          cone = 1.4;
        }
        emitSparks({ origin, count: Math.round(count * burstScale), power, cone });
      }),
    [camera, burstScale, R],
  );

  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    // spawn
    for (const b of drainSparks()) {
      for (let n = 0; n < b.count; n++) {
        const i = pool.cursor++ % max;
        const cone = b.cone ?? 1.05;
        const theta = R() * cone;
        const phi = R() * Math.PI * 2;
        const speed = (2.2 + R() * 7.5) * (0.55 + b.power * 0.75);
        pool.vel[i * 3] = Math.sin(theta) * Math.cos(phi) * speed;
        pool.vel[i * 3 + 1] = Math.cos(theta) * speed;
        pool.vel[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * speed;
        const pos = pool.geo.attributes.position as THREE.BufferAttribute;
        pos.setXYZ(i, b.origin[0] + (R() - 0.5) * 0.4, b.origin[1], b.origin[2] + (R() - 0.5) * 0.4);
        pool.age[i] = 0;
        pool.ttl[i] = 0.45 + R() * 0.95;
      }
    }
    // integrate
    const pos = pool.geo.attributes.position as THREE.BufferAttribute;
    const col = pool.geo.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < max; i++) {
      if (pool.age[i] >= pool.ttl[i]) continue;
      pool.age[i] += d;
      const t = pool.age[i] / pool.ttl[i];
      if (t >= 1) {
        pos.setXYZ(i, 9999, 9999, 9999);
        col.setXYZ(i, 0, 0, 0);
        continue;
      }
      pool.vel[i * 3 + 1] -= 9.5 * d; // gravity
      const drag = Math.exp(-d * 1.3);
      pool.vel[i * 3] *= drag;
      pool.vel[i * 3 + 2] *= drag;
      pos.setXYZ(i, pos.getX(i) + pool.vel[i * 3] * d, pos.getY(i) + pool.vel[i * 3 + 1] * d, pos.getZ(i) + pool.vel[i * 3 + 2] * d);
      // white-hot -> cyan -> royal, fading to black (additive blending = alpha)
      if (t < 0.25) tmp.copy(HOT).lerp(CYAN, t / 0.25);
      else tmp.copy(CYAN).lerp(BLUE, (t - 0.25) / 0.75);
      const fade = 1 - t * t;
      col.setXYZ(i, tmp.r * fade * 1.6, tmp.g * fade * 1.6, tmp.b * fade * 1.6);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });

  return (
    <points geometry={pool.geo} frustumCulled={false} renderOrder={10}>
      <pointsMaterial
        map={map}
        size={byTier(tier, 0.34, 0.3, 0.28)}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
