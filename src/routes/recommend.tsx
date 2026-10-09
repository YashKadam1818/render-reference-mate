import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BUDGET_LABEL, CATEGORY_LABEL, recommend, type Budget, type Category } from "@/lib/data";
import { EmptyState, PageHeader, PlaceCard, SyntheticBadge } from "@/components/ui-kit";

export const Route = createFileRoute("/recommend")({
  head: () => ({
    meta: [
      { title: "Recommendations — UrbanPulse" },
      { name: "description", content: "Get place recommendations by budget and category, with reasons." },
      { property: "og:title", content: "Recommendations — UrbanPulse" },
      { property: "og:description", content: "Explained place recommendations by budget and category." },
    ],
  }),
  component: Recommend,
});

function Recommend() {
  const [budget, setBudget] = useState<Budget>("low");
  const [category, setCategory] = useState<Category | "any">("any");
  const results = recommend(budget, category);

  return (
    <>
      <PageHeader title="Recommendations" subtitle="Same inputs always give the same results: places are filtered by your choices, then ranked by the transparent score." />
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Budget
          <select className="input mt-1" value={budget} onChange={(e) => setBudget(e.target.value as Budget)}>
            {Object.entries(BUDGET_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="text-sm">Preferred category
          <select className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value as Category | "any")}>
            <option value="any">Any category</option>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>
      <div className="mb-4"><SyntheticBadge>Based on synthetic data</SyntheticBadge></div>
      {results.length === 0 ? (
        <EmptyState title="No matches for this combination" hint="Try a different budget or 'Any category'." />
      ) : (
        <ol className="grid gap-4 md:grid-cols-2">
          {results.map(({ place, score, reasons }, i) => (
            <li key={place.id} className="space-y-2">
              <p className="font-display text-sm font-semibold text-primary">#{i + 1} · score {score.total.toFixed(1)}/100</p>
              <PlaceCard place={place} />
              <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">{reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
