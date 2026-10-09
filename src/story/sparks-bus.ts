export type V3 = [number, number, number];

export interface SparkBurst {
  origin: V3;
  count: number;
  /** 0..1.2 scales speed */
  power: number;
  /** half-angle of the emission cone around +Y, radians */
  cone?: number;
}

const queue: SparkBurst[] = [];

/** Queue a burst of cyan sparks; the <Sparks> component drains this each frame. */
export function emitSparks(b: SparkBurst) {
  if (queue.length < 48) queue.push(b);
}
export function drainSparks(): SparkBurst[] {
  return queue.length ? queue.splice(0, queue.length) : [];
}
