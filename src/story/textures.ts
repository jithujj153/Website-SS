import * as THREE from "three";

/**
 * Procedural canvas textures. Everything in the 3D story is generated here, so the 3D payload is
 * essentially zero bytes (no GLB / image downloads).
 * NOTE: fonts are generic system stacks on purpose (canvas runs before webfonts are guaranteed loaded).
 */

const SANS = "600 {s}px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MONO = "500 {s}px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
const font = (tpl: string, size: number) => tpl.replace("{s}", String(size));

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return { c, ctx };
}

function toTexture(c: HTMLCanvasElement, srgb = true, repeat = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

/** deterministic pseudo-random so textures are stable across renders */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ------------------------------------------------------------------ chaos */

/** a paper bill / invoice (dim blue-grey paper, overdue stamp) */
export function billTexture(seed = 1) {
  const R = rng(seed);
  const { c, ctx } = makeCanvas(300, 400);
  const g = ctx.createLinearGradient(0, 0, 0, 400);
  g.addColorStop(0, "#cfd9ea");
  g.addColorStop(1, "#b9c6dc");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 300, 400);
  ctx.fillStyle = "#6f86ad";
  ctx.fillRect(0, 0, 300, 58);
  ctx.fillStyle = "#eaf2ff";
  ctx.font = font(SANS, 26);
  ctx.fillText("INVOICE", 18, 39);
  ctx.fillStyle = "rgba(20,35,70,0.55)";
  for (let i = 0; i < 9; i++) {
    const y = 90 + i * 28;
    ctx.fillRect(18, y, 110 + R() * 90, 7);
    ctx.fillRect(226, y, 56, 7);
  }
  ctx.fillStyle = "rgba(20,35,70,0.8)";
  ctx.font = font(SANS, 20);
  ctx.fillText("TOTAL", 18, 372);
  ctx.fillRect(196, 352, 86, 24);
  // stamp
  ctx.save();
  ctx.translate(165, 215);
  ctx.rotate(-0.28);
  ctx.strokeStyle = "rgba(214,69,80,0.75)";
  ctx.lineWidth = 5;
  ctx.strokeRect(-80, -26, 160, 52);
  ctx.fillStyle = "rgba(214,69,80,0.8)";
  ctx.font = font(SANS, 30);
  ctx.textAlign = "center";
  ctx.fillText("OVERDUE", 0, 11);
  ctx.restore();
  return toTexture(c);
}

export function receiptTexture(seed = 2) {
  const R = rng(seed);
  const { c, ctx } = makeCanvas(180, 520);
  ctx.fillStyle = "#d8e1ef";
  ctx.beginPath();
  ctx.moveTo(0, 8);
  for (let x = 0; x <= 180; x += 12) ctx.lineTo(x, x % 24 === 0 ? 0 : 8);
  ctx.lineTo(180, 512);
  for (let x = 180; x >= 0; x -= 12) ctx.lineTo(x, x % 24 === 0 ? 520 : 512);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(25,40,75,0.75)";
  ctx.font = font(MONO, 17);
  ctx.textAlign = "center";
  ctx.fillText("RECEIPT", 90, 44);
  ctx.textAlign = "left";
  ctx.fillText("- - - - - - - - -", 14, 68);
  for (let i = 0; i < 14; i++) {
    const y = 100 + i * 24;
    ctx.fillRect(14, y, 60 + R() * 50, 5);
    ctx.fillRect(138, y, 28, 5);
  }
  ctx.fillText("- - - - - - - - -", 14, 448);
  ctx.fillText("TOTAL", 14, 478);
  ctx.fillRect(110, 464, 56, 16);
  return toTexture(c);
}

export function stickyTexture(text: string, seed = 3) {
  const R = rng(seed);
  const { c, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = "#ffffff"; // tinted per-instance via instanceColor
  ctx.fillRect(0, 0, 256, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.12)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "rgba(25,35,70,0.82)";
  ctx.font = "700 40px 'Comic Sans MS', 'Segoe Print', cursive, sans-serif";
  const words = text.split(" ");
  let line = "";
  let y = 80;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > 210 && line) {
      ctx.save();
      ctx.translate(24, y);
      ctx.rotate((R() - 0.5) * 0.05);
      ctx.fillText(line, 0, 0);
      ctx.restore();
      line = w;
      y += 52;
    } else line = test;
  }
  ctx.fillText(line, 24, y);
  return toTexture(c);
}

