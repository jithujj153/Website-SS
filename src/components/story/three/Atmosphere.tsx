"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { story } from "@/story/store";
import { rng } from "@/story/textures";
import { byTier, useQuality } from "./quality";

/** Background colour, fog and the global lighting rig shared by every scene. */
export function Atmosphere() {
  const { tier } = useQuality();
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    scene.background = new THREE.Color("#060b1a");
    scene.fog = new THREE.FogExp2("#060b1a", 0.0105);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.5} color="#7f98c9" />
      <hemisphereLight args={["#9bb8ff", "#0a1228", 0.55]} />
      {/* cool key light from upper left, blue rim from behind-right: brushed metal picks up blue rim lighting */}
      <directionalLight position={[-8, 16, 10]} intensity={1.15} color="#cfe0ff" />
      <directionalLight position={[10, 6, -14]} intensity={0.9} color="#3a63e8" />
      {tier > 0 && (
        <Environment resolution={64} frames={1} environmentIntensity={0.55}>
          <Lightformer form="rect" intensity={2.2} color="#9fd6ff" position={[-6, 6, 6]} scale={[10, 3, 1]} />
          <Lightformer form="rect" intensity={1.6} color="#3a63e8" position={[8, 2, -6]} scale={[12, 2, 1]} />
          <Lightformer form="ring" intensity={1.2} color="#2db7db" position={[0, 8, 0]} scale={4} rotation-x={Math.PI / 2} />
        </Environment>
      )}
    </>
  );
}

/** Floating motes for depth. They ride along with the camera region so the void never feels empty. */
export function Dust() {
  const { tier } = useQuality();
  const count = byTier(tier, 160, 320, 520);
  const ref = useRef<THREE.Points>(null!);
  const geo = useMemo(() => {
    const R = rng(77);
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (R() - 0.5) * 60;
      a[i * 3 + 1] = -34 + R() * 42;
      a[i * 3 + 2] = -130 + R() * 140;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return g;
  }, [count]);

  useFrame((s) => {
    ref.current.rotation.y = s.clock.elapsedTime * 0.004 + story.smooth * 0.2;
  });

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial color="#8fb4ff" size={0.06} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}
