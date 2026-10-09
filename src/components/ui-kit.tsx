import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CATEGORY_LABEL, type Place } from "@/lib/data";
import { actions, useStore } from "@/lib/store";

export function SyntheticBadge({ children = "Synthetic data" }: { children?: ReactNode }) {
  return <span className="badge-synthetic">{children}</span>;
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
    </header>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`panel ${className}`}>{children}</div>;
}

export function Meter({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div className="text-xs">
      <div className="flex justify-between text-muted-foreground"><span>{label}</span><span>{value}/{max}</span></div>
      <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} /></div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <p className="font-display font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

export function PlaceCard({ place, onDetails }: { place: Place; onDetails?: () => void }) {
  const { compare } = useStore();
  const selected = compare.includes(place.id);
  return (
    <Panel className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-primary">{CATEGORY_LABEL[place.category]}</p>
          <h3 className="truncate font-display text-lg font-semibold">{place.name}</h3>
          <p className="text-xs text-muted-foreground">{place.area}</p>
        </div>
        <span className="shrink-0 rounded-md bg-secondary px-2 py-1 text-sm font-semibold">★ {place.rating}</span>
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">{place.description}</p>
      <p className="text-sm">Est. cost: <strong>{place.cost === 0 ? "Free" : `$${place.cost}`}</strong> <span className="text-xs text-muted-foreground">(estimate)</span></p>
      <div className="mt-auto flex gap-2">
        {onDetails && <button className="btn-ghost flex-1" onClick={onDetails}>Details</button>}
        <button className={selected ? "btn-primary flex-1" : "btn-outline flex-1"} onClick={() => actions.toggleCompare(place.id)} aria-pressed={selected}>
          {selected ? "✓ In compare" : "+ Compare"}
        </button>
      </div>
    </Panel>
  );
}

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/discover", label: "Discover" },
  { to: "/compare", label: "Compare" },
  { to: "/insights", label: "City Insights" },
  { to: "/recommend", label: "Recommend" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { compare } = useStore();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="shrink-0 font-display text-xl font-bold">City<span className="text-primary">Lens</span></Link>
          <nav className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="nav-link" activeProps={{ className: "nav-link nav-link-active" }} activeOptions={{ exact: n.to === "/" }}>
                {n.label}{n.to === "/compare" && compare.length > 0 ? ` (${compare.length})` : ""}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted-foreground">
        CityLens demo — all places, scores, traffic, weather and reports are synthetic sample data for a fictional city. Nothing here is live or a safety guarantee.
      </footer>
    </div>
  );
}
