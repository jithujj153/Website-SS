"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { story } from "@/story/store";
import { BEATS, easeOutBack, remap, smoothstep } from "@/story/ranges";
import { BUILD } from "@/story/camera-path";
import { chartPanelTexture, receiptPanelTexture, statusPanelTexture, stockPanelTexture } from "@/story/textures";
import { useStoryValue } from "@/story/hooks";
import { TerminalPanel } from "../panels/TerminalPanel";
import { useWindowVisible } from "./useWindow";
import { byTier, useQuality } from "./quality";

/**
 * SCENE 3: BUILD OUTPUT  (scroll 40 - 60%)
 * A terminal (real DOM, CSS-3D positioned) runs a build log: our seven services compile one by one with
 * green checks, then "Build passed". Real-looking UI panels (stock table, billing receipt, status board,
 * sales chart) extrude out of the screen in 3D. Around 0.585 - 0.625 they collapse into the city that follows.
 */

const [BX, BY, BZ] = BUILD;
const TERMINAL_Y = BY + 0.5;

const PANELS = [
  { key: "stock", x: -6.45, y: TERMINAL_Y + 1.15, ry: 0.3, delay: 0.0, depth: 1.9 },
  { key: "billing", x: -6.45, y: TERMINAL_Y - 1.2, ry: 0.3, delay: 0.22, depth: 2.4 },
  { key: "status", x: 6.45, y: TERMINAL_Y + 1.15, ry: -0.3, delay: 0.11, depth: 2.1 },
  { key: "sales", x: 6.45, y: TERMINAL_Y - 1.2, ry: -0.3, delay: 0.33, depth: 2.7 },
] as const;

const PANEL_W = 2.56;
const PANEL_H = 2.0;

function PanelSlab({ spec, map }: { spec: (typeof PANELS)[number]; map: THREE.Texture }) {
  const group = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Mesh>(null!);
  const face = useRef<THREE.Group>(null!);
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0f1b3a", metalness: 0.7, roughness: 0.45, emissive: "#102a5c", emissiveIntensity: 0.6 }), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(PANEL_W, PANEL_H, 1)), []);

  useFrame((s) => {
    const p = story.smooth;
    const ext = remap(p, BEATS.panelsExtrude[0], BEATS.panelsExtrude[1]);
    const e = easeOutBack(remap(ext, spec.delay, spec.delay + 0.62));
    const z = Math.max(0.001, e * spec.depth);
    const collapse = smoothstep(remap(p, BEATS.panelsCollapse[0], BEATS.panelsCollapse[1]));
    const vis = e > 0.002 && collapse < 0.995;
    group.current.visible = vis;
    if (!vis) return;
    body.current.scale.z = z;
    body.current.position.z = z / 2 - 0.01;
    face.current.position.z = z + 0.012;
    // gentle float once out, then collapse into a flat shard
    const t = s.clock.elapsedTime;
    group.current.position.set(spec.x, spec.y + Math.sin(t * 0.8 + spec.x) * 0.06, BZ);
    group.current.rotation.set(0, spec.ry * e, collapse * 1.4);
    group.current.scale.setScalar(1 - collapse);
  });

  return (
    <group ref={group}>
      <mesh ref={body} material={bodyMat}>
        <boxGeometry args={[PANEL_W, PANEL_H, 1]} />
      </mesh>
      <group ref={face}>
        <mesh>
          <planeGeometry args={[PANEL_W, PANEL_H]} />
          <meshBasicMaterial map={map} toneMapped={false} />
        </mesh>
        <lineSegments geometry={edges} position={[0, 0, -0.5]}>
          <lineBasicMaterial color="#2db7db" toneMapped={false} />
        </lineSegments>
      </group>
    </group>
  );
}

export function Scene3Build({ panelInScene }: { panelInScene: boolean }) {
  const { tier } = useQuality();
  const root = useRef<THREE.Group>(null!);
  const maps = useMemo(
    () => ({
      stock: stockPanelTexture(),
      billing: receiptPanelTexture(),
      status: statusPanelTexture(),
      sales: chartPanelTexture(),
    }),
    [],
  );
  const terminalActive = useStoryValue((s) => s.smooth > 0.37 && s.smooth < 0.62);
  useWindowVisible(root, 0.36, 0.66);

  return (
    <group ref={root} name="scene-3-build">
      {/* monitor stand + floor */}
      <group position={[BX, BY - 3.1, BZ]}>
        <mesh rotation-x={-Math.PI / 2}>
          <circleGeometry args={[11, 64]} />
          <meshStandardMaterial color="#080f22" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
          <ringGeometry args={[9.2, 9.32, 4]} />
          <meshBasicMaterial color="#2db7db" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.9, -0.2]}>
          <boxGeometry args={[0.7, 1.8, 0.4]} />
          <meshStandardMaterial color="#17254a" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.06, -0.2]}>
          <cylinderGeometry args={[1.8, 2.1, 0.12, 6]} />
          <meshStandardMaterial color="#17254a" metalness={0.85} roughness={0.35} />
        </mesh>
      </group>

      {/* backing plate: something solid is there even before the DOM terminal mounts */}
      <mesh position={[BX, TERMINAL_Y, BZ - 0.08]}>
        <planeGeometry args={[9.3, 5.5]} />
        <meshBasicMaterial color="#0a1530" toneMapped={false} />
      </mesh>
      <lineSegments position={[BX, TERMINAL_Y, BZ - 0.06]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(9.3, 5.5)]} />
        <lineBasicMaterial color="#2db7db" toneMapped={false} />
      </lineSegments>

      {panelInScene && terminalActive && (
        <Html transform position={[BX, TERMINAL_Y, BZ]} distanceFactor={4.737} zIndexRange={[20, 0]} pointerEvents="none" style={{ pointerEvents: "none" }}>
          <TerminalPanel />
        </Html>
      )}

      {PANELS.slice(0, byTier(tier, 4, 4, 4)).map((spec) => (
        <PanelSlab key={spec.key} spec={spec} map={maps[spec.key]} />
      ))}

      <pointLight position={[BX, TERMINAL_Y, BZ + 6]} color="#7fd6ff" intensity={18} distance={22} decay={2} />
      <pointLight position={[BX - 7, TERMINAL_Y + 3, BZ + 2]} color="#2347c5" intensity={14} distance={16} decay={2} />
    </group>
  );
}
