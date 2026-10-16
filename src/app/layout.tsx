import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { PageTransition } from "@/components/PageTransition";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { THEME_STORAGE_KEY } from "@/lib/themeKey";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": absoluteUrl("/feed.xml"),
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: siteConfig.author.twitter,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: siteConfig.tagline,
  icons: {
    icon: "/apple-icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#18181c" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('system-theme');
    } else if (t === 'system') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('system-theme');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('system-theme');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

const cursorPng = {
  light:
    "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAABEVBMVEVMaXEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACbTVBqAAAAWnRSTlMAKeAq+8XiBQEMa9GiREzrpgJV9NyRlvK3Ff4iyDT2/b6l7ks8CQNn6N9bBFaztoZdXPUzlTpH3sAYSIRk7xYZhXRzwTL6EhcTfA6e1SyA0g3xdpd7nR0kbNA8vuymAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA5ElEQVR4nGNgIAfYm9lhFbe0jWKRMODElLCKsrE2jzIS4GNHk5BkcWBgMBbViFLi4eVAkZFgAvHVeHnEo9hEXZAkDKNMIQxVIV3XKB8/aZgEp7AJwlwuVil5BUYoT4Af2V5pTzZuKJMvShlJwouLCSbBzq8IF/YVE4+SYYbxxIQh/mPXsYiS85ZF6FaJ0gJR2qxRIo5uyD7h0NQDUUJR6oJovtdncWdgYHAWQRdnYIziYmBglnJCF2dg4GZlYAiW88CUCIoKDwgMxRRnCJMPiYhCcicCKLAxyWATZ2CM9If7lzwAACn5F5/fEoXNAAAAAElFTkSuQmCC",
  lightFilled:
    "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAArlBMVEVMaXEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADEid+MAAAAOXRSTlMAAQWmKQy4/P791fjfAspMKjQWFVz3SPZd8kcYGTyegOKRotblE3RzlhIiwNdnwXad0x3U8e4yhkSQkXJ9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAArElEQVR4nJ2QxxaDIBREsYLRaHrvvfc2//9jOUSwYTbO8l5g3oOQIhn0arm83wW1O5YqWgAomkagZ0SdgofiMftoKWOHBnCwmL4SoiE4AMZwGO+ksNqxARywkymMId8SoSUhAvwR+jOF4Vdky8aRlMEdVeO5htFhb7VNbqJNWGiO5cz2759gXpYTM7ywVn/yzuvdpSrOvPqicnLjJYk54+wp9fM4Ma/zaN9i+QKAqiOwcSzRkgAAAABJRU5ErkJggg==",
  dark:
    "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAABEVBMVEVMaXHT09nT09jU1NrU1NjU1NjU1NfMzMz////U1NTU1NjU1NfV1dnU1NfT09bT09fT09j////V1djU1NjU1NfU1NjU1NfT09jT09fOztrT09fS0tnU1NfT09fS0tfU1NjT09fT09jU1NjU1NjGxuLS0tnU1Neqqv/U1NjU1NfT09i/v7/U1NjS0tjT09fT09jU1NjS0tjT09jU1NfS0tfT09fU1NfU1NjT09fQ0NzT09fU1NTU1NjU1NjU1NfT09jU1NjW1tbT09fU1NfU1NjW1tbU1NTS0tLW1tbT09fW1tbT09fT09ja2trT09fU1NjT09fT09jU1NjX19fT09vU1NjU1NbU1NTT09fU1NfU1NiZkP16AAAAWnRSTlMAKeAq+8XiBQEMa9FEokzrpgJV9NyRlvK3Ff4i9sg0vv2l7jwJS2cD6FvfBLNWtob1XF2VMzrvhXQWRxiEwN5kSBnBc/oyEhcTgCx8ng7V0nt2nQ0dl2wk8dACnUx8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA5ElEQVR4nGNgIAc4WlliFbc2i2KRMOLElHCIsrexizIQ4GNHk5BkMWdgMBHViFLi5eFAkZFgAvHVeXjFo9hEXZEkDKNMIQwVIR2XKD9PaZgEp7AxwlwuVikFeUYoT4Af2V5pbzZuKJMvShVJwpeLCSbBzq8IF/YSE4+SZYbxxIQh/mPXtY2S8ZFD6FaO0gRR2qxRIhZuyD7h0NIDUUJRaoJovtdncWdgYHASQRdnYIziYmBglnJGF2dg4GZlYAiV8cCUCIwKD44IwhRnCFEICItCcicCyLMxyWITZ2CM9If7lzwAAC9+F5/xuqN1AAAAAElFTkSuQmCC",
  darkFilled:
    "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAyVBMVEVMaXHT09j////U1NrT09nU1NTU1NjT09fU1NjT09jMzMz////T09fT09fU1NfT09bU1NfT09fS0tfOztrU1NjW1tbT09bQ0NzS0tjU1NjT09jU1NTU1NjT09fU1NfU1NfT09bU1NjT09fU1NjU1NjW1tbU1NfT09jT09fU1NjT09fU1NfT09jT09fU1NjS0tnU1NTU1NfU1NfU1NfT09jT09fV1dnT09jU1NjT09fW1tbT09fU1NfU1NjT09vS0tbU1NjU1NjT09geyhmcAAAAQXRSTlMApgIqKQy4/vz8BQHV/MpM+P00FfcZ8hZc9l0YSEf81uWR1P3+E5Z2dOKA14bB3yISomdz3+5EnjzAMvH9nR3+07FexsIAAAAJcEhZcwAACxMAAAsTAQCanBgAAACzSURBVHicnZDFFoMwFERDi1Os7u7ubtP//6geIDgrZnlvkvcmhKRJqVVJ5I0yRL7OxUUTQBtFRpcjoiDCiojH7qyEDC/ZBjDR7d0Doko5gKGAxXzjCq7mG2AAYcVSw7hv0ag5KnSEI7lCPgWxCC3rThmbFP4EGJe8v9fVO3ycboNNlJngmH0m0n5pi886ygnrXDjEf7L/BGCM4mJirf+Kc/K2hgT29HNTJS2JE/bb8fqmyx+YIilfkYL49AAAAABJRU5ErkJggg==",
  contrast:
    "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAABQVBMVEVMaXF/f39qan9ycntycngAAABxcXlvb3yAgIhmZmZxcXpxcXtzc3l0dHxycntwcHpycnuQkJdxcXp/f4dwcHpwcHt2doBycntycntxcXp1dX5ycntxcXlycnt8fIR6eoKPj5Zzc3yamqFwcHlycntwcHlxcXmZmZ9wcHhycnqTk5pwcHiBgYlwcHqTk5lzc39xcXlycntxcXhtbXlvb3p0dHRzc3xwcHpxcX9ycntxcXlxcXtwcHp2dn9ycnxwcHhra3hzc3txcXlycnxzc3tycnt3d39ycntwcHn///9xcXrDw8f8/Pz9/f3Q0NO1tbpycnujo6mlpavZ2dzV1dj4+Pn6+vrMzNDPz9Lf3+GsrLGurrPj4+THx8v+/v7z8/Srq7G6ur739/js7O3m5ujy8vPo6Omrq7D4+Pi7u7/r6+w/g3iNAAAASXRSTlMAAgzfTAGmKfwF/Lgq1fg0yv3+/JZE/fHuov08Z+X8/Pzi/pH2hlz+Xff+dPwZ/hZz8kgVRxj+MhL+gNee/MEiE9ad09Qd/MB2BR9FKAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAO5JREFUeJxjYCAH6JroYxU3NfTi4tZgwpQw8or11/HSZGPhRJMw5vL39IyJlvMSlxRlRZHh5ojz9PT0DQ4S85JVNkeSUPOK9ASDMD8lMy9rK3uYBJNKFETC09Mz3lswQMiOHSrDJu8Dl/H0TE4U5oVKsHiFIEkkeXPAJDglAuHCKQm2XgI8MFtEpELBoj4RWl58NvwId0l7hYPEfRW8mLUtkH3CqqgOkvDzkmFE872qZaqnp6ceM7o4A7uXt6dnWoABZki6CHp6pvM5YEp4eGVluDlhijO4CmV6eyG5EwHchTkEsIkzsDs7wv1LHgAAHKkxqITfE/sAAAAASUVORK5CYII=",
} as const;

