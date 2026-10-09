"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cityActive, emitStrike, story } from "@/story/store";
import { BEATS, easeOutBack, remap, smoothstep } from "@/story/ranges";
import { CITY } from "@/story/camera-path";
import { GRID, LOTS, PITCH, TILE, lotPosition } from "@/story/city-layout";
import { emitSparks } from "@/story/sparks-bus";
import { glowTexture, rng, windowsTexture } from "@/story/textures";
import type { CityBuildingId } from "@/config/content";
import { useWindowVisible } from "./useWindow";
import { byTier, useQuality } from "./quality";

/**
 * SCENE 4: PRODUCT CITY  (scroll 60 - 85%)
 * The camera comes through the screen and pulls back to an isometric view of a small city built on diamond
 * tiles. Buildings "deploy" one by one (rise, flash white-hot cyan, settle to brand blue):
 *   fuel station = Fuel Pump ERP, Montessori school = Student Relationship Management,
 *   cafe = Restaurant & Cafe Management / Billing, office tower = HRMS, factory = Factory Management Systems.
 * Interaction is hover only (tap on mobile): the lot lifts and a glass card slides up in the DOM overlay.
 * The buildings are not links; the card's "Request demo" button goes to /contact with the product pre-selected.
 */

const HOT = new THREE.Color("#d9fbff");
const SETTLED = new THREE.Color("#2347c5");
const NEON = new THREE.Color("#8feaff");

interface Mats {
  /** emissive colour / intensity the body settles to after deploying */
  bodySettled: THREE.Color;
  bodyBase: number;
  body: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  white: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  light: THREE.MeshBasicMaterial;
}

function useMats(windows?: THREE.Texture): Mats {
  return useMemo(
    () => ({
      bodySettled: windows ? new THREE.Color("#cfeaff") : SETTLED.clone(),
      bodyBase: windows ? 1.15 : 0.14,
      body: new THREE.MeshStandardMaterial({
        color: "#1a2b55", metalness: 0.45, roughness: 0.5, emissive: windows ? new THREE.Color("#cfeaff") : SETTLED.clone(), emissiveIntensity: windows ? 1.15 : 0.14,
        ...(windows ? { emissiveMap: windows } : {}),
      }),
      trim: new THREE.MeshStandardMaterial({ color: "#2347c5", metalness: 0.3, roughness: 0.4, emissive: SETTLED.clone(), emissiveIntensity: 0.9 }),
      white: new THREE.MeshStandardMaterial({ color: "#cfe0ff", roughness: 0.6, emissive: "#9fb8ff", emissiveIntensity: 0.12 }),
      roof: new THREE.MeshStandardMaterial({ color: "#10214a", metalness: 0.6, roughness: 0.45, emissive: SETTLED.clone(), emissiveIntensity: 0.1 }),
      light: new THREE.MeshBasicMaterial({ color: NEON.clone(), toneMapped: false }),
    }),
    [windows],
  );
}

