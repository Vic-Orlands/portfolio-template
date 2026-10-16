export default function Circled({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline border border-zinc-800/50 dark:border-zinc-100/50 px-1.5 py-0.5 mx-0.5 text-zinc-800 dark:text-zinc-100 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
      style={{ borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px" }}
    >
      {children}
    </span>
  );
}
