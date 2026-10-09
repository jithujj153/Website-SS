import { createContext, useContext } from "react";

export interface Quality {
  /** 0 = mobile/low, 1 = medium, 2 = high */
  tier: 0 | 1 | 2;
  mobile: boolean;
  aspect: number;
}

export const QualityContext = createContext<Quality>({ tier: 2, mobile: false, aspect: 16 / 9 });
export const useQuality = () => useContext(QualityContext);
/** pick a value per quality tier */
export const byTier = <T,>(tier: 0 | 1 | 2, low: T, mid: T, high: T): T => (tier === 0 ? low : tier === 1 ? mid : high);
