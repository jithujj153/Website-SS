/**
 * Scroll ranges for the five story scenes (fractions of the pinned story section).
 * Every scene component and DOM overlay reads these, so retiming the story means editing one file.
 */
export const SCENES = {
  chaos: [0, 0.2],
  forge: [0.2, 0.4],
  build: [0.4, 0.6],
  city: [0.6, 0.85],
  live: [0.85, 1],
} as const;

export type SceneId = keyof typeof SCENES;
export const SCENE_ORDER: SceneId[] = ["chaos", "forge", "build", "city", "live"];

/** Height of the pinned story section, in viewport heights (one viewport is the sticky stage). */
export const STORY_VH = 900;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Progress 0..1 of `p` inside [a, b]. */
export const remap = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeOutBack = (t: number) => {
  const x = clamp01(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** 0 -> 1 -> 0 window with soft edges: opacity of a scene's copy. */
export function windowed(p: number, start: number, end: number, fade = 0.025) {
  return clamp01(Math.min((p - start) / fade, (end - p) / fade));
}

export function sceneAt(p: number): SceneId {
  for (const id of SCENE_ORDER) if (p < SCENES[id][1]) return id;
  return "live";
}

/** Timeline beats inside scenes (all as absolute story progress). */
export const BEATS = {
  // scene 2: code editor
  editorStart: 0.208,
  editorEnd: 0.39,
  // scene 3: terminal build log
  buildLogStart: 0.415,
  buildLogEnd: 0.575,
  panelsExtrude: [0.43, 0.54] as const,
  panelsCollapse: [0.585, 0.625] as const,
  // scene 4: city deploy order (start, duration)
  deploy: {
    fuel: [0.655, 0.04],
    school: [0.688, 0.04],
    cafe: [0.72, 0.04],
    tower: [0.752, 0.04],
    factory: [0.784, 0.04],
  } as const,
  hoverEnabled: [0.7, 0.865] as const,
  // scene 5
  status: [0.865, 0.89, 0.915, 0.94] as const, // Committed, Built, Tested, Live
  counters: 0.955,
} as const;
