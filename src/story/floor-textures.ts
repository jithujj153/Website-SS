import * as THREE from "three";
import { rng } from "./textures";

/** Procedural canvas textures for SCENE 1 (factory variant) and its Forge hand-off. No image files. */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d")! };
}
function tex(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** A thought bubble as it travels to the anvil in the Forge: glass pill, text, red status chip. */
export function floorBubbleTexture(text: string, chip: string) {
  const { c, ctx } = makeCanvas(640, 230);
  rr(ctx, 6, 6, 628, 190, 46);
  ctx.fillStyle = "rgba(13,23,48,0.96)";
  ctx.fill();
  ctx.strokeStyle = "rgba(143,214,255,0.55)";
  ctx.lineWidth = 3;
  ctx.stroke();
  // tail
  ctx.beginPath();
  ctx.moveTo(110, 190);
  ctx.lineTo(80, 226);
  ctx.lineTo(150, 192);
  ctx.closePath();
  ctx.fillStyle = "rgba(13,23,48,0.96)";
  ctx.fill();
  ctx.fillStyle = "#eaf2ff";
  ctx.font = "600 40px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "middle";
  const lines = wrap(ctx, text, 540);
  const y0 = 92 - ((lines.length - 1) * 48) / 2 - 14;
  lines.forEach((l, i) => ctx.fillText(l, 40, y0 + i * 48));
  // red chip
  ctx.font = "700 26px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
  const cw = ctx.measureText(chip).width + 36;
  rr(ctx, 40, 140, cw, 40, 20);
  ctx.fillStyle = "#d64550";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillText(chip, 58, 161);
  return tex(c);
}

/** Digital shift clock. */
export function clockTexture(time = "11:40") {
  const { c, ctx } = makeCanvas(512, 224);
  rr(ctx, 4, 4, 504, 216, 26);
  ctx.fillStyle = "#050a18";
  ctx.fill();
  ctx.strokeStyle = "rgba(143,214,255,0.5)";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.font = "500 24px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
  ctx.fillStyle = "#8fa3c4";
  ctx.fillText("SHIFT 2", 36, 50);
  ctx.font = "700 150px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
  ctx.fillStyle = "#d9fbff";
  ctx.shadowColor = "#2db7db";
  ctx.shadowBlur = 24;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(time, 40, 186);
  return tex(c);
}

/** A paper job card pinned on the board. */
export function jobCardTexture(seed: number) {
  const R = rng(seed);
  const { c, ctx } = makeCanvas(128, 168);
  ctx.fillStyle = "#dfe8f6";
  ctx.fillRect(0, 0, 128, 168);
  ctx.fillStyle = ["#2347c5", "#2db7db", "#4a8cff", "#7391ff"][Math.floor(R() * 4)];
  ctx.fillRect(0, 0, 128, 26);
  ctx.fillStyle = "#0d1730";
  for (let i = 0; i < 7; i++) ctx.fillRect(12, 42 + i * 16, 40 + R() * 64, 5);
  ctx.fillStyle = "rgba(13,23,48,0.55)";
  ctx.fillRect(12, 152, 56, 6);
  return tex(c);
}

/** The tablet screen the camera dives through: it already looks like the Forge editor. */
export function tabletTexture() {
  const { c, ctx } = makeCanvas(640, 440);
  const g = ctx.createLinearGradient(0, 0, 0, 440);
  g.addColorStop(0, "#0d1b3d");
  g.addColorStop(1, "#071030");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 640, 440);
  ctx.fillStyle = "#121f3f";
  ctx.fillRect(0, 0, 640, 44);
  ["#8fa3c4", "#8fa3c4", "#8fa3c4"].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(24 + i * 22, 22, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.font = "500 22px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
  ctx.fillStyle = "#8fa3c4";
  ctx.fillText("floor.ts", 96, 29);
  const R = rng(5);
  const colors = ["#7fe3ff", "#8ea6ff", "#eaf2ff", "#7fe3ff"];
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = "#4a5d85";
    ctx.fillText(String(i + 1), 28, 90 + i * 34);
    ctx.fillStyle = colors[i % 4];
    ctx.globalAlpha = 0.9;
    ctx.fillRect(66 + (i % 3) * 22, 78 + i * 34, 120 + R() * 280, 10);
    ctx.globalAlpha = 1;
  }
  // input line
  rr(ctx, 24, 386, 592, 38, 10);
  ctx.fillStyle = "rgba(45,183,219,0.14)";
  ctx.fill();
  ctx.strokeStyle = "rgba(45,183,219,0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#d9fbff";
  ctx.fillRect(40, 396, 3, 18);
  return tex(c);
}

/** soft vertical light shaft (alpha gradient, additive) */
export function shaftTexture() {
  const { c, ctx } = makeCanvas(64, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.5, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 256);
  // fade the sides
  ctx.globalCompositeOperation = "destination-in";
  const h = ctx.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, "rgba(0,0,0,0)");
  h.addColorStop(0.5, "rgba(0,0,0,1)");
  h.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = h;
  ctx.fillRect(0, 0, 64, 256);
  return tex(c, false);
}

/** conveyor belt: dark rubber with faint chevrons; repeats along its length */
export function beltTexture() {
  const { c, ctx } = makeCanvas(64, 64);
  ctx.fillStyle = "#0a1226";
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = "rgba(115,145,255,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(8, 8);
  ctx.lineTo(32, 28);
  ctx.lineTo(56, 8);
  ctx.moveTo(8, 40);
  ctx.lineTo(32, 60);
  ctx.lineTo(56, 40);
  ctx.stroke();
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** pale windows high in the hall wall */
export function windowStripTexture() {
  const { c, ctx } = makeCanvas(256, 64);
  ctx.fillStyle = "#0b1328";
  ctx.fillRect(0, 0, 256, 64);
  for (let i = 0; i < 4; i++) {
    const g = ctx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#9fd6ff");
    ctx.fillStyle = g;
    ctx.fillRect(i * 64 + 5, 6, 54, 52);
  }
  return tex(c);
}
