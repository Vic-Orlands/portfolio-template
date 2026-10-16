import { InspirationsPageClient } from "@/components/portfolio/InspirationsPageClient";
import { getContentRepository } from "@/lib/content";

export const revalidate = 60;

export default async function InspirationsPage() {
  const items = await (await getContentRepository()).getInspirations();
  return <InspirationsPageClient items={items} />;
}
