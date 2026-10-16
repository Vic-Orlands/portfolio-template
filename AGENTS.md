# Agent guide

This is a personal-portfolio template built with Next.js App Router, React, and Tailwind. Writings, projects, series, scribbles, inspirations, and the display name in `content/profile.json` are sample data (Jane Doe, example.com). The site URL, contact email, and social links in that file are the owner's real ones: `https://mezie.dev`, `chimezieinnocent39@gmail.com`, GitHub `Vic-Orlands`, LinkedIn `victor-innocent`, and X `@MezieIV`.

Use this file as the prompt context when you change the site. A ready-to-paste personalization prompt is at the bottom.

## How content is loaded

Pages and routes call `getContentRepository()` from `src/lib/content`. They do not talk to a database directly.

```ts
const content = await getContentRepository();
const posts = await content.getPosts();
```

The interface is `ContentRepository` in `src/lib/content/types.ts`:

- `getPosts`, `getPost`
- `getSeries`, `getSeriesBySlug`
- `getProjects`, `getProject`
- `getWorks`, `getWork`
- `getInspirations`
- `getByTag`

`CONTENT_SOURCE` selects the adapter:

| Value | Module | When to use it |
| --- | --- | --- |
| `local` (default) | `src/lib/content/adapters/local.ts` | No database. Reads `content/`. |
| `convex` | `src/lib/content/adapters/convex.ts` | Optional Convex backend and admin CMS. |
| `custom` | `src/lib/content/adapters/custom.ts` | Your own database. Starts as a stub. |

Local mode does not import the Convex adapter, and it does not need `npx convex dev` or Convex codegen. The committed `convex/_generated` files exist so the optional adapter still typechecks.

### Write a new adapter

1. Implement `ContentRepository` (see `src/lib/content/adapters/sql.example.ts` for Drizzle, Prisma, and Supabase sketches).
2. Export it from `src/lib/content/adapters/custom.ts`.
3. Set `CONTENT_SOURCE=custom`.
4. Keep pages on `getContentRepository()`. Do not query your database from a page.

Map rows onto the types in `src/data.ts` (`Blog`, `Series`, `Project`, `Work`) and `InspirationItem` in `src/lib/inspirations.ts`. Series parts are the posts whose `series` slug matches the series.

## Where to personalize

| What | Where |
| --- | --- |
| Name, short name, title, description, tagline, job title, keywords | `content/profile.json` |
| Email, GitHub, LinkedIn, X | `content/profile.json` (`email`, `github`, `linkedin`, `x`, `twitter`) |
| Homepage intro | `content/profile.json` (`introLead`, `introBody`) |
| About biography and featured-work links | `content/profile.json` (`bio`, `featured`) |
| About portrait | `content/profile.json` `aboutPortrait`, file in `public/placeholders/` or `public/` |
| Homepage photo | `src/assets/homepage-profile.png` only |
| Published-elsewhere outlets | `content/publications.json` |
| Canonical URL | `NEXT_PUBLIC_SITE_URL`, fallback `url` in `content/profile.json` |
| Writings | `content/posts/*.md`, `*.mdx`, or `*.json` |
| Series | `content/series/*`. Link posts with frontmatter `series: <slug>` and `partOrder` |
| Projects | `content/projects/*` |
| Scribbles / works | `content/works/*` |
| Inspirations | `content/inspirations.json` |
| Nav labels and paths | `src/components/portfolio/SideNavigation.tsx` (`links`) |
| Colors | Tailwind `amber` accents, page background `#fafafa` / `#18181c` in `src/app/layout.tsx` and `src/app/globals.css` |
| Fonts | `src/app/layout.tsx` (Instrument Serif) and `src/app/globals.css` (`--font-sans`, `--font-editorial`, `--font-monument`) |
| Theme storage key | `src/lib/themeKey.ts` |
| SEO, RSS, sitemap, manifest, JSON-LD | They read `src/lib/site.ts`, which reads the JSON above |
| Convex seed copy | `convex/seedData/*`, applied with `npx convex run seed:seedTemplate` |

`src/lib/site.ts` is the code entry for profile and publications. Edit the JSON, not the TypeScript, unless you are adding a field.

### Post frontmatter

```md
---
title: Quiet Interfaces
category: tech
description: One sentence.
date: Jun 12, 2026
tags: design, writing
series: field-notes
partOrder: 1
cover: /placeholders/cover.svg
externalUrl: https://example.com/optional
status: draft
---
```

