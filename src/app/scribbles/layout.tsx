import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const description = `Small interface designs, motion studies, and visual experiments by ${siteConfig.name}.`;

export const metadata: Metadata = {
  title: "Scribbles and Designs",
  description,
  keywords: [
    "interaction design",
    "UI animation",
    "motion design",
    "design engineering",
    "frontend experiments",
  ],
  alternates: { canonical: "/scribbles" },
  openGraph: {
    type: "website",
    url: "/scribbles",
    title: `Scribbles and Designs · ${siteConfig.name}`,
    description,
    images: [siteConfig.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `Scribbles and Designs · ${siteConfig.name}`,
    description,
    images: [siteConfig.ogImage],
  },
};

export default function ScribblesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
