"use client";

// The only personal photo kept in the template. Replace this file when you personalize the site.
import portrait from "@/assets/homepage-profile.png";
import { siteConfig } from "@/lib/site";
import { playClickSound } from "@/lib/uiSounds";

type IntroSectionProps = {
  onOpenAbout: () => void;
};

export function IntroSection({ onOpenAbout }: IntroSectionProps) {
  return (
    <section
      className="flex flex-col items-start lg:gap-6 sm:flex-row"
      id="section-intro"
    >
      <div className="relative w-32 h-32 shrink-0 flex flex-col lg:items-center gap-2">
        <div className="relative w-24 h-24 border border-zinc-300 dark:border-zinc-800 p-1.5 bg-zinc-100/50 dark:bg-zinc-900/10 rounded">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/80" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500/80" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500/80" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/80" />

          <div
            className="w-full h-full bg-zinc-200 dark:bg-zinc-900 overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              clipPath:
                "polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)",
            }}
          >
            <img
              src={portrait.src}
              alt={`${siteConfig.name} portrait`}
              className="w-full h-full object-cover grayscale brightness-95 contrast-105 hover:grayscale-0 transition-all duration-500"
              width={96}
              height={96}
            />
          </div>
        </div>
      </div>

      <p className="text-sm md:text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-300 font-sans">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onOpenAbout();
          }}
          className="inline cursor-pointer border-b border-dashed border-amber-500 bg-transparent p-0 text-left font-semibold text-zinc-950 transition-colors duration-200 hover:border-amber-600 hover:bg-amber-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:text-zinc-50"
          title="Read more about my work"
        >
          {siteConfig.introLead}
        </button>{" "}
        {siteConfig.introBody}{" "}
        <a
          href={`mailto:${siteConfig.author.email}`}
          className="font-semibold text-zinc-950 underline decoration-amber-500 underline-offset-4 hover:decoration-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:text-zinc-50"
        >
          Let&apos;s talk.
        </a>
      </p>
    </section>
  );
}
