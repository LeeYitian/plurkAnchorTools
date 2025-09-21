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
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const contextMenuTarget = useRef<HTMLDivElement>(null);
  const [{ hasData, plurks, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const [editing, setEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState<Record<string, string>>({});
  const {
    isDBInitialized,
    // saveOriginalPlurk,
    saveEditedPlurk,
    getSavedEditedPlurks,
    deleteEditedPlurk,
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

  const handleEditClick = (target: HTMLDivElement) => {
    setEditing(true);
    const id = target.id;
    const plurk_id = selectedPlurks.find(
      (plurk) => plurk.id.toString() === id
    )!.plurk_id;

    target.setAttribute("contentEditable", "true");
    target.focus();

    target.addEventListener(
      "blur",
      () => {
        target.removeAttribute("contentEditable");
        const newContent = target.innerHTML;
        saveEditedPlurk({
          editedPlurk: { id: Number(id), content: newContent, plurk_id },
        });

        setEditedRecord((prev) => ({ ...prev, [id]: newContent }));
        setEditing(false);
      },
      { once: true }
    );
  };

  const handleRestoreClick = async (target: HTMLDivElement) => {
    const id = target.id;
    const originalContent = selectedPlurks.find(
      (plurk) => plurk.id.toString() === id
    )?.content;
    if (originalContent) {
      target.innerHTML = originalContent;
      await deleteEditedPlurk(Number(id));
    }
  };

  const customContextMenu: MouseEventHandler = (e) => {
    e.preventDefault();
    contextMenuTarget.current = e.currentTarget as HTMLDivElement;
    const contextMenu = contextMenuRef.current;
    if (contextMenu) {
      contextMenu.style.top = `${e.pageY}px`;
      contextMenu.style.left = `${e.pageX}px`;
      contextMenu.classList.remove("hidden");
    }
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

  useEffect(() => {
    const hideContextMenu = () => {
      const contextMenu = contextMenuRef.current;
      if (contextMenu && !contextMenu.classList.contains("hidden")) {
        contextMenu.classList.add("hidden");
      }
    };
    document.addEventListener("click", hideContextMenu);

    return () => {
      document.removeEventListener("click", hideContextMenu);
    };
  }, []);

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
                  if (
                    editing ||
                    !contextMenuRef.current?.classList.contains("hidden")
                  )
                    return;
                  dispatch({ type: "SCROLL_TO_ID", payload: plurk.id });
                }}
                onDoubleClick={(e) => handleEditClick(e.currentTarget)}
                onContextMenu={customContextMenu}
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
          <div ref={contextMenuRef} className="hidden contextMenu">
            <div
              className="contextMenuItem mb-1"
              onClick={(e) => {
                e.stopPropagation();
                if (!contextMenuTarget.current) return;
                handleEditClick(contextMenuTarget.current);
              }}
            >
              編輯
            </div>
            <div
              className="contextMenuItem"
              onClick={(e) => {
                e.stopPropagation();
                if (!contextMenuTarget.current) return;
                handleRestoreClick(contextMenuTarget.current);
              }}
            >
              全部還原
            </div>
          </div>
        </>
      )}
    </>
  );
}
