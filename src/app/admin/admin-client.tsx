"use client";

import { lazy, Suspense } from "react";

const AdminApp = lazy(() =>
  import("@/components/admin/AdminApp").then((module) => ({
    default: module.AdminApp,
  })),
);

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#18181c] font-mono text-sm text-zinc-400">
      Loading admin…
    </div>
  );
}

export function AdminClient() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminApp />
    </Suspense>
  );
}
