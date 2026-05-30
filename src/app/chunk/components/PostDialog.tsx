import * as Dialog from "@radix-ui/react-dialog";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import type { TPlurkItem } from "@/types/plurks";
import { PLURK_URL_REGEX } from "@/types/constants";

type PostDialogProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  chunks: string[];
};

function extractPlurkId(url: string) {
  const match = url.match(PLURK_URL_REGEX);
  if (!match) return null;
  return parseInt(match[1], 36).toString();
}

export default function PostDialog({
  open,
  onOpenChange,
  chunks,
}: PostDialogProps) {
  const [plurks, setPlurks] = useState<TPlurkItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [sendAll, setSendAll] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchPlurks = async () => {
      setIsFetching(true);
      try {
        const r = await fetch("/api/getMyPlurks");
        const data = await r.json();
        setPlurks(data.data ?? []);
      } catch {
        // 忽略錯誤
      } finally {
        setIsFetching(false);
      }
    };
    fetchPlurks();
  }, [open]);

  const targetPlurkId = selectedId || extractPlurkId(urlInput);

  const handleConfirm = async () => {
    if (!targetPlurkId) return;
    // Step 4: posting logic will be wired here
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Title className="mb-4 text-base font-bold text-main">
            發送留言
          </Dialog.Title>
          <label className="mb-1 block text-sm text-gray-500">選擇安價噗</label>
          <select
            className="mb-4 w-full rounded-md border border-plain bg-plain/10 p-2 text-sm text-gray-800 disabled:opacity-50"
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
                  ? `${p.content_raw.slice(0, 40)}...`
                  : p.content_raw}
              </option>
            ))}
          </select>
          <label className="mb-1 block text-sm text-gray-500">
            或直接貼上噗浪網址
          </label>
          <input
            type="text"
            className="mb-4 w-full rounded-md border border-plain bg-plain/10 p-2 text-sm text-gray-800"
            placeholder="https://www.plurk.com/p/xxxxxxx"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (e.target.value) setSelectedId("");
            }}
          />
          <label className="mb-6 flex cursor-pointer items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={sendAll}
              onChange={(e) => setSendAll(e.target.checked)}
              className="accent-main"
            />
            一次發送所有分段（共 {chunks.length} 則）
          </label>
          <div className="flex justify-end gap-2">
            <Dialog.Close className="rounded-md border border-plain px-4 py-1.5 text-sm text-gray-500 hover:bg-plain/10">
              取消
            </Dialog.Close>
            <button
              className="rounded-md bg-main px-4 py-1.5 text-sm text-white disabled:opacity-40"
              disabled={!targetPlurkId}
              onClick={handleConfirm}
            >
              確認發送
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
