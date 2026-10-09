import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { CityMap } from "@/components/CityMap";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Explore Map — UrbanPulse" },
      {
        name: "description",
        content:
          "Interactive city exploration map with tourist attractions, dining, lodging, landmarks, and citizen hazard reports.",
      },
      { property: "og:title", content: "Explore Map — UrbanPulse" },
      {
        property: "og:description",
        content:
          "Interactive city exploration map with transparent scores and citizen reports.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Explore Map"
        subtitle="Explore city destinations, filter categories, and inspect citizen reports on an interactive map."
      />
      <CityMap />
    </div>
  );
}