function cursorUrl(png: string) {
  return `url("data:image/png;base64,${png}") 4 2, default`;
}

const triangleCursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3.452 4.728 9.064 20.555c.306.862 1.513.895 1.865.051l2.691-6.449a1 1 0 0 1 .538-.538l6.448-2.69c.845-.353.812-1.56-.05-1.866L4.728 3.451c-.793-.281-1.558.484-1.276 1.277Z" stroke="white" stroke-width="3.5" stroke-linejoin="round"/><path d="M3.452 4.728 9.064 20.555c.306.862 1.513.895 1.865.051l2.691-6.449a1 1 0 0 1 .538-.538l6.448-2.69c.845-.353.812-1.56-.05-1.866L4.728 3.451c-.793-.281-1.558.484-1.276 1.277Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

function svgCursorUrl(svg: string) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 4 2, default`;
}

const triangleCursorUrl = svgCursorUrl(triangleCursorSvg);
const dragCursorPath = "M8.00012 1.5C8.00012 1.22386 7.77626 1 7.50012 1C7.22398 1 7.00012 1.22386 7.00012 1.5V13.5C7.00012 13.7761 7.22398 14 7.50012 14C7.77626 14 8.00012 13.7761 8.00012 13.5V1.5ZM3.31812 5.818C3.49386 5.64227 3.49386 5.35734 3.31812 5.18161C3.14239 5.00587 2.85746 5.00587 2.68173 5.18161L0.681729 7.18161C0.505993 7.35734 0.505993 7.64227 0.681729 7.818L2.68173 9.818C2.85746 9.99374 3.14239 9.99374 3.31812 9.818C3.49386 9.64227 3.49386 9.35734 3.31812 9.18161L2.08632 7.9498H5.50017C5.7487 7.9498 5.95017 7.74833 5.95017 7.4998C5.95017 7.25128 5.7487 7.0498 5.50017 7.0498H2.08632L3.31812 5.818ZM12.3181 5.18161C12.1424 5.00587 11.8575 5.00587 11.6817 5.18161C11.506 5.35734 11.506 5.64227 11.6817 5.818L12.9135 7.0498H9.50017C9.25164 7.0498 9.05017 7.25128 9.05017 7.4998C9.05017 7.74833 9.25164 7.9498 9.50017 7.9498H12.9135L11.6817 9.18161C11.506 9.35734 11.506 9.64227 11.6817 9.818C11.8575 9.99374 12.1424 9.99374 12.3181 9.818L14.3181 7.818C14.4939 7.64227 14.4939 7.35734 14.3181 7.18161L12.3181 5.18161Z";
const dragCursorSvg = `<svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${dragCursorPath}" fill="black" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`;
const dragCursorDarkSvg = `<svg width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${dragCursorPath}" fill="white" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`;
const dragCursorUrl = `url("data:image/svg+xml,${encodeURIComponent(dragCursorSvg)}") 12 12, ew-resize`;
const dragCursorDarkUrl = `url("data:image/svg+xml,${encodeURIComponent(dragCursorDarkSvg)}") 12 12, ew-resize`;

