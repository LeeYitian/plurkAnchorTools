"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useMemo, useRef } from "react";
import "./ArticleArea.scss";
import { EMPTY_LINE, EMPTY_LINE_RAW } from "@/types/constants";
import clsx from "clsx";
import CopyBar from "@/app/unit/components/CopyBar/CopyBar";
import useCustomContextMenu from "@/app/unit/utils/useCustomContextMenu";
import useEditPlurks from "@/app/unit/utils/useEditPlurks";

export default function ArticleArea() {
  const [{ hasData, plurks, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const { editedRecord, editing, handleEditClick, handleRestoreClick } =
    useEditPlurks();
  const {
    isOpen,
    // position: contextMenuPos,
    openCustomContextMenu,
    CustomContextMenu,
  } = useCustomContextMenu();

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

  return (
    <>
      {hasData && (
        <>
          <div
            id="articleArea"
            className="w-[58%] p-2 overflow-y-auto max-h-[calc(100vh-200px)] max-h-[calc(100dvh-200px)] scrollbar"
          >
            {selectedPlurks.map((plurk) => (
              <div
                key={plurk.id}
                id={plurk.id.toString()}
                className={clsx(
                  "article",
                  editedRecord[plurk.id] && ["border-l-cute border-l-3 "]
                )}
                onClick={() => {
                  if (editing || isOpen) return;
                  dispatch({ type: "SCROLL_TO_ID", payload: plurk.id });
                }}
                onDoubleClick={(e) =>
                  handleEditClick({ target: e.currentTarget })
                }
                onContextMenu={openCustomContextMenu}
                dangerouslySetInnerHTML={{
                  __html: editedRecord[plurk.id] || plurk.content,
                }}
              />
            ))}
          </div>
          <CopyBar
            selectedPlurks={selectedPlurks}
            editedRecord={editedRecord}
          />
          <CustomContextMenu
            onEdit={handleEditClick}
            onRestore={handleRestoreClick}
          />
        </>
      )}
    </>
  );
}
