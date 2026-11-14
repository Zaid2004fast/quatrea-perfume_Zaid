import type { MetadataRoute } from "next";
import { FRAGRANCES } from "@/lib/fragrances";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/collection", "/maison", "/discover", "/care"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...FRAGRANCES.map((f) => ({ url: `${SITE_URL}/fragrance/${f.slug}`, changeFrequency: "monthly" as const, priority: 0.9 })),
  ];
}
