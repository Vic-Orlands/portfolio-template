import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { AdminClient } from "@/app/admin/admin-client";
import { isAdminEnabled } from "@/lib/env";

export default function AdminPage() {
  if (!isAdminEnabled()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#18181c] px-6 text-zinc-300">
        <div className="max-w-md space-y-3 text-sm">
          <h1 className="text-lg font-semibold text-zinc-50">
            Admin is optional
          </h1>
          <p className="font-mono text-xs leading-relaxed text-zinc-400">
            The CMS ships with the Convex adapter and is off until you opt in.
            Set <code className="text-amber-400">CONTENT_SOURCE=convex</code>,{" "}
            <code className="text-amber-400">NEXT_PUBLIC_CONVEX_URL</code>, and{" "}
            <code className="text-amber-400">ADMIN_ENABLED=true</code>. Then set
            the Convex environment variable{" "}
            <code className="text-amber-400">ADMIN_PASSWORD</code> to a password
            you choose. Local Markdown mode does not use this screen.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1 font-mono text-xs text-amber-400 underline"
          >
            <ChevronLeftIcon className="size-3" />
            Back to site
          </a>
        </div>
      </div>
    );
  }

  return <AdminClient />;
}
