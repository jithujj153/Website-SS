"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/story/store";
import { remap } from "@/story/ranges";
import { rng, glowTexture } from "@/story/textures";
import { clockTexture, jobCardTexture } from "@/story/floor-textures";
import { CLOCK_POS, FLOOR_BEATS, GLASS_OFFICE as O } from "@/story/floor-layout";
import { Inst, kit, lerp, smooth, type Item } from "./kit";
import { byTier, useQuality } from "../quality";

/** Raised glass floor office behind the manager: board of paper job cards, desk, shift clock reading 11:40. */
export function GlassOffice() {
  const k = kit();
  const clock = useMemo(() => clockTexture("11:40"), []);
  const glow = useMemo(() => glowTexture(), []);
  const clockMat = useMemo(() => new THREE.MeshBasicMaterial({ map: clock, color: new THREE.Color("#ffffff").multiplyScalar(1.25), toneMapped: false }), [clock]);
  const frame = useMemo<Item[]>(() => {
    const out: Item[] = [];
    const y0 = O.y, h = O.h, w = O.w, d = O.d;
    // mullions along the front and sides, top and bottom bars
    for (let i = 0; i <= 6; i++) out.push({ p: [-w / 2 + (i * w) / 6, y0 + h / 2 + 0.15, O.z + d / 2], s: [0.08, h, 0.08] });
    for (const sx of [-1, 1]) for (let j = 0; j <= 2; j++) out.push({ p: [sx * (w / 2), y0 + h / 2 + 0.15, O.z + d / 2 - (j * d) / 2], s: [0.08, h, 0.08] });
    out.push({ p: [0, y0 + 0.2, O.z + d / 2], s: [w, 0.1, 0.1] }, { p: [0, y0 + h + 0.2, O.z + d / 2], s: [w, 0.12, 0.12] });
    for (const sx of [-1, 1]) {
      out.push({ p: [sx * (w / 2), y0 + h + 0.2, O.z], s: [0.12, 0.12, d] });
    }
    return out;
  }, []);
  const stilts = useMemo<Item[]>(() => [-5.4, -1.8, 1.8, 5.4].flatMap((x) => [O.z + O.d / 2 - 0.3, O.z - O.d / 2 + 0.3].map((z) => ({ p: [x, O.y / 2, z] as [number, number, number], s: [0.3, O.y, 0.3] as [number, number, number] }))), []);
  const steps = useMemo<Item[]>(() => Array.from({ length: 12 }, (_, i) => ({ p: [O.w / 2 + 1.2 + (11 - i) * 0.0, i * 0.28 + 0.14, O.z + 1 - i * 0.4] as [number, number, number], s: [1.6, 0.08, 0.5] as [number, number, number] })), []);

  return (
    <group>
      <mesh geometry={k.box} material={k.m.steel} position={[O.x, O.y, O.z]} scale={[O.w + 0.6, 0.3, O.d + 0.6]} />
      <Inst items={stilts} geometry={k.box} material={k.m.darkSteel} />
      <Inst items={steps} geometry={k.box} material={k.m.silver} />
      {/* glass + frame */}
      <mesh geometry={k.plane} material={k.m.glass} position={[O.x, O.y + O.h / 2 + 0.15, O.z + O.d / 2]} scale={[O.w, O.h, 1]} />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={k.plane} material={k.m.glass} position={[s * (O.w / 2), O.y + O.h / 2 + 0.15, O.z]} rotation-y={Math.PI / 2} scale={[O.d, O.h, 1]} />
      ))}
      <Inst items={frame} geometry={k.box} material={k.m.darkSteel} />
      <mesh geometry={k.box} material={k.m.darkSteel} position={[O.x, O.y + O.h + 0.3, O.z]} scale={[O.w + 0.4, 0.2, O.d + 0.4]} />
      {/* interior: warm-free cool light, desk with screens, back board */}
      <mesh geometry={k.box} material={k.m.hot} position={[O.x, O.y + O.h + 0.17, O.z]} scale={[O.w - 1, 0.02, 0.5]} />
      <mesh position={[O.x, O.y + 2.0, O.z]} scale={[14, 6, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={glow} color="#6fa8ff" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh geometry={k.box} material={k.m.body} position={[-2.5, O.y + 0.95, O.z + 0.6]} scale={[3.2, 0.08, 1.1]} />
      <mesh geometry={k.box} material={k.m.screen} position={[-3.1, O.y + 1.55, O.z + 0.35]} scale={[0.9, 0.5, 0.04]} />
      <mesh geometry={k.box} material={k.m.screen} position={[-1.9, O.y + 1.55, O.z + 0.35]} scale={[0.9, 0.5, 0.04]} />
      <mesh geometry={k.box} material={k.m.darkSteel} position={[O.x, O.y + 2.5, O.z - O.d / 2 + 0.12]} scale={[9.6, 2.7, 0.08]} />
      <JobCards />
      {/* shift clock on brackets above the office */}
      <mesh position={[CLOCK_POS[0], CLOCK_POS[1], CLOCK_POS[2]]} material={clockMat} scale={[3.4, 1.5, 1]}>
        <planeGeometry />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} geometry={k.box} material={k.m.darkSteel} position={[x, CLOCK_POS[1] + 1.8, CLOCK_POS[2] - 0.05]} scale={[0.05, 2.6, 0.05]} />
      ))}
    </group>
  );
}

