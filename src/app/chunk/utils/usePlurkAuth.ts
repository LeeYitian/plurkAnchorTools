import { useCallback, useEffect, useState } from "react";
import { CHUNKS_SESSION_KEY, DEVICE_ID_KEY } from "@/types/constants";

function checkAuthed(): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith("plurk_authed="));
}

function getOrCreateDeviceId(): string {
  const stored = localStorage.getItem(DEVICE_ID_KEY);
  if (stored) return stored;
  const id = crypto.randomUUID().replace(/-/g, "");
  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

export function usePlurkAuth(splitTexts: string[]) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(checkAuthed());
  }, []);

  const handleSend = useCallback(() => {
    if (!splitTexts.length) return;
    if (!authed) {
      sessionStorage.setItem(CHUNKS_SESSION_KEY, JSON.stringify(splitTexts));
      const deviceId = getOrCreateDeviceId();
      window.location.href = `/api/auth/requestToken?deviceid=${deviceId}`; //OAuth 必須讓瀏覽器直接導航
    } else {
      // Step 3: open PostDialog will be wired here
    }
  }, [authed, splitTexts]);

  return { authed, handleSend };
}
