"use client";

import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { kit } from "./kit";

/** Stylised, faceless low-poly worker (1.8 m). Front faces -z. Poses are driven from outside via the rig refs. */
export interface Rig {
  root: React.RefObject<THREE.Group>;
  torso: React.RefObject<THREE.Group>;
  head: React.RefObject<THREE.Group>;
  lSh: React.RefObject<THREE.Group>;
  lEl: React.RefObject<THREE.Group>;
  rSh: React.RefObject<THREE.Group>;
  rEl: React.RefObject<THREE.Group>;
  lLeg: React.RefObject<THREE.Group>;
  rLeg: React.RefObject<THREE.Group>;
}
export function useRig(): Rig {
  return {
    root: useRef<THREE.Group>(null!),
    torso: useRef<THREE.Group>(null!),
    head: useRef<THREE.Group>(null!),
    lSh: useRef<THREE.Group>(null!),
    lEl: useRef<THREE.Group>(null!),
    rSh: useRef<THREE.Group>(null!),
    rEl: useRef<THREE.Group>(null!),
    lLeg: useRef<THREE.Group>(null!),
    rLeg: useRef<THREE.Group>(null!),
  };
}

/** [shoulder x, elbow x, shoulder z] ; +x swings the arm forward (-z), +z swings the LEFT arm inward */
export type Pose = [number, number, number];
export const mixPose = (a: Pose, b: Pose, t: number): Pose => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export function applyArms(rig: Rig, l: Pose, r: Pose) {
  rig.lSh.current?.rotation.set(l[0], 0, l[2]);
  rig.lEl.current?.rotation.set(l[1], 0, 0);
  rig.rSh.current?.rotation.set(r[0], 0, -r[2]);
  rig.rEl.current?.rotation.set(r[1], 0, 0);
}

export function Person({
  rig,
  hat = "#f2f6ff",
  vest = "#0a1126",
  scale = 1.12,
  leftHand,
  rightHand,
  position,
  rotationY = 0,
}: {
  rig: Rig;
  hat?: string;
  vest?: string;
  scale?: number;
  leftHand?: ReactNode;
  rightHand?: ReactNode;
  position?: [number, number, number];
  rotationY?: number;
}) {
  const k = kit();
  const hatMat = useRefMat(hat);
  const vestMat = useRefMat(vest, 0.1, 0.8);

  const arm = (side: -1 | 1, sh: Rig["lSh"], el: Rig["lEl"], hand?: ReactNode) => (
    <group ref={sh} position={[side * 0.3, 1.42, 0]}>
      <mesh geometry={k.box} material={k.m.shirt} position={[0, -0.14, 0]} scale={[0.1, 0.3, 0.1]} />
      <group ref={el} position={[0, -0.29, 0]}>
        <mesh geometry={k.box} material={k.m.shirt} position={[0, -0.13, 0]} scale={[0.09, 0.27, 0.09]} />
        <mesh geometry={k.sphere} material={k.m.skin} position={[0, -0.29, 0]} scale={0.05} />
        <group position={[0, -0.3, 0]}>{hand}</group>
      </group>
    </group>
  );
  const leg = (side: -1 | 1, ref: Rig["lLeg"]) => (
    <group ref={ref} position={[side * 0.1, 0.86, 0]}>
      <mesh geometry={k.box} material={k.m.pants} position={[0, -0.43, 0]} scale={[0.16, 0.86, 0.18]} />
      <mesh geometry={k.box} material={k.m.darkSteel} position={[0, -0.84, -0.04]} scale={[0.17, 0.08, 0.28]} />
    </group>
  );

  return (
    <group ref={rig.root} position={position} rotation-y={rotationY} scale={scale}>
      {leg(-1, rig.lLeg)}
      {leg(1, rig.rLeg)}
      <group ref={rig.torso}>
        <mesh geometry={k.box} material={vestMat} position={[0, 1.16, 0]} scale={[0.48, 0.62, 0.27]} />
        {/* cyan reflective strips: front, back and a waist band */}
        <mesh geometry={k.box} material={k.m.cyan} position={[-0.12, 1.2, -0.138]} scale={[0.045, 0.5, 0.006]} />
        <mesh geometry={k.box} material={k.m.cyan} position={[0.12, 1.2, -0.138]} scale={[0.045, 0.5, 0.006]} />
        <mesh geometry={k.box} material={k.m.cyan} position={[-0.12, 1.2, 0.138]} scale={[0.045, 0.5, 0.006]} />
        <mesh geometry={k.box} material={k.m.cyan} position={[0.12, 1.2, 0.138]} scale={[0.045, 0.5, 0.006]} />
        <mesh geometry={k.box} material={k.m.cyan} position={[0, 0.97, 0]} scale={[0.495, 0.04, 0.285]} />
        <mesh geometry={k.box} material={k.m.shirt} position={[0, 1.5, 0]} scale={[0.52, 0.08, 0.28]} />
      </group>
      {arm(-1, rig.lSh, rig.lEl, leftHand)}
      {arm(1, rig.rSh, rig.rEl, rightHand)}
      <group ref={rig.head} position={[0, 1.52, 0]}>
        <mesh geometry={k.cyl} material={k.m.skin} position={[0, 0.03, 0]} scale={[0.05, 0.08, 0.05]} />
        <mesh geometry={k.sphere} material={k.m.skin} position={[0, 0.17, 0]} scale={[0.115, 0.13, 0.12]} />
        {/* hard hat: dome + brim + ridge */}
        <mesh position={[0, 0.2, 0]} scale={[0.15, 0.13, 0.155]} material={hatMat}>
          <sphereGeometry args={[1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh geometry={k.cyl} material={hatMat} position={[0, 0.2, -0.01]} scale={[0.19, 0.018, 0.2]} />
        <mesh geometry={k.box} material={hatMat} position={[0, 0.34, -0.01]} scale={[0.03, 0.025, 0.2]} />
      </group>
    </group>
  );
}

const _mats = new Map<string, THREE.Material>();
function useRefMat(color: string, metalness = 0.1, roughness = 0.5) {
  const key = `${color}:${metalness}:${roughness}`;
  let m = _mats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, metalness, roughness });
    _mats.set(key, m);
  }
  return m;
}
