"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/story/store";
import { remap } from "@/story/ranges";
import { tabletTexture } from "@/story/floor-textures";
import { FLOOR_BEATS as B, MANAGER, TAB_C, TAB_N } from "@/story/floor-layout";
import { kit, lerp, smooth } from "./kit";
import { Person, applyArms, mixPose, useRig, type Pose } from "./People";

const IDLE_L: Pose = [0.1, 0.3, 0.05];
const IDLE_R: Pose = [0.1, 0.3, 0.05];
const CLIP: Pose = [0.62, 1.4, 0.18]; // clipboard held across the chest (left)
const RADIO_DOWN: Pose = [0.12, 0.55, 0.05];
const RADIO_UP: Pose = [0.8, 2.35, 0.0];
const TAB_L: Pose = [0.78, 1.0, 0.28];
const TAB_R: Pose = [0.78, 1.0, 0.28];

const faceYaw = (dx: number, dz: number) => Math.atan2(-dx, -dz);
function lerpAngle(a: number, b: number, t: number) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/** The floor manager: stands still in the middle, scans the hall, radio at his mouth, then types on a tablet. */
export function Manager() {
  const k = kit();
  const rig = useRig();
  const led = useRef<THREE.Mesh>(null!);
  const clip = useRef<THREE.Group>(null!);

  useFrame((s) => {
    const p = story.smooth;
    const t = s.clock.elapsedTime;
    const radioUp = smooth(remap(p, B.radio[0] - 0.004, B.radio[0] + 0.01)) * (1 - smooth(remap(p, B.tabletOn, B.tabletOn + 0.008)));
    const tab = smooth(remap(p, B.tabletOn, B.tabletOn + 0.014));
    const l = mixPose(mixPose(IDLE_L, CLIP, smooth(remap(p, 0, 0.03))), TAB_L, tab);
    let r = mixPose(RADIO_DOWN, RADIO_UP, radioUp);
    r = mixPose(r, TAB_R, tab);
    if (radioUp > 0.5 && tab < 0.2) r = [r[0] + Math.sin(t * 38) * 0.015, r[1], r[2]]; // the radio crackles
    applyArms(rig, l, r);
    // he scans the floor, then looks down at the tablet
    const scan = Math.sin(t * 0.55) * 0.55 * (1 - tab);
    rig.head.current.rotation.y = scan;
    rig.head.current.rotation.x = tab * 0.38;
    rig.torso.current.position.y = Math.sin(t * 1.6) * 0.004;
    if (clip.current) clip.current.visible = tab < 0.5;
    // radio LED
    const lm = led.current.material as THREE.MeshBasicMaterial;
    lm.color.set("#2db7db").multiplyScalar(radioUp > 0.3 ? (Math.sin(t * 22) > 0 ? 3.5 : 0.5) : 0.6);
  });

  return (
    <group position={MANAGER}>
      <Person
        rig={rig}
        scale={1.14}
        leftHand={
          <group ref={clip} position={[0.04, -0.02, -0.12]} rotation={[-1.1, 0.1, 0.2]}>
            <mesh geometry={k.box} material={k.m.darkSteel} scale={[0.24, 0.32, 0.02]} />
            <mesh geometry={k.box} material={k.m.paper} position={[0, 0, -0.012]} scale={[0.2, 0.28, 0.004]} />
            <mesh geometry={k.box} material={k.m.silver} position={[0, 0.17, 0]} scale={[0.1, 0.03, 0.03]} />
          </group>
        }
        rightHand={
          <group position={[0, -0.06, -0.02]} rotation={[0.2, 0, 0]}>
            <mesh geometry={k.box} material={k.m.darkSteel} scale={[0.055, 0.13, 0.04]} />
            <mesh geometry={k.cyl} material={k.m.silver} position={[0.018, 0.12, 0]} scale={[0.006, 0.12, 0.006]} />
            <mesh ref={led} geometry={k.sphere} material={new THREE.MeshBasicMaterial({ toneMapped: false })} position={[0, 0.045, -0.022]} scale={0.01} />
          </group>
        }
      />
    </group>
  );
}

