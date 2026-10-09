import { useEffect, useSyncExternalStore } from "react";
import { SEED_REPORTS, type HazardReport } from "./data";

// Tiny local store for compare selection + user-submitted synthetic reports (saved in this browser only).
type State = { compare: string[]; reports: HazardReport[]; hydrated: boolean };
let state: State = { compare: [], reports: SEED_REPORTS, hydrated: false };
const listeners = new Set<() => void>();
const KEY = "citylens-v1";

function set(next: Partial<State>) {
  state = { ...state, ...next };
  if (typeof window !== "undefined" && state.hydrated) {
    localStorage.setItem(KEY, JSON.stringify({ compare: state.compare, reports: state.reports }));
  }
  listeners.forEach((l) => l());
}

const STATUSES = ["open", "in review", "resolved"];
// Saved data may be from an older version or edited; drop entries that would crash rendering.
function isValidReport(r: unknown): r is HazardReport {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  return (
    typeof o["id"] === "string" && typeof o["category"] === "string" && typeof o["area"] === "string" &&
    typeof o["description"] === "string" && typeof o["source"] === "string" &&
    typeof o["status"] === "string" && STATUSES.includes(o["status"]) &&
    typeof o["timestamp"] === "string" && !Number.isNaN(Date.parse(o["timestamp"]))
  );
}

function hydrate() {
  if (state.hydrated) return;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const saved = Array.isArray(parsed?.reports) ? parsed.reports.filter(isValidReport) : [];
    set({
      hydrated: true,
      compare: Array.isArray(parsed?.compare) ? parsed.compare.filter((x: unknown) => typeof x === "string") : [],
      reports: saved.length > 0 ? saved : SEED_REPORTS,
    });
  } catch {
    set({ hydrated: true });
  }
}

const serverState = state;
export function useStore() {
  const s = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => state,
    () => serverState,
  );
  useEffect(hydrate, []);
  return s;
}

export const actions = {
  toggleCompare(id: string) {
    set({ compare: state.compare.includes(id) ? state.compare.filter((x) => x !== id) : [...state.compare, id] });
  },
  clearCompare() { set({ compare: [] }); },
  addReport(r: HazardReport) { set({ reports: [r, ...state.reports] }); },
};
