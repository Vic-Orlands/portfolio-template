const STORAGE_KEY = "portfolio-admin-session";

export function getAdminSessionToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminSessionToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearAdminSessionToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
