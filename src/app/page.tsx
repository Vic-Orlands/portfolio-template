import { PortfolioHome } from "@/components/portfolio/PortfolioHome";
import { getContentRepository } from "@/lib/content";

export const revalidate = 60;

export default async function HomePage() {
  const content = await getContentRepository();
  const [blogs, projects, series, works] = await Promise.all([
    content.getPosts(),
    content.getProjects(),
    content.getSeries(),
    content.getWorks(),
  ]);

  return (
    <PortfolioHome
      blogs={blogs}
      projects={projects}
      series={series}
      works={works}
    />
  );
}
