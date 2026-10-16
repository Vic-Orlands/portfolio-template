"use client";

import {
  DesktopIcon,
  MoonIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { PortfolioSocialLinks } from "@/components/portfolio/PortfolioSocialLinks";
import { siteConfig } from "@/lib/site";
import type { Theme } from "@/components/portfolio/useTheme";
import {
  playClickSound,
  playSoundEnabledSound,
  playThemeSound,
  preloadUiSounds,
  setUiSoundEnabled,
} from "@/lib/uiSounds";

type PortfolioHeaderProps = {
  onTitleClick: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  animateSharedLayout?: boolean;
};

const SOUND_PREFERENCE_EVENT = "portfolio-sound-change";

export function PortfolioUtilityControls({
  theme,
  onToggleTheme,
  className = "mt-3",
}: {
  theme: Theme;
  onToggleTheme: () => void;
  className?: string;
}) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const syncPreference = () => {
      const storedPreference = window.localStorage.getItem("portfolio-sound");
      const nextEnabled = storedPreference !== "off";
      setSoundEnabled(nextEnabled);
      setUiSoundEnabled(nextEnabled);
    };

    preloadUiSounds();
    syncPreference();
    window.addEventListener(SOUND_PREFERENCE_EVENT, syncPreference);
    return () =>
      window.removeEventListener(SOUND_PREFERENCE_EVENT, syncPreference);
  }, []);

  const toggleSound = () => {
    const nextEnabled = !soundEnabled;
    setSoundEnabled(nextEnabled);
    setUiSoundEnabled(nextEnabled);
    window.localStorage.setItem("portfolio-sound", nextEnabled ? "on" : "off");
    window.dispatchEvent(new Event(SOUND_PREFERENCE_EVENT));
    if (nextEnabled) playSoundEnabledSound();
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundEnabled}
        className="cursor-pointer rounded-md p-0 text-zinc-500 transition-colors hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:text-zinc-400 dark:hover:text-zinc-100"
        title={
          soundEnabled ? "Mute interface sounds" : "Enable interface sounds"
        }
      >
        {soundEnabled ? (
          <SpeakerLoudIcon className="size-3.5" />
        ) : (
          <SpeakerOffIcon className="size-3.5" />
        )}
        <span className="sr-only">
          {soundEnabled ? "Mute interface sounds" : "Enable interface sounds"}
        </span>
      </button>
      <button
        type="button"
        onClick={() => {
          playThemeSound(theme);
          onToggleTheme();
        }}
        id="theme-toggler"
        className="cursor-pointer rounded-md p-0 text-zinc-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:text-zinc-400"
        title={
          theme === "dark"
            ? "Switch to light mode"
            : theme === "light"
              ? "Switch to system theme"
              : "Switch to dark mode"
        }
      >
        {theme === "dark" ? (
          <SunIcon className="size-3.5" />
        ) : theme === "light" ? (
          <DesktopIcon className="size-3.5" />
        ) : (
          <MoonIcon className="size-3.5" />
        )}
        <span className="sr-only">
          {theme === "dark"
            ? "Switch to light mode"
            : theme === "light"
              ? "Switch to system theme"
              : "Switch to dark mode"}
        </span>
      </button>
    </div>
  );
}

export function PortfolioHeader({
  onTitleClick,
  theme,
  onToggleTheme,
  animateSharedLayout = false,
}: PortfolioHeaderProps) {
  const reduceMotion = useReducedMotion();
  const animateLayout = animateSharedLayout && !reduceMotion;

  return (
    <header
      className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-baseline sm:text-left"
      id="portfolio-header"
    >
      <div style={{ viewTransitionName: "site-identity" }}>
        <motion.div
          layoutId={animateLayout ? "inspirations-site-name" : undefined}
          layout={animateLayout ? "position" : false}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={() => {
              playClickSound();
              onTitleClick();
            }}
            className="cursor-pointer text-center font-sans text-xl font-semibold tracking-tight text-zinc-950 transition-colors duration-150 hover:text-zinc-700 focus:outline-none sm:text-left dark:text-zinc-50 dark:hover:text-zinc-300"
            id="header-title-name"
          >
            {siteConfig.name}
          </button>
        </motion.div>
        <motion.p
          layoutId={animateLayout ? "inspirations-site-email" : undefined}
          layout={animateLayout ? "position" : false}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            title="Email Me"
            href={`mailto:${siteConfig.author.email}`}
            className="text-xs font-mono text-zinc-600 dark:text-zinc-500 mt-1"
          >
            {siteConfig.author.email}
          </a>
        </motion.p>
      </div>

      <div className="flex items-center gap-4">
        <PortfolioSocialLinks
          layoutId={
            animateSharedLayout ? "inspirations-site-social-links" : undefined
          }
        />
        <PortfolioUtilityControls
          theme={theme}
          onToggleTheme={onToggleTheme}
          className="min-[1121px]:hidden"
        />
      </div>
    </header>
  );
}
