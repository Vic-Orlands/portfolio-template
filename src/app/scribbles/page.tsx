import { Suspense } from "react";
import { ScribblesPageClient } from "@/components/portfolio/ScribblesPageClient";
import { getContentRepository } from "@/lib/content";
import { preload } from "react-dom";

export const revalidate = 60;

export default async function ScribblesPage() {
  const works = await (await getContentRepository()).getWorks();

  works.forEach((work, index) => {
    if (!work.mediaUrl) return;

    const isVideo =
      work.mediaType === "video" ||
      /\.(mp4|webm|mov)(?:[?#]|$)/i.test(work.mediaUrl);

    if (isVideo) {
      preload(work.mediaUrl, {
        as: "video",
        fetchPriority: index < 12 ? "high" : "auto",
      });
      return;
    }

    if (!work.mediaWidth || !work.mediaHeight) {
      preload(work.mediaUrl, {
        as: "image",
        fetchPriority: index < 12 ? "high" : "auto",
      });
    }
  });

  return (
    <Suspense fallback={null}>
      <ScribblesPageClient works={works} />
    </Suspense>
  );
}
