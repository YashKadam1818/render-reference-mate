import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { AREAS, REPORT_CATEGORIES, TRAFFIC_SAMPLE, WEATHER_SAMPLE, type ReportCategory } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { EmptyState, PageHeader, Panel, SyntheticBadge } from "@/components/ui-kit";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "City Insights — CityLens" },
      { name: "description", content: "Sample traffic, weather and citizen-reported hazards." },
      { property: "og:title", content: "City Insights — CityLens" },
      { property: "og:description", content: "Sample traffic, weather and citizen-reported hazards." },
    ],
  }),
  component: Insights,
});

const reportSchema = z.object({
  category: z.enum(REPORT_CATEGORIES as [ReportCategory, ...ReportCategory[]]),
  area: z.string().refine((a) => AREAS.includes(a), "Choose an area"),
  description: z.string().trim().min(10, "Please write at least 10 characters").max(300, "Keep it under 300 characters"),
});

const levelClass: Record<string, string> = { Heavy: "text-destructive", Moderate: "text-warning", Light: "text-success" };

function Insights() {
  const { reports, hydrated } = useStore();
  const [filter, setFilter] = useState<ReportCategory | "all">("all");
  const [form, setForm] = useState({ category: "pothole", area: AREAS[0], description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const shown = reports.filter((r) => filter === "all" || r.category === filter);

  function submit(e: FormEvent) {
    e.preventDefault();
    setDone(false);
    const parsed = reportSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setSubmitting(true);
    setTimeout(() => {
      actions.addReport({ id: crypto.randomUUID(), ...parsed.data, timestamp: new Date().toISOString(), status: "open", source: "Your synthetic report (this browser only)" });
      setForm((f) => ({ ...f, description: "" }));
      setSubmitting(false);
      setDone(true);
    }, 400);
  }

  return (
    <>
      <PageHeader title="City Insights" subtitle="Sample conditions and citizen hazard reports. No live feeds are connected." />
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Panel>
          <div className="flex items-center justify-between"><h2 className="font-display font-semibold">Weather</h2><SyntheticBadge>Sample</SyntheticBadge></div>
          <p className="mt-3 text-3xl font-bold">{WEATHER_SAMPLE.tempC}°C</p>
          <p className="text-sm text-muted-foreground">{WEATHER_SAMPLE.condition} · Wind {WEATHER_SAMPLE.windKph} km/h · Humidity {WEATHER_SAMPLE.humidity}%</p>
          <p className="mt-3 text-xs text-muted-foreground">Live weather unavailable — no weather service connected.</p>
        </Panel>
        <Panel className="md:col-span-2">
          <div className="flex items-center justify-between"><h2 className="font-display font-semibold">Traffic patterns</h2><SyntheticBadge>Sample</SyntheticBadge></div>
          <ul className="mt-3 divide-y text-sm">
            {TRAFFIC_SAMPLE.map((t) => (
              <li key={t.road} className="flex justify-between gap-2 py-2"><span>{t.road}</span><span><strong className={levelClass[t.level]}>{t.level}</strong> <span className="text-xs text-muted-foreground">· {t.note}</span></span></li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Live traffic unavailable — these are illustrative patterns, not current conditions.</p>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold">Citizen reports</h2>
            <select className="input max-w-[180px]" value={filter} onChange={(e) => setFilter(e.target.value as ReportCategory | "all")} aria-label="Filter reports">
              <option value="all">All categories</option>
              {REPORT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {!hydrated ? (
            <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div>
          ) : shown.length === 0 ? (
            <EmptyState title="No reports in this category" hint="Choose another category or submit a report." />
          ) : (
            <ul className="space-y-3">
              {shown.map((r) => (
                <li key={r.id} className="panel">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-secondary px-2 py-0.5 font-semibold uppercase">{r.category}</span>
                    <span className={`status status-${r.status.replace(" ", "-")}`}>{r.status}</span>
                    <span className="text-muted-foreground">{r.area} · {new Date(r.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm">{r.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Source: {r.source}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Panel className="h-fit">
          <h2 className="font-display text-lg font-semibold">Submit a report</h2>
          <p className="mt-1 text-xs text-muted-foreground">Synthetic demo: saved only in this browser, not sent to any authority. No personal details needed.</p>
          <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
            <label className="block text-sm">Category
              <select className="input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {REPORT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="block text-sm">Area
              <select className="input mt-1" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
                {AREAS.map((a) => <option key={a}>{a}</option>)}
              </select>
              {errors["area"] && <span className="text-xs text-destructive">{errors["area"]}</span>}
            </label>
            <label className="block text-sm">Description
              <textarea className="input mt-1 min-h-24" maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {errors["description"] && <span className="text-xs text-destructive">{errors["description"]}</span>}
            </label>
            <button className="btn-primary w-full" disabled={submitting}>{submitting ? "Submitting…" : "Submit report"}</button>
            {done && <p className="text-sm text-success">Report added to the list.</p>}
          </form>
        </Panel>
      </div>
    </>
  );
}
