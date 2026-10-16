import { WorksPageClient } from "@/components/portfolio/WorksPageClient";
import { getContentRepository } from "@/lib/content";

export const revalidate = 60;

export default async function WorksPage() {
  const works = await (await getContentRepository()).getWorks();
  return <WorksPageClient works={works} />;
}
