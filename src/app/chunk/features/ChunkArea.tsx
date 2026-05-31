"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import SplitResult from "@/app/chunk/components/SplitResult/SplitResult";
import TextArea from "@/app/chunk/components/TextArea";
import { splitTextUtils } from "@/app/chunk/utils/splitText";
import { getOrCreateDeviceId } from "@/app/chunk/utils/plurkAuth";
import { CHUNKS_SESSION_KEY } from "@/types/constants";

export default function ChunkArea() {
  const [originalText, setOriginalText] = useState("");
  const [oauthError, setOauthError] = useState<string | null>(null);

  // OAuth popup 完成或失敗後，收到 popup 的通知
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "OAUTH_COMPLETE") {
        const stored = sessionStorage.getItem(CHUNKS_SESSION_KEY);
        if (stored) {
          setOriginalText(stored);
          sessionStorage.removeItem(CHUNKS_SESSION_KEY);
        }
      }

      if (event.data?.type === "OAUTH_ERROR") {
        setOauthError(event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const splitTexts = useMemo(() => {
    return splitTextUtils.countAndSplit(originalText);
  }, [originalText]);

  // 授權前把原始文字存入 sessionStorage，並開 popup 跑 OAuth 流程
  const handleConfirmOAuth = useCallback(() => {
    sessionStorage.setItem(CHUNKS_SESSION_KEY, originalText);
    const deviceId = getOrCreateDeviceId();
    window.open(
      `/api/auth/requestToken?deviceid=${deviceId}`,
      "plurk_oauth",
      "width=500,height=700,left=200,top=100",
    );
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
        oauthError={oauthError}
        onClearOAuthError={() => setOauthError(null)}
      />
    </>
  );
}