/** spreadsheet printout with red #REF! cells */
export function sheetTexture(seed = 4) {
  const R = rng(seed);
  const cols = 6, rows = 10;
  const { c, ctx } = makeCanvas(480, 340);
  ctx.fillStyle = "#e1e8f4";
  ctx.fillRect(0, 0, 480, 340);
  const cw = 480 / cols, ch = 340 / rows;
  ctx.fillStyle = "#9fb4d8";
  ctx.fillRect(0, 0, 480, ch);
  ctx.strokeStyle = "rgba(60,85,130,0.45)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cw, 0);
    ctx.lineTo(i * cw, 340);
    ctx.stroke();
  }
  for (let j = 0; j <= rows; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * ch);
    ctx.lineTo(480, j * ch);
    ctx.stroke();
  }
  ctx.font = font(SANS, 15);
  ctx.textAlign = "center";
  for (let j = 1; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const r = R();
      if (r < 0.13) {
        ctx.fillStyle = "#d64550";
        ctx.fillRect(i * cw + 1, j * ch + 1, cw - 2, ch - 2);
        ctx.fillStyle = "#fff";
        ctx.fillText("#REF!", i * cw + cw / 2, j * ch + ch / 2 + 5);
      } else if (r < 0.2) {
        ctx.fillStyle = "rgba(214,69,80,0.18)";
        ctx.fillRect(i * cw + 1, j * ch + 1, cw - 2, ch - 2);
        ctx.fillStyle = "rgba(160,40,55,0.9)";
        ctx.fillText("#N/A", i * cw + cw / 2, j * ch + ch / 2 + 5);
      } else if (r < 0.82) {
        ctx.fillStyle = "rgba(25,40,75,0.55)";
        ctx.fillRect(i * cw + 8, j * ch + ch / 2 - 2, 14 + R() * (cw - 30), 5);
      }
    }
  }
  return toTexture(c);
}

/** chat bubble; `mine` flips colour/side */
export function chatTexture(text: string, mine: boolean) {
  const { c, ctx } = makeCanvas(640, 170);
  const w = 600, h = 110, x = mine ? 36 : 4, y = 20;
  roundRect(ctx, x, y, w, h, 34);
  ctx.fillStyle = mine ? "#2347c5" : "#18284d";
  ctx.fill();
  ctx.strokeStyle = mine ? "rgba(160,200,255,0.5)" : "rgba(120,170,230,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();
  // tail
  ctx.beginPath();
  const tx = mine ? x + w - 50 : x + 50;
  ctx.moveTo(tx, y + h - 2);
  ctx.lineTo(tx + (mine ? 22 : -22), y + h + 26);
  ctx.lineTo(tx + (mine ? -20 : 20), y + h - 2);
  ctx.closePath();
  ctx.fillStyle = mine ? "#2347c5" : "#18284d";
  ctx.fill();
  ctx.fillStyle = "#eaf2ff";
  ctx.font = "600 38px ui-sans-serif, system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 30, y + h / 2 + 2);
  return toTexture(c);
}

/* ------------------------------------------------------------ materials */

/** horizontal brushed-metal streaks, used as roughness + bump */
export function brushedMetalTexture() {
  const R = rng(99);
  const { c, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const y = R() * 512;
    const l = 60 + R() * 380;
    const x = R() * 512;
    const v = 100 + R() * 110;
    ctx.fillStyle = `rgba(${v},${v},${v},${0.05 + R() * 0.2})`;
    ctx.fillRect(x, y, l, 1 + R() * 1.4);
  }
  const t = toTexture(c, false, true);
  t.repeat.set(2, 2);
  return t;
}

/** lit-window map (emissive) for buildings: dark with scattered cyan windows */
export function windowsTexture(cols: number, rows: number, lit: number, seed = 5) {
  const R = rng(seed);
  const { c, ctx } = makeCanvas(cols * 24, rows * 24);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      if (R() < lit) {
        ctx.fillStyle = R() < 0.25 ? "#d9fbff" : "#2db7db";
        ctx.fillRect(i * 24 + 5, j * 24 + 5, 14, 14);
      } else {
        ctx.fillStyle = "#0d1c3d";
        ctx.fillRect(i * 24 + 5, j * 24 + 5, 14, 14);
      }
    }
  const t = toTexture(c);
  t.magFilter = THREE.NearestFilter;
  return t;
}

