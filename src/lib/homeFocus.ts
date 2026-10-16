const OPEN_PROJECTS_EVENT = "portfolio:open-projects-modal";
const FOCUS_KEY = "portfolio-home-focus";

export type HomeFocus = "projects-modal";

export function requestHomeFocus(focus: HomeFocus) {
  try {
    sessionStorage.setItem(FOCUS_KEY, focus);
  } catch {
    // Ignore private-mode / blocked storage.
  }
}

export function consumeHomeFocus(): HomeFocus | null {
  try {
    const value = sessionStorage.getItem(FOCUS_KEY);
    sessionStorage.removeItem(FOCUS_KEY);
    if (value === "projects-modal") return "projects-modal";
  } catch {
    // Ignore private-mode / blocked storage.
  }
  return null;
}

/** Open All Projects modal when already on the homepage (no remount). */
export function openProjectsModalOnHome() {
  window.dispatchEvent(new Event(OPEN_PROJECTS_EVENT));
}

export function subscribeOpenProjectsModal(handler: () => void) {
  window.addEventListener(OPEN_PROJECTS_EVENT, handler);
  return () => window.removeEventListener(OPEN_PROJECTS_EVENT, handler);
}
