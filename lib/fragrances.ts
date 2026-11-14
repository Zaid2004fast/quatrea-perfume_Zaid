export type Season = "spring" | "summer" | "autumn" | "winter";

export interface Note {
  name: string;
  description: string;
  /** Photograph of the raw material: transparent cut-outs in /img/notes, licensed photographs in /img/notes/photo. */
  image?: string;
}

export interface Fragrance {
  slug: string;
  season: Season;
  index: number;
  numeral: string;
  name: string;
  seasonLabel: string;
  frenchSeason: string;
  tagline: string;
  theme: string;
  stateOfBeing: string;
  story: string[];
  notes: { top: Note[]; heart: Note[]; base: Note[] };
  bottle: string;
  /** Liquid colour inside the flacon. */
  juice: string;
  /** Position of this fragrance's world on the journey timeline (0–1). */
  worldT: number;
  palette: { bg: string; deep: string; accent: string; soft: string; ink: string; glow: string };
  prices: { size: string; price: number }[];
  longevity: number; // 1–5
  sillage: number; // 1–5
  mood: string[];
  hour: string;
}

export const FRAGRANCES: Fragrance[] = [
  {
    slug: "aubade",
    season: "spring",
    index: 0,
    numeral: "I",
    name: "Aubade",
    seasonLabel: "Spring",
    frenchSeason: "Printemps",
    tagline: "A love song to first light.",
    theme: "Renewal, awakening, tenderness, blossoming life.",
    stateOfBeing: "Awakening",
    story: [
      "An aubade is a song sung at daybreak. Ours is the instant a bud decides to open — composed in the hour after rain, when moss holds the light and the air is green enough to drink, it is a portrait of tenderness that refuses to stay small.",
      "Pear blossom arrives first — crisp, almost dewy — before peony unfurls over a thread of green tea. Beneath it all, a white musk as soft as the inside of a petal keeps the composition close to skin.",
    ],
    notes: {
      top: [{ name: "Pear blossom", description: "Crisp, watery, faintly honeyed — the first light of the orchard.", image: "/img/notes/photo/pear-blossom.webp" }],
      heart: [
        { name: "Peony", description: "Rosy, luminous, petal-thick. The heart of the bloom.", image: "/img/notes/peony.webp" },
        { name: "Green tea", description: "Leafy and serene, a cool green breath through the florals.", image: "/img/notes/photo/green-tea.webp" },
      ],
      base: [{ name: "White musk", description: "Clean, skin-like warmth that lingers like morning haze.", image: "/img/notes/photo/white-musk.webp" }],
    },
    bottle: "/img/bottles/product-aubade.webp",
    juice: "#f4cfa0",
    worldT: 0.24,
    palette: { bg: "#eef0e4", deep: "#24311f", accent: "#e9b9b4", soft: "#cfdcb8", ink: "#1d2419", glow: "#f6d9d3" },
    prices: [
      { size: "50 ml", price: 165 },
      { size: "100 ml", price: 235 },
    ],
    longevity: 3,
    sillage: 2,
    mood: ["Tender", "Luminous", "Green"],
    hour: "Dawn, after rain",
  },
  {
    slug: "azur",
    season: "summer",
    index: 1,
    numeral: "II",
    name: "Azur",
    seasonLabel: "Summer",
    frenchSeason: "Été",
    tagline: "An endless afternoon.",
    theme: "Warmth, freedom, sunshine, radiance.",
    stateOfBeing: "Radiance",
    story: [
      "Azur is the long Mediterranean afternoon that never quite ends — sun-warmed limestone, salt drying on the shoulders, the sea a sheet of turquoise glass beneath the cliffs.",
      "Bergamot flashes bright and golden, then neroli and sea salt open like shutters onto the water. Coconut water settles at the base: milky, cool, impossibly light.",
    ],
    notes: {
      top: [{ name: "Bergamot", description: "Sparkling, green-golden citrus pressed from sun-ripened rind.", image: "/img/notes/citrus.webp" }],
      heart: [
        { name: "Neroli", description: "The bitter-orange blossom: honeyed, solar, gently green.", image: "/img/notes/neroli.webp" },
        { name: "Sea salt", description: "A mineral, skin-warm accord of the shoreline.", image: "/img/notes/photo/sea-salt.webp" },
      ],
      base: [{ name: "Coconut water", description: "Translucent and milky — cool shade on a hot day.", image: "/img/notes/photo/coconut-water.webp" }],
    },
    bottle: "/img/bottles/product-azur.webp",
    juice: "#f6bf4a",
    worldT: 0.46,
    palette: { bg: "#f7eedc", deep: "#0f4a52", accent: "#e8b54a", soft: "#f3d39a", ink: "#1f1a12", glow: "#ffe2a6" },
    prices: [
      { size: "50 ml", price: 165 },
      { size: "100 ml", price: 235 },
    ],
    longevity: 3,
    sillage: 4,
    mood: ["Radiant", "Salted", "Free"],
    hour: "Four in the afternoon",
  },
  {
    slug: "velours",
    season: "autumn",
    index: 2,
    numeral: "III",
    name: "Velours",
    seasonLabel: "Autumn",
    frenchSeason: "Automne",
    tagline: "The art of letting go.",
    theme: "Nostalgia, warmth, transformation, intimacy.",
    stateOfBeing: "Release",
    story: [
      "Velours is the velvet hour — when canyon walls turn to copper, the air thickens to gold, and everything you have carried all year is finally allowed to fall.",
      "Ripe fig opens, milky and green, before saffron and cedarwood glow like embers. Amber resin settles at the base, slow and golden, the warmth of a hand held in the dark.",
    ],
    notes: {
      top: [{ name: "Fig", description: "Split, sun-dark fruit with a milky green sap.", image: "/img/notes/fig.webp" }],
      heart: [
        { name: "Saffron", description: "Leathery, honeyed, faintly metallic threads of crimson.", image: "/img/notes/photo/saffron.webp" },
        { name: "Cedarwood", description: "Dry, pencil-shaving woods warmed by the last light.", image: "/img/notes/wood.webp" },
      ],
      base: [{ name: "Amber", description: "Resinous, balsamic and glowing — slow-burning gold.", image: "/img/notes/photo/amber.webp" }],
    },
    bottle: "/img/bottles/product-velours.webp",
    juice: "#b3521f",
    worldT: 0.68,
    palette: { bg: "#efe2d4", deep: "#3a1512", accent: "#b8653a", soft: "#d9a07a", ink: "#24120e", glow: "#f0a768" },
    prices: [
      { size: "50 ml", price: 175 },
      { size: "100 ml", price: 250 },
    ],
    longevity: 4,
    sillage: 3,
    mood: ["Intimate", "Burnished", "Nostalgic"],
    hour: "The last light",
  },
  {
    slug: "givre",
    season: "winter",
    index: 3,
    numeral: "IV",
    name: "Givre",
    seasonLabel: "Winter",
    frenchSeason: "Hiver",
    tagline: "Silence has a scent.",
    theme: "Stillness, mystery, darkness, elegance.",
    stateOfBeing: "Stillness",
    story: [
      "Givre — frost — is the stillness after snowfall: obsidian ground, a sky emptied of sound, frost blooming on stone like slow lace. It is elegance distilled to its quietest form.",
      "Black pepper strikes first, cold and bright as a struck match. Iris and incense drift through the heart, powdery and ecclesiastical, before sandalwood closes the night in a creamy, lasting hush.",
    ],
    notes: {
      top: [{ name: "Black pepper", description: "A cold spark — crisp, piquant, almost mineral.", image: "/img/notes/photo/black-pepper.webp" }],
      heart: [
        { name: "Iris", description: "Powdery orris: cool, violet-tinged and velvet-soft.", image: "/img/notes/iris.webp" },
        { name: "Incense", description: "Olibanum smoke curling through a silent nave.", image: "/img/notes/photo/incense.webp" },
      ],
      base: [{ name: "Sandalwood", description: "Creamy, lactonic woods with infinite patience.", image: "/img/notes/wood.webp" }],
    },
    bottle: "/img/bottles/product-givre.webp",
    juice: "#bcd3ea",
    worldT: 0.865,
    palette: { bg: "#e6e9ee", deep: "#0b1220", accent: "#9fb2cc", soft: "#c5ccd6", ink: "#0d121b", glow: "#cfe0f5" },
    prices: [
      { size: "50 ml", price: 175 },
      { size: "100 ml", price: 250 },
    ],
    longevity: 5,
    sillage: 3,
    mood: ["Still", "Mysterious", "Velvet"],
    hour: "Midnight, first snow",
  },
];

export const bySlug = (slug: string) => FRAGRANCES.find((f) => f.slug === slug);
export const bySeason = (s: Season) => FRAGRANCES.find((f) => f.season === s)!;

export const FINALE_T = 1;
export const HERO_T = 0;

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
