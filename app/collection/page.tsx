import type { Metadata } from "next";
import { Collection } from "@/components/collection/Collection";

export const metadata: Metadata = {
  title: "The Collection",
  description: "Aubade, Azur, Velours and Givre — four eaux de parfum, one for every season.",
};

export default function CollectionPage() {
  return <Collection />;
}
