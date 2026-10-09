"use client";

import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

/** Shared geometry + materials for the factory hall, so hundreds of parts cost a handful of draw calls. */

export type V3 = [number, number, number];
export interface Item {
  p: V3;
  s?: V3;
  r?: V3;
  c?: string | number;
}

let _kit: ReturnType<typeof build> | null = null;
function build() {
  const std = (color: string, metalness: number, roughness: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });
  const glow = (hex: string, k: number, extra: Partial<THREE.MeshBasicMaterialParameters> = {}) =>
    new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, ...extra });
  return {
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 12),
    sphere: new THREE.SphereGeometry(1, 14, 10),
    plane: new THREE.PlaneGeometry(1, 1),
    m: {
      steel: std("#2a3a64", 0.85, 0.4),
      darkSteel: std("#101a36", 0.7, 0.5),
      rackBlue: std("#1f3fae", 0.5, 0.5),
      silver: std("#8fa3c4", 0.8, 0.35),
      pallet: std("#18213f", 0.1, 0.85),
      crate: std("#ffffff", 0.05, 0.75),
      body: std("#223260", 0.6, 0.45),
      body2: std("#2d4178", 0.55, 0.45),
      white: std("#eef4ff", 0.1, 0.5),
      skin: std("#6f7fa6", 0.05, 0.8),
      vest: std("#0a1126", 0.1, 0.8),
      pants: std("#101a36", 0.1, 0.85),
      shirt: std("#aab9d6", 0.05, 0.85),
      paper: std("#dfe8f6", 0, 0.9),
      floor: std("#0a1226", 0.55, 0.32),
      wall: std("#0b1430", 0.2, 0.9),
      cyan: glow("#2db7db", 2.4),
      hot: glow("#d9fbff", 2.2),
      blue: glow("#3a63e8", 2.0),
      red: glow("#ff3b4e", 2.6),
      glass: new THREE.MeshStandardMaterial({ color: "#7fc4ff", transparent: true, opacity: 0.11, roughness: 0.1, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false }),
      screen: glow("#2db7db", 1.1),
    },
  };
}
export const kit = () => (_kit ??= build());

/** A static InstancedMesh from a list of items (position / scale / rotation / colour). */
export function Inst({ items, geometry, material }: { items: Item[]; geometry: THREE.BufferGeometry; material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    const m = ref.current;
    const d = new THREE.Object3D();
    const col = new THREE.Color();
    items.forEach((it, i) => {
      d.position.set(...it.p);
      d.rotation.set(...(it.r ?? [0, 0, 0]));
      d.scale.set(...(it.s ?? [1, 1, 1]));
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      if (it.c !== undefined) m.setColorAt(i, col.set(it.c as THREE.ColorRepresentation));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  return <instancedMesh ref={ref} args={[geometry, material, Math.max(1, items.length)]} frustumCulled={false} />;
}

export const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
