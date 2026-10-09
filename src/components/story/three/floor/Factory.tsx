"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/story/store";
import { emitSparks } from "@/story/sparks-bus";
import { remap } from "@/story/ranges";
import { rng } from "@/story/textures";
import { beltTexture } from "@/story/floor-textures";
import { WELD_POINT, FLOOR_BEATS } from "@/story/floor-layout";
import { byTier, useQuality } from "../quality";
import { Inst, kit, lerp, smooth, type Item, type V3 } from "./kit";
import { Person, applyArms, mixPose, useRig, type Pose } from "./People";

/* ============================================================ INVENTORY */

/** Tall racks with pallets and crates (4 instanced meshes for ~500 parts). */
export function Racks() {
  const { tier } = useQuality();
  const k = kit();
  const { uprights, beams, pallets, crates } = useMemo(() => {
    const R = rng(11);
    const xs = byTier(tier, [-9.8], [-9.8, -13.2], [-9.8, -13.2]);
    const bays = byTier(tier, 5, 9, 11);
    const bay = 3.4;
    const z0 = 6;
    const levels = [0.2, 1.95, 3.7, 5.45];
    const palette = ["#3b4a73", "#4a5d85", "#2c3a63", "#5f78a8", "#6f86ad", "#34456f"];
    const uprights: Item[] = [], beams: Item[] = [], pallets: Item[] = [], crates: Item[] = [];
    for (const x of xs) {
      for (let i = 0; i <= bays; i++) for (const dx of [-0.55, 0.55]) uprights.push({ p: [x + dx, 3.55, z0 - i * bay], s: [0.13, 7.1, 0.13], c: "#1f3fae" });
      for (let b = 0; b < bays; b++) {
        const zc = z0 - b * bay - bay / 2;
        for (const y of levels) {
          for (const dx of [-0.55, 0.55]) beams.push({ p: [x + dx, y, zc], s: [0.07, 0.15, bay], c: "#8fa3c4" });
          for (const dz of [-0.82, 0.82]) {
            pallets.push({ p: [x, y + 0.14, zc + dz], s: [1.0, 0.13, 1.4], c: "#18213f" });
            if (R() < 0.74) {
              const h = 0.45 + R() * 0.55;
              crates.push({ p: [x + (R() - 0.5) * 0.06, y + 0.2 + h / 2, zc + dz], s: [0.92, h, 1.22], c: palette[Math.floor(R() * palette.length)] });
            }
          }
        }
      }
    }
    return { uprights, beams, pallets, crates };
  }, [tier]);
  return (
    <group>
      <Inst items={uprights} geometry={k.box} material={k.m.rackBlue} />
      <Inst items={beams} geometry={k.box} material={k.m.silver} />
      <Inst items={pallets} geometry={k.box} material={k.m.pallet} />
      <Inst items={crates} geometry={k.box} material={k.m.crate} />
    </group>
  );
}

/** A slow forklift shuttling down the aisle with a loaded pallet. Royal blue body, cyan beacon. */
export function Forklift() {
  const k = kit();
  const g = useRef<THREE.Group>(null!);
  const beacon = useRef<THREE.Mesh>(null!);
  useFrame((s) => {
    const t = s.clock.elapsedTime * 0.028;
    const u = (t % 2) as number;
    const fwd = u < 1;
    const e = smooth(fwd ? u : u - 1);
    g.current.position.set(-5.4, 0, lerp(4, -30, fwd ? e : 1 - e));
    g.current.rotation.y = fwd ? 0 : Math.PI;
    (beacon.current.material as THREE.MeshBasicMaterial).color.set("#2db7db").multiplyScalar(Math.sin(s.clock.elapsedTime * 6) > 0 ? 3 : 0.4);
  });
  return (
    <group ref={g}>
      <mesh geometry={k.box} material={k.m.rackBlue} position={[0, 0.55, 0.35]} scale={[1.1, 0.7, 1.7]} />
      <mesh geometry={k.box} material={k.m.darkSteel} position={[0, 0.25, 0.4]} scale={[1.15, 0.3, 1.6]} />
      <mesh geometry={k.box} material={k.m.darkSteel} position={[0, 1.0, -0.2]} scale={[0.9, 0.08, 0.95]} />
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} geometry={k.box} material={k.m.darkSteel} position={[x, 1.55, -0.2]} scale={[0.06, 1.0, 0.06]} />
      ))}
      <mesh geometry={k.box} material={k.m.darkSteel} position={[0, 2.05, -0.2]} scale={[1.0, 0.06, 1.0]} />
      <mesh geometry={k.box} material={k.m.steel} position={[0, 1.25, -1.0]} scale={[0.9, 2.5, 0.12]} />
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} geometry={k.box} material={k.m.silver} position={[x, 0.12, -1.8]} scale={[0.1, 0.08, 1.6]} />
      ))}
      {/* the load */}
      <mesh geometry={k.box} material={k.m.pallet} position={[0, 0.3, -1.8]} scale={[1.0, 0.13, 1.1]} />
      <mesh geometry={k.box} material={k.m.body2} position={[0, 0.85, -1.8]} scale={[0.9, 0.95, 0.95]} />
      {([[-0.5, 0.25], [0.5, 0.25], [-0.5, 0.95], [0.5, 0.95]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} geometry={k.cyl} material={k.m.darkSteel} position={[x, 0.3, z]} rotation-z={Math.PI / 2} scale={[0.3, 0.2, 0.3]} />
      ))}
      <mesh ref={beacon} geometry={k.sphere} material={new THREE.MeshBasicMaterial({ toneMapped: false })} position={[0, 2.18, -0.2]} scale={0.08} />
    </group>
  );
}

