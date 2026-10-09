"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { story } from "@/story/store";
import { BEATS, easeOutCubic, lerp, remap, smoothstep } from "@/story/ranges";
import { FORGE } from "@/story/camera-path";
import { billTexture, brushedMetalTexture, glowTexture } from "@/story/textures";
import { CodeEditorPanel } from "../panels/CodeEditorPanel";
import { ANVIL_STRIKE } from "./Sparks";
import { useWindowVisible } from "./useWindow";
import { useStoryValue } from "@/story/hooks";
import { byTier, useQuality } from "./quality";
import { scene1Variant } from "@/config/site";
import { FORGE_BUBBLES, FORGE_ENDS } from "@/story/floor-layout";
import { floorBubbleTexture } from "@/story/floor-textures";

/**
 * SCENE 2: THE FORGE  (scroll 20 - 40%)
 * The camera drops to a dark metal anvil. A glowing code editor (real DOM, CSS-3D positioned so text
 * stays sharp) floats above it: code types in as you scroll, an AI ghost-text suggestion appears and is accepted.
 * Every scroll tick is a hammer strike (the hammer slams down on `story.impulse`), and a piece of clutter
 * is pulled in, flattened and turned into a line of code.
 */

const [FX, FY, FZ] = FORGE;
const ANVIL_S = 1.1;

/** side profile of the anvil (x, y), extruded along z */
const ANVIL_PROFILE: [number, number][] = [
  [-1.3, 0], [1.3, 0], [1.3, 0.35], [0.95, 0.55], [0.72, 0.9], [0.72, 1.3], [1.55, 1.48], [2.3, 1.58], [2.3, 2.05],
  [-0.35, 2.05], [-2.3, 1.82], [-2.72, 1.68], [-2.4, 1.52], [-0.72, 1.45], [-0.72, 0.9], [-0.95, 0.55], [-1.3, 0.35],
];

function useAnvilGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    ANVIL_PROFILE.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 1.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
    g.translate(0, 0, -0.65);
    g.computeVertexNormals();
    return g;
  }, []);
}

/** dark brushed metal with a blue rim; falls back to a plainer look without an environment map */
function useMetal(tier: 0 | 1 | 2) {
  return useMemo(() => {
    const tex = brushedMetalTexture();
    return new THREE.MeshStandardMaterial({
      color: "#2b3b66",
      metalness: tier === 0 ? 0.55 : 0.92,
      roughness: 0.42,
      roughnessMap: tex,
      bumpMap: tex,
      bumpScale: 1.4,
      emissive: "#0b1c44",
      emissiveIntensity: 0.5,
      envMapIntensity: 1.1,
    });
  }, [tier]);
}

interface Piece {
  kind: "book" | "paper";
  from: [number, number, number];
  a: number;
  b: number;
  rot: number;
}

/** a piece of clutter on its way to becoming code */
function FlyingPiece({ piece, geoBook, geoPaper, tex }: { piece: Piece; geoBook: THREE.BufferGeometry; geoPaper: THREE.BufferGeometry; tex: THREE.Texture }) {
  const ref = useRef<THREE.Mesh>(null!);
  const mat = useMemo(() => {
    return piece.kind === "book"
      ? new THREE.MeshStandardMaterial({ color: "#3b4a73", roughness: 0.7, emissive: "#16264a", emissiveIntensity: 0.5, transparent: true })
      : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide, emissive: "#7f98c9", emissiveMap: tex, emissiveIntensity: 0.2, transparent: true });
  }, [piece.kind, tex]);
  const cyan = useMemo(() => new THREE.Color("#7fe3ff"), []);
  const base = useMemo(() => new THREE.Color(piece.kind === "book" ? "#3b4a73" : "#ffffff"), [piece.kind]);

  useFrame(() => {
    const m = ref.current;
    const f = remap(story.smooth, BEATS.editorStart, BEATS.editorEnd);
    const u = remap(f, piece.a, piece.b);
    m.visible = u > 0 && u < 1 ? true : u <= 0 && f > 0.02;
    if (!m.visible) return;
    const fly = easeOutCubic(remap(u, 0, 0.58));
    const target: [number, number, number] = [FX + 0.7, FY + ANVIL_S * 2.05 + 0.1, FZ + 0.25];
    m.position.set(
      lerp(piece.from[0], target[0], fly),
      lerp(piece.from[1], target[1], fly) + Math.sin(Math.PI * fly) * 3.4,
      lerp(piece.from[2], target[2], fly),
    );
    const flat = smoothstep(remap(u, 0.6, 0.78));
    const conv = smoothstep(remap(u, 0.78, 1));
    if (piece.kind === "book") {
      m.rotation.set(0.5 * (1 - fly), piece.rot * (1 - fly), 0.3 * (1 - fly));
      m.scale.set(lerp(1, 1.5, flat) * lerp(1, 1.6, conv), lerp(1, 0.07, flat), lerp(1, 1.5, flat));
    } else {
      m.rotation.set(lerp(0.6, -Math.PI / 2, flat), piece.rot * (1 - fly), 0);
      m.scale.set(lerp(1, 1.25, flat) * lerp(1, 1.6, conv), lerp(1, 1, flat), 1);
    }
    m.position.y += conv * 1.1;
    mat.color.copy(base).lerp(cyan, conv);
    mat.emissive.copy(cyan);
    mat.emissiveIntensity = lerp(0.3, 2.4, conv);
    mat.opacity = 1 - conv * conv;
  });

  return <mesh ref={ref} geometry={piece.kind === "book" ? geoBook : geoPaper} material={mat} />;
}


