"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SplitResult from "@/app/chunk/components/SplitResult/SplitResult";
import TextArea from "@/app/chunk/components/TextArea";
import { splitTextUtils } from "@/app/chunk/utils/splitText";
import { getOrCreateDeviceId } from "@/app/chunk/utils/plurkAuth";

export default function ChunkArea() {
  const [originalText, setOriginalText] = useState("");
  const popupRef = useRef<Window | null>(null);

  // 收到 popup 的授權完成通知後，由父視窗關閉 popup。
  // 父視窗持有 window.open() 的 reference，close() 不受 cross-origin 跳轉的限制。
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "OAUTH_COMPLETE") {
        popupRef.current?.close();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const splitTexts = useMemo(() => {
    return splitTextUtils.countAndSplit(originalText);
  }, [originalText]);

  const handleConfirmOAuth = useCallback(() => {
    const deviceId = getOrCreateDeviceId();
    popupRef.current = window.open(
      `/api/auth/requestToken?deviceid=${deviceId}`,
      "plurk_oauth",
      "width=500,height=700,left=200,top=100",
    );
  }, []);

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
