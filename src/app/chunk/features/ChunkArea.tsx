"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import SplitResult from "@/app/chunk/components/SplitResult/SplitResult";
import TextArea from "@/app/chunk/components/TextArea";
import { splitTextUtils } from "@/app/chunk/utils/splitText";
import { checkAuthed, getOrCreateDeviceId } from "@/app/chunk/utils/plurkAuth";
import { CHUNKS_SESSION_KEY } from "@/types/constants";

export default function ChunkArea() {
  const [originalText, setOriginalText] = useState("");

  // OAuth 跳轉回來後，還原原始文字，splitTexts 會自動重新計算
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (checkAuthed() && params.get("from_oauth") === "1") {
      window.history.replaceState(null, "", window.location.pathname);//確認來自 OAuth 導轉後移除網址中的 params
      const stored = sessionStorage.getItem(CHUNKS_SESSION_KEY);
      if (stored) {
        setOriginalText(stored);
        sessionStorage.removeItem(CHUNKS_SESSION_KEY);
      }
    }
  }, []);

  const splitTexts = useMemo(() => {
    return splitTextUtils.countAndSplit(originalText);
  }, [originalText]);

  // 授權前把原始文字存入 sessionStorage，確保跳轉回來可以精確還原
  const handleConfirmOAuth = useCallback(() => {
    sessionStorage.setItem(CHUNKS_SESSION_KEY, originalText);
    const deviceId = getOrCreateDeviceId();
    window.location.href = `/api/auth/requestToken?deviceid=${deviceId}`;
  }, [originalText]);

  return (
    <>
      <TextArea
        clearTexts={() => setOriginalText("")}
        setText={setOriginalText}
        restoredValue={originalText}
      />
      <SplitResult
        splitTexts={splitTexts}
        onConfirmOAuth={handleConfirmOAuth}
      />
    </>
  );
}
