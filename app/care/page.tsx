import type { Metadata } from "next";
import { Care } from "@/components/care/Care";

export const metadata: Metadata = {
  title: "Client Care",
  description: "Shipping, returns and refills, questions, and how to reach the Quatréa client care team.",
};

export default function CarePage() {
  return <Care />;
}
