import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  CATEGORY_LABEL,
  DEMO_CITY_CENTER,
  PLACES,
  getReportCoordinates,
  type Category,
  type HazardReport,
  type Place,
} from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { SyntheticBadge } from "@/components/ui-kit";

// SVG icons embedded in custom pins for zero-asset-missing rendering
const ICON_SVGS = {
  attraction: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  restaurant: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path><path d="M15 11v11"></path><path d="M6 2v20"></path><path d="M6 7h4a2 2 0 0 0 2-2V2"></path></svg>`,
  hotel: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path></svg>`,
  landmark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="21" x2="21" y2="21"></line><line x1="3" y1="10" x2="21" y2="10"></line><polyline points="12 3 2 10 22 10"></polyline><line x1="6" y1="10" x2="6" y2="21"></line><line x1="10" y1="10" x2="10" y2="21"></line><line x1="14" y1="10" x2="14" y2="21"></line><line x1="18" y1="10" x2="18" y2="21"></line></svg>`,
  report: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
};

const CATEGORY_COLORS: Record<string, string> = {
  attraction: "#0284c7",
  restaurant: "#ea580c",
  hotel: "#7c3aed",
  landmark: "#db2777",
  report: "#dc2626",
};

function createPinIcon(key: string, color: string, svg: string) {
  return L.divIcon({
    className: `custom-marker-${key}`,
    html: `
      <div class="custom-map-pin" style="background-color: ${color};">
        <div class="custom-map-pin-icon">
          ${svg}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Controller to invalidate size on resize and provide manual recentering
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => map.setView(center, 14, { animate: true })}
        className="rounded-md border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur transition hover:bg-accent"
        title="Recenter Map"
      >
        Center City
      </button>
    </div>
  );
}