/** One lot: handles deploy animation, flash, hover lift, shockwave ring and pointer events. */
function Lot({ id, mats, topY, children }: { id: CityBuildingId; mats: Mats; topY: number; children: ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const marker = useRef<THREE.Mesh>(null!);
  const st = useMemo(() => ({ hover: 0, target: 0, prev: 0 }), []);
  const [start, dur] = BEATS.deploy[id];
  const pos = lotPosition(id);
  const h = LOTS[id].h;
  const { tier } = useQuality();

  const enabled = () => story.smooth >= BEATS.hoverEnabled[0] && story.smooth <= BEATS.hoverEnabled[1];

  // when the card closes elsewhere, drop our hover target
  useEffect(
    () =>
      cityActive.subscribe(() => {
        st.target = cityActive.get() === id ? 1 : 0;
      }),
    [id, st],
  );

  useFrame((s, dt) => {
    const p = story.smooth;
    const d = remap(p, start, start + dur);
    const rise = easeOutBack(d);
    const vis = d > 0.001;
    group.current.visible = vis;
    if (!vis) {
      st.prev = d;
      return;
    }
    // hover lift
    st.hover += (st.target - st.hover) * (1 - Math.exp(-dt * 10));
    inner.current.scale.set(1, Math.max(0.001, rise), 1);
    group.current.position.y = pos[1] + st.hover * 0.14;

    // white-hot while deploying, then settles to brand blue
    const hot = d <= 0 ? 0 : 1 - smoothstep(remap(p, start + dur * 0.45, start + dur + 0.07));
    const hv = st.hover;
    mats.body.emissive.copy(mats.bodySettled).lerp(HOT, hot);
    mats.body.emissiveIntensity = mats.bodyBase + hot * 1.5 + hv * 0.35;
    mats.trim.emissive.copy(SETTLED).lerp(HOT, hot);
    mats.trim.emissiveIntensity = 0.9 + hot * 2.2 + hv * 1.1;
    mats.roof.emissive.copy(SETTLED).lerp(HOT, hot);
    mats.roof.emissiveIntensity = 0.1 + hot * 1.2 + hv * 0.3;
    mats.white.emissiveIntensity = 0.12 + hot * 1.1 + hv * 0.25;

    // shockwave ring on the tile
    const rt = remap(p, start, start + 0.055);
    ring.current.visible = rt > 0 && rt < 1;
    if (ring.current.visible) {
      ring.current.scale.setScalar(0.6 + rt * 4.2);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - rt) * 0.9;
    }

    // idle diamond marker hints that the lot is interactive; it grows on hover
    const t = s.clock.elapsedTime;
    const ready = smoothstep(remap(p, start + dur, start + dur + 0.03));
    marker.current.visible = ready > 0.01;
    marker.current.position.y = topY + 0.9 + Math.sin(t * 2 + pos[0]) * 0.12 + hv * 0.2;
    marker.current.rotation.y = t * 1.2;
    marker.current.scale.setScalar(ready * (0.42 + hv * 0.5));

    // deploy burst (forward scrolling only)
    if (st.prev < 0.03 && d >= 0.03 && story.direction > 0) {
      emitSparks({ origin: [pos[0], pos[1] + 0.3, pos[2]], count: byTier(tier, 20, 34, 44), power: 0.95, cone: 1.35 });
      story.impulse = Math.min(1.25, story.impulse + 0.55);
    }
    st.prev = d;
  });

  return (
    <group
      ref={group}
      position={pos}
      onPointerOver={(e) => {
        if (!enabled() || e.pointerType === "touch") return;
        e.stopPropagation();
        cityActive.set(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        if (e.pointerType === "touch") return;
        document.body.style.cursor = "";
        if (cityActive.get() === id) cityActive.clearSoon();
      }}
      onClick={(e) => {
        if (!enabled()) return;
        e.stopPropagation();
        cityActive.set(cityActive.get() === id ? null : id);
      }}
    >
      {/* generous invisible hit box so hovering feels forgiving */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[TILE, h, TILE]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={inner}>{children}</group>
      <mesh ref={ring} rotation-x={-Math.PI / 2} rotation-z={Math.PI / 4} position={[0, 0.06, 0]}>
        <ringGeometry args={[1.0, 1.12, 4]} />
        <meshBasicMaterial color="#d9fbff" transparent toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={marker} position={[0, topY + 0.9, 0]}>
        <octahedronGeometry args={[0.32, 0]} />
        <meshBasicMaterial color="#8feaff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Box({ s, p, m, r }: { s: [number, number, number]; p: [number, number, number]; m: THREE.Material; r?: [number, number, number] }) {
  return (
    <mesh position={p} rotation={r} material={m}>
      <boxGeometry args={s} />
    </mesh>
  );
}

/* ----------------------------------------------------------------- buildings */

function FuelStation() {
  const mats = useMats();
  return (
    <Lot id="fuel" mats={mats} topY={LOTS.fuel.h}>
      {/* canopy on four columns */}
      <Box s={[3.0, 0.16, 2.0]} p={[0, 2.1, 0.2]} m={mats.roof} />
      <Box s={[3.04, 0.07, 0.07]} p={[0, 2.1, 1.22]} m={mats.light} />
      <Box s={[2.8, 0.05, 1.8]} p={[0, 2.0, 0.2]} m={mats.light} />
      {[-1.3, 1.3].flatMap((x) => [-0.55, 0.9].map((z) => <Box key={`${x}${z}`} s={[0.1, 2.0, 0.1]} p={[x, 1.0, z]} m={mats.white} />))}
      {/* pump island + two pumps */}
      <Box s={[1.9, 0.12, 1.1]} p={[0, 0.06, 0.2]} m={mats.body} />
      {[-0.55, 0.55].map((x) => (
        <group key={x} position={[x, 0, 0.2]}>
          <Box s={[0.42, 0.95, 0.34]} p={[0, 0.58, 0]} m={mats.trim} />
          <Box s={[0.3, 0.24, 0.02]} p={[0, 0.86, 0.18]} m={mats.light} />
        </group>
      ))}
      {/* shop at the back */}
      <Box s={[1.5, 1.15, 0.9]} p={[0.5, 0.58, -1.05]} m={mats.body} />
      <Box s={[1.3, 0.55, 0.03]} p={[0.5, 0.6, -0.59]} m={mats.light} />
      {/* price pylon */}
      <Box s={[0.1, 2.6, 0.1]} p={[-1.35, 1.3, -1.1]} m={mats.white} />
      <Box s={[0.6, 0.8, 0.12]} p={[-1.35, 2.65, -1.1]} m={mats.trim} />
      <Box s={[0.42, 0.14, 0.02]} p={[-1.35, 2.82, -1.03]} m={mats.light} />
      <Box s={[0.42, 0.14, 0.02]} p={[-1.35, 2.52, -1.03]} m={mats.light} />
    </Lot>
  );
}

function useRoofGeometry(width: number, height: number, depth: number) {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(0, height);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
    g.translate(0, 0, -depth / 2);
    return g;
  }, [width, height, depth]);
}

function School() {
  const mats = useMats();
  const roof = useRoofGeometry(3.0, 0.85, 1.7);
  return (
    <Lot id="school" mats={mats} topY={LOTS.school.h}>
      <Box s={[2.7, 1.35, 1.55]} p={[0, 0.68, 0]} m={mats.body} />
      <mesh geometry={roof} material={mats.roof} position={[0, 1.35, 0]} />
      {/* entrance arch + window row */}
      <Box s={[0.55, 0.8, 0.05]} p={[0, 0.4, 0.8]} m={mats.light} />
      {[-0.95, -0.5, 0.5, 0.95].map((x) => (
        <Box key={x} s={[0.3, 0.38, 0.04]} p={[x, 0.82, 0.8]} m={mats.light} />
      ))}
      {/* gable clock */}
      <mesh position={[0, 1.75, 0.86]}>
        <circleGeometry args={[0.22, 20]} />
        <meshBasicMaterial color="#d9fbff" toneMapped={false} />
      </mesh>
      {/* flag */}
      <Box s={[0.05, 1.5, 0.05]} p={[1.15, 2.2, -0.5]} m={mats.white} />
      <Box s={[0.5, 0.28, 0.02]} p={[1.42, 2.78, -0.5]} m={mats.trim} />
      {/* play blocks and a small slide */}
      <Box s={[0.34, 0.34, 0.34]} p={[-1.0, 0.17, 1.15]} m={mats.trim} />
      <Box s={[0.34, 0.34, 0.34]} p={[-0.62, 0.17, 1.2]} m={mats.white} />
      <Box s={[0.34, 0.34, 0.34]} p={[-0.8, 0.5, 1.17]} m={mats.light} />
      <Box s={[0.35, 0.05, 0.9]} p={[1.05, 0.38, 1.1]} m={mats.white} r={[0.5, 0, 0]} />
    </Lot>
  );
}

function Cafe() {
  const mats = useMats();
  const stripes = [0, 1, 2, 3, 4, 5];
  return (
    <Lot id="cafe" mats={mats} topY={LOTS.cafe.h}>
      <Box s={[2.1, 1.15, 1.6]} p={[0, 0.58, -0.1]} m={mats.body} />
      <Box s={[2.14, 0.1, 1.64]} p={[0, 1.2, -0.1]} m={mats.roof} />
      {/* striped awning */}
      {stripes.map((i) => (
        <Box key={i} s={[0.36, 0.06, 0.8]} p={[-0.9 + i * 0.36, 1.02, 0.95]} m={i % 2 ? mats.white : mats.trim} r={[0.42, 0, 0]} />
      ))}
      <Box s={[1.5, 0.6, 0.03]} p={[0, 0.55, 0.71]} m={mats.light} />
      {/* neon cup sign */}
      <mesh position={[0, 1.62, -0.1]} material={mats.light}>
        <cylinderGeometry args={[0.2, 0.15, 0.3, 14]} />
      </mesh>
      <mesh position={[0.22, 1.62, -0.1]} rotation-z={Math.PI / 2} material={mats.light}>
        <torusGeometry args={[0.09, 0.025, 6, 12]} />
      </mesh>
      {/* patio tables + umbrellas */}
      {[-0.85, 0.85].map((x) => (
        <group key={x} position={[x, 0, 1.55]}>
          <mesh position={[0, 0.34, 0]} material={mats.white}>
            <cylinderGeometry args={[0.03, 0.03, 0.68, 6]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} material={mats.white}>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 14]} />
          </mesh>
          <mesh position={[0, 1.15, 0]} material={x < 0 ? mats.trim : mats.white}>
            <coneGeometry args={[0.6, 0.28, 8]} />
          </mesh>
        </group>
      ))}
    </Lot>
  );
}