/** factory variant: one of the manager's thought bubbles hovers, is pulled onto the anvil by a strike, flattens and becomes code */
function FlyingBubble({ index }: { index: number }) {
  const b = FORGE_BUBBLES[index];
  const end = FORGE_ENDS[index];
  const ref = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => floorBubbleTexture(b.text, b.chip), [b.text, b.chip]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }), [tex]);
  const geo = useMemo(() => new THREE.PlaneGeometry(2.9, 1.04), []);
  const cyan = useMemo(() => new THREE.Color("#7fe3ff").multiplyScalar(2.2), []);
  const white = useMemo(() => new THREE.Color("#ffffff"), []);
  const from: [number, number, number] = [FX - 5.4 - (index % 2) * 1.3, FY + 2.6 + index * 1.15, FZ + 2.4 - index * 0.35];

  useFrame(({ camera, clock }) => {
    const m = ref.current;
    const f = remap(story.smooth, BEATS.editorStart, BEATS.editorEnd);
    const u = remap(f, end - 0.2, end);
    const born = smoothstep(remap(f, 0.0, 0.05));
    m.visible = born > 0.01 && u < 1;
    if (!m.visible) return;
    m.quaternion.copy(camera.quaternion);
    const fly = easeOutCubic(remap(u, 0, 0.58));
    const target: [number, number, number] = [FX + 0.7, FY + ANVIL_S * 2.05 + 0.25, FZ + 0.25];
    const bob = Math.sin(clock.elapsedTime * 1.6 + index * 1.7) * 0.16 * (1 - fly);
    m.position.set(lerp(from[0], target[0], fly), lerp(from[1], target[1], fly) + Math.sin(Math.PI * fly) * 2.6 + bob, lerp(from[2], target[2], fly));
    const flat = smoothstep(remap(u, 0.6, 0.78));
    const conv = smoothstep(remap(u, 0.78, 1));
    const pulse = 1 + Math.min(1, story.impulse) * 0.07;
    m.scale.set(lerp(1, 1.1, flat) * lerp(1, 1.5, conv) * pulse, lerp(1, 0.09, flat) * pulse, 1);
    m.position.y += conv * 0.9;
    mat.color.copy(white).lerp(cyan, conv);
    mat.opacity = born * (1 - conv * conv);
  });

  return <mesh ref={ref} geometry={geo} material={mat} renderOrder={5} />;
}

