export const READABLE_MODE_STORAGE_KEY = "lume-readable-mode";

export function getReadableModeState(storedValue: string | null) {
  return storedValue === "1";
}

export function applyReadableMode(enabled: boolean) {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("lume-readable", enabled);
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(READABLE_MODE_STORAGE_KEY, enabled ? "1" : "0");
  }
}
