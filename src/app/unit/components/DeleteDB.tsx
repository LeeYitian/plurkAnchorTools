"use client";

import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import useIndexedDB from "@/app/unit/utils/useIndexedDB";
import clsx from "clsx";

enum DELETE_TYPE {
  ALL = "ALL",
  SINGLE = "SINGLE",
}

const DELETEBTN_CONFIG = {
  [DELETE_TYPE.ALL]: {
    btnText: "刪除所有紀錄",
    dialogText: (count: string) =>
      `此瀏覽器上共儲存了 ${count} 筆噗文紀錄，確定要全部刪除嗎？`,
  },
  [DELETE_TYPE.SINGLE]: {
    btnText: (
      <Icon
        icon="material-symbols:delete-outline-rounded"
        width={25}
        height={25}
      />
    ),
    dialogText: (id: string) => `確定要刪除此噗（${id}）的紀錄嗎？`,
  },
};

export default function DeleteDB({ style }: { style?: string }) {
  const [{ hasData, plurk_id }] = useContext(PlurksDataContext);
  const [showDialog, setShowDialog] = useState(false);
  const {
    isDBInitialized,
    getAllPlurkIds,
    deleteIndexedDB,
    deleteSinglePlurkData,
  } = useIndexedDB();
  const deleteType = hasData ? DELETE_TYPE.SINGLE : DELETE_TYPE.ALL;
  const [text, setText] = useState<string>("0");
  const handleConfirm = async (deleteType: DELETE_TYPE) => {
    switch (deleteType) {
      case DELETE_TYPE.ALL:
        await deleteIndexedDB();
        break;
      case DELETE_TYPE.SINGLE:
        if (hasData) {
          await deleteSinglePlurkData(plurk_id);
          window.location.reload();
        }
        break;
    }
  };

  useEffect(() => {
    if (!isDBInitialized) return;
    const getCount = async () => {
      const allIds = await getAllPlurkIds();
      setText(allIds.length.toString());
    };
    getCount();
  }, [isDBInitialized]);

  useEffect(() => {
    if (hasData) {
      const id = plurk_id.toString(36);
      setText(id);
    }
  }, [hasData, plurk_id]);

  return (
    <>
      <button
        className={clsx(
          "absolute py-1 rounded-full border-cute border-2 text-cute text-xs",
          style,
          {
            "right-12 -top-1 px-1 flex justify-center items-center max-w-8 max-h-8":
              hasData,
          },
          { "right-3 px-2 top-0": !hasData },
        )}
        onClick={() => setShowDialog(true)}
      >
        {DELETEBTN_CONFIG[deleteType].btnText}
      </button>
      <div
        className={clsx(
          "flex flex-col justify-between fixed z-50 top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[80vw] md:w-[40vw] min-h-[150px] bg-white p-5 shadow-md rounded-2xl border-gray-200 border-1 transition-opacity duration-300 ease-in-out",
          showDialog ? "opacity-100" : "opacity-0",
          !showDialog && "pointer-events-none",
        )}
      >
        <span>{DELETEBTN_CONFIG[deleteType].dialogText(text)}</span>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-2 py-1 rounded-md bg-cute text-white"
            onClick={() => {
              handleConfirm(deleteType);
              setShowDialog(false);
            }}
          >
            確定
          </button>
          <button
            className="px-2 py-1 rounded-md bg-gray-300 text-gray-500"
            onClick={() => setShowDialog(false)}
          >
            取消
          </button>
        </div>
      </div>
    </>
  );
}