/* ============================================================ PRODUCTION */

interface MachineDef {
  id: string;
  p: V3;
  ry: number;
  s: V3;
}
const MACHINES: MachineDef[] = [
  { id: "cncA", p: [11.2, 0, -1], ry: Math.PI, s: [2.6, 2.7, 3.2] },
  { id: "cncB", p: [11.2, 0, -9], ry: Math.PI, s: [2.6, 2.7, 3.2] },
  { id: "press", p: [11.4, 0, -18], ry: Math.PI, s: [3.0, 3.6, 3.4] },
  { id: "cncC", p: [11.2, 0, -27], ry: Math.PI, s: [2.6, 2.7, 3.2] },
  { id: "cncD", p: [3.0, 0, -22], ry: 0, s: [2.4, 2.5, 3.0] },
];
export const IDLE_MACHINE = "cncB";

const CONVEYOR_X = 7.4;
const C_LEN = 40;

export function Conveyor() {
  const k = kit();
  const { tier } = useQuality();
  const belt = useMemo(() => {
    const t = beltTexture();
    t.repeat.set(1, C_LEN / 0.8);
    return t;
  }, []);
  const beltMat = useMemo(() => new THREE.MeshStandardMaterial({ map: belt, roughness: 0.6, metalness: 0.2 }), [belt]);
  const boxes = useRef<THREE.InstancedMesh>(null!);
  const cyls = useRef<THREE.InstancedMesh>(null!);
  const n = byTier(tier, 12, 20, 28);
  const d = useMemo(() => new THREE.Object3D(), []);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    belt.offset.y = (t * 0.9) / 0.8;
    for (let i = 0; i < n; i++) {
      const z = 7 - ((t * 0.9 + i * (C_LEN / n)) % C_LEN);
      d.position.set(CONVEYOR_X, i % 2 ? 0.96 : 0.92, z);
      d.rotation.set(0, 0, 0);
      if (i % 2) d.scale.set(0.2, 0.3, 0.2);
      else d.scale.set(0.46, 0.22, 0.6);
      d.updateMatrix();
      (i % 2 ? cyls : boxes).current.setMatrixAt(i >> 1, d.matrix);
    }
    boxes.current.instanceMatrix.needsUpdate = true;
    cyls.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh geometry={k.box} material={k.m.darkSteel} position={[CONVEYOR_X, 0.4, 7 - C_LEN / 2]} scale={[1.0, 0.8, C_LEN]} />
      <mesh position={[CONVEYOR_X, 0.805, 7 - C_LEN / 2]} rotation-x={-Math.PI / 2} material={beltMat}>
        <planeGeometry args={[0.8, C_LEN]} />
      </mesh>
      {[-0.46, 0.46].map((dx) => (
        <mesh key={dx} geometry={k.box} material={k.m.silver} position={[CONVEYOR_X + dx, 0.88, 7 - C_LEN / 2]} scale={[0.06, 0.16, C_LEN]} />
      ))}
      {/* parts riding the belt */}
      <instancedMesh ref={boxes} args={[k.box, k.m.body2, Math.ceil(n / 2)]} frustumCulled={false} />
      <instancedMesh ref={cyls} args={[k.cyl, k.m.silver, Math.ceil(n / 2)]} frustumCulled={false} />
    </group>
  );
}

