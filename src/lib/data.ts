// All values in this file are SYNTHETIC demo data for a fictional city ("Demo City").
export type Category = "attraction" | "restaurant" | "hotel" | "landmark";
export type Budget = "low" | "medium" | "high";

export interface Place {
  id: string;
  name: string;
  category: Category;
  area: string;
  description: string;
  rating: number; // 1-5
  cost: number; // estimated cost per person, USD
  cleanliness: number; // 1-5 synthetic
  accessibility: number; // 1-5 synthetic
  safetyNote: string | null; // null = no information available
  hours: string;
  tags: string[];
  coordinates: [number, number]; // [lat, lng] sample demo coordinates
}

export const CATEGORY_LABEL: Record<Category, string> = {
  attraction: "Tourist attraction",
  restaurant: "Restaurant",
  hotel: "Hotel",
  landmark: "Historical landmark",
};

export const BUDGET_LABEL: Record<Budget, string> = {
  low: "Low (under $20)",
  medium: "Medium ($20–$80)",
  high: "High (over $80)",
};

export function budgetOf(cost: number): Budget {
  if (cost < 20) return "low";
  if (cost <= 80) return "medium";
  return "high";
}

// Demo synthetic coordinates centered around a cohesive fictional city layout
export const PLACES: Place[] = [
  { id: "p1", name: "Riverside Promenade", category: "attraction", area: "Old Harbour", description: "A 3 km walkway along the river with food stalls and evening light shows.", rating: 4.6, cost: 0, cleanliness: 4, accessibility: 5, safetyNote: "Synthetic: 2 sample citizen reports of poor lighting near the north end.", hours: "Open 24h", tags: ["outdoor", "free", "family"], coordinates: [52.3782, 4.8968] },
  { id: "p2", name: "Glasshouse Botanical Garden", category: "attraction", area: "Greenbelt", description: "Tropical domes, a cactus wing and a quiet tea pavilion.", rating: 4.4, cost: 12, cleanliness: 5, accessibility: 4, safetyNote: null, hours: "9:00–18:00", tags: ["nature", "family"], coordinates: [52.3642, 4.8824] },
  { id: "p3", name: "SkyDeck Observation Tower", category: "attraction", area: "Central District", description: "360° views from the 62nd floor with an interactive city model.", rating: 4.2, cost: 28, cleanliness: 4, accessibility: 5, safetyNote: null, hours: "10:00–22:00", tags: ["views", "indoor"], coordinates: [52.3727, 4.8938] },
  { id: "p4", name: "Lantern Night Market", category: "attraction", area: "Eastgate", description: "Crowded weekend market with crafts, music and street food.", rating: 4.5, cost: 15, cleanliness: 3, accessibility: 2, safetyNote: "Synthetic: sample reports mention crowding and pickpocketing on weekends.", hours: "Fri–Sun 18:00–01:00", tags: ["nightlife", "food"], coordinates: [52.3682, 4.9122] },
  { id: "p5", name: "Saffron & Salt", category: "restaurant", area: "Central District", description: "Modern regional cuisine with a seasonal tasting menu.", rating: 4.7, cost: 95, cleanliness: 5, accessibility: 4, safetyNote: null, hours: "18:00–23:00", tags: ["fine dining"], coordinates: [52.3712, 4.8914] },
  { id: "p6", name: "Dockside Noodle Bar", category: "restaurant", area: "Old Harbour", description: "Hand-pulled noodles and broths, fast counter service.", rating: 4.3, cost: 11, cleanliness: 3, accessibility: 3, safetyNote: null, hours: "11:00–22:00", tags: ["quick", "budget"], coordinates: [52.3764, 4.8935] },
  { id: "p7", name: "The Green Fork", category: "restaurant", area: "Greenbelt", description: "Plant-based bistro with a garden terrace.", rating: 4.1, cost: 32, cleanliness: 5, accessibility: 5, safetyNote: null, hours: "08:00–21:00", tags: ["vegan", "brunch"], coordinates: [52.3658, 4.8858] },
  { id: "p8", name: "Ember Grill House", category: "restaurant", area: "Eastgate", description: "Charcoal grills and late-night plates.", rating: 3.9, cost: 45, cleanliness: 3, accessibility: 3, safetyNote: "Synthetic: one sample report of a broken pavement outside.", hours: "17:00–02:00", tags: ["late night"], coordinates: [52.3667, 4.9152] },
  { id: "p9", name: "Harbour Crown Hotel", category: "hotel", area: "Old Harbour", description: "Waterfront rooms, rooftop pool and spa.", rating: 4.6, cost: 210, cleanliness: 5, accessibility: 5, safetyNote: null, hours: "24h reception", tags: ["luxury", "pool"], coordinates: [52.3795, 4.9012] },
  { id: "p10", name: "Backpack Loft", category: "hotel", area: "Eastgate", description: "Friendly hostel with dorms and private pods.", rating: 4.0, cost: 18, cleanliness: 3, accessibility: 2, safetyNote: null, hours: "24h reception", tags: ["hostel", "budget"], coordinates: [52.3697, 4.9182] },
  { id: "p11", name: "Parkview Suites", category: "hotel", area: "Greenbelt", description: "Quiet apartment-style suites with kitchenettes.", rating: 4.3, cost: 75, cleanliness: 4, accessibility: 4, safetyNote: null, hours: "24h reception", tags: ["family", "long stay"], coordinates: [52.3618, 4.8892] },
  { id: "p12", name: "Old Mint Fortress", category: "landmark", area: "Old Harbour", description: "17th-century fortress, now a coin and trade museum.", rating: 4.5, cost: 8, cleanliness: 4, accessibility: 2, safetyNote: "Synthetic: steep, uneven stairs reported in the sample data.", hours: "9:00–17:00", tags: ["history", "museum"], coordinates: [52.3771, 4.9056] },
  { id: "p13", name: "Cathedral of St. Ilse", category: "landmark", area: "Central District", description: "Gothic cathedral with a climbable bell tower.", rating: 4.7, cost: 0, cleanliness: 5, accessibility: 3, safetyNote: null, hours: "7:00–19:00", tags: ["history", "free"], coordinates: [52.3738, 4.8979] },
  { id: "p14", name: "Weavers' Quarter", category: "landmark", area: "Eastgate", description: "Preserved textile district with guided walking tours.", rating: 4.2, cost: 22, cleanliness: 3, accessibility: 3, safetyNote: null, hours: "Tours 10:00, 14:00", tags: ["history", "walking"], coordinates: [52.3718, 4.9142] },
  { id: "p15", name: "Founders' Bridge", category: "landmark", area: "Central District", description: "Iron suspension bridge, the city's oldest crossing.", rating: 4.0, cost: 0, cleanliness: 4, accessibility: 4, safetyNote: null, hours: "Open 24h", tags: ["free", "views"], coordinates: [52.3698, 4.8962] },
  { id: "p16", name: "Cliffside Inn", category: "hotel", area: "Greenbelt", description: "Boutique inn with 12 rooms and a breakfast garden.", rating: 4.8, cost: 140, cleanliness: 5, accessibility: 3, safetyNote: null, hours: "7:00–23:00 reception", tags: ["boutique"], coordinates: [52.3602, 4.8814] },
];

