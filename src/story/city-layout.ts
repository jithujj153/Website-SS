import { CITY } from "./camera-path";
import type { CityBuildingId } from "@/config/content";

/** Isometric tile pitch (world units) of the 5 x 5 diamond-tile grid. */
export const PITCH = 3.4;
export const TILE = 3.1;
export const GRID = 5;

/**
 * Where each product building stands (grid indices) and how tall it is.
 * With the camera on the +x/+z side, the four corner lots form a diamond on screen
 * (tower = top, factory = left, school = right, fuel = front) and the cafe sits in the middle.
 */
export const LOTS: Record<CityBuildingId, { gx: number; gz: number; h: number }> = {
  fuel: { gx: 1, gz: 1, h: 2.7 },
  school: { gx: 1, gz: -1, h: 2.7 },
  cafe: { gx: 0, gz: 0, h: 2.0 },
  tower: { gx: -1, gz: -1, h: 7.8 },
  factory: { gx: -1, gz: 1, h: 3.6 },
};

export const lotPosition = (id: CityBuildingId): [number, number, number] => [
  CITY[0] + LOTS[id].gx * PITCH,
  CITY[1],
  CITY[2] + LOTS[id].gz * PITCH,
];