function Machine({ def, press = false }: { def: MachineDef; press?: boolean }) {
  const k = kit();
  const ram = useRef<THREE.Group>(null!);
  const [w, h, dpt] = def.s;
  useFrame((s) => {
    if (press) ram.current.position.y = 1.2 + 0.9 * Math.abs(Math.sin(s.clock.elapsedTime * 1.3));
  });
  return (
    <group position={def.p} rotation-y={def.ry}>
      {/* local +x is the machine's front (it faces the conveyor) after rotation; body is w deep, dpt wide */}
      <mesh geometry={k.box} material={k.m.body} position={[0, h / 2, 0]} scale={[w, h, dpt]} />
      <mesh geometry={k.box} material={k.m.silver} position={[0, h + 0.04, 0]} scale={[w + 0.08, 0.08, dpt + 0.08]} />
      <mesh geometry={k.box} material={k.m.darkSteel} position={[0, 0.12, 0]} scale={[w + 0.1, 0.24, dpt + 0.1]} />
      {press ? (
        <>
          <mesh geometry={k.box} material={k.m.darkSteel} position={[w / 2 + 0.02, h * 0.55, 0]} scale={[0.1, h * 0.55, dpt * 0.7]} />
          <group ref={ram} position={[w / 2 + 0.55, 1.2, 0]}>
            <mesh geometry={k.box} material={k.m.silver} position={[0, 0.9, 0]} scale={[0.6, 0.55, 1.3]} />
            <mesh geometry={k.box} material={k.m.steel} position={[0, 1.6, 0]} scale={[0.22, 1.2, 0.22]} />
          </group>
          <mesh geometry={k.box} material={k.m.darkSteel} position={[w / 2 + 0.55, 0.45, 0]} scale={[0.8, 0.5, 1.5]} />
        </>
      ) : (
        <>
          {/* front window (glowing work area) + control pad */}
          <mesh geometry={k.box} material={k.m.screen} position={[w / 2 + 0.005, h * 0.55, -dpt * 0.12]} scale={[0.02, h * 0.42, dpt * 0.5]} />
          <mesh geometry={k.box} material={k.m.darkSteel} position={[w / 2 + 0.04, h * 0.56, dpt * 0.38]} scale={[0.08, h * 0.35, dpt * 0.18]} />
        </>
      )}
    </group>
  );
}

function machineLights() {
  const out: { p: V3; hue: "cyan" | "blue" | "hot"; ph: number; machine: string }[] = [];
  let ph = 0;
  for (const m of MACHINES) {
    const c = Math.cos(m.ry), sn = Math.sin(m.ry);
    const local: V3[] = [
      [m.s[0] / 2 + 0.05, m.s[1] * 0.9, -m.s[2] * 0.3],
      [m.s[0] / 2 + 0.05, m.s[1] * 0.9, 0],
      [m.s[0] / 2 + 0.05, m.s[1] * 0.9, m.s[2] * 0.3],
      [m.s[0] / 2 + 0.08, m.s[1] * 0.7, m.s[2] * 0.38],
      [m.s[0] / 2 + 0.08, m.s[1] * 0.62, m.s[2] * 0.38],
    ];
    for (const l of local) {
      const x = l[0] * c + l[2] * sn;
      const z = -l[0] * sn + l[2] * c;
      out.push({ p: [m.p[0] + x, l[1], m.p[2] + z], hue: (["cyan", "blue", "hot"] as const)[ph % 3], ph: ph * 1.37, machine: m.id });
      ph++;
    }
  }
  return out;
}