// ---------- Transparent scoring ----------
export const WEIGHTS = { rating: 0.4, cleanliness: 0.2, accessibility: 0.2, affordability: 0.2 } as const;
export const MAX_COST = Math.max(...PLACES.map((p) => p.cost));

export interface ScoreBreakdown {
  rating: number; cleanliness: number; accessibility: number; affordability: number; total: number;
}

/** Each component normalized to 0-100, then weighted. Safety is NOT scored (no reliable data). */
export function scorePlace(p: Place): ScoreBreakdown {
  const rating = (p.rating / 5) * 100;
  const cleanliness = (p.cleanliness / 5) * 100;
  const accessibility = (p.accessibility / 5) * 100;
  const affordability = (1 - p.cost / MAX_COST) * 100;
  const total =
    rating * WEIGHTS.rating + cleanliness * WEIGHTS.cleanliness +
    accessibility * WEIGHTS.accessibility + affordability * WEIGHTS.affordability;
  return { rating, cleanliness, accessibility, affordability, total };
}

// ---------- Recommendations (deterministic) ----------
export function recommend(budget: Budget, category: Category | "any") {
  return PLACES.filter((p) => budgetOf(p.cost) === budget && (category === "any" || p.category === category))
    .map((p) => {
      const s = scorePlace(p);
      const reasons = [
        `Fits your ${budget} budget (est. $${p.cost} per person).`,
        category === "any" ? `Category: ${CATEGORY_LABEL[p.category]}.` : `Matches your preferred category.`,
        `Rated ${p.rating}/5 — contributes ${(s.rating * WEIGHTS.rating).toFixed(1)} pts.`,
      ];
      if (p.accessibility >= 4) reasons.push(`High accessibility score (${p.accessibility}/5).`);
      if (p.cleanliness >= 4) reasons.push(`High cleanliness score (${p.cleanliness}/5).`);
      return { place: p, score: s, reasons };
    })
    .sort((a, b) => b.score.total - a.score.total || a.place.name.localeCompare(b.place.name));
}

