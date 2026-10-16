"use client";

import type { ComponentType } from "react";
import { DragToDelete, KeycapFeedback, MagneticButton } from "./source/button-effects";
import {
  ContainerExpand,
  FlipReorder,
  ListToDetail,
  PanelSlide,
  SlidingTabs,
  StatusMorph,
} from "./source/layout-effects";
import { DockTooltip } from "./source/slider-dock";
import { NumberTicker } from "./source/text-effects";
import type { DemoSlug } from "./registry";

const demos: Record<DemoSlug, ComponentType> = {
  "drag-to-delete": DragToDelete,
  "dock-floating-tooltip": DockTooltip,
  "container-expand-stagger": ContainerExpand,
  "shared-layout-list-detail": ListToDetail,
  "sliding-tab-indicator": SlidingTabs,
  "status-color-morph": StatusMorph,
  "optimistic-reorder-flip": FlipReorder,
  "keyboard-shortcut-feedback": KeycapFeedback,
  "panel-slide-crossfade": PanelSlide,
  "magnetic-button": MagneticButton,
  "number-ticker": NumberTicker,
};

export function ScribbleInteractionDemo({ slug }: { slug: DemoSlug }) {
  const Demo = demos[slug];

  return (
    <div
      data-scribble-demo={slug}
      className="scribble-interaction-demo dark flex min-h-[min(78dvh,42rem)] w-full items-center justify-center overflow-hidden bg-background p-6 text-foreground sm:p-10"
    >
      <Demo />
    </div>
  );
}
