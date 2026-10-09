import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORY_LABEL, PLACES, WEIGHTS, scorePlace } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { EmptyState, PageHeader, SyntheticBadge } from "@/components/ui-kit";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Places — UrbanPulse" },
      { name: "description", content: "Compare places side by side with a transparent score breakdown." },
      { property: "og:title", content: "Compare Places — UrbanPulse" },
      { property: "og:description", content: "Side-by-side comparison with explained scores." },
    ],
  }),
  component: Compare,
});

function Compare() {
  const { compare } = useStore();
  const selected = PLACES.filter((p) => compare.includes(p.id));
  const others = PLACES.filter((p) => !compare.includes(p.id));

  return (
    <>
      <PageHeader title="Compare Places" subtitle="Pick two or more places. Every score is shown with its parts so you can judge for yourself." />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select className="input max-w-xs" value="" onChange={(e) => e.target.value && actions.toggleCompare(e.target.value)} aria-label="Add a place">
          <option value="">+ Add a place…</option>
          {others.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {selected.length > 0 && <button className="btn-ghost" onClick={actions.clearCompare}>Clear all</button>}
        <SyntheticBadge>Scores use synthetic values</SyntheticBadge>
      </div>

      {selected.length < 2 ? (
        <EmptyState title={selected.length === 0 ? "Nothing selected yet" : "Add one more place"} hint="Select at least two places here or from Discover to compare them." />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted">
              <tr><th className="p-3 text-left">Metric</th>{selected.map((p) => (
                <th key={p.id} className="p-3 text-left align-top">
                  <div className="font-display font-semibold">{p.name}</div>
                  <div className="text-xs font-normal text-muted-foreground">{CATEGORY_LABEL[p.category]}</div>
                  <button className="mt-1 text-xs text-destructive" onClick={() => actions.toggleCompare(p.id)}>Remove</button>
                </th>))}</tr>
            </thead>
            <tbody>
              <Row label="Rating" vals={selected.map((p) => `★ ${p.rating}/5`)} />
              <Row label="Est. cost / person" vals={selected.map((p) => (p.cost === 0 ? "Free" : `$${p.cost}`) + " (estimate)")} />
              <Row label="Cleanliness" vals={selected.map((p) => `${p.cleanliness}/5 (synthetic)`)} />
              <Row label="Accessibility" vals={selected.map((p) => `${p.accessibility}/5 (synthetic)`)} />
              <Row label="Safety info" vals={selected.map((p) => p.safetyNote ?? "No information available")} />
              {(["rating", "cleanliness", "accessibility", "affordability"] as const).map((k) => (
                <Row key={k} label={`${k.charAt(0).toUpperCase() + k.slice(1)} pts (×${WEIGHTS[k]})`}
                  vals={selected.map((p) => { const s = scorePlace(p); return `${s[k].toFixed(0)} × ${WEIGHTS[k]} = ${(s[k] * WEIGHTS[k]).toFixed(1)}`; })} muted />
              ))}
              <tr className="border-t bg-secondary font-semibold"><td className="p-3">Total score / 100</td>{selected.map((p) => <td key={p.id} className="p-3 text-lg">{scorePlace(p).total.toFixed(1)}</td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="panel mt-6 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">How the score works</p>
        <p className="mt-1">Each metric is scaled to 0–100: rating and the 1–5 scores divide by 5; affordability = 1 − cost ÷ highest cost in the dataset. Weights: rating 40%, cleanliness 20%, accessibility 20%, affordability 20%. Safety is <strong>not</strong> scored because no reliable safety data is available. <Link to="/discover" className="text-primary">Browse places →</Link></p>
      </div>
    </>
  );
}

function Row({ label, vals, muted }: { label: string; vals: string[]; muted?: boolean }) {
  return (
    <tr className={`border-t ${muted ? "text-muted-foreground" : ""}`}>
      <td className="p-3 font-medium">{label}</td>
      {vals.map((v, i) => <td key={i} className="p-3 align-top">{v}</td>)}
    </tr>
  );
}
