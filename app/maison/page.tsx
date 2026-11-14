import type { Metadata } from "next";
import { Maison } from "@/components/maison/Maison";

export const metadata: Metadata = {
  title: "La Maison",
  description: "Four seasons. Four states of being. The philosophy and craft of Quatréa.",
};

export default function MaisonPage() {
  return <Maison />;
}
