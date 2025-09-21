"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import {
  MouseEventHandler,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./ArticleArea.scss";
import {
  DICE_EMOTICON,
  EMPTY_LINE,
  EMPTY_LINE_RAW,
  OWNER,
} from "@/types/constants";
import clsx from "clsx";
import CopyBar from "@/app/unit/components/CopyBar/CopyBar";
import useIndexedDB from "../../utils/useIndexedDB";
import { LoadingContext } from "@/providers/LoadingProvider";

export default function ArticleArea() {
  const articleRef = useRef<HTMLDivElement>(null);
  const [{ hasData, plurks, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const [editing, setEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState<Record<string, string>>({});
  const {
    isDBInitialized,
    saveOriginalPlurk,
    saveEditedPlurk,
    getSavedEditedPlurks,
  } = useIndexedDB();
  const [, setLoading] = useContext(LoadingContext);

  const selectedPlurks = useMemo(() => {
    return plurks
      .filter((plurk) => selectedPlurksIds.includes(plurk.id))
      .map((plurk, index, array) => {
        const { content, content_raw } = plurk;
        if (index === array.length - 1) {
          return { ...plurk, content: content };
        } else {
          return {
            ...plurk,
            content: content + EMPTY_LINE,
            content_raw: content_raw + EMPTY_LINE_RAW,
          };
        }
      });
  }, [plurks, selectedPlurksIds]);

  const handleDoubleClick: MouseEventHandler = (e) => {
    setEditing(true);
    const target = e.currentTarget as HTMLDivElement;
    const id = target.id;

    target.setAttribute("contentEditable", "true");
    target.focus();

    const originalPlurk = selectedPlurks.find(
      (plurk) => plurk.id.toString() === id
    );
    if (originalPlurk) {
      saveOriginalPlurk({
        originalPlurk: {
          id,
          content: originalPlurk.content,
        },
      });
    }

    target.addEventListener(
      "blur",
      () => {
        target.removeAttribute("contentEditable");
        const newContent = target.innerHTML;
        saveEditedPlurk({ editedPlurk: { id, content: newContent } });

        setEditedRecord((prev) => ({ ...prev, [id]: newContent }));
        setEditing(false);
      },
      { once: true }
    );
  };

  useEffect(() => {
    const getDBRecord = async () => {
      setLoading(true);
      const record = await getSavedEditedPlurks();
      setEditedRecord(record);
      setLoading(false);
    };
    getDBRecord();
  }, [isDBInitialized]);

  return (
    <>
      {hasData && (
        <>
          <div
            ref={articleRef}
            className="w-[50%] p-2 border-l-main border-l-3 overflow-y-auto max-h-[calc(100vh-200px)] max-h-[calc(100dvh-200px)] scrollbar"
          >
            {selectedPlurks.map((plurk) => (
              <div
                key={plurk.id}
                id={plurk.id.toString()}
                className={clsx(
                  "article",
                  plurk.handle === OWNER &&
                    plurk.content.includes(DICE_EMOTICON) && [
                      "text-main",
                      "font-medium",
                    ]
                )}
                onClick={() => {
                  if (editing) return;
                  dispatch({ type: "SCROLL_TO_ID", payload: plurk.id });
                }}
                onDoubleClick={handleDoubleClick}
                dangerouslySetInnerHTML={{
                  __html: editedRecord[plurk.id] || plurk.content,
                }}
              />
            ))}
          </div>
          <CopyBar
            selectedPlurks={selectedPlurks}
            articleRef={articleRef.current}
          />
        </>
      )}
    </>
  );
}
