import { DEVICE_ID_KEY } from "@/types/constants";

export function checkAuthed(): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith("plurk_authed="));
}

export function clearAuthed(): void {
  document.cookie = "plurk_authed=; Max-Age=0; path=/";
}

export function getOrCreateDeviceId(): string {
  const stored = localStorage.getItem(DEVICE_ID_KEY);
  if (stored) return stored;
  const id = crypto.randomUUID().replace(/-/g, "");
  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}
