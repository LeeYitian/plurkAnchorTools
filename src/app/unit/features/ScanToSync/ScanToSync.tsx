"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { Icon } from "@iconify-icon/react";
import clsx from "clsx";
import QRCode from "react-qr-code";
import { useContext, useEffect, useRef, useState } from "react";
import "./ScanToSync.scss";
import useSendAndReceive from "@/app/unit/utils/useSendAndReceive";
import ReceiveInputDialog from "@/app/unit/components/ReceiveInputDialog";
import { indexedDBService } from "@/app/unit/lib/indexDB";
import AskForReplace from "../../components/AskForReplace";

enum TRANSFER_TYPE {
  UNCHOOSE = "UNCHOOSE",
  RECEIVE = "RECEIVE",
  SEND = "SEND",
}

//TODO：error message 的管理，尤其是 send/receive 和 fetchPlurks 之間沒有統一行為。Hook 的設計問題？改用 tanstack？
export default function ScanToSync({ style }: { style?: string }) {
  const [{ hasData, hasEditedPlurks }] = useContext(PlurksDataContext);
  const [transferType, setTransferType] = useState<TRANSFER_TYPE>(
    TRANSFER_TYPE.UNCHOOSE,
  );
  const [openDialog, setOpenDialog] = useState(false);
  const inputAreaRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [keyForStorage, setKeyForStorage] = useState("");
  const [askForReplace, setAskForReplace] = useState(false);
  const [tempData, setTempData] = useState<{
    data: Record<string, string>;
    plurk_id: number;
    selectedPlurksIds: number[];
  } | null>(null);
  const {
    sendDataToCloud,
    receiveDataFromCloud,
    replaceExistedData,
    errorMessage,
  } = useSendAndReceive();
  const { getSavedEditedPlurks } = indexedDBService();

  const toggleQRCode = () => {
    setOpenDialog(!openDialog);
    setTransferType(!hasData ? TRANSFER_TYPE.RECEIVE : TRANSFER_TYPE.UNCHOOSE);
    const children = Array.from(
      inputAreaRef.current?.children || [],
    ) as HTMLInputElement[];
    children.forEach((el) => (el.value = ""));
  };

  const sendData = async () => {
    setLoading(true);
    const data = await sendDataToCloud();
    if (data) {
      setKeyForStorage(data);
    }
    setLoading(false);
  };

  const confirmInput = async () => {
    const children = Array.from(
      inputAreaRef.current?.children || [],
    ) as HTMLInputElement[];
    const typedValue = children.map((el) => el.value).join("");

    if (typedValue.length === 6) {
      setLoading(true);
      const res = await receiveDataFromCloud(typedValue);
      if (res) {
        const { data, plurk_id, selectedPlurksIds } = res;

        const existedPlurks = await getSavedEditedPlurks(plurk_id);
        if (Object.keys(existedPlurks).length > 0) {
          setTempData({ data, plurk_id, selectedPlurksIds });
          setAskForReplace(true);
        } else {
          await replaceExistedData(
            { data, plurk_id, selectedPlurksIds },
            !hasData,
          );
          toggleQRCode();
        }
      }
      setLoading(false);
    }
  };

  const confirmReplace = async (confirm: boolean) => {
    if (!confirm) {
      setTempData(null);
      setAskForReplace(false);
      toggleQRCode();
      return;
    }
    if (tempData) {
      setLoading(true);
      const { data, plurk_id, selectedPlurksIds } = tempData;
      await replaceExistedData({ data, plurk_id, selectedPlurksIds }, !hasData);
      setTempData(null);
      setAskForReplace(false);
    } else {
      alert("出現錯誤請重試");
    }
    toggleQRCode();
    setLoading(false);
  };

  useEffect(() => {
    setTransferType(!hasData ? TRANSFER_TYPE.RECEIVE : TRANSFER_TYPE.UNCHOOSE);
  }, [hasData]);

  return (
    <>
      <button
        className={clsx(
          "outlineBtn absolute border-cute text-cute icon",
          style,
          { "-top-1 right-21": hasData },
          { "-top-0.5 right-28": !hasData },
          {
            "pointer-events-none text-gray-400 border-gray-400":
              hasData && !hasEditedPlurks,
          },
        )}
        onClick={() => {
          toggleQRCode();
        }}
      >
        <Icon
          icon="streamline-ultimate:cloud-data-transfer-bold"
          width={25}
          height={25}
        />
      </button>
      <div
        className={clsx(
          "QRCodeDialog",
          openDialog && "opacity-100",
          !openDialog && "pointer-events-none opacity-0",
        )}
      >
        <div className="text-gray-400 cursor-pointer group p-2 w-full flex justify-end items-center">
          <Icon
            icon="material-symbols:close-rounded"
            className="group-hover:scale-110"
            width={30}
            height={30}
            onClick={toggleQRCode}
          />
        </div>
        {loading ? (
          <div className="h-[100%] w-[100%] flex justify-center items-center">
            <div className="sendAndReceive"></div>
          </div>
        ) : (
          <>
            {transferType === TRANSFER_TYPE.UNCHOOSE && (
              <div className="h-[75%] w-full p-10 flex justify-center gap-4 items-center flex-col">
                <button
                  className="selectBtn"
                  onClick={() => {
                    setTransferType(TRANSFER_TYPE.SEND);
                    sendData();
                  }}
                >
                  傳送編輯紀錄
                </button>
                <span className="text-gray-700 text-md">或</span>
                <button
                  className="selectBtn plain"
                  onClick={() => setTransferType(TRANSFER_TYPE.RECEIVE)}
                >
                  接收編輯紀錄
                </button>
              </div>
            )}
            {transferType === TRANSFER_TYPE.RECEIVE && !askForReplace && (
              <ReceiveInputDialog
                inputAreaRef={inputAreaRef}
                confirmInput={confirmInput}
                openDialog={openDialog}
              />
            )}
            {transferType === TRANSFER_TYPE.RECEIVE && askForReplace && (
              <AskForReplace
                plurk_id={tempData?.plurk_id}
                confirmReplace={confirmReplace}
              />
            )}
            {transferType === TRANSFER_TYPE.SEND && (
              <div className="h-[90%] flex justify-center items-center flex-col">
                <QRCode
                  value={`${window.location.origin}/unit?key=${keyForStorage}`}
                  style={{ height: "100%", width: "100%" }}
                />
                <span className="my-1 text-black font-bold text-4xl tracking-widest">
                  {keyForStorage}
                </span>
                <span className="text-gray-500 mb-6 text-center text-md font-light">
                  掃描 QRCode 或輸入驗證碼
                  <br />
                  在另一台裝置繼續編輯
                </span>
              </div>
            )}
          </>
        )}
        {errorMessage && (
          <div className="h-[25%] w-[100%]">
            <div className="text-red-500 font-light text-xs text-center">
              {`出現錯誤：${errorMessage}`}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
