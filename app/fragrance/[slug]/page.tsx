import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FRAGRANCES, bySlug } from "@/lib/fragrances";
import { FragranceView } from "@/components/fragrance/FragranceView";

export function generateStaticParams() {
  return FRAGRANCES.map((f) => ({ slug: f.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = bySlug(slug);
  return f ? { title: `${f.name} — ${f.seasonLabel}`, description: `${f.name}: ${f.tagline} ${f.theme}` } : {};
}

export default async function FragrancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = bySlug(slug);
  if (!f) notFound();
  return <FragranceView key={f.slug} f={f} />;
}