// ---------- City insights (synthetic) ----------
export const TRAFFIC_SAMPLE = [
  { road: "Harbour Ring Road", level: "Heavy", note: "Sample peak-hour pattern" },
  { road: "Central Avenue", level: "Moderate", note: "Sample weekday pattern" },
  { road: "Greenbelt Parkway", level: "Light", note: "Sample weekday pattern" },
  { road: "Eastgate Bridge", level: "Heavy", note: "Sample weekend pattern" },
];

export const WEATHER_SAMPLE = { condition: "Partly cloudy", tempC: 24, humidity: 62, windKph: 14 };

export type ReportCategory = "pothole" | "lighting" | "flooding" | "crowding" | "other";
export type ReportStatus = "open" | "in review" | "resolved";
export interface HazardReport {
  id: string;
  category: ReportCategory;
  area: string;
  description: string;
  timestamp: string;
  status: ReportStatus;
  source: string;
  coordinates?: [number, number]; // [lat, lng] sample demo coordinates
}

export const REPORT_CATEGORIES: ReportCategory[] = ["pothole", "lighting", "flooding", "crowding", "other"];
export const AREAS = ["Old Harbour", "Central District", "Greenbelt", "Eastgate"];

// Demo synthetic coordinates for seed reports (fictional Demo City)
export const SEED_REPORTS: HazardReport[] = [
  { id: "r1", category: "lighting", area: "Old Harbour", description: "Streetlights out near north promenade entrance.", timestamp: "2026-10-07T20:15:00Z", status: "open", source: "Synthetic seed data", coordinates: [52.3788, 4.8992] },
  { id: "r2", category: "pothole", area: "Eastgate", description: "Large pothole on Weaver St. near the market.", timestamp: "2026-10-06T08:40:00Z", status: "in review", source: "Synthetic seed data", coordinates: [52.3710, 4.9135] },
  { id: "r3", category: "flooding", area: "Greenbelt", description: "Water pooling under the parkway underpass after rain.", timestamp: "2026-10-03T16:05:00Z", status: "resolved", source: "Synthetic seed data", coordinates: [52.3632, 4.8842] },
  { id: "r4", category: "crowding", area: "Eastgate", description: "Very crowded walkway at the night market on Saturday.", timestamp: "2026-10-04T22:30:00Z", status: "open", source: "Synthetic seed data", coordinates: [52.3676, 4.9110] },
];

// Center for the sample Demo City map
export const DEMO_CITY_CENTER: [number, number] = [52.3700, 4.9000];

// Area centers used for default/synthetic placement of user-submitted reports
export const AREA_COORDINATES: Record<string, [number, number]> = {
  "Old Harbour": [52.3775, 4.8985],
  "Central District": [52.3718, 4.8950],
  "Greenbelt": [52.3630, 4.8850],
  "Eastgate": [52.3690, 4.9140],
};

/** Get sample coordinates for a hazard report, providing deterministic demo coordinates if none were supplied */
export function getReportCoordinates(report: HazardReport): [number, number] {
  if (report.coordinates) return report.coordinates;
  const base = AREA_COORDINATES[report.area] ?? DEMO_CITY_CENTER;
  const hash = report.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const latOffset = ((hash % 7) - 3) * 0.0008;
  const lngOffset = (((hash >> 2) % 7) - 3) * 0.0008;
  return [Number((base[0] + latOffset).toFixed(4)), Number((base[1] + lngOffset).toFixed(4))];
}
