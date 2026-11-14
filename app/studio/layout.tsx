import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Internal product-photography tool: available in development, hidden in production unless ENABLE_STUDIO=1. */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_STUDIO !== "1") notFound();
  return children;
}
