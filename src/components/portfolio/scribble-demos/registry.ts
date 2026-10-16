export const DEMO_SLUGS = [
  "drag-to-delete",
  "dock-floating-tooltip",
  "container-expand-stagger",
  "shared-layout-list-detail",
  "sliding-tab-indicator",
  "status-color-morph",
  "optimistic-reorder-flip",
  "keyboard-shortcut-feedback",
  "panel-slide-crossfade",
  "magnetic-button",
  "number-ticker",
] as const;

export type DemoSlug = (typeof DEMO_SLUGS)[number];

export function hasInteractiveScribbleDemo(slug: string): slug is DemoSlug {
  return (DEMO_SLUGS as readonly string[]).includes(slug);
}
