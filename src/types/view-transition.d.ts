import type { ReactNode } from "react";

declare module "react" {
  // Next.js experimental.viewTransition exposes React's ViewTransition API.
  export function ViewTransition(props: {
    children?: ReactNode;
    name?: string;
    default?: string;
    enter?: string | Record<string, string>;
    exit?: string | Record<string, string>;
    share?: string | Record<string, string>;
    update?: string | Record<string, string>;
  }): ReactNode;
}
