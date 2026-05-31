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
  const [openPostDialogIndex, setOpenPostDialogIndex] = useState<number | null>(null);
  const [postedIndex, setPostedIndex] = useState<number[]>([]);

  // OAuth 跳轉回來後，還原原始文字、更新 textarea 顯示、開啟 PostDialog
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (checkAuthed() && params.get("from_oauth") === "1") {
      window.history.replaceState(null, "", window.location.pathname); //確認來自 OAuth 導轉後移除網址中的 params
      const stored = sessionStorage.getItem(CHUNKS_SESSION_KEY);
      if (stored) {
        const { text, index } = JSON.parse(stored) as { text: string; index: number };
        setOriginalText(text);
        setOpenPostDialogIndex(index);
        sessionStorage.removeItem(CHUNKS_SESSION_KEY);
      }
    }
  }, []);

  const clearTexts = () => setOriginalText("");
  const setTexts = (value: string) => setOriginalText(value);

  const splitTexts = useMemo(() => {
    return splitTextUtils.countAndSplit(originalText);
  }, [originalText]);

  // splitTexts 變動時重置已發送狀態
  useEffect(() => {
    setPostedIndex([]);
  }, [splitTexts]);

  const openPostDialog = (index: number) => setOpenPostDialogIndex(index);

  const handleSendSuccess = useCallback((indices: number[]) => {
    setPostedIndex((prev) => [...new Set([...prev, ...indices])]);
  }, []);

  // 授權前把原始文字（非分段結果）存入 sessionStorage，確保跳轉回來可以精確還原
  const handleConfirmOAuth = useCallback((index: number) => {
    sessionStorage.setItem(CHUNKS_SESSION_KEY, JSON.stringify({ text: originalText, index }));
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
        postedIndex={postedIndex}
        onOpenPostDialog={openPostDialog}
        onConfirmOAuth={handleConfirmOAuth}
      />
      <PostDialog
        openIndex={openPostDialogIndex}
        onClose={() => setOpenPostDialogIndex(null)}
        splitTexts={splitTexts}
        onSendSuccess={handleSendSuccess}
      />
    </>
  );
}
