import * as THREE from "three";

/**
 * The live R3F camera, shared with the DOM overlay so labels can be pinned to 3D points.
 * CameraRig sets it and refreshes its matrices every frame.
 */
export const camShare: { cam: THREE.PerspectiveCamera | null; w: number; h: number } = { cam: null, w: 1, h: 1 };

const tmp = new THREE.Vector3();
/** Project a world point to CSS pixels. Returns null if it is behind the camera. */
export function projectToScreen(x: number, y: number, z: number, out: { x: number; y: number }): boolean {
  const cam = camShare.cam;
  if (!cam) return false;
  tmp.set(x, y, z).project(cam);
  if (tmp.z > 1 || tmp.z < -1) return false;
  out.x = (tmp.x * 0.5 + 0.5) * camShare.w;
  out.y = (-tmp.y * 0.5 + 0.5) * camShare.h;
  return true;
}
