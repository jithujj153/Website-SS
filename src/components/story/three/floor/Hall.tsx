"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { glowTexture, rng } from "@/story/textures";
import { shaftTexture, windowStripTexture } from "@/story/floor-textures";
import { HALL, MANAGER } from "@/story/floor-layout";
import { byTier, useQuality } from "../quality";
import { Inst, kit, type Item } from "./kit";

/** The hall shell: floor, walls, high windows, roof trusses, gantry lamps, light shafts, haze, crane chains, railings. */

const LAMP_X = [-6, 6];
const LAMP_Z = [6, -6, -18, -30, -42];

export function HallShell() {
  const k = kit();
  const { tier } = useQuality();
  const glow = useMemo(() => glowTexture(), []);
  const shaft = useMemo(() => shaftTexture(), []);
  const win = useMemo(() => windowStripTexture(), []);

  const mats = useMemo(
    () => ({
      shaft: new THREE.MeshBasicMaterial({ map: shaft, color: new THREE.Color("#a9cdff").multiplyScalar(0.9), transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
      window: new THREE.MeshBasicMaterial({ map: win, color: new THREE.Color("#ffffff").multiplyScalar(1.5), toneMapped: false }),
      lamp: new THREE.MeshBasicMaterial({ color: new THREE.Color("#eaf6ff").multiplyScalar(3.2), toneMapped: false }),
      line: new THREE.MeshBasicMaterial({ color: new THREE.Color("#7f9bd6").multiplyScalar(0.7), toneMapped: false }),
      pad: new THREE.MeshBasicMaterial({ color: "#0f1b3b" }),
      edge: new THREE.MeshBasicMaterial({ color: new THREE.Color("#2db7db").multiplyScalar(1.4), toneMapped: false }),
    }),
    [shaft, win],
  );

  const data = useMemo(() => {
    const R = rng(3);
    // roof trusses + long beams
    const trusses: Item[] = [];
    for (let z = 14; z > HALL.back; z -= 6) trusses.push({ p: [0, 15, z], s: [HALL.halfW * 2, 0.35, 0.35] });
    for (const x of [-9, 0, 9]) trusses.push({ p: [x, 14.55, -20], s: [0.4, 0.4, 80] });
    // wall windows
    const zs = byTier(tier, [8, -10, -28, -46], [10, 0, -10, -20, -30, -40, -50], [10, 0, -10, -20, -30, -40, -50]);
    const windows: Item[] = [];
    for (const z of zs) {
      windows.push({ p: [HALL.halfW - 0.05, 12.2, z], s: [8, 2.2, 1], r: [0, -Math.PI / 2, 0] });
      windows.push({ p: [-HALL.halfW + 0.05, 12.2, z], s: [8, 2.2, 1], r: [0, Math.PI / 2, 0] });
    }
    // slanted shafts from the windows (two crossing sheets each) and vertical shafts under the lamps
    const shafts: Item[] = [];
    const slant = Math.atan2(9.6, 12.2);
    zs.filter((_, i) => i % 2 === 0 || tier === 2).forEach((z) => {
      for (const side of [1, -1]) {
        const rz = -side * slant;
        shafts.push({ p: [side * 10.8, 6.1, z], s: [3.4, 15.5, 1], r: [0, 0, rz] });
        shafts.push({ p: [side * 10.8, 6.1, z], s: [3.4, 15.5, 1], r: [0, Math.PI / 2, rz] });
      }
    });
    const lamps: Item[] = [];
    const lampXY = (x: number, z: number) => {
      lamps.push({ p: [x, 13.7, z], s: [0.9, 0.12, 0.9] });
      shafts.push({ p: [x, 6.85, z], s: [4.4, 13.7, 1], r: [0, 0, 0] });
      shafts.push({ p: [x, 6.85, z], s: [4.4, 13.7, 1], r: [0, Math.PI / 2, 0] });
    };
    const lz = byTier(tier, LAMP_Z.slice(0, 3), LAMP_Z, LAMP_Z);
    for (const z of lz) for (const x of LAMP_X) lampXY(x, z);
    lampXY(MANAGER[0], MANAGER[2]); // the lamp over the manager
    // floor markings: safety lanes and zone pads
    const lines: Item[] = [
      { p: [-3.2, 0.012, -20], s: [0.1, 0.01, 70] },
      { p: [3.2, 0.012, -20], s: [0.1, 0.01, 70] },
      { p: [0, 0.012, -11.5], s: [30, 0.01, 0.1] },
      { p: [0, 0.012, -24.5], s: [30, 0.01, 0.1] },
    ];
    const pads: Item[] = [
      { p: [-11.5, 0.008, -14], s: [9, 0.01, 44] },
      { p: [8.2, 0.008, -14], s: [11, 0.01, 44] },
      { p: [2.8, 0.008, -17.2], s: [8, 0.01, 4.4] },
    ];
    // hall dust-lit haze sprites
    const haze = [8, -2, -12, -24, -36, -46].map((z, i) => ({ z, o: 0.07 + R() * 0.04, y: 4 + (i % 2) * 2 }));
    return { trusses, windows, shafts, lamps, lines, pads, haze, lampPos: lz.flatMap((z) => LAMP_X.map((x) => [x, z] as [number, number])).concat([[MANAGER[0], MANAGER[2]]]) };
  }, [tier]);

  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, (HALL.front + HALL.back) / 2]}>
        <planeGeometry args={[HALL.halfW * 2, HALL.front - HALL.back]} />
        {tier === 2 ? (
          <MeshReflectorMaterial blur={[260, 90]} resolution={384} mixBlur={1} mixStrength={16} mixContrast={1.1} roughness={0.9} depthScale={0.5} minDepthThreshold={0.4} maxDepthThreshold={1.3} color="#0a1226" metalness={0.5} mirror={0} />
        ) : (
          <primitive object={k.m.floor} attach="material" />
        )}
      </mesh>
      <Inst items={data.pads} geometry={k.box} material={mats.pad} />
      <Inst items={data.lines} geometry={k.box} material={mats.line} />
      {/* walls */}
      <mesh position={[0, 8, HALL.back]} material={k.m.wall}>
        <planeGeometry args={[HALL.halfW * 2, 16]} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * HALL.halfW, 8, (HALL.front + HALL.back) / 2]} rotation-y={-s * (Math.PI / 2)} material={k.m.wall}>
          <planeGeometry args={[HALL.front - HALL.back, 16]} />
        </mesh>
      ))}
      <Inst items={data.windows} geometry={k.plane} material={mats.window} />
      <Inst items={data.trusses} geometry={k.box} material={k.m.darkSteel} />
      <Inst items={data.lamps} geometry={k.cyl} material={mats.lamp} />
      <Inst items={data.shafts} geometry={k.plane} material={mats.shaft} />
      {/* lamp glow + haze layers */}
      {data.lampPos.map(([x, z], i) => (
        <sprite key={i} position={[x, 13.4, z]} scale={[6.5, 6.5, 1]}>
          <spriteMaterial map={glow} color="#bfe0ff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </sprite>
      ))}
      {data.haze.map((h, i) => (
        <sprite key={i} position={[0, h.y, h.z]} scale={[50, 16, 1]}>
          <spriteMaterial map={glow} color="#6f94d8" transparent opacity={h.o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </sprite>
      ))}
      {/* the manager's pool of light on the floor */}
      <mesh position={[MANAGER[0], 0.03, MANAGER[2]]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[7, 7]} />
        <meshBasicMaterial map={glow} color="#8fd6ff" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[MANAGER[0], 0.035, MANAGER[2]]} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 4}>
        <ringGeometry args={[1.05, 1.1, 4]} />
        <primitive object={mats.edge} attach="material" />
      </mesh>
      <Crane />
      <Railings />
    </group>
  );
}

