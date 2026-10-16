import { flushSync } from "react-dom";

type ViewTransitionResult = {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    update: () => void | Promise<void>,
  ) => ViewTransitionResult;
};

/** Run a DOM update inside the View Transitions API when available. */
export function runViewTransition(
  update: () => void,
  options?: { documentClass?: string },
): void {
  if (typeof document === "undefined") {
    update();
    return;
  }

  const doc = document as DocumentWithViewTransition;
  if (typeof doc.startViewTransition !== "function") {
    update();
    return;
  }

  const className = options?.documentClass;
  if (className) {
    document.documentElement.classList.add(className);
  }

  const transition = doc.startViewTransition(() => {
    flushSync(update);
  });

  if (!className) return;

  const cleanup = () => {
    document.documentElement.classList.remove(className);
  };
  void transition.finished.then(cleanup, cleanup);
}
