/** How hard a scroll "tick" hits depends on where we are in the story: heaviest at the forge. */
export function strikeWeight(p: number): number {
  if (p < 0.2) return 0.18;
  if (p < 0.44) return 1;
  if (p < 0.6) return 0.45;
  if (p < 0.85) return 0.3;
  return 0.2;
}
