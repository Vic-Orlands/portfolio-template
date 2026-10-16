---
title: Quiet Interfaces
category: tech
description: A sample essay on why a portfolio page can be mostly type, space, and a few careful links.
date: Jun 12, 2026
tags: design, writing
series: field-notes
partOrder: 1
cover: /placeholders/cover.svg
---

This essay is placeholder copy for the portfolio template. It is here so the writings index, the article page, and the series view have something to render before you add your own posts.

## What to replace

Edit this file in `content/posts`. The block at the top is frontmatter. The rest is Markdown (or MDX treated as Markdown). The local content adapter reads it when `CONTENT_SOURCE` is `local` or unset.

- Change the title, date, and description.
- Point `cover` at an image in `public/`, or delete the field.
- Remove `series` if the piece stands alone.

## A short example

A quiet page asks for one thing at a time. The title is the loudest element. Links look like links. Motion is optional. None of that requires a database.

```ts
export const source = process.env.CONTENT_SOURCE ?? "local";
```

Replace this note with an essay you actually want to publish.
