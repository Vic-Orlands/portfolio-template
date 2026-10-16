export type InspirationSkill = {
  name: string;
  description: string;
  stars: string;
  kind: string;
  url: string;
  install: string;
};

export type InspirationSkillDirectory = {
  name: string;
  description: string;
  kind: string;
  url: string;
};

export const inspirationSkills: readonly InspirationSkill[] = [
  {
    name: "emilkowalski/emil-design-eng",
    description: "Craft interfaces with polish, motion, and taste",
    stars: "18.8K+",
    kind: "gradient",
    url: "https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md",
    install:
      "npx skills add https://github.com/emilkowalski/skills --skill emil-design-eng",
  },
  {
    name: "emilkowalski/review-animations",
    description: "Review motion code against a high craft bar",
    stars: "18.8K+",
    kind: "gradient",
    url: "https://github.com/emilkowalski/skills/blob/main/skills/review-animations/SKILL.md",
    install:
      "npx skills add https://github.com/emilkowalski/skills --skill review-animations",
  },
  {
    name: "emilkowalski/improve-animations",
    description: "Audit motion and plan high-leverage animation fixes",
    stars: "18.8K+",
    kind: "gradient",
    url: "https://github.com/emilkowalski/skills/blob/main/skills/improve-animations/SKILL.md",
    install:
      "npx skills add https://github.com/emilkowalski/skills --skill improve-animations",
  },
  {
    name: "addyosmani/frontend-ui-engineering",
    description: "Build production-quality, accessible, responsive UIs",
    stars: "79.5K+",
    kind: "person",
    url: "https://github.com/addyosmani/agent-skills/blob/main/skills/frontend-ui-engineering/SKILL.md",
    install:
      "npx skills add https://github.com/addyosmani/agent-skills --skill frontend-ui-engineering",
  },
  {
    name: "anthropics/frontend-design",
    description: "Create distinctive, production-grade frontend design",
    stars: "162.7K",
    kind: "ai",
    url: "https://github.com/anthropics/skills",
    install:
      "npx skills add https://github.com/anthropics/skills --skill frontend-design",
  },
  {
    name: "vercel-labs/find-skills",
    description: "Discover and install skills from the open ecosystem",
    stars: "26.7K",
    kind: "dark",
    url: "https://github.com/vercel-labs/skills",
    install:
      "npx skills add https://github.com/vercel-labs/skills --skill find-skills",
  },
  {
    name: "vercel-labs/vercel-react-best-practices",
    description: "React and Next.js performance guidelines from Vercel",
    stars: "29.3K",
    kind: "dark",
    url: "https://github.com/vercel-labs/agent-skills",
    install:
      "npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices",
  },
  {
    name: "mattpocock/improve-codebase-architecture",
    description: "Improve architecture with clear, high-leverage refactors",
    stars: "178.0K",
    kind: "person",
    url: "https://github.com/mattpocock/skills",
    install:
      "npx skills add https://github.com/mattpocock/skills --skill improve-codebase-architecture",
  },
  {
    name: "mattpocock/tdd",
    description: "Practice test-driven development with agent-friendly workflows",
    stars: "178.0K",
    kind: "person",
    url: "https://github.com/mattpocock/skills",
    install:
      "npx skills add https://github.com/mattpocock/skills --skill tdd",
  },
  {
    name: "vercel-labs/web-design-guidelines",
    description: "Audit UI code for design and accessibility compliance",
    stars: "29.3K",
    kind: "dark",
    url: "https://github.com/vercel-labs/agent-skills",
    install:
      "npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines",
  },
  {
    name: "jakubkrehel/make-interfaces-feel-better",
    description: "Polish UI details so interfaces feel intentional",
    stars: "2.4K",
    kind: "silver",
    url: "https://github.com/jakubkrehel/make-interfaces-feel-better",
    install:
      "npx skills add https://github.com/jakubkrehel/make-interfaces-feel-better --skill make-interfaces-feel-better",
  },
  {
    name: "mattpocock/grill-me",
    description: "Rigorous grilling that exposes gaps and sharpens decisions",
    stars: "178.0K",
    kind: "person",
    url: "https://github.com/mattpocock/skills",
    install:
      "npx skills add https://github.com/mattpocock/skills --skill grill-me",
  },
] as const;

export const inspirationSkillDirectories: readonly InspirationSkillDirectory[] =
  [
    {
      name: "skills.sh",
      description: "Browse the open agent skills ecosystem and leaderboard",
      kind: "blue",
      url: "https://www.skills.sh/",
    },
    {
      name: "ui-skills.com",
      description: "A curated directory of UI-focused agent skills",
      kind: "gray",
      url: "https://www.ui-skills.com/skills",
    },
  ] as const;
