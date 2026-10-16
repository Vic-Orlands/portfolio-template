"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

type PageTransitionProps = {
  children: React.ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  if (pathname === "/scribbles") return children;

  return <ViewTransition default="page-fade">{children}</ViewTransition>;
}
