export type Consent = "granted" | "denied" | "ack" | null;
const KEY = "ss-consent";

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" || v === "ack" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Exclude<Consent, null>) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* storage unavailable: the choice just won't persist */
  }
  window.dispatchEvent(new CustomEvent("ss-consent", { detail: value }));
}
