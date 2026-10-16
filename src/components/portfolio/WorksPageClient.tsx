"use client";

import { useRouter } from "next/navigation";
import type { Work } from "@/data";
import { WorksSliderPage } from "@/components/WorksSliderPage";
import { useTheme } from "@/components/portfolio/useTheme";

export function WorksPageClient({ works }: { works: Work[] }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  return (
    <WorksSliderPage
      works={works}
      theme={resolvedTheme}
      onClose={() => router.push("/", { transitionTypes: ["nav-back"] })}
    />
  );
}