/** Blue / cyan indicator lights across the line; the idle machine's lights stop blinking and one turns red. */
function Indicators() {
  const k = kit();
  const ref = useRef<THREE.InstancedMesh>(null!);
  const beacon = useRef<THREE.Mesh>(null!);
  const halo = useRef<THREE.Sprite>(null!);
  const lights = useMemo(machineLights, []);
  const cols = useMemo(() => ({ cyan: new THREE.Color("#2db7db"), blue: new THREE.Color("#3a63e8"), hot: new THREE.Color("#d9fbff") }), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const idleDef = MACHINES.find((m) => m.id === IDLE_MACHINE)!;
  const frame = useRef(0);

  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    lights.forEach((l, i) => {
      d.position.set(...l.p);
      d.scale.setScalar(0.07);
      d.updateMatrix();
      ref.current.setMatrixAt(i, d.matrix);
      ref.current.setColorAt(i, cols[l.hue]);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [lights, cols]);

  useFrame((s) => {
    if (++frame.current % 2) return;
    const t = s.clock.elapsedTime;
    const red = smooth(remap(story.smooth, FLOOR_BEATS.redLight, FLOOR_BEATS.redLight + 0.006));
    lights.forEach((l, i) => {
      const idle = l.machine === IDLE_MACHINE && red > 0.5;
      const on = idle ? 0.18 : Math.sin(t * (1.4 + (i % 4) * 0.55) + l.ph) > -0.1 ? 1 : 0.14;
      tmp.copy(cols[l.hue]).multiplyScalar(on * 2.4);
      ref.current.setColorAt(i, tmp);
    });
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    // the warning beacon on the idle machine: cyan until it fails, then pulsing red
    const mat = beacon.current.material as THREE.MeshBasicMaterial;
    const pulse = 0.6 + 0.4 * Math.sin(t * 7);
    mat.color.copy(cols.cyan).multiplyScalar(1.6).lerp(tmp.set("#ff2d44").multiplyScalar(3.2 * pulse), red);
    const hm = halo.current.material as THREE.SpriteMaterial;
    hm.opacity = red * (0.55 + 0.35 * Math.sin(t * 7));
  });

  return (
    <group>
      <instancedMesh ref={ref} args={[k.sphere, new THREE.MeshBasicMaterial({ toneMapped: false }), lights.length]} frustumCulled={false} />
      <mesh ref={beacon} geometry={k.cyl} material={new THREE.MeshBasicMaterial({ toneMapped: false })} position={[idleDef.p[0], idleDef.s[1] + 0.32, idleDef.p[2]]} scale={[0.1, 0.22, 0.1]} />
      <sprite ref={halo} position={[idleDef.p[0], idleDef.s[1] + 0.35, idleDef.p[2]]} scale={[2.6, 2.6, 1]}>
        <spriteMaterial color="#ff2d44" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  );
}

/** Robot arm: turntable, two links, gripper. `amp` lets one of them go idle with the failed machine. */
function Robot({ p, ry = 0, phase = 0, idleAfter = false }: { p: V3; ry?: number; phase?: number; idleAfter?: boolean }) {
  const k = kit();
  const turn = useRef<THREE.Group>(null!);
  const up = useRef<THREE.Group>(null!);
  const fore = useRef<THREE.Group>(null!);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const amp = idleAfter ? 1 - smooth(remap(story.smooth, FLOOR_BEATS.redLight, FLOOR_BEATS.redLight + 0.012)) : 1;
    turn.current.rotation.y = Math.sin(t * 0.8 + phase) * 0.95 * amp;
    up.current.rotation.x = -0.55 + Math.sin(t * 1.3 + phase) * 0.32 * amp;
    fore.current.rotation.x = 1.15 + Math.cos(t * 1.1 + phase) * 0.4 * amp;
  });
  return (
    <group position={p} rotation-y={ry}>
      <mesh geometry={k.cyl} material={k.m.darkSteel} position={[0, 0.25, 0]} scale={[0.5, 0.5, 0.5]} />
      <group ref={turn} position={[0, 0.5, 0]}>
        <mesh geometry={k.cyl} material={k.m.silver} position={[0, 0.14, 0]} scale={[0.34, 0.28, 0.34]} />
        <group ref={up} position={[0, 0.3, 0]}>
          <mesh geometry={k.box} material={k.m.white} position={[0, 0.7, 0]} scale={[0.22, 1.4, 0.22]} />
          <mesh geometry={k.sphere} material={k.m.steel} position={[0, 1.4, 0]} scale={0.17} />
          <group ref={fore} position={[0, 1.4, 0]}>
            <mesh geometry={k.box} material={k.m.white} position={[0, 0.6, 0]} scale={[0.18, 1.2, 0.18]} />
            <mesh geometry={k.box} material={k.m.cyan} position={[0, 1.24, 0]} scale={[0.26, 0.08, 0.26]} />
            <mesh geometry={k.box} material={k.m.darkSteel} position={[0, 1.34, 0]} scale={[0.1, 0.16, 0.1]} />
          </group>
        </group>
      </group>
    </group>
  );
}

export function Production() {
  const { tier } = useQuality();
  const acc = useRef(0);
  useFrame((s, dt) => {
    // white-cyan welding sparks at the weld station
    acc.current += dt;
    if (acc.current > (tier === 0 ? 1.1 : 0.62) && story.smooth < 0.2) {
      acc.current = 0;
      emitSparks({ origin: [WELD_POINT[0] + (Math.random() - 0.5) * 0.15, WELD_POINT[1], WELD_POINT[2] + (Math.random() - 0.5) * 0.15], count: tier === 0 ? 6 : 10, power: 0.3, cone: 1.3 });
    }
  });
  const machines = tier === 0 ? MACHINES.slice(0, 3) : MACHINES;
  return (
    <group>
      <Conveyor />
      {machines.map((m) => (
        <Machine key={m.id} def={m} press={m.id === "press"} />
      ))}
      <Robot p={[5.7, 0, -3]} ry={Math.PI / 2} phase={0} />
      <Robot p={[5.7, 0, -13]} ry={Math.PI / 2} phase={2.1} idleAfter />
      {tier > 0 && <Robot p={[5.7, 0, -22]} ry={Math.PI / 2} phase={4.2} />}
      <Indicators />
    </group>
  );
}

