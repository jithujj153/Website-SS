/**
 * SCENE 1 (factory variant) layout: shared by the 3D hall, the camera path and the DOM tags/bubbles,
 * so a tag always sits on the thing it labels. Units are roughly metres; the hall floor is y = 0.
 * (The Forge anvil lives far below, at y = -24, and the tablet dive carries the camera down to it.)
 */
export type V3 = [number, number, number];

export const HALL = { halfW: 16, front: 17, back: -54 } as const;

/** The floor manager faces -z (into the hall); the gantry camera starts behind him. */
export const MANAGER: V3 = [0, 0, -5];

/** The tablet the manager types on (beat 4). N is the screen normal, pointing back at the camera. */
export const TAB_C: V3 = [0.05, 1.25, -5.55];
export const TAB_N: V3 = [0.4, 0.82, 0.4];

/** Zone anchors for the floating status tags. */
export const ZONES = {
  inventory: [-9.4, 5.2, -9] as V3,
  production: [8.2, 4.6, -7] as V3,
  qc: [1.4, 3.1, -17.5] as V3,
};

export const GLASS_OFFICE = { x: 0, y: 3.4, z: -30, w: 12, d: 6, h: 3.6 } as const;
export const CLOCK_POS: V3 = [0, 8.2, -27];
export const WELD_POINT: V3 = [6.1, 1.5, -2.6];

/** Story-progress timings for the floor (all inside Scene 1: 0 to 0.2). */
export const FLOOR_BEATS = {
  beat1: [-0.1, 0.04],
  zonesIn: [0.05, 0.075, 0.098], // Stock / Job status / Passed tags appear
  qcLeadWalk: [0.1, 0.132], // QC lead walks to the manager with the rejected batch
  redLight: 0.112, // a machine light turns red
  radio: [0.108, 0.158], // radio crackles
  copy3: [0.104, 0.166],
  scatter: [0.112, 0.172], // paper job cards scatter
  collapse: [0.158, 0.174], // every tag and bubble collapses into one
  tabletType: [0.168, 0.196],
  tabletOn: 0.158, // the clipboard is swapped for the tablet
  dive: [0.176, 0.2],
} as const;

export interface FloorBubble {
  id: string;
  text: string;
  chip: string;
  /** story progress at which it appears */
  at: number;
  /** slot (px offset from the manager's head) in the thought-bubble cluster */
  slot: [number, number];
  /** code it becomes in the Forge, if any */
  code?: string;
}

/** beat 2 (one at a time) + beat 3 (overlapping, rising faster than he can read them) */
export const FLOOR_BUBBLES: FloorBubble[] = [
  { id: "orders", text: "Which orders are running right now?", chip: "UNKNOWN", at: 0.048, slot: [-30, -78], code: "trackOrders()" },
  { id: "stock", text: "Is the raw material actually in stock?", chip: "CHECK", at: 0.07, slot: [190, -128], code: "syncInventory()" },
  { id: "stuck", text: "Which job is stuck on that machine?", chip: "DELAYED?", at: 0.09, slot: [-250, -150] },
  { id: "deadline", text: "Which orders will miss the deadline?", chip: "AT RISK", at: 0.108, slot: [-40, -205] },
  { id: "qc", text: "How many parts failed QC today?", chip: "REJECTS", at: 0.119, slot: [250, -215], code: "logQC(batch)" },
  { id: "idle", text: "Why is that machine idle?", chip: "IDLE", at: 0.129, slot: [-300, -270], code: "machineStatus(id)" },
  { id: "client", text: "The client is calling. Where is their order?", chip: "URGENT", at: 0.14, slot: [100, -285] },
  { id: "jobcard", text: "Who changed this job card?", chip: "UNTRACKED", at: 0.15, slot: [-170, -330] },
];

/** the four bubbles that become code at the anvil, in order */
export const FORGE_BUBBLES = FLOOR_BUBBLES.filter((b) => b.code);

export interface FloorTag {
  id: string;
  text: string;
  at: number;
  pos: V3;
}
export const FLOOR_TAGS: FloorTag[] = [
  { id: "stock", text: "Stock", at: FLOOR_BEATS.zonesIn[0], pos: ZONES.inventory },
  { id: "job", text: "Job status", at: FLOOR_BEATS.zonesIn[1], pos: ZONES.production },
  { id: "passed", text: "Passed", at: FLOOR_BEATS.zonesIn[2], pos: ZONES.qc },
];

/** Mobile shows three bubbles only. */
export const MOBILE_BUBBLE_IDS = ["orders", "stock", "qc"];

/**
 * Scene 2 (factory): each hammer strike pulls one of the manager's bubbles onto the anvil and turns it into code.
 * `end` is where (0..1 through the editor's scroll window) the bubble finishes converting; the editor types the line then.
 */
export const FORGE_FIELDS: Record<string, string> = { orders: "orders", stock: "stock", qc: "quality", idle: "machines" };
export const FORGE_ENDS = [0.3, 0.46, 0.62, 0.78];
