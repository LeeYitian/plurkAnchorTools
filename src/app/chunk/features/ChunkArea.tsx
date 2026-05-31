"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import SplitResult from "@/app/chunk/components/SplitResult/SplitResult";
import TextArea from "@/app/chunk/components/TextArea";
import PostDialog from "@/app/chunk/components/PostDialog/PostDialog";
import { splitTextUtils } from "@/app/chunk/utils/splitText";
import { checkAuthed, getOrCreateDeviceId } from "@/app/chunk/utils/plurkAuth";
import { CHUNKS_SESSION_KEY } from "@/types/constants";

export default function ChunkArea() {
  const [originalText, setOriginalText] = useState("");
  const [postDialogOpen, setPostDialogOpen] = useState(false);

  // OAuth 跳轉回來後，還原原始文字、更新 textarea 顯示、開啟 PostDialog
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (checkAuthed() && params.get("from_oauth") === "1") {
      window.history.replaceState(null, "", window.location.pathname); //確認來自 OAuth 導轉後移除網址中的 params
      const stored = sessionStorage.getItem(CHUNKS_SESSION_KEY);
      if (stored) {
        setOriginalText(stored);
        setPostDialogOpen(true);
        sessionStorage.removeItem(CHUNKS_SESSION_KEY);
      }
    }
  }, []);

  const clearTexts = () => setOriginalText("");
  const setTexts = (value: string) => setOriginalText(value);

  const splitTexts = useMemo(() => {
    return splitTextUtils.countAndSplit(originalText);
  }, [originalText]);

  const openPostDialog = () => setPostDialogOpen(true);

  // 授權前把原始文字（非分段結果）存入 sessionStorage，確保跳轉回來可以精確還原
  const handleConfirmOAuth = useCallback(() => {
    sessionStorage.setItem(CHUNKS_SESSION_KEY, originalText);
    const deviceId = getOrCreateDeviceId();
    window.location.href = `/api/auth/requestToken?deviceid=${deviceId}`;
  }, [originalText]);

  return (
    <>
      <TextArea
        clearTexts={clearTexts}
        setText={setTexts}
        restoredValue={originalText}
      />
      <SplitResult
        splitTexts={splitTexts}
        onOpenPostDialog={openPostDialog}
        onConfirmOAuth={handleConfirmOAuth}
      />
      <PostDialog
        open={postDialogOpen}
        onOpenChange={setPostDialogOpen}
        splitTexts={splitTexts}
      />
    </>
  );
}