export function Scene2Forge({ panelInScene }: { panelInScene: boolean }) {
  const { tier } = useQuality();
  const root = useRef<THREE.Group>(null!);
  const hammer = useRef<THREE.Group>(null!);
  const heat = useRef<THREE.MeshBasicMaterial>(null!);
  const glow = useRef<THREE.MeshBasicMaterial>(null!);
  const strikeLight = useRef<THREE.PointLight>(null!);
  const anvilGeo = useAnvilGeometry();
  const metal = useMetal(tier);
  const glowMap = useMemo(() => glowTexture(), []);
  const billTex = useMemo(() => billTexture(7), []);
  const geoBook = useMemo(() => new THREE.BoxGeometry(0.92, 1.2, 0.24), []);
  const geoPaper = useMemo(() => new THREE.PlaneGeometry(1.15, 1.55), []);
  const editorActive = useStoryValue((s) => s.smooth > 0.15 && s.smooth < 0.5);

  const pieces = useMemo<Piece[]>(() => {
    const all: Piece[] = [
      { kind: "book", from: [FX - 6.8, FY + 0.5, FZ + 3.4], a: 0.0, b: 0.24, rot: 0.8 },
      { kind: "paper", from: [FX - 6.0, FY + 0.15, FZ + 4.4], a: 0.1, b: 0.34, rot: -0.6 },
      { kind: "book", from: [FX - 7.4, FY + 0.5, FZ + 2.2], a: 0.2, b: 0.44, rot: -0.4 },
      { kind: "paper", from: [FX - 6.4, FY + 0.15, FZ + 5.2], a: 0.32, b: 0.56, rot: 0.9 },
      { kind: "book", from: [FX - 6.2, FY + 0.5, FZ + 3.0], a: 0.44, b: 0.68, rot: 0.3 },
      { kind: "paper", from: [FX - 7.0, FY + 0.15, FZ + 3.9], a: 0.56, b: 0.8, rot: -0.9 },
      { kind: "book", from: [FX - 6.6, FY + 0.5, FZ + 2.7], a: 0.68, b: 0.92, rot: 0.6 },
      { kind: "paper", from: [FX - 7.2, FY + 0.15, FZ + 4.8], a: 0.76, b: 1.0, rot: 0.2 },
    ];
    return all.slice(0, byTier(tier, 5, 7, 8));
  }, [tier]);

  useWindowVisible(root, 0.14, 0.52);

  useFrame(() => {
    const hit = Math.min(1, story.impulse * 1.35);
    if (hammer.current) hammer.current.rotation.z = -0.95 * (1 - smoothstep(hit));
    if (heat.current) heat.current.opacity = Math.min(0.95, hit * 0.95);
    if (glow.current) glow.current.opacity = 0.3 + hit * 0.25;
    if (strikeLight.current) strikeLight.current.intensity = 3 + hit * 46;
  });

  // editor placement: just above the anvil face, shifted left so the hammer on the right stays visible
  const editorPos: [number, number, number] = [FX - 1.2, FY + 4.89, FZ - 0.2];

  return (
    <group ref={root} name="scene-2-forge">
      {/* anvil + platform */}
      <group position={[FX, FY, FZ]}>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]}>
          <circleGeometry args={[7.6, 64]} />
          <meshStandardMaterial color="#080f22" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
          <ringGeometry args={[6.6, 6.72, 4]} />
          <meshBasicMaterial color="#2db7db" toneMapped={false} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
          <ringGeometry args={[4.4, 4.46, 4]} />
          <meshBasicMaterial color="#2347c5" toneMapped={false} />
        </mesh>
        <mesh geometry={anvilGeo} material={metal} scale={ANVIL_S} />
        {/* white-hot flash on the anvil face when struck */}
        <mesh position={[2.0, ANVIL_S * 2.05 + 0.02, 0.0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1.5, 1.1]} />
          <meshBasicMaterial ref={heat} color="#d9fbff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      {/* hammer: pivots at the far end of the handle and slams down on every scroll tick */}
      <group ref={hammer} position={[ANVIL_STRIKE[0] + 3.0, ANVIL_STRIKE[1] + 0.35, ANVIL_STRIKE[2]]}>
        <mesh position={[-1.5, 0, 0]} rotation-z={Math.PI / 2} material={metal}>
          <cylinderGeometry args={[0.1, 0.12, 3.0, 10]} />
        </mesh>
        <mesh position={[-3.0, 0, 0]} material={metal}>
          <boxGeometry args={[1.0, 0.66, 0.66]} />
        </mesh>
        <mesh position={[-3.0, 0, 0]}>
          <boxGeometry args={[1.02, 0.08, 0.68]} />
          <meshBasicMaterial color="#2db7db" toneMapped={false} />
        </mesh>
      </group>

      {/* editor glow plate sits behind the DOM editor so bloom frames it */}
      <mesh position={[editorPos[0], editorPos[1], editorPos[2] - 0.35]}>
        <planeGeometry args={[9, 5.6]} />
        <meshBasicMaterial ref={glow} map={glowMap} color="#2db7db" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* the editor itself: real DOM text in 3D (desktop landscape); an overlay on small screens */}
      {panelInScene && editorActive && (
        <Html transform position={editorPos} distanceFactor={3.857} zIndexRange={[20, 0]} pointerEvents="none" style={{ pointerEvents: "none" }}>
          <CodeEditorPanel />
        </Html>
      )}

      {scene1Variant === "factory"
        ? FORGE_BUBBLES.map((_, i) => <FlyingBubble key={i} index={i} />)
        : pieces.map((p, i) => <FlyingPiece key={i} piece={p} geoBook={geoBook} geoPaper={geoPaper} tex={billTex} />)}

      <pointLight ref={strikeLight} position={[ANVIL_STRIKE[0], ANVIL_STRIKE[1] + 0.9, ANVIL_STRIKE[2] + 1.0]} color="#8feaff" distance={13} decay={2} />
      <pointLight position={[FX - 3.5, FY + 6, FZ + 4]} color="#4a8cff" intensity={14} distance={18} decay={2} />
      <pointLight position={[FX + 3.5, FY + 3, FZ - 4]} color="#2347c5" intensity={18} distance={16} decay={2} />
    </group>
  );
}
