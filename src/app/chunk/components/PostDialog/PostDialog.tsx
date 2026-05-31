import clsx from "clsx";
import { useEffect, useState } from "react";
import type { TPlurkItem } from "@/types/plurks";
import { PLURK_URL_REGEX } from "@/types/constants";
import { clearAuthed } from "@/app/chunk/utils/plurkAuth";
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

  useEffect(() => {
    if (!open) return;
    setError("");
    const fetchPlurks = async () => {
      setIsFetching(true);
      try {
        const r = await fetch("/api/getMyPlurks");
        if (!r.ok) {
          const data = await r.json();
          setError(data.data || "取得噗文清單失敗");
          return;
        }
        const data = await r.json();
        setPlurks(data.data ?? []);
      } catch {
        clearAuthed();
        setError("取得噗文清單失敗，請重新授權");
      } finally {
        setIsFetching(false);
      }
    };
    fetchPlurks();
  }, [open]);

  const targetPlurkId = selectedId || extractPlurkId(urlInput);
  const handleClose = () => onClose();

  const handleConfirm = async () => {
    if (openIndex === null || !targetPlurkId || isSending) return;
    const toSend = sendAll ? splitTexts : [splitTexts[openIndex]];
    setIsSending(true);
    setError("");
    try {
      for (const content of toSend) {
        const res = await fetch("/api/postResponse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plurk_id: targetPlurkId, content }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.data || "留言發送失敗");
        }
      }
      const sentIndices = sendAll ? splitTexts.map((_, i) => i) : [openIndex];
      onSendSuccess(sentIndices);
      handleClose();
    } catch (e) {
      clearAuthed();
      setError(e instanceof Error ? e.message : "留言發送失敗，請重新授權");
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
            一次發送所有分段（共 {splitTexts.length} 則）
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
              onClick={handleConfirm}
            >
              確認發送
            </button>
          </div>
        </>
      )}
    </div>
  );
}