/**
 * The tablet he types on. It lives in world space, outside the hall group, so it is still there when the hall
 * is hidden: the camera dives into its screen (it fills the view), passes through it, and falls into the void.
 */
export function Tablet() {
  const k = kit();
  const tabletTex = useMemo(() => tabletTexture(), []);
  const screenMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tabletTex, color: new THREE.Color("#ffffff").multiplyScalar(1.35), toneMapped: false }), [tabletTex]);
  const tablet = useRef<THREE.Group>(null!);
  // screen faces TAB_N; its top edge points away from the camera (towards the hall) so it reads upright from behind his shoulder
  const quat = useMemo(() => {
    const z = new THREE.Vector3(...TAB_N).normalize();
    const away = new THREE.Vector3(0, 0, -1);
    const y = away.sub(z.clone().multiplyScalar(away.dot(z))).normalize();
    const x = new THREE.Vector3().crossVectors(y, z);
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  }, []);
  useFrame(() => {
    const p = story.smooth;
    const tab = smooth(remap(p, B.tabletOn, B.tabletOn + 0.014));
    tablet.current.visible = p > B.tabletOn - 0.004 && p < 0.21;
    tablet.current.scale.setScalar(0.4 + 0.6 * tab);
  });
  return (
    <group ref={tablet} position={TAB_C} quaternion={quat}>
      <mesh geometry={k.box} material={k.m.darkSteel} scale={[0.37, 0.26, 0.012]} position={[0, 0, -0.008]} />
      <mesh material={screenMat} position={[0, 0, 0.0001]}>
        <planeGeometry args={[0.35, 0.24]} />
      </mesh>
    </group>
  );
}

/** The QC lead: stands at the QC table, then walks the rejected batch over to the manager. */
export function QCLead() {
  const k = kit();
  const rig = useRig();
  const A = useMemo(() => new THREE.Vector3(3.6, 0, -15.6), []);
  const Bp = useMemo(() => new THREE.Vector3(-1.75, 0, -7.7), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const yawWalk = faceYaw(Bp.x - A.x, Bp.z - A.z);
  const yawEnd = faceYaw(MANAGER[0] - Bp.x, MANAGER[2] - Bp.z);
  const yawIdle = faceYaw(-1, 0.4);

  useFrame((s) => {
    const p = story.smooth;
    const t = s.clock.elapsedTime;
    const u = remap(p, B.qcLeadWalk[0], B.qcLeadWalk[1]);
    const e = smooth(u);
    tmp.copy(A).lerp(Bp, e);
    const g = rig.root.current;
    g.position.copy(tmp);
    const walking = u > 0 && u < 1;
    g.rotation.y = u <= 0 ? yawIdle : lerpAngle(lerpAngle(yawIdle, yawWalk, smooth(remap(u, 0, 0.12))), yawEnd, smooth(remap(u, 0.86, 1)));
    const ph = e * 46;
    rig.lLeg.current.rotation.x = walking ? Math.sin(ph) * 0.6 : 0;
    rig.rLeg.current.rotation.x = walking ? -Math.sin(ph) * 0.6 : 0;
    g.position.y = walking ? Math.abs(Math.sin(ph)) * 0.03 : 0;
    // carrying the tray of rejected parts in front of him
    applyArms(rig, [0.9, 1.0, 0.12], [0.9, 1.0, 0.12]);
    rig.head.current.rotation.y = Math.sin(t * 0.7) * 0.2;
  });

  return (
    <Person
      rig={rig}
      hat="#9fd6ff"
      scale={1.12}
      leftHand={
        <group position={[0.12, -0.04, -0.12]}>
          <mesh geometry={k.box} material={k.m.steel} scale={[0.5, 0.04, 0.34]} />
          {[[-0.12, 0.05], [0.04, 0.03], [0.14, 0.06]].map(([x, z], i) => (
            <mesh key={i} geometry={k.box} material={k.m.body} position={[x, 0.05, z - 0.03]} scale={[0.14, 0.07, 0.12]} rotation-y={i} />
          ))}
        </group>
      }
    />
  );
}