const cursorCriticalCss = `
:root {
  --portfolio-cursor: ${triangleCursorUrl};
  --portfolio-contrast-cursor: ${cursorUrl(cursorPng.contrast)};
  --portfolio-drag-cursor: ${dragCursorUrl};
}

:root.dark {
  --portfolio-cursor: ${triangleCursorUrl};
  --portfolio-drag-cursor: ${dragCursorDarkUrl};
}

:root.system-theme {
  --portfolio-drag-cursor: ${dragCursorDarkUrl};
}

html,
body,
body *,
body *::before,
body *::after {
  cursor: var(--portfolio-cursor) !important;
}

body [data-cursor-contrast],
body [data-cursor-contrast] * {
  cursor: var(--portfolio-contrast-cursor) !important;
}

body :where(
  a[href],
  button:not(:disabled),
  summary,
  select:not(:disabled),
  label[for],
  input[type="button"]:not(:disabled),
  input[type="submit"]:not(:disabled),
  input[type="reset"]:not(:disabled),
  input[type="checkbox"]:not(:disabled),
  input[type="radio"]:not(:disabled),
  input[type="file"]:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  [role="link"]:not([aria-disabled="true"]),
  [role="menuitem"]:not([aria-disabled="true"]),
  [role="option"]:not([aria-disabled="true"]),
  [role="tab"]:not([aria-disabled="true"]),
  [role="switch"]:not([aria-disabled="true"]),
  [role="checkbox"]:not([aria-disabled="true"]),
  [role="radio"]:not([aria-disabled="true"]),
  [data-clickable]
),
body :where(
  a[href],
  button:not(:disabled),
  summary,
  select:not(:disabled),
  label[for],
  [role="button"]:not([aria-disabled="true"]),
  [role="link"]:not([aria-disabled="true"]),
  [role="menuitem"]:not([aria-disabled="true"]),
  [role="option"]:not([aria-disabled="true"]),
  [role="tab"]:not([aria-disabled="true"]),
  [role="switch"]:not([aria-disabled="true"]),
  [role="checkbox"]:not([aria-disabled="true"]),
  [role="radio"]:not([aria-disabled="true"]),
  [data-clickable]
) * {
  cursor: pointer !important;
}

body :where(
  input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]),
  textarea,
  [contenteditable="true"],
  [role="textbox"]
) {
  cursor: text !important;
}

body :where(:disabled, [aria-disabled="true"]),
body :where(:disabled, [aria-disabled="true"]) * {
  cursor: not-allowed !important;
}

body [data-cursor-help],
body [data-cursor-help] * {
  cursor: help !important;
}

body [data-cursor-drag],
body [data-cursor-drag] * {
  cursor: var(--portfolio-drag-cursor) !important;
}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <style
          id="portfolio-cursor"
          dangerouslySetInnerHTML={{ __html: cursorCriticalCss }}
        />
        <JsonLd />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteConfig.name} RSS Feed`}
          href="/feed.xml"
        />
      </head>
      <body
        className="min-h-screen bg-[#fafafa] font-sans text-zinc-950 antialiased dark:bg-[#18181c] dark:text-zinc-400"
        suppressHydrationWarning
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        {process.env.NEXT_PUBLIC_ANALYTICS_SRC ? (
          <Script
            id="analytics-script"
            {...(process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID
              ? { "data-site-id": process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID }
              : {})}
            src={process.env.NEXT_PUBLIC_ANALYTICS_SRC}
            strategy="afterInteractive"
          />
        ) : null}
        <ConvexClientProvider>
          <PageTransition>{children}</PageTransition>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
