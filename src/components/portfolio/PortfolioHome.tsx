"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Blog, BlogCategory, Project, Series, Work } from "@/data";
import { AboutMeView } from "@/components/AboutMeView";
import { DirectoryModal } from "@/components/DirectoryModal";
import {
  PortfolioHeader,
  PortfolioUtilityControls,
} from "@/components/portfolio/PortfolioHeader";
import { IntroSection } from "@/components/portfolio/IntroSection";
import { ProjectsSection } from "@/components/portfolio/ProjectsSection";
import { WritingsSection } from "@/components/portfolio/WritingsSection";
import { WorksSection } from "@/components/portfolio/WorksSection";
import { SeriesSection } from "@/components/portfolio/SeriesSection";
import { PortfolioFooter } from "@/components/portfolio/PortfolioFooter";
import { SideNavigation } from "@/components/portfolio/SideNavigation";
import { useTheme } from "@/components/portfolio/useTheme";
import { consumeHomeFocus, subscribeOpenProjectsModal } from "@/lib/homeFocus";
import {
  extractMarkdownImageUrls,
  usePreloadImages,
} from "@/hooks/usePreloadImages";
import { isVideoMedia } from "@/components/WorkMediaPreview";

type PortfolioHomeProps = {
  blogs: Blog[];
  blogsLoading?: boolean;
  projects: Project[];
  projectsLoading?: boolean;
  series: Series[];
  seriesLoading?: boolean;
  works: Work[];
  worksLoading?: boolean;
};

export function PortfolioHome({
  blogs,
  blogsLoading = false,
  projects,
  projectsLoading = false,
  series,
  seriesLoading = false,
  works,
  worksLoading = false,
}: PortfolioHomeProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const [isAboutMeOpen, setIsAboutMeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<BlogCategory>("tech");
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [writingsFormat, setWritingsFormat] = useState<"compact" | "detailed">(
    "compact",
  );
  const projectImageUrls = useMemo(
    () =>
      projects.flatMap((project) => [
        ...(project.mediaType !== "video" && !isVideoMedia(project.imageUrl)
          ? [project.imageUrl]
          : []),
        ...extractMarkdownImageUrls(project.content),
      ]),
    [projects],
  );

  usePreloadImages(projectImageUrls);

  useEffect(() => {
    if (consumeHomeFocus() === "projects-modal") {
      setIsProjectsModalOpen(true);
    }
    return subscribeOpenProjectsModal(() => {
      setIsAboutMeOpen(false);
      setIsProjectsModalOpen(true);
    });
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#fafafa] px-6 pb-5 pt-12 text-zinc-950 md:pt-52 dark:bg-[#18181c] dark:text-zinc-400"
      data-theme-surface
      id="portfolio-app-root"
    >
      <SideNavigation
        hidden={isAboutMeOpen || isProjectsModalOpen}
        controls={
          <PortfolioUtilityControls theme={theme} onToggleTheme={toggleTheme} />
        }
      />
      <AnimatePresence mode="wait">
        {isAboutMeOpen ? (
          <AboutMeView
            key="aboutme"
            onClose={() => setIsAboutMeOpen(false)}
            theme={resolvedTheme}
          />
        ) : (
          <motion.div
            key="main-layout"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto flex min-h-[calc(100dvh-4.25rem)] w-full max-w-2xl flex-col md:min-h-[calc(100dvh-6.25rem)]"
          >
            <PortfolioHeader
              theme={theme}
              onToggleTheme={toggleTheme}
              onTitleClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />

            <main id="portfolio-main" className="mt-10 space-y-16 lg:mt-16">
              <IntroSection onOpenAbout={() => setIsAboutMeOpen(true)} />
              <ProjectsSection
                projects={projects}
                isLoading={projectsLoading}
                onShowMore={() => setIsProjectsModalOpen(true)}
              />
              <WritingsSection
                blogs={blogs}
                isLoading={blogsLoading}
                activeTab={activeTab}
                writingsFormat={writingsFormat}
                onTabChange={setActiveTab}
                onFormatChange={setWritingsFormat}
              />
              <SeriesSection series={series} isLoading={seriesLoading} />
              <WorksSection works={works} isLoading={worksLoading} />
            </main>

            <PortfolioFooter />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProjectsModalOpen && (
          <DirectoryModal
            key="projects-modal"
            projects={projects}
            onClose={() => setIsProjectsModalOpen(false)}
            theme={resolvedTheme}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
