"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/story/store";
import { SCENES } from "@/story/ranges";
import {
  billTexture,
  chatTexture,
  receiptTexture,
  rng,
  sheetTexture,
  stickyTexture,
} from "@/story/textures";
import { byTier, useQuality } from "./quality";

/**
 * SCENE 1: CHAOS  (scroll 0 - 20%)
 * A dim, slightly tilted space full of floating clutter: paper bills, ledger books, crumpled receipts,
 * sticky notes, spreadsheet printouts with red #REF! cells and chat bubbles in plain English.
 * The camera drifts forward and objects pass close for depth (see camera-path.ts keys 0 - 0.2).
 * All geometry is instanced: 7 draw calls for ~100 objects.
 */

interface DriftProps {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  count: number;
  seed: number;
  scale: [number, number];
  colors?: string[];
  spin?: number;
  zRange?: [number, number];
}

function DriftMesh({ geometry, material, count, seed, scale, colors, spin = 0.22, zRange = [-27, 6] }: DriftProps) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const { tier } = useQuality();
  const frame = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    const R = rng(seed);
    const items = [];
    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, z = 0;
      for (let tries = 0; tries < 12; tries++) {
        x = (R() - 0.5) * 20;
        y = (R() - 0.5) * 11;
        z = zRange[0] + R() * (zRange[1] - zRange[0]);
        // keep a clear corridor along the camera path so nothing clips through the near plane
        const nearPath = Math.abs(x) < 1.7 && Math.abs(y - 0.3) < 1.5 && z < 9 && z > -24;
        if (!nearPath) break;
      }
      items.push({
        x, y, z,
        rx: R() * Math.PI * 2, ry: R() * Math.PI * 2, rz: R() * Math.PI * 2,
        wx: (R() - 0.5) * spin, wy: (R() - 0.5) * spin, wz: (R() - 0.5) * spin * 1.4,
        s: scale[0] + R() * (scale[1] - scale[0]),
        ph: R() * Math.PI * 2,
        bob: 0.15 + R() * 0.3,
      });
    }
    return items;
  }, [count, seed, scale, spin, zRange]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (colors && colors.length) {
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        c.set(colors[i % colors.length]);
        mesh.setColorAt(i, c);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    // initial pose so the first frame is already populated
    update(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function update(t: number) {
    const mesh = ref.current;
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      dummy.position.set(d.x, d.y + Math.sin(t * 0.5 + d.ph) * d.bob, d.z);
      dummy.rotation.set(d.rx + t * d.wx, d.ry + t * d.wy, d.rz + t * d.wz);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  useFrame((s) => {
    // only animate while the chaos is near the camera; throttle on weaker devices
    if (story.smooth > SCENES.chaos[1] + 0.12) return;
    frame.current++;
    if (tier === 0 && frame.current % 2) return;
    update(s.clock.elapsedTime);
  });

  return <instancedMesh ref={ref} args={[geometry, material, count]} frustumCulled={false} />;
}

function ChatBubble({ text, mine, position, rotation, delay }: { text: string; mine: boolean; position: [number, number, number]; rotation: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const map = useMemo(() => chatTexture(text, mine), [text, mine]);
  useFrame((s) => {
    const t = s.clock.elapsedTime + delay;
    ref.current.position.y = position[1] + Math.sin(t * 0.55) * 0.22;
    ref.current.rotation.z = rotation[2] + Math.sin(t * 0.4) * 0.04;
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <planeGeometry args={[3.4, 0.9]} />
      <meshBasicMaterial map={map} transparent toneMapped={false} side={THREE.DoubleSide} opacity={0.95} />
    </mesh>
  );
}

const CHATS: { text: string; mine: boolean; pos: [number, number, number]; rot: [number, number, number] }[] = [
  { text: "how much stock is left?", mine: false, pos: [-4.4, 1.8, -7], rot: [0.05, 0.35, 0.06] },
  { text: "send the bill tomorrow", mine: true, pos: [4.6, -1.2, -11], rot: [-0.04, -0.4, -0.05] },
  { text: "which file is the latest?", mine: false, pos: [-3.6, -2.4, -16], rot: [0.03, 0.3, 0.04] },
  { text: "is the invoice paid?", mine: true, pos: [3.8, 2.6, -19], rot: [-0.03, -0.35, 0.05] },
  { text: "update the sheet pls", mine: false, pos: [-5.2, 0.4, -23], rot: [0.04, 0.4, -0.04] },
  { text: "who changed this?", mine: false, pos: [5.4, 1.4, -4], rot: [0, -0.5, 0.03] },
  { text: "send the bill tomorrow", mine: true, pos: [-5.8, -1.6, -1.5], rot: [0, 0.5, -0.05] },
];

export function Scene1Chaos() {
  const { tier } = useQuality();
  const f = (n: number) => Math.max(2, Math.round(n * byTier(tier, 0.42, 0.7, 1)));

  const assets = useMemo(() => {
    const paper = (map: THREE.Texture, emissive = 0.2) =>
      new THREE.MeshStandardMaterial({
        map, roughness: 0.95, metalness: 0, side: THREE.DoubleSide,
        emissive: new THREE.Color("#7f98c9"), emissiveMap: map, emissiveIntensity: emissive,
      });

    // crumpled receipt geometry: a plane displaced by layered sines
    const crumple = new THREE.PlaneGeometry(0.66, 1.85, 5, 14);
    const pos = crumple.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, (Math.sin(x * 11 + y * 5) * 0.5 + Math.sin(y * 14 + x * 3) * 0.35 + Math.cos(x * 7 - y * 9) * 0.25) * 0.06);
    }
    crumple.computeVertexNormals();

    return {
      billGeo: new THREE.PlaneGeometry(1.15, 1.55),
      billMat: paper(billTexture(1)),
      crumple,
      receiptMat: paper(receiptTexture(2), 0.22),
      stickyGeo: new THREE.PlaneGeometry(0.8, 0.8),
      stickyMats: ["call back?", "reorder!!", "who has the key?"].map((t, i) => paper(stickyTexture(t, 30 + i), 0.12)),
      sheetGeo: new THREE.PlaneGeometry(2.3, 1.63),
      sheetMats: [sheetTexture(41), sheetTexture(42)].map((t) => paper(t, 0.25)),
      ledgerGeo: new THREE.BoxGeometry(0.92, 1.2, 0.24),
      ledgerMat: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.75, metalness: 0.1, emissive: "#16264a", emissiveIntensity: 0.4 }),
    };
  }, []);

  const stickyColors = ["#bfe3f5", "#c6f1e2", "#d9d0ff", "#eef3ff"];
  const ledgerColors = ["#33466f", "#3b3a63", "#27506a", "#46506e", "#2e3f63"];

  return (
    <group rotation={[0.06, -0.12, 0.09]} name="scene-1-chaos">
      <DriftMesh geometry={assets.billGeo} material={assets.billMat} count={f(20)} seed={11} scale={[0.9, 1.5]} />
      <DriftMesh geometry={assets.crumple} material={assets.receiptMat} count={f(16)} seed={12} scale={[0.9, 1.4]} spin={0.35} />
      {assets.stickyMats.map((m, i) => (
        <DriftMesh key={i} geometry={assets.stickyGeo} material={m} count={f(6)} seed={20 + i} scale={[0.8, 1.35]} colors={stickyColors} />
      ))}
      {assets.sheetMats.map((m, i) => (
        <DriftMesh key={i} geometry={assets.sheetGeo} material={m} count={f(5)} seed={60 + i} scale={[0.9, 1.4]} spin={0.14} />
      ))}
      <DriftMesh geometry={assets.ledgerGeo} material={assets.ledgerMat} count={f(10)} seed={80} scale={[0.9, 1.5]} colors={ledgerColors} spin={0.3} />
      {CHATS.slice(0, byTier(tier, 4, 6, 7)).map((c, i) => (
        <ChatBubble key={i} text={c.text} mine={c.mine} position={c.pos} rotation={c.rot} delay={i * 1.7} />
      ))}
    </group>
  );
}