`category` is `tech`, `scriptures`, or `other`. `status: draft` hides a file. Works use `category` `3D`, `Grid`, or `Card`, plus `technologies`, `media`, and `mediaType`.

JSON files use the same fields and a `content` string instead of a Markdown body. `.mdx` files are stored as Markdown. The renderer does not execute MDX components.

Images that are not the homepage portrait belong in `public/`. Placeholder art is in `public/placeholders/`.

## Environment

Copy `.env.example` to `.env.local`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `CONTENT_SOURCE` | No | `local` (default), `convex`, or `custom` |
| `NEXT_PUBLIC_SITE_URL` | In production | Canonical origin for SEO, RSS, sitemap |
| `NEXT_PUBLIC_CONVEX_URL` | Convex only | Deployment URL |
| `CONVEX_DEPLOYMENT` | Convex only | Written by `npx convex dev` |
| `ADMIN_ENABLED` | No | `true` turns on `/admin` when Convex is the source |
| `ADMIN_PASSWORD` | Convex admin | Set in the Convex dashboard, not in git |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Contact form | Optional email delivery |
| `NEXT_PUBLIC_ANALYTICS_SRC`, `NEXT_PUBLIC_ANALYTICS_SITE_ID` | No | Optional tracker script. Omit both for no analytics |
| `IMAGE_REMOTE_HOSTS` | No | Comma-separated hostnames for `next/image` |
| `R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_BASE_URL` | Uploads | Optional object storage for the Convex admin |

Do not hard-code analytics IDs, storage hostnames, or access keys.

## Commands

```bash
pnpm install
pnpm dev          # Next.js on port 3000, local content by default
pnpm build
pnpm lint         # tsc --noEmit
pnpm dev:backend  # optional: npx convex dev
```

Production build with no database:

```bash
CONTENT_SOURCE=local pnpm build
```

Unset `NEXT_PUBLIC_CONVEX_URL` for that check. Convex codegen is not part of the local build.

## Conventions

- App Router pages live in `src/app`. Interactive UI is under `src/components/portfolio`.
- Server pages fetch through the repository and pass props into client components.
- Comments are Convex-only. Without Convex they render a short unavailable note.
- The admin CMS is opt-in. It is not tied to a specific account. Login checks `ADMIN_PASSWORD`.
- Keep sample links on `https://example.com` until the owner replaces them.
- Prefer editing `content/` over hard-coding copy in components.

## What not to touch

Unless the task asks for it:

- `src/app/layout.tsx` cursor CSS and the theme-init script, beyond the storage key
- `src/components/portfolio/scribble-demos/` (hand-built interaction demos)
- `convex/_generated/` (generated by Convex)
- `public/fonts/` and `public/sounds/`
- The homepage photo path, except to swap the image file itself
- View-transition types on links

When you do change Convex functions, read `convex/_generated/ai/guidelines.md` first.

## Personalize this portfolio for me

Paste this to an agent, then fill in the blanks:

```text
Personalize this portfolio for me.

Name: <full name>
Short name: <name used in the manifest>
Email: <email>
Site URL: https://<domain>
GitHub: https://github.com/<handle>
LinkedIn: https://www.linkedin.com/in/<handle>
X: https://x.com/<handle>
Twitter handle: @<handle>

Role: <one line, used as the tagline and job title>
Homepage intro: <the sentence on the portrait button, then one or two sentences after it>
About: <two short paragraphs>
Location label: <text on the about portrait, or "LOC // CITY">

Replace the homepage photo with the image I will add at src/assets/homepage-profile.png.
Replace the about portrait with a file I will add under public/, and point content/profile.json aboutPortrait at it.

Featured work:
- <name> — <url> — <one line> — image at public/<file>
- <name> — <url> — <one line> — image at public/<file>

Writings to add (create content/posts files, remove the sample posts):
- <title> — <date> — <category: tech|scriptures|other> — <one sentence>

Series:
- <title> — parts: <post slugs in order>

Projects (content/projects, remove the samples):
- <name> — <url> — <date> — <one sentence>

Scribbles (content/works):
- <name> — <category: 3D|Grid|Card> — <one sentence>

Inspirations: replace content/inspirations.json with <list or "I'll paste URLs">.
Publications: replace content/publications.json with <outlet, url, one line>.

Keep CONTENT_SOURCE=local unless I say otherwise.
Do not add analytics, private hostnames, or a database.
Do not change the layout system, cursor, or scribble demos.
```
