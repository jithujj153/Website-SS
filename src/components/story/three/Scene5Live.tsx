"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/story/store";
import { BEATS, remap, smoothstep } from "@/story/ranges";
import { LOTS, lotPosition } from "@/story/city-layout";
import type { CityBuildingId } from "@/config/content";
import { useWindowVisible } from "./useWindow";

/**
 * SCENE 5: LIVE + CTA  (scroll 85 - 100%)
 * The 3D side of "going live": a light beam rises from every building as the Committed > Built > Tested > Live
 * sequence completes, and soft shockwave rings roll out across the diamond tiles. The status sequence and the
 * counters themselves are DOM text (see StoryOverlay) so they stay sharp and accessible.
 */

const IDS = Object.keys(LOTS) as CityBuildingId[];

function Beam({ id, index }: { id: CityBuildingId; index: number }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const pos = lotPosition(id);
  const h = LOTS[id].h;

  useFrame((s) => {
    const live = smoothstep(remap(story.smooth, BEATS.status[3] - 0.004 + index * 0.004, BEATS.status[3] + 0.03 + index * 0.004));
    mesh.current.visible = live > 0.01;
    if (!mesh.current.visible) return;
    const len = 4 + live * 18;
    mesh.current.scale.set(1, len, 1);
    mesh.current.position.set(pos[0], pos[1] + h + len / 2 - 0.2, pos[2]);
    mat.current.opacity = live * (0.2 + Math.sin(s.clock.elapsedTime * 2 + index) * 0.05);
  });

  return (
    <mesh ref={mesh}>
      <cylinderGeometry args={[0.1, 0.5, 1, 12, 1, true]} />
      <meshBasicMaterial ref={mat} color="#7fe3ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function PulseRings() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const center = lotPosition("cafe");
  useFrame((s) => {
    const live = smoothstep(remap(story.smooth, BEATS.status[3], BEATS.status[3] + 0.02));
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.visible = live > 0.01;
      if (!m.visible) return;
      const u = (s.clock.elapsedTime * 0.22 + i / 3) % 1;
      m.scale.setScalar(1 + u * 9);
      (m.material as THREE.MeshBasicMaterial).opacity = live * (1 - u) * 0.55;
    });
  });
  return (
    <group position={[center[0], center[1] + 0.12, center[2]]} rotation-x={-Math.PI / 2}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => void (refs.current[i] = el)} rotation-z={Math.PI / 4}>
          <ringGeometry args={[1.0, 1.06, 4]} />
          <meshBasicMaterial color="#2db7db" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function Scene5Live() {
  const root = useRef<THREE.Group>(null!);
  useWindowVisible(root, 0.8, 1.01);
  return (
    <group ref={root} name="scene-5-live">
      {IDS.map((id, i) => (
        <Beam key={id} id={id} index={i} />
      ))}
      <PulseRings />
    </group>
  );
}
