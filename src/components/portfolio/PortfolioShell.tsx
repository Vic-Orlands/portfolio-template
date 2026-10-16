"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { PortfolioFooter } from "@/components/portfolio/PortfolioFooter";
import {
  PortfolioHeader,
  PortfolioUtilityControls,
} from "@/components/portfolio/PortfolioHeader";
import { SideNavigation } from "@/components/portfolio/SideNavigation";
import { useTheme } from "@/components/portfolio/useTheme";
import type { ContentHeading } from "@/lib/contentHeadings";
import { playClickSound } from "@/lib/uiSounds";

type PortfolioShellProps = {
  children: React.ReactNode;
  showHomeLink?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  sideNavigation?: "default" | "none" | ContentHeading[];
  animateHeaderLayout?: boolean;
};

export function PortfolioShell({
  children,
  showHomeLink = true,
  showHeader = false,
  showFooter = true,
  sideNavigation = "default",
  animateHeaderLayout = false,
}: PortfolioShellProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-[#fafafa] px-6 pb-5 pt-12 font-sans text-zinc-950 md:pt-52 dark:bg-[#18181c] dark:text-zinc-400"
      data-theme-surface
    >
      {sideNavigation !== "none" && (
        <SideNavigation
          outline={Array.isArray(sideNavigation) ? sideNavigation : undefined}
          controls={
            <PortfolioUtilityControls
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />
      )}
      <div className="mx-auto flex min-h-[calc(100dvh-4.25rem)] w-full max-w-2xl flex-col md:min-h-[calc(100dvh-6.25rem)]">
        <div className="space-y-12">
          {showHeader && (
            <PortfolioHeader
              theme={theme}
              onToggleTheme={toggleTheme}
              onTitleClick={() => {
                router.push("/", { transitionTypes: ["nav-back"] });
              }}
              animateSharedLayout={animateHeaderLayout}
            />
          )}
          {showHomeLink && (
            <div className="text-xs font-mono">
              <Link
                href="/"
                transitionTypes={["nav-back"]}
                onClick={playClickSound}
                className="inline-flex items-center gap-1 text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                <ChevronLeftIcon className="size-3" />
                Home
              </Link>
            </div>
          )}
          {children}
        </div>
        {showFooter && <PortfolioFooter />}
      </div>
    </div>
  );
}
