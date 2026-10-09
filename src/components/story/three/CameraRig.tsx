"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/story/store";
import { sampleCamera } from "@/story/camera-path";
import { camShare } from "@/story/camera-share";
import { useQuality } from "./quality";

/**
 * Scroll-driven camera. Position, look-at and FOV come from the eased spline in camera-path.ts.
 * On top of that: a hammer-strike pulse (push-in + micro roll), and a touch of pointer parallax on desktop.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const { mobile } = useQuality();
  const pos = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());
  const par = useRef({ x: 0, y: 0 });

  useFrame((_, dt) => {
    const p = story.smooth;
    const fov = sampleCamera(p, pos.current, look.current);

    // narrow screens: pull back so the scene still fits
    const aspect = size.width / size.height;
    const fit = THREE.MathUtils.clamp(1.25 / aspect, 1, 2.1);
    if (fit > 1) {
      dir.current.copy(pos.current).sub(look.current).multiplyScalar(fit);
      pos.current.copy(look.current).add(dir.current);
    }

    // pointer parallax (desktop only)
    if (!mobile) {
      const k = 1 - Math.exp(-dt * 3);
      par.current.x += (story.pointer.x - par.current.x) * k;
      par.current.y += (story.pointer.y - par.current.y) * k;
      pos.current.x += par.current.x * 0.35;
      pos.current.y += par.current.y * 0.2;
    }

    // hammer strike: tiny push along the view direction + roll
    const imp = story.impulse;
    camera.position.copy(pos.current);
    camera.lookAt(look.current);
    if (imp > 0.002) {
      camera.translateZ(-imp * 0.09);
      camera.rotateZ(imp * 0.0045 * (story.strikeCount % 2 ? 1 : -1));
    }
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    // let the DOM overlay pin labels to 3D points with the exact camera we are about to render
    camera.updateMatrixWorld();
    camShare.cam = camera;
    camShare.w = size.width;
    camShare.h = size.height;
  });

  return null;
}
