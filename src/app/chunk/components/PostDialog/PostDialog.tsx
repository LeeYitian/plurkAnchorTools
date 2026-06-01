import clsx from "clsx";
import { useEffect, useState } from "react";
import type { TPlurkItem } from "@/types/plurks";
import { PLURK_URL_REGEX } from "@/types/constants";

import "./PostDialog.scss";

type PostDialogProps = {
  openIndex: number | null;
  onClose: () => void;
  splitTexts: string[];
  onSendSuccess: (indices: number[]) => void;
};

function extractPlurkId(url: string) {
  const match = url.match(PLURK_URL_REGEX);
  if (!match) return null;
  return parseInt(match[1], 36).toString();
}

export default function PostDialog({
  openIndex,
  onClose,
  splitTexts,
  onSendSuccess,
}: PostDialogProps) {
  const open = openIndex !== null;
  const [plurks, setPlurks] = useState<TPlurkItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [sendAll, setSendAll] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const resetData = () => {
    setPlurks([]);
    setSelectedId("");
    setUrlInput("");
  };

  useEffect(() => {
    if (!open) return;
    setError("");
    resetData(); // 每次開啟都清空舊資料，避免授權被撤銷後仍能看到上次的 plurks
    const fetchPlurks = async () => {
      setIsFetching(true);
      try {
        const res = await fetch("/api/getMyPlurks");
        if (!res.ok) {
          const data = await res.json();
          // server 的 401 response 已帶 Set-Cookie 清除 plurk_authed，不需要 client 再清一次
          // 502：Plurk 服務故障，授權狀態可能仍有效
          setError(data.data);
          return;
        }
        const data = await res.json();
        setPlurks(data.data ?? []);
      } catch {
        // 純粹的網路錯誤，不清除授權狀態
        setError("網路連線失敗，請稍後再試");
      } finally {
        setIsFetching(false);
      }
    };
    fetchPlurks();
  }, [open]);

  const targetPlurkId = selectedId || extractPlurkId(urlInput);
  const handleClose = () => onClose();

  const handlePost = async () => {
    if (openIndex === null || !targetPlurkId || isSending) return;
    const toSend = sendAll ? splitTexts : [splitTexts[openIndex]];
    setIsSending(true);
    setError("");
    try {
      const res = await fetch("/api/postResponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plurk_id: targetPlurkId, contents: toSend }),
      });
      const data = await res.json();

      if (data.sentCount > 0) {
        const sentIndices = sendAll
          ? Array.from({ length: data.sentCount }, (_, i) => i)
          : [openIndex];
        onSendSuccess(sentIndices);
      }

      if (!res.ok) {
        // server 的 401 response 已帶 Set-Cookie 清除 plurk_authed，不需要 client 再清一次
        if (res.status === 401) resetData();
        setError(data.data);
        return;
      }

      handleClose();
    } catch {
      // 純粹的網路錯誤
      setError("網路連線失敗，請稍後再試");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={clsx(
        "postDialog",
        open ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      {isSending ? (
        <div className="flex h-full w-full items-center justify-center py-8">
          <div className="spinner" />
        </div>
      ) : (
        <>
          <p className="mb-4 text-base font-bold text-main">發送留言</p>
          {error && (
            <p className="mb-4 text-xs text-red-500">{`出現錯誤：${error}`}</p>
          )}
          <label className="mb-1 block text-sm text-gray-500">選擇安價噗</label>
          <select
            className="mb-4 w-full rounded-md border border-plain bg-plain/10 py-2 pl-2 pr-3 text-sm text-gray-500 disabled:opacity-50"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={isFetching || !!urlInput}
          >
            <option value="">
              {isFetching ? "載入中..." : "-- 選擇安價噗 --"}
            </option>
            {plurks.map((p) => (
              <option key={p.plurk_id} value={p.plurk_id.toString()}>
                {p.content_raw.length > 40
                  ? `${p.content_raw.slice(0, 25)}...`
                  : p.content_raw}
              </option>
            ))}
          </select>

          <label className="mb-1 block text-sm text-gray-500">
            或直接貼上噗浪網址
          </label>
          <input
            type="text"
            className="mb-4 w-full rounded-md border border-plain bg-plain/10 p-2 text-sm text-gray-500"
            placeholder="https://www.plurk.com/p/xxxxxxx"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (e.target.value) setSelectedId("");
            }}
          />

          <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={sendAll}
              onChange={(e) => setSendAll(e.target.checked)}
            />
            一次依序發送所有分段（共 {splitTexts.length} 則）
          </label>

          <div className="flex justify-end gap-2">
            <button
              className="rounded-md bg-gray-300 px-4 py-1.5 text-sm text-gray-500"
              onClick={handleClose}
            >
              取消
            </button>
            <button
              className="rounded-md bg-main px-4 py-1.5 text-sm text-white disabled:opacity-40"
              disabled={!targetPlurkId || isSending}
              onClick={handlePost}
            >
              確認發送
            </button>
          </div>
        </>
      )}
    </div>
  );
}
