import profile from "../../content/profile.json";
import publications from "../../content/publications.json";

export type Publication = {
  name: string;
  domain: string;
  description: string;
  href: string;
  logo: string;
  logoClass: string;
  linkLabel: string;
};

export type FeaturedLink = {
  href: string;
  title: string;
  label: string;
  image: string;
  imageAlt: string;
};

export const siteConfig = {
  name: profile.name,
  shortName: profile.shortName,
  title: profile.title,
  description: profile.description,
  tagline: profile.tagline,
  jobTitle: profile.jobTitle,
  keywords: profile.keywords,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? profile.url,
  locale: profile.locale,
  author: {
    name: profile.name,
    email: profile.email,
    github: profile.github,
    linkedin: profile.linkedin,
    x: profile.x,
    twitter: profile.twitter,
  },
  introLead: profile.introLead,
  introBody: profile.introBody,
  bio: profile.bio,
  aboutPortrait: profile.aboutPortrait,
  locationLabel: profile.locationLabel,
  featured: profile.featured as FeaturedLink[],
  publications: publications as Publication[],
  ogImage: "/opengraph-image",
} as const;

export function absoluteUrl(path = "/"): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