/** soft round glow, used by sparks and light flares */
export function glowTexture() {
  const { c, ctx } = makeCanvas(64, 64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return toTexture(c, false);
}

/* --------------------------------------------- build-output UI panels
   Illustrative UI only: bars and labels, no figures, no customer data. */

function panelFrame(ctx: CanvasRenderingContext2D, title: string) {
  const w = 512, h = 400;
  ctx.fillStyle = "#0d1730";
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "rgba(45,183,219,0.16)");
  g.addColorStop(1, "rgba(35,71,197,0.04)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#121f3f";
  ctx.fillRect(0, 0, w, 62);
  ctx.fillStyle = "#eaf2ff";
  ctx.font = font(SANS, 28);
  ctx.textBaseline = "middle";
  ctx.fillText(title, 24, 32);
  // diamond marker
  ctx.save();
  ctx.translate(w - 34, 31);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#2db7db";
  ctx.fillRect(-8, -8, 16, 16);
  ctx.restore();
  ctx.strokeStyle = "rgba(45,183,219,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
}

export function stockPanelTexture() {
  const R = rng(11);
  const { c, ctx } = makeCanvas(512, 400);
  panelFrame(ctx, "Stock");
  ctx.fillStyle = "#8fa3c4";
  ctx.font = font(SANS, 17);
  ctx.fillText("ITEM", 28, 92);
  ctx.fillText("ON HAND", 250, 92);
  ctx.fillText("STATUS", 392, 92);
  for (let i = 0; i < 7; i++) {
    const y = 120 + i * 38;
    ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)";
    ctx.fillRect(16, y - 8, 480, 34);
    ctx.fillStyle = "rgba(234,242,255,0.7)";
    ctx.fillRect(28, y + 4, 90 + R() * 80, 8);
    ctx.fillStyle = "rgba(45,183,219,0.9)";
    ctx.fillRect(250, y + 4, 40 + R() * 80, 8);
    const low = i === 2 || i === 5;
    ctx.fillStyle = low ? "rgba(143,163,196,0.5)" : "rgba(61,220,151,0.9)";
    roundRect(ctx, 392, y - 1, 64, 22, 11);
    ctx.fill();
  }
  return toTexture(c);
}

export function receiptPanelTexture() {
  const R = rng(12);
  const { c, ctx } = makeCanvas(512, 400);
  panelFrame(ctx, "Billing");
  for (let i = 0; i < 6; i++) {
    const y = 96 + i * 40;
    ctx.fillStyle = "rgba(234,242,255,0.65)";
    ctx.fillRect(34, y, 120 + R() * 120, 9);
    ctx.fillStyle = "rgba(143,163,196,0.8)";
    ctx.fillRect(390, y, 80, 9);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(30, 340);
  ctx.lineTo(482, 340);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#eaf2ff";
  ctx.font = font(SANS, 24);
  ctx.fillText("Total", 34, 372);
  ctx.fillStyle = "rgba(45,183,219,0.95)";
  ctx.fillRect(360, 362, 112, 14);
  // paid check
  ctx.strokeStyle = "#3ddc97";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(366, 316);
  ctx.lineTo(388, 338);
  ctx.lineTo(430, 290);
  ctx.stroke();
  return toTexture(c);
}

export function statusPanelTexture() {
  const R = rng(13);
  const { c, ctx } = makeCanvas(512, 400);
  panelFrame(ctx, "Status board");
  const colsT = ["QUEUED", "IN PROGRESS", "DONE"];
  const colsC = ["rgba(143,163,196,0.9)", "rgba(45,183,219,0.95)", "rgba(61,220,151,0.95)"];
  for (let k = 0; k < 3; k++) {
    const x = 20 + k * 162;
    ctx.fillStyle = colsC[k];
    ctx.font = font(SANS, 15);
    ctx.fillText(colsT[k], x + 6, 92);
    const n = k === 0 ? 3 : k === 1 ? 2 : 4;
    for (let i = 0; i < n; i++) {
      const y = 112 + i * 66;
      roundRect(ctx, x, y, 148, 54, 10);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
      ctx.fillStyle = colsC[k];
      ctx.fillRect(x + 12, y + 12, 6, 30);
      ctx.fillStyle = "rgba(234,242,255,0.7)";
      ctx.fillRect(x + 28, y + 14, 60 + R() * 40, 7);
      ctx.fillStyle = "rgba(143,163,196,0.6)";
      ctx.fillRect(x + 28, y + 32, 40 + R() * 30, 6);
    }
  }
  return toTexture(c);
}

export function chartPanelTexture() {
  const R = rng(14);
  const { c, ctx } = makeCanvas(512, 400);
  panelFrame(ctx, "Sales");
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(34, 110 + i * 54);
    ctx.lineTo(482, 110 + i * 54);
    ctx.stroke();
  }
  const bars = 8;
  let prev = 0;
  const pts: [number, number][] = [];
  for (let i = 0; i < bars; i++) {
    const v = 0.3 + 0.12 * i + R() * 0.2;
    prev = v;
    const bh = Math.min(0.95, v) * 200;
    const x = 44 + i * 54;
    const g = ctx.createLinearGradient(0, 330 - bh, 0, 330);
    g.addColorStop(0, "#2db7db");
    g.addColorStop(1, "#2347c5");
    ctx.fillStyle = g;
    ctx.fillRect(x, 330 - bh, 34, bh);
    pts.push([x + 17, 330 - bh - 18]);
  }
  void prev;
  ctx.strokeStyle = "#d9fbff";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  return toTexture(c);
}