function Tower() {
  const windows = useMemo(() => windowsTexture(6, 30, 0.55, 8), []);
  windows.wrapS = windows.wrapT = THREE.RepeatWrapping;
  const mats = useMats(windows);
  return (
    <Lot id="tower" mats={mats} topY={LOTS.tower.h}>
      <Box s={[2.7, 0.7, 2.7]} p={[0, 0.35, 0]} m={mats.roof} />
      <Box s={[1.7, 6.2, 1.7]} p={[0, 3.8, 0]} m={mats.body} />
      <Box s={[1.2, 0.8, 1.2]} p={[0, 7.3, 0]} m={mats.roof} />
      <Box s={[0.05, 1.5, 0.05]} p={[0, 8.4, 0]} m={mats.white} />
      <Box s={[0.14, 0.14, 0.14]} p={[0, 9.2, 0]} m={mats.light} />
      {/* corner light strips */}
      {[-0.86, 0.86].flatMap((x) => [-0.86, 0.86].map((z) => <Box key={`${x}${z}`} s={[0.05, 6.2, 0.05]} p={[x, 3.8, z]} m={mats.light} />))}
    </Lot>
  );
}

function Steam({ origin, count }: { origin: [number, number, number]; count: number }) {
  const map = useMemo(() => glowTexture(), []);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    refs.current.forEach((sp, i) => {
      if (!sp) return;
      const u = (t * 0.28 + i / count) % 1;
      sp.position.set(origin[0] + Math.sin(u * 5 + i) * 0.18, origin[1] + u * 2.4, origin[2]);
      sp.scale.setScalar(0.35 + u * 1.1);
      (sp.material as THREE.SpriteMaterial).opacity = 0.42 * (1 - u) * Math.min(1, u * 6);
    });
  });
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <sprite key={i} ref={(el) => void (refs.current[i] = el)}>
          <spriteMaterial map={map} color="#bff6ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}
    </>
  );
}