/** Paper job cards: pinned on the board, then they scatter across the floor when the questions pile up. */
function JobCards() {
  const { tier } = useQuality();
  const ref = useRef<THREE.InstancedMesh>(null!);
  const tex = useMemo(() => jobCardTexture(7), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide, emissive: "#9fb7e6", emissiveMap: tex, emissiveIntensity: 0.28 }), [tex]);
  const geo = useMemo(() => new THREE.PlaneGeometry(0.42, 0.55), []);
  const N = byTier(tier, 24, 40, 56);
  const cards = useMemo(() => {
    const R = rng(55);
    const cols = Math.ceil(N / 4);
    return Array.from({ length: N }, (_, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      return {
        home: [O.x + (c - (cols - 1) / 2) * 0.66, O.y + 3.4 - r * 0.7, O.z - O.d / 2 + 0.18] as [number, number, number],
        tgt: [(R() - 0.5) * 15, 0.1 + R() * 0.9, -4 - R() * 18] as [number, number, number],
        lift: 3 + R() * 6,
        spin: [(R() - 0.5) * 9, (R() - 0.5) * 9, (R() - 0.5) * 7] as [number, number, number],
        delay: R() * 0.45,
        flutter: R() * 6.28,
      };
    });
  }, [N]);
  const d = useMemo(() => new THREE.Object3D(), []);
  const jitter = useMemo(() => cards.map((c) => (c.flutter % 1) * 0.06), [cards]);

  useLayoutEffect(() => {
    cards.forEach((c, i) => {
      d.position.set(...c.home);
      d.rotation.set(0, 0, (jitter[i] - 0.03) * 2);
      d.scale.setScalar(1);
      d.updateMatrix();
      ref.current.setMatrixAt(i, d.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [cards, d, jitter]);

  useFrame((s) => {
    const p = story.smooth;
    const t = s.clock.elapsedTime;
    const base = remap(p, FLOOR_BEATS.scatter[0], FLOOR_BEATS.scatter[1]);
    for (let i = 0; i < N; i++) {
      const c = cards[i];
      const u = smooth(remap(base, c.delay, c.delay + 0.55));
      if (u <= 0) {
        d.position.set(...c.home);
        d.rotation.set(0, 0, (jitter[i] - 0.03) * 2);
      } else {
        const fly = Math.sin(Math.PI * Math.min(1, u * 1.15)) * c.lift;
        const settle = u > 0.98 ? Math.sin(t * 0.9 + c.flutter) * 0.04 : 0;
        d.position.set(lerp(c.home[0], c.tgt[0], u), lerp(c.home[1], c.tgt[1], u) + fly * (1 - u) * 0.6 + settle, lerp(c.home[2], c.tgt[2], u));
        d.rotation.set(c.spin[0] * (1 - u) + (u > 0.5 ? -Math.PI / 2 * u * 0.9 : 0), c.spin[1] * (1 - u), c.spin[2] * (1 - u));
      }
      d.scale.setScalar(1 + u * 0.8);
      d.updateMatrix();
      ref.current.setMatrixAt(i, d.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, N]} frustumCulled={false} />;
}
