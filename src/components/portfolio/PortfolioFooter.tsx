import { siteConfig } from "@/lib/site";

export function PortfolioFooter() {
  return (
    <footer
      className="mt-auto pt-12 text-center font-sans text-xs text-zinc-500/80"
      id="portfolio-footer"
    >
      <h6 className="hover:text-black dark:hover:text-zinc-400 transition-colors">
        © {new Date().getFullYear()} {siteConfig.name}
      </h6>
    </footer>
  );
}
