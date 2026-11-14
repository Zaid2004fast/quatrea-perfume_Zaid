import type { Metadata } from "next";
import { Discover } from "@/components/discover/Discover";

export const metadata: Metadata = {
  title: "Discover your season",
  description: "Five questions to find the Quatréa fragrance that belongs to you.",
};

export default function DiscoverPage() {
  return <Discover />;
}
