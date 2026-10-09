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

function hydrate() {
  if (state.hydrated) return;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    set({
      hydrated: true,
      compare: Array.isArray(parsed?.compare) ? parsed.compare : [],
      reports: Array.isArray(parsed?.reports) ? parsed.reports : SEED_REPORTS,
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