/* ============================================================ QUALITY CONTROL */

export function QCZone() {
  const k = kit();
  const arm1 = useRef<THREE.Group>(null!);
  const arm2 = useRef<THREE.Group>(null!);
  const rig = useRig();
  const parts = useMemo<Item[]>(() => {
    const R = rng(21);
    return Array.from({ length: 10 }, (_, i) => ({ p: [1.2 + (i % 5) * 0.5, 1.02, -17.3 + Math.floor(i / 5) * 0.55 + (R() - 0.5) * 0.1] as V3, s: [0.22, 0.1, 0.3] as V3, c: i % 4 === 3 ? "#3b4a73" : "#8fa3c4" }));
  }, []);
  const rejects = useMemo<Item[]>(() => {
    const R = rng(33);
    return Array.from({ length: 9 }, () => ({ p: [5.6 + (R() - 0.5) * 0.5, 0.78 + R() * 0.12, -17.7 + (R() - 0.5) * 0.5] as V3, s: [0.2 + R() * 0.12, 0.1, 0.26 + R() * 0.1] as V3, r: [R() * 2, R() * 3, R() * 2] as V3, c: "#3b4a73" }));
  }, []);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    arm1.current.rotation.y = Math.sin(t * 0.5) * 0.5;
    arm2.current.rotation.x = 0.7 + Math.sin(t * 0.9) * 0.18;
    // QC team member leans over the table, hand moving along the parts
    rig.torso.current.rotation.x = 0.28;
    applyArms(rig, [0.95 + Math.sin(t * 0.9) * 0.08, 0.9, 0.1], [0.7, 1.0 + Math.sin(t * 0.9 + 1) * 0.1, 0.1]);
    rig.head.current.rotation.x = 0.35 + Math.sin(t * 0.7) * 0.05;
  });

  return (
    <group>
      {/* inspection table with a light panel */}
      <mesh geometry={k.box} material={k.m.silver} position={[2.5, 0.96, -17.1]} scale={[3.4, 0.07, 1.4]} />
      <mesh geometry={k.box} material={k.m.hot} position={[2.5, 0.995, -17.1]} scale={[3.2, 0.01, 1.2]} />
      {([[0.9, -16.5], [4.1, -16.5], [0.9, -17.7], [4.1, -17.7]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} geometry={k.box} material={k.m.darkSteel} position={[x, 0.48, z]} scale={[0.08, 0.96, 0.08]} />
      ))}
      <Inst items={parts} geometry={k.box} material={k.m.silver} />
      {/* measuring arm */}
      <group position={[3.7, 1.0, -17.9]}>
        <mesh geometry={k.cyl} material={k.m.darkSteel} position={[0, 0.05, 0]} scale={[0.25, 0.1, 0.25]} />
        <mesh geometry={k.cyl} material={k.m.silver} position={[0, 0.7, 0]} scale={[0.05, 1.4, 0.05]} />
        <group ref={arm1} position={[0, 1.4, 0]}>
          <mesh geometry={k.box} material={k.m.white} position={[0, 0, 0.6]} scale={[0.1, 0.1, 1.2]} />
          <group ref={arm2} position={[0, 0, 1.2]}>
            <mesh geometry={k.box} material={k.m.white} position={[0, -0.5, 0]} scale={[0.08, 1.0, 0.08]} />
            <mesh geometry={k.sphere} material={k.m.cyan} position={[0, -1.02, 0]} scale={0.045} />
          </group>
        </group>
      </group>
      {/* QC team member */}
      <Person rig={rig} position={[0.6, 0, -16.5]} rotationY={-Math.PI / 2 + 0.2} hat="#9fd6ff" scale={1.1} />
      {/* bin of rejected pieces */}
      <mesh geometry={k.box} material={k.m.steel} position={[5.6, 0.4, -17.7]} scale={[1.1, 0.8, 0.9]} />
      <mesh geometry={k.box} material={k.m.darkSteel} position={[5.6, 0.82, -17.7]} scale={[1.0, 0.02, 0.8]} />
      <Inst items={rejects} geometry={k.box} material={k.m.body} />
      <mesh geometry={k.box} material={k.m.red} position={[5.6, 0.72, -17.22]} scale={[0.12, 0.05, 0.02]} />
    </group>
  );
}
