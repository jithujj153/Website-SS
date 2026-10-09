import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import type { Object3D } from "three";
import { story } from "@/story/store";

/** Hide a scene's objects outside [from, to] story progress (saves draw calls and CPU). */
export function useWindowVisible(ref: RefObject<Object3D | null>, from: number, to: number) {
  useFrame(() => {
    const o = ref.current;
    if (!o) return;
    const v = story.smooth >= from && story.smooth <= to;
    if (o.visible !== v) o.visible = v;
  });
}
