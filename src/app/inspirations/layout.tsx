import type { Metadata } from "next";
import { inspirationsMetadata } from "@/lib/inspirations";

export const metadata: Metadata = inspirationsMetadata;

export default function InspirationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