export function CityMap() {
  const [isClient, setIsClient] = useState(false);
  const { reports, compare } = useStore();

  // Category filter toggles
  const [showAttractions, setShowAttractions] = useState(true);
  const [showRestaurants, setShowRestaurants] = useState(true);
  const [showHotels, setShowHotels] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Pre-created Leaflet icons for each category
  const icons = useMemo(() => {
    if (typeof window === "undefined") return null;
    return {
      attraction: createPinIcon("attraction", CATEGORY_COLORS["attraction"] ?? "#0284c7", ICON_SVGS.attraction),
      restaurant: createPinIcon("restaurant", CATEGORY_COLORS["restaurant"] ?? "#ea580c", ICON_SVGS.restaurant),
      hotel: createPinIcon("hotel", CATEGORY_COLORS["hotel"] ?? "#7c3aed", ICON_SVGS.hotel),
      landmark: createPinIcon("landmark", CATEGORY_COLORS["landmark"] ?? "#db2777", ICON_SVGS.landmark),
      report: createPinIcon("report", CATEGORY_COLORS["report"] ?? "#dc2626", ICON_SVGS.report),
    };
  }, []);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return PLACES.filter((place) => {
      if (place.category === "attraction" && !showAttractions) return false;
      if (place.category === "restaurant" && !showRestaurants) return false;
      if (place.category === "hotel" && !showHotels) return false;
      if (place.category === "landmark" && !showLandmarks) return false;
      if (!q) return true;
      return [place.name, place.area, place.description, ...place.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [showAttractions, showRestaurants, showHotels, showLandmarks, searchQuery]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    if (!showReports) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) =>
      [r.category, r.area, r.description, r.status].join(" ").toLowerCase().includes(q),
    );
  }, [showReports, reports, searchQuery]);

  const totalVisibleCount = filteredPlaces.length + filteredReports.length;

  const toggleAll = (enable: boolean) => {
    setShowAttractions(enable);
    setShowRestaurants(enable);
    setShowHotels(enable);
    setShowLandmarks(enable);
    setShowReports(enable);
  };

  const allActive =
    showAttractions && showRestaurants && showHotels && showLandmarks && showReports;

  if (!isClient || !icons) {
    return (
      <div className="flex h-[550px] w-full flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 p-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 font-display font-semibold">Loading UrbanPulse Map…</p>
        <p className="text-xs text-muted-foreground">Preparing synthetic city coordinates and OpenStreetMap tiles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Transparency and honest labeling banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs text-accent">
        <div className="flex items-center gap-2">
          <span className="font-semibold uppercase tracking-wider">Demo City Map</span>
          <span>·</span>
          <span>
            All places, coordinates, and hazard reports are synthetic sample data for a fictional city. No live GPS or real-world safety feeds are connected.
          </span>
        </div>
        <SyntheticBadge />
      </div>

      {/* Filter and search controls bar */}
      <div className="panel space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 min-w-[240px] items-center gap-2">
            <input
              type="text"
              placeholder="Search places or reports (e.g. 'harbour', 'market', 'pothole')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.slice(0, 100))}
              className="input text-sm"
              aria-label="Search map markers"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => toggleAll(!allActive)}
              className="btn-outline px-2.5 py-1 text-xs"
            >
              {allActive ? "Hide all" : "Select all"}
            </button>
            <span className="text-muted-foreground">
              Showing <strong>{totalVisibleCount}</strong> marker{totalVisibleCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowAttractions((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition ${
              showAttractions
                ? "bg-sky-600/20 text-sky-400 border border-sky-500/50"
                : "bg-muted text-muted-foreground opacity-60 border border-transparent"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS["attraction"] }} />
            Tourist Attractions ({PLACES.filter((p) => p.category === "attraction").length})
          </button>

          <button
            type="button"
            onClick={() => setShowRestaurants((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition ${
              showRestaurants
                ? "bg-orange-600/20 text-orange-400 border border-orange-500/50"
                : "bg-muted text-muted-foreground opacity-60 border border-transparent"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS["restaurant"] }} />
            Restaurants ({PLACES.filter((p) => p.category === "restaurant").length})
          </button>

          <button
            type="button"
            onClick={() => setShowHotels((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition ${
              showHotels
                ? "bg-purple-600/20 text-purple-400 border border-purple-500/50"
                : "bg-muted text-muted-foreground opacity-60 border border-transparent"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS["hotel"] }} />
            Hotels ({PLACES.filter((p) => p.category === "hotel").length})
          </button>

          <button
            type="button"
            onClick={() => setShowLandmarks((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition ${
              showLandmarks
                ? "bg-pink-600/20 text-pink-400 border border-pink-500/50"
                : "bg-muted text-muted-foreground opacity-60 border border-transparent"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS["landmark"] }} />
            Historical Landmarks ({PLACES.filter((p) => p.category === "landmark").length})
          </button>

          <button
            type="button"
            onClick={() => setShowReports((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition ${
              showReports
                ? "bg-rose-600/20 text-rose-400 border border-rose-500/50"
                : "bg-muted text-muted-foreground opacity-60 border border-transparent"
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS["report"] }} />
            Citizen Reports ({reports.length})
          </button>
        </div>
      </div>

      {/* Map container with defined height and responsive styling */}
      <div className="relative h-[480px] sm:h-[560px] lg:h-[640px] w-full overflow-hidden rounded-xl border border-border shadow-md">
        {totalVisibleCount === 0 && (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-background/80 p-6 text-center backdrop-blur-sm">
            <div className="max-w-md space-y-3 panel">
              <h3 className="font-display text-lg font-semibold text-foreground">No markers match the selected filters</h3>
              <p className="text-sm text-muted-foreground">
                All marker categories are currently hidden or no items match your search. Use the category pills above to re-enable categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  toggleAll(true);
                  setSearchQuery("");
                }}
                className="btn-primary text-xs"
              >
                Reset filters & show all
              </button>
            </div>
          </div>
        )}

        <MapContainer
          center={DEMO_CITY_CENTER}
          zoom={14}
          scrollWheelZoom={true}
          zoomControl={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapController center={DEMO_CITY_CENTER} />

          {/* Place markers */}
          {filteredPlaces.map((place: Place) => {
            const icon = icons[place.category];
            const isSelectedInCompare = compare.includes(place.id);
            return (
              <Marker
                key={place.id}
                position={place.coordinates}
                icon={icon}
              >
                <Popup minWidth={260} maxWidth={320}>
                  <div className="space-y-2 p-3 text-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span
                          className="inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[place.category] }}
                        >
                          {CATEGORY_LABEL[place.category]}
                        </span>
                        <h4 className="mt-1 font-display text-base font-bold text-white">{place.name}</h4>
                        <p className="text-xs text-slate-400">{place.area}</p>
                      </div>
                      <span className="shrink-0 rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-amber-300">
                        ★ {place.rating}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{place.description}</p>

                    <div className="space-y-1 rounded bg-slate-900/60 p-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Est. cost:</span>
                        <span className="font-semibold text-white">{place.cost === 0 ? "Free" : `$${place.cost}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hours:</span>
                        <span className="text-slate-300">{place.hours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cleanliness:</span>
                        <span className="text-slate-300">{place.cleanliness}/5 (synthetic)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Accessibility:</span>
                        <span className="text-slate-300">{place.accessibility}/5 (synthetic)</span>
                      </div>
                    </div>

                    {place.safetyNote && (
                      <p className="rounded bg-amber-950/40 p-2 text-[11px] text-amber-200 border border-amber-800/40">
                        {place.safetyNote}
                      </p>
                    )}

                    <div className="rounded border border-accent/40 bg-accent/10 p-1.5 text-[10px] text-accent">
                      Synthetic demo data for fictional city · Not a live safety guarantee.
                    </div>

                    <button
                      type="button"
                      onClick={() => actions.toggleCompare(place.id)}
                      className={`w-full rounded px-2.5 py-1 text-xs font-semibold transition ${
                        isSelectedInCompare
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : "border border-sky-400/60 text-sky-300 hover:bg-sky-500/20"
                      }`}
                    >
                      {isSelectedInCompare ? "✓ In compare" : "+ Add to compare"}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Citizen hazard report markers */}
          {filteredReports.map((report: HazardReport) => {
            const coords = getReportCoordinates(report);
            const statusClass =
              report.status === "open"
                ? "bg-rose-500/20 text-rose-300"
                : report.status === "in review"
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-emerald-500/20 text-emerald-300";

            return (
              <Marker
                key={report.id}
                position={coords}
                icon={icons.report}
              >
                <Popup minWidth={260} maxWidth={320}>
                  <div className="space-y-2 p-3 text-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Citizen Report ({report.category})
                        </span>
                        <h4 className="mt-1 font-display text-base font-bold text-white capitalize">
                          {report.category} issue
                        </h4>
                        <p className="text-xs text-slate-400">
                          {report.area} · {new Date(report.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold capitalize ${statusClass}`}>
                        {report.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200">{report.description}</p>

                    <p className="text-[11px] text-slate-400">
                      Source: {report.source}
                    </p>

                    <div className="rounded border border-destructive/40 bg-destructive/10 p-1.5 text-[10px] text-destructive-foreground">
                      Synthetic citizen report for demo purposes only. Does not represent verified live hazards or guarantees.
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="panel">
        <h3 className="font-display text-sm font-semibold mb-2">Map Legend</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS["attraction"] }} />
            <span>Tourist attraction</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS["restaurant"] }} />
            <span>Restaurant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS["hotel"] }} />
            <span>Hotel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS["landmark"] }} />
            <span>Historical landmark</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS["report"] }} />
            <span>Citizen hazard report</span>
          </div>
        </div>
      </div>
    </div>
  );
}