function Factory() {
  const { tier } = useQuality();
  const mats = useMats();
  const saw = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(1.0, 0);
    s.lineTo(1.0, 0.6);
    s.closePath(); // right triangle: the classic sawtooth
    const g = new THREE.ExtrudeGeometry(s, { depth: 2.1, bevelEnabled: false });
    g.translate(-0.5, 0, -1.05);
    return g;
  }, []);
  return (
    <Lot id="factory" mats={mats} topY={LOTS.factory.h}>
      <Box s={[3.1, 1.5, 2.1]} p={[0, 0.75, 0]} m={mats.body} />
      {[-1.0, 0, 1.0].map((x) => (
        <mesh key={x} geometry={saw} material={mats.roof} position={[x, 1.5, 0]} />
      ))}
      <Box s={[2.6, 0.5, 0.03]} p={[0, 1.0, 1.06]} m={mats.light} />
      <Box s={[0.8, 0.8, 0.04]} p={[1.2, 0.4, 1.07]} m={mats.trim} />
      {/* chimneys */}
      {[-0.95, 0.35].map((x) => (
        <group key={x} position={[x, 0, -0.55]}>
          <mesh position={[0, 2.1, 0]} material={mats.white}>
            <cylinderGeometry args={[0.2, 0.26, 2.2, 10]} />
          </mesh>
          <mesh position={[0, 3.18, 0]} material={mats.light}>
            <cylinderGeometry args={[0.22, 0.22, 0.06, 10]} />
          </mesh>
        </group>
      ))}
      <Steam origin={[-0.95, 3.25, -0.55]} count={byTier(tier, 3, 5, 6)} />
      <Steam origin={[0.35, 3.25, -0.55]} count={byTier(tier, 3, 5, 6)} />
      {/* loading dock + conveyor */}
      <Box s={[1.4, 0.18, 0.5]} p={[-0.3, 0.3, 1.5]} m={mats.trim} />
      <Box s={[0.4, 0.4, 0.4]} p={[-0.7, 0.58, 1.5]} m={mats.white} />
    </Lot>
  );
}

