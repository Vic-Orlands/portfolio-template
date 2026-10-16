"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { NotFoundBot } from "@/components/NotFoundBot";
import { useTheme } from "@/components/portfolio/useTheme";
import { siteConfig } from "@/lib/site";

type WorkType = "fulltime" | "contractor" | "writing" | "others";

const EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const FOUR_OH_FOUR_GALLERY = "https://www.404s.design/";

const typeLabels: Record<WorkType, string> = {
  fulltime: "Full time Role",
  contractor: "Contractor",
  writing: "Technical writing",
  others: "Others",
};

const typeBodies: Record<WorkType, string> = {
  fulltime:
    "I build web and mobile products, AI workflows, and clear interfaces. I'm open to full-time roles — remote or hybrid.",
  contractor:
    "I help teams ship web/mobile apps, AI tooling, and polished UI. Available for contract or gig work, remote or hybrid.",
  writing:
    "I write about software, AI, and product craft — docs, essays, and technical explainers. Open to writing retainers or projects.",
  others:
    "I work across software, AI engineering, design engineering, and writing. Open to full-time, contract, gig, remote, or hybrid.",
};

function buildLetter(name: string, type: WorkType, message: string): string {
  const note = message.trim();
  return `Hi ${name},

${typeBodies[type]}
${note ? `\n${note}\n` : ""}
Thank you for your time — happy to chat if there's a fit.

Best regards,
${siteConfig.author.name}`;
}

function ActionArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function NotFound() {
  const { theme, toggleTheme } = useTheme();
  const [type, setType] = useState<WorkType>("fulltime");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [copied404, setCopied404] = useState(false);
  const [sendHint, setSendHint] = useState<string | null>(null);

  const letter = useMemo(() => {
    const recipient = name.trim() || "[Your Name]";
    return buildLetter(recipient, type, message);
  }, [type, name, message]);

  const paragraphs = useMemo(
    () => letter.split("\n\n").filter(Boolean),
    [letter],
  );

  const handleCopy404Link = async () => {
    try {
      await navigator.clipboard.writeText(FOUR_OH_FOUR_GALLERY);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = FOUR_OH_FOUR_GALLERY;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied404(true);
    window.setTimeout(() => setCopied404(false), 1600);
  };

  const handleSend = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) {
      setSendHint("Add your name and email first.");
      window.setTimeout(() => setSendHint(null), 2200);
      return;
    }

    setSendHint("Sending…");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: `Portfolio inquiry — ${typeLabels[type]} from ${trimmedName}`,
          message: [
            message.trim() || "(No additional message)",
            "",
            "—",
            "",
            letter,
          ].join("\n"),
          type: typeLabels[type],
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to send.");
      }

      setSendHint("Sent.");
      setName("");
      setEmail("");
      setMessage("");
      window.setTimeout(() => setSendHint(null), 2200);
    } catch (err) {
      setSendHint(err instanceof Error ? err.message : "Failed to send.");
      window.setTimeout(() => setSendHint(null), 2800);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#fafafa] text-zinc-950 antialiased [text-wrap-style:pretty] dark:bg-[#18181c] dark:text-[#eaeaea]">
      <div className="flex items-center justify-between pt-7 pb-5 px-[clamp(24px,4vw,56px)]">
        <h1 className="m-0 text-[clamp(22px,2.2vw,24px)] font-medium tracking-[-0.02em] leading-none text-zinc-950 dark:text-[#eaeaea]">
          {siteConfig.name}
        </h1>

        <nav className="flex w-1/2 items-center justify-between max-[860px]:w-auto max-[860px]:gap-6">
          <div className="flex items-center gap-[clamp(10px,2.4vw,15px)]">
            <Link
              href="/"
              className="text-[12px] font-normal tracking-[0.01em] text-zinc-500 no-underline transition-colors duration-200 hover:text-zinc-950 dark:text-[#8c8c8c] dark:hover:text-[#eaeaea]"
              style={{ transitionTimingFunction: EASE }}
            >
              Home
            </Link>
            <Link
              href="/writings"
              transitionTypes={["nav-forward"]}
              className="text-[12px] font-normal tracking-[0.01em] text-zinc-500 no-underline transition-colors duration-200 hover:text-zinc-950 dark:text-[#8c8c8c] dark:hover:text-[#eaeaea]"
              style={{ transitionTimingFunction: EASE }}
            >
              Writing
            </Link>
            <Link
              href="/#section-projects"
              className="text-[12px] font-normal tracking-[0.01em] text-zinc-500 no-underline transition-colors duration-200 hover:text-zinc-950 dark:text-[#8c8c8c] dark:hover:text-[#eaeaea]"
              style={{ transitionTimingFunction: EASE }}
            >
              Projects
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-zinc-500 transition-colors duration-200 hover:bg-zinc-950/5 hover:text-zinc-950 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#ff2f6e] dark:text-[#8c8c8c] dark:hover:bg-white/5 dark:hover:text-[#eaeaea]"
              style={{ transitionTimingFunction: EASE }}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <Link
            href="/#contact"
            className="text-[12px] font-normal tracking-[0.01em] text-[#ff2f6e] no-underline transition-colors duration-200"
            style={{ transitionTimingFunction: EASE }}
          >
            Contact
          </Link>
        </nav>
      </div>

      <div className="px-[clamp(24px,4vw,56px)] pt-2 pb-[100px]">
        <div className="mb-5 ml-auto flex w-1/2 justify-end max-[860px]:mb-4 max-[860px]:w-full max-[860px]:justify-start">
          <p className="m-0 w-full text-[clamp(12.5px,2vw,24px)] font-normal leading-normal text-zinc-700 dark:text-[#d9d9d9] max-[860px]:mt-4">
            Software and AI engineer — and sometimes a design engineer —
            building web and mobile products, writing about the craft, and
            exploring LLMs, context engineering, and agentic workflows.
          </p>
        </div>

        <div className="ml-auto w-[70%] max-[860px]:w-full">
          <div className="grid grid-cols-[28%_72%] items-center border-t border-zinc-950/10 py-[15px] dark:border-white/5.5 max-[860px]:grid-cols-1 max-[860px]:gap-1.5">
            <div className="text-[12px] font-normal text-zinc-500 dark:text-[#8c8c8c]">
              Type
            </div>
            <div className="flex justify-start max-[860px]:mt-2">
              <div className="flex gap-[clamp(18px,2.6vw,34px)] max-[860px]:flex-wrap">
                {(
                  [
                    ["fulltime", "Full time Role"],
                    ["contractor", "Contractor"],
                    ["writing", "Technical writing"],
                    ["others", "Others"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="group flex cursor-pointer select-none items-center gap-2 text-[12px] text-zinc-700 dark:text-[#c9c9c9]"
                  >
                    <input
                      type="radio"
                      name="work-type"
                      value={value}
                      checked={type === value}
                      onChange={() => setType(value)}
                      className="peer absolute h-0 w-0 opacity-0"
                    />
                    <span
                      className="relative flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[rgba(255,47,110,0.35)] transition-[border-color,transform] duration-200 peer-checked:scale-[1.04] peer-checked:border-[#ff2f6e] group-hover:border-[#ff2f6e] after:block after:h-[7px] after:w-[7px] after:scale-0 after:rounded-full after:bg-[#ff2f6e] after:content-[''] after:transition-transform after:duration-220 peer-checked:after:scale-100"
                      style={{ transitionTimingFunction: EASE }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[28%_72%] items-center border-t border-zinc-950/10 py-[12px] dark:border-white/5.5 max-[860px]:grid-cols-1 max-[860px]:gap-1.5">
            <div className="text-[12px] font-normal text-zinc-500 dark:text-[#8c8c8c]">
              Name
            </div>
            <div className="flex justify-start max-[860px]:mt-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border-none bg-transparent font-[inherit] text-[12.5px] text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-[#eaeaea] dark:placeholder:text-[#4a4a4a] max-[860px]:text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-[28%_72%] items-center border-t border-zinc-950/10 py-[12px] dark:border-white/5.5 max-[860px]:grid-cols-1 max-[860px]:gap-1.5">
            <div className="text-[12px] font-normal text-zinc-500 dark:text-[#8c8c8c]">
              Email
            </div>
            <div className="flex justify-start max-[860px]:mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full border-none bg-transparent font-[inherit] text-[12.5px] text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-[#eaeaea] dark:placeholder:text-[#4a4a4a] max-[860px]:text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-[28%_72%] items-start border-t border-b border-zinc-950/10 py-[15px] dark:border-white/5.5 max-[860px]:grid-cols-1 max-[860px]:gap-1.5">
            <div className="pt-0.5 text-[12px] font-normal text-zinc-500 dark:text-[#8c8c8c]">
              Message
            </div>
            <div className="flex w-full flex-col gap-3 max-[860px]:mt-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional note"
                rows={2}
                className="w-full resize-none border-none bg-transparent font-[inherit] text-[12.5px] text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-[#eaeaea] dark:placeholder:text-[#4a4a4a] max-[860px]:text-left"
              />
              <div className="flex items-center justify-end gap-3">
                {sendHint && (
                  <span className="text-[11px] font-mono text-[#ff2f6e]">
                    {sendHint}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  className="cursor-pointer appearance-none border border-zinc-950/15 bg-transparent px-3 py-1.5 text-[12px] font-medium text-zinc-950 transition-colors duration-200 hover:border-[#ff2f6e] hover:text-[#ff2f6e] dark:border-white/15 dark:text-[#eaeaea] dark:hover:border-[#ff2f6e] dark:hover:text-[#ff2f6e]"
                  style={{ transitionTimingFunction: EASE }}
                >
                  Send message
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 pt-5 max-[860px]:grid-cols-1 max-[860px]:gap-1.5">
          <div className="max-[860px]:hidden">
            <NotFoundBot />
          </div>
          <div className="rounded-[2px] border border-zinc-950/10 p-[clamp(28px,3vw,40px)] dark:border-white/5.5 max-[860px]:col-span-full">
            <h2 className="m-0 mb-4 text-[clamp(4.5rem,14vw,9rem)] font-medium leading-none tracking-[-0.06em] text-zinc-950 dark:text-[#eaeaea]">
              404
            </h2>
            <p className="m-0 mb-6 text-[clamp(13px,1.2vw,16px)] font-normal leading-relaxed text-zinc-700 dark:text-[#d9d9d9]">
              Whatever you were looking for... This ain&apos;t it!
            </p>
            <p className="m-0 mb-8 whitespace-pre-line text-[12px] font-normal uppercase leading-[1.75] tracking-[0.04em] text-zinc-600 dark:text-[#dcdcdc]">
              {`SOMETHING SEEMS TO HAVE GONE WRONG!
                THE PAGE YOU ARE REQUESTING DOES NOT
                EXIST. IT MAY HAVE BEEN OUTDATED, DELETED,
                OR AN INCORRECT ADDRESS WAS ENTERED IN
                THE ADDRESS BAR.`}
            </p>
            <div className="border-t border-zinc-950/10 pt-6 dark:border-white/5.5">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className="mb-4 whitespace-pre-wrap text-[12px] leading-[1.65] text-zinc-600 dark:text-[#dcdcdc] last:mb-0"
                >
                  {p.split("\n").map((line, j, arr) => (
                    <span key={j}>
                      {line}
                      {j < arr.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="ml-auto mt-5 w-1/2 max-[860px]:w-full">
          <button
            type="button"
            onClick={() => void handleCopy404Link()}
            className="group flex w-full cursor-pointer appearance-none items-center justify-between border-0 border-b border-zinc-950/10 bg-transparent p-0 pb-1.5 pt-5 font-[inherit] text-inherit focus-visible:outline focus-visible:outline-offset-[6px] focus-visible:outline-[#ff2f6e] dark:border-white/5.5"
          >
            <span
              className="text-[clamp(13px,1.1vw,16px)] font-normal text-zinc-950 transition-colors duration-200 group-hover:text-[#ff2f6e] dark:text-[#eaeaea]"
              style={{ transitionTimingFunction: EASE }}
            >
              See 404 inspirations
            </span>
            <span className="flex items-center">
              <span
                className={`ml-2.5 text-[11px] text-[#ff2f6e] transition-opacity duration-250 ${
                  copied404 ? "opacity-100" : "opacity-0"
                }`}
                style={{ transitionTimingFunction: EASE }}
              >
                Copied
              </span>
              <ActionArrow className="h-[14px] w-[14px] text-zinc-950 transition-[transform,color] duration-320 group-hover:translate-x-1.5 group-hover:text-[#ff2f6e] group-active:translate-x-2.5 group-active:scale-[0.92] dark:text-[#eaeaea]" />
            </span>
          </button>

          <Link
            href="/inspirations"
            transitionTypes={["nav-forward"]}
            className="group flex w-full items-center justify-between border-0 border-b border-zinc-950/10 p-0 pb-1.5 pt-5 no-underline focus-visible:outline focus-visible:outline-offset-[6px] focus-visible:outline-[#ff2f6e] dark:border-white/5.5"
          >
            <span
              className="text-[clamp(13px,1.1vw,16px)] font-normal text-zinc-950 transition-colors duration-200 group-hover:text-[#ff2f6e] dark:text-[#eaeaea]"
              style={{ transitionTimingFunction: EASE }}
            >
              See my work Inspirations
            </span>
            <ActionArrow className="h-[14px] w-[14px] text-zinc-950 transition-[transform,color] duration-320 group-hover:translate-x-1.5 group-hover:text-[#ff2f6e] group-active:translate-x-2.5 group-active:scale-[0.92] dark:text-[#eaeaea]" />
          </Link>

          <Link
            href="/"
            className="group flex w-full items-center justify-between border-0 border-b border-zinc-950/10 p-0 pb-1.5 pt-5 no-underline focus-visible:outline focus-visible:outline-offset-[6px] focus-visible:outline-[#ff2f6e] dark:border-white/5.5"
          >
            <span
              className="text-[clamp(13px,1.1vw,16px)] font-normal text-zinc-950 transition-colors duration-200 group-hover:text-[#ff2f6e] dark:text-[#eaeaea]"
              style={{ transitionTimingFunction: EASE }}
            >
              Back to home
            </span>
            <ActionArrow className="h-[14px] w-[14px] text-zinc-950 transition-[transform,color] duration-320 group-hover:translate-x-1.5 group-hover:text-[#ff2f6e] group-active:translate-x-2.5 group-active:scale-[0.92] dark:text-[#eaeaea]" />
          </Link>
        </div>
      </div>
    </main>
  );
}
