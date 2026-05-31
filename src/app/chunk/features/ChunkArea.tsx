"use client";
import { useCallback, useMemo, useState } from "react";
import SplitResult from "@/app/chunk/components/SplitResult/SplitResult";
import TextArea from "@/app/chunk/components/TextArea";
import { splitTextUtils } from "@/app/chunk/utils/splitText";
import { getOrCreateDeviceId } from "@/app/chunk/utils/plurkAuth";

export default function ChunkArea() {
  const [originalText, setOriginalText] = useState("");

  const splitTexts = useMemo(() => {
    return splitTextUtils.countAndSplit(originalText);
  }, [originalText]);

  // 主視窗全程不跳轉，OAuth 在 popup 裡進行，完成後 popup 關閉即可。
  // 不需要 postMessage listener，也不需要 sessionStorage 還原文字。
  const handleConfirmOAuth = useCallback(() => {
    const deviceId = getOrCreateDeviceId();
    window.open(
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