/* ------------------------------------------------------------ base + fillers */

/** diamond tile base: 5x5 glass tiles, a slab beneath, and the logo's diamond as a ground inlay */
function CityBase() {
  const { tier } = useQuality();
  const tiles = useRef<THREE.InstancedMesh>(null!);
  const tileGeo = useMemo(() => new THREE.BoxGeometry(TILE, 0.3, TILE), []);
  const edgeGeo = useMemo(() => {
    const pts: number[] = [];
    const y = 0.16;
    for (let i = -2; i <= 2; i++)
      for (let j = -2; j <= 2; j++) {
        const cx = i * PITCH, cz = j * PITCH, h = TILE / 2;
        const c = [[cx - h, cz - h], [cx + h, cz - h], [cx + h, cz + h], [cx - h, cz + h]];
        for (let k = 0; k < 4; k++) {
          const a = c[k], b = c[(k + 1) % 4];
          pts.push(a[0], y, a[1], b[0], y, b[1]);
        }
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useEffect(() => {
    const m = new THREE.Matrix4();
    let n = 0;
    for (let i = -2; i <= 2; i++)
      for (let j = -2; j <= 2; j++) {
        m.makeTranslation(i * PITCH, -0.15, j * PITCH);
        tiles.current.setMatrixAt(n++, m);
      }
    tiles.current.instanceMatrix.needsUpdate = true;
  }, []);

  const baseRef = useRef<THREE.Group>(null!);
  useFrame(() => {
    // the base fades in as the camera arrives (0.6 - 0.66)
    const a = smoothstep(remap(story.smooth, 0.585, 0.65));
    baseRef.current.visible = a > 0.01;
    baseRef.current.scale.set(1, 0.2 + 0.8 * a, 1);
  });

  return (
    <group ref={baseRef} position={[CITY[0], CITY[1], CITY[2]]}>
      <instancedMesh ref={tiles} args={[tileGeo, undefined, GRID * GRID]}>
        <meshStandardMaterial color="#0c1838" metalness={0.65} roughness={0.35} emissive="#0e2a63" emissiveIntensity={0.45} />
      </instancedMesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color="#2db7db" transparent opacity={0.65} toneMapped={false} />
      </lineSegments>
      <mesh position={[0, -0.68, 0]}>
        <boxGeometry args={[18.4, 0.7, 18.4]} />
        <meshStandardMaterial color="#0a1430" metalness={0.8} roughness={0.35} emissive="#0b1d4a" emissiveIntensity={0.4} />
      </mesh>
      <lineSegments position={[0, -0.33, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(18.4, 0.01, 18.4)]} />
        <lineBasicMaterial color="#2347c5" toneMapped={false} />
      </lineSegments>
      {/* the logo's diamond, big, on the ground around the city */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.04, 0]} rotation-z={Math.PI / 4}>
        <ringGeometry args={[15.2, 15.4, 4]} />
        <meshBasicMaterial color="#2db7db" toneMapped={false} transparent opacity={0.7} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.04, 0]} rotation-z={Math.PI / 4}>
        <ringGeometry args={[19.4, 19.46, 4]} />
        <meshBasicMaterial color="#2347c5" toneMapped={false} transparent opacity={0.55} />
      </mesh>
      {tier > 0 && (
        <mesh rotation-x={-Math.PI / 2} position={[0, -1.1, 0]}>
          <circleGeometry args={[40, 48]} />
          <meshStandardMaterial color="#070d20" metalness={0.8} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

/** smaller supporting blocks on the free tiles: they light up after the five products */
function Fillers() {
  const { tier } = useQuality();
  const windows = useMemo(() => windowsTexture(3, 10, 0.5, 21), []);
  const items = useMemo(() => {
    const R = rng(5150);
    const taken = new Set(Object.values(LOTS).map((l) => `${l.gx},${l.gz}`));
    const out: { x: number; z: number; w: number; h: number; d: number; delay: number }[] = [];
    for (let i = -2; i <= 2; i++)
      for (let j = -2; j <= 2; j++) {
        if (taken.has(`${i},${j}`)) continue;
        if (R() < 0.38) continue; // leave plazas and roads
        out.push({ x: i * PITCH, z: j * PITCH, w: 1.3 + R() * 0.9, d: 1.3 + R() * 0.9, h: 0.5 + R() * 1.7, delay: R() });
      }
    return out.slice(0, byTier(tier, 6, 10, 14));
  }, [tier]);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#14234a", metalness: 0.4, roughness: 0.55, emissive: "#bfe8ff", emissiveMap: windows, emissiveIntensity: 0.9 }),
    [windows],
  );
  useFrame(() => {
    const p = story.smooth;
    items.forEach((it, i) => {
      const m = refs.current[i];
      if (!m) return;
      const d = remap(p, 0.8 + it.delay * 0.05, 0.835 + it.delay * 0.05);
      m.visible = d > 0.001;
      m.scale.y = Math.max(0.001, easeOutBack(d)) * it.h;
      m.position.y = (it.h * Math.max(0.001, easeOutBack(d))) / 2;
    });
  });
  return (
    <group position={[CITY[0], CITY[1], CITY[2]]}>
      {items.map((it, i) => (
        <mesh key={i} ref={(el) => void (refs.current[i] = el)} position={[it.x, 0, it.z]} scale={[it.w, 1, it.d]} material={mat}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

export function Scene4City() {
  const root = useRef<THREE.Group>(null!);
  useWindowVisible(root, 0.55, 1.01);
  return (
    <group ref={root} name="scene-4-city">
      <CityBase />
      <FuelStation />
      <School />
      <Cafe />
      <Tower />
      <Factory />
      <Fillers />
      <pointLight position={[CITY[0], CITY[1] + 7, CITY[2]]} color="#7fe3ff" intensity={55} distance={34} decay={2} />
      <pointLight position={[CITY[0] + 10, CITY[1] + 3, CITY[2] - 10]} color="#2347c5" intensity={40} distance={30} decay={2} />
      <pointLight position={[CITY[0] - 9, CITY[1] + 5, CITY[2] + 9]} color="#4a8cff" intensity={30} distance={26} decay={2} />
    </group>
  );
}