function Chain({ x, z, top = 14, len = 14, phase = 0 }: { x: number; z: number; top?: number; len?: number; phase?: number }) {
  const k = kit();
  const g = useRef<THREE.Group>(null!);
  const links = useMemo<Item[]>(() => Array.from({ length: len }, (_, i) => ({ p: [0, -i * 0.2, 0], s: i % 2 ? [0.07, 0.24, 0.13] : [0.13, 0.24, 0.07] })), [len]);
  useFrame((s) => {
    g.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.45 + phase) * 0.035;
    g.current.rotation.x = Math.cos(s.clock.elapsedTime * 0.37 + phase) * 0.025;
  });
  return (
    <group ref={g} position={[x, top, z]}>
      <Inst items={links} geometry={k.box} material={k.m.steel} />
      <mesh geometry={k.box} material={k.m.silver} position={[0, -len * 0.2 - 0.18, 0]} scale={[0.34, 0.3, 0.24]} />
      <mesh geometry={k.box} material={k.m.hot} position={[0, -len * 0.2 - 0.36, 0]} scale={[0.1, 0.06, 0.1]} />
    </group>
  );
}

/** Overhead crane: a bridge slowly crossing the hall with hanging chains (foreground depth) */
function Crane() {
  const k = kit();
  const bridge = useRef<THREE.Group>(null!);
  useFrame((s) => {
    bridge.current.position.z = -2 + Math.sin(s.clock.elapsedTime * 0.07) * 14;
  });
  return (
    <group>
      {[-12, 12].map((x) => (
        <mesh key={x} geometry={k.box} material={k.m.steel} position={[x, 13.2, -20]} scale={[0.5, 0.5, 80]} />
      ))}
      <group ref={bridge}>
        <mesh geometry={k.box} material={k.m.body} position={[0, 13.1, 0]} scale={[24, 0.7, 0.9]} />
        <mesh geometry={k.box} material={k.m.cyan} position={[0, 12.72, 0.46]} scale={[24, 0.03, 0.03]} />
        <group position={[3.4, 0, 0]}>
          <Chain x={0} z={0} top={12.7} len={12} phase={1} />
        </group>
      </group>
      <Chain x={-3.6} z={9} len={15} phase={0.3} />
      <Chain x={2.7} z={7.2} len={13} phase={2.2} top={13.6} />
      <Chain x={-9} z={2} len={14} phase={4} top={13.4} />
    </group>
  );
}

/** Catwalk railings on the near left and right edges (foreground layer) */
function Railings() {
  const k = kit();
  const items = useMemo(() => {
    const posts: Item[] = [], rails: Item[] = [];
    for (const [a, b] of [[-15.5, -7], [7, 15.5]]) {
      for (let x = a; x <= b + 0.01; x += 1.5) posts.push({ p: [x, 9.8, 13.4], s: [0.09, 1.9, 0.09] });
      rails.push({ p: [(a + b) / 2, 10.65, 13.4], s: [b - a, 0.08, 0.08] }, { p: [(a + b) / 2, 10.15, 13.4], s: [b - a, 0.06, 0.06] });
      rails.push({ p: [(a + b) / 2, 8.85, 12.4], s: [b - a, 0.14, 2.1] });
    }
    return { posts, rails };
  }, []);
  return (
    <group>
      <Inst items={items.posts} geometry={k.box} material={k.m.silver} />
      <Inst items={items.rails} geometry={k.box} material={k.m.steel} />
    </group>
  );
}
