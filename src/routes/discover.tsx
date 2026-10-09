import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BUDGET_LABEL, CATEGORY_LABEL, PLACES, budgetOf, type Budget, type Category, type Place } from "@/lib/data";
import { EmptyState, Meter, PageHeader, PlaceCard, SyntheticBadge } from "@/components/ui-kit";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover Places — CityLens" },
      { name: "description", content: "Search and filter attractions, restaurants, hotels and landmarks." },
      { property: "og:title", content: "Discover Places — CityLens" },
      { property: "og:description", content: "Search and filter places by category and budget." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [budget, setBudget] = useState<Budget | "all">("all");
  const [detail, setDetail] = useState<Place | null>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PLACES.filter((p) =>
      (cat === "all" || p.category === cat) &&
      (budget === "all" || budgetOf(p.cost) === budget) &&
      (!term || [p.name, p.area, p.description, ...p.tags].join(" ").toLowerCase().includes(term)),
    );
  }, [q, cat, budget]);

  return (
    <>
      <PageHeader title="Discover Places" subtitle="Search by name, area or tag, then narrow by category and budget." />
      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input className="input" placeholder="Search e.g. 'harbour', 'vegan', 'free'" value={q} onChange={(e) => setQ(e.target.value.slice(0, 100))} aria-label="Search places" />
        <select className="input" value={cat} onChange={(e) => setCat(e.target.value as Category | "all")} aria-label="Category">
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input" value={budget} onChange={(e) => setBudget(e.target.value as Budget | "all")} aria-label="Budget">
          <option value="all">Any budget</option>
          {Object.entries(BUDGET_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{results.length} result{results.length === 1 ? "" : "s"}</span><SyntheticBadge />
      </div>
      {results.length === 0 ? (
        <EmptyState title="No places match" hint="Try a different search term or clear a filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => <PlaceCard key={p.id} place={p} onDetails={() => setDetail(p)} />)}
        </div>
      )}
      {detail && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-background/70 p-4 backdrop-blur" onClick={() => setDetail(null)}>
          <div role="dialog" aria-label={detail.name} className="panel w-full max-w-lg space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2">
              <div><p className="text-xs uppercase tracking-wider text-primary">{CATEGORY_LABEL[detail.category]}</p><h2 className="font-display text-2xl font-bold">{detail.name}</h2></div>
              <button className="btn-ghost" onClick={() => setDetail(null)} aria-label="Close">✕</button>
            </div>
            <p className="text-sm text-muted-foreground">{detail.description}</p>
            <p className="text-sm">{detail.area} · {detail.hours} · Est. {detail.cost === 0 ? "free" : `$${detail.cost}`}</p>
            <Meter label="Rating" value={detail.rating} />
            <Meter label="Cleanliness (synthetic)" value={detail.cleanliness} />
            <Meter label="Accessibility (synthetic)" value={detail.accessibility} />
            <p className="rounded-lg bg-muted p-3 text-sm">{detail.safetyNote ?? "No safety information available for this place. This does not mean it is safe or unsafe."}</p>
            <div className="flex flex-wrap gap-1">{detail.tags.map((t) => <span key={t} className="rounded bg-secondary px-2 py-0.5 text-xs">{t}</span>)}</div>
          </div>
        </div>
      )}
    </>
  );
}
