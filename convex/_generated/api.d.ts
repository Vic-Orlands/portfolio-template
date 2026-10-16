/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as comments from "../comments.js";
import type * as files from "../files.js";
import type * as filesActions from "../filesActions.js";
import type * as inspirations from "../inspirations.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_content from "../lib/content.js";
import type * as lib_r2 from "../lib/r2.js";
import type * as lib_readingTime from "../lib/readingTime.js";
import type * as lib_tags from "../lib/tags.js";
import type * as posts from "../posts.js";
import type * as projectNotesSeed from "../projectNotesSeed.js";
import type * as projects from "../projects.js";
import type * as r2 from "../r2.js";
import type * as seed from "../seed.js";
import type * as seedData_buildingSilo from "../seedData/buildingSilo.js";
import type * as seedData_inspirations from "../seedData/inspirations.js";
import type * as seedData_kmsBlog from "../seedData/kmsBlog.js";
import type * as seedData_projectNotes from "../seedData/projectNotes.js";
import type * as series from "../series.js";
import type * as tags from "../tags.js";
import type * as works from "../works.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  comments: typeof comments;
  files: typeof files;
  filesActions: typeof filesActions;
  inspirations: typeof inspirations;
  "lib/auth": typeof lib_auth;
  "lib/content": typeof lib_content;
  "lib/r2": typeof lib_r2;
  "lib/readingTime": typeof lib_readingTime;
  "lib/tags": typeof lib_tags;
  posts: typeof posts;
  projectNotesSeed: typeof projectNotesSeed;
  projects: typeof projects;
  r2: typeof r2;
  seed: typeof seed;
  "seedData/buildingSilo": typeof seedData_buildingSilo;
  "seedData/inspirations": typeof seedData_inspirations;
  "seedData/kmsBlog": typeof seedData_kmsBlog;
  "seedData/projectNotes": typeof seedData_projectNotes;
  series: typeof series;
  tags: typeof tags;
  works: typeof works;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
