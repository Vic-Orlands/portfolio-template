const avatarTone: Record<string, string> = {
  ai: "bg-zinc-900 text-white",
  dark: "bg-zinc-900 text-white",
  gray: "bg-zinc-400 text-white",
  blue: "bg-[#2861ff] text-white",
  gradient:
    "bg-[linear-gradient(135deg,#68def4,#c7f0ff_45%,#8d78f6)] text-white",
  silver: "bg-[radial-gradient(circle_at_30%_25%,#f8f8f8,#888)] text-zinc-800",
  photo:
    "bg-[conic-gradient(#a5d3b6,#e59d80,#7087c1,#b5cf7d,#a5d3b6)] text-white",
  person:
    "bg-[linear-gradient(140deg,#6f3f25,#e7c1a7_45%,#1d1d1d_48%)] text-white",
};

export function InspirationSkillAvatar({ kind }: { kind: string }) {
  const tone = avatarTone[kind] ?? avatarTone.person;
  const label = kind === "ai" ? "AI" : kind === "gray" ? "RS" : "";

  return (
    <span
      className={`grid size-8 shrink-0 place-items-center overflow-hidden rounded-full text-[10px] font-bold ${tone}`}
      aria-hidden
    >
      {label}
    </span>
  );
}
