import { LayoutGrid, List } from "lucide-react";
import { playClickSound } from "@/lib/uiSounds";

type InspirationViewToggleProps = {
  gridMode: boolean;
  onToggle: () => void;
  className?: string;
};

export function InspirationViewToggle({
  gridMode,
  onToggle,
  className = "",
}: InspirationViewToggleProps) {
  return (
    <button
      type="button"
      className={`grid size-8 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 cursor-pointer transition-[border-color,background-color,transform] duration-150 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.94] focus:outline-none focus-visible:outline-1 focus-visible:outline-zinc-500 focus-visible:outline-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 max-md:hidden ${className}`}
      onClick={() => {
        playClickSound();
        onToggle();
      }}
      aria-label={gridMode ? "Show inspiration list" : "Show inspiration grid"}
      title={gridMode ? "List view" : "Grid view"}
    >
      {gridMode ? (
        <List className="size-3.5" aria-hidden />
      ) : (
        <LayoutGrid className="size-3.5" aria-hidden />
      )}
    </button>
  );
}
