import { createFileRoute, Link } from "@tanstack/react-router";
import { PLACES, SEED_REPORTS, WEATHER_SAMPLE } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Panel, SyntheticBadge } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CityLens — Explore Smarter, Navigate Better" },
      { name: "description", content: "Discover, compare and understand city places with transparent scores and citizen reports." },
      { property: "og:title", content: "CityLens — Explore Smarter, Navigate Better" },
      { property: "og:description", content: "Discover, compare and understand city places with transparent scores." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { reports, compare } = useStore();
  const open = reports.filter((r) => r.status !== "resolved").length;
  const cards = [
    { to: "/discover", title: "Discover Places", text: "Search and filter attractions, food, hotels and landmarks.", stat: `${PLACES.length} places` },
    { to: "/compare", title: "Compare Places", text: "Side-by-side with a transparent score breakdown.", stat: `${compare.length} selected` },
    { to: "/insights", title: "City Insights", text: "Sample traffic, weather and citizen hazard reports.", stat: `${open} open reports` },
    { to: "/recommend", title: "Recommendations", text: "Tell us your budget and category; see why each pick fits.", stat: "Deterministic" },
  ] as const;
  return (
    <div className="space-y-8">
      <section className="hero">
        <SyntheticBadge>Demo City · synthetic data</SyntheticBadge>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Explore smarter,<br />navigate better.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">CityLens helps you find places, compare them honestly and stay aware of citizen-reported issues.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/discover" className="btn-primary">Start exploring</Link>
          <Link to="/recommend" className="btn-outline">Get recommendations</Link>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="panel panel-hover block">
            <p className="text-xs uppercase tracking-wider text-primary">{c.stat}</p>
            <h2 className="mt-2 font-display text-lg font-semibold">{c.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <div className="flex items-center justify-between"><h2 className="font-display font-semibold">Weather snapshot</h2><SyntheticBadge>Sample · not live</SyntheticBadge></div>
          <p className="mt-3 text-3xl font-bold">{WEATHER_SAMPLE.tempC}°C</p>
          <p className="text-sm text-muted-foreground">{WEATHER_SAMPLE.condition} · Humidity {WEATHER_SAMPLE.humidity}%</p>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between"><h2 className="font-display font-semibold">Latest report</h2><SyntheticBadge /></div>
          <p className="mt-3 text-sm">{reports[0]?.description ?? SEED_REPORTS[0]?.description ?? "No reports yet."}</p>
          <Link to="/insights" className="mt-3 inline-block text-sm text-primary">View all reports →</Link>
        </Panel>
      </div>
    </div>
  );
}
