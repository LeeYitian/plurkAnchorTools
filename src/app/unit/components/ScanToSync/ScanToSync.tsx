"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { Icon } from "@iconify-icon/react";
import clsx from "clsx";
import QRCode from "react-qr-code";
import { useContext, useEffect, useRef, useState } from "react";
import "./ScanToSync.scss";
import useSendAndReceive from "@/app/unit/utils/useSendAndReceive";
import { indexedDBService } from "@/app/unit/lib/indexDB";

//TODO：拆成更小的 component？
//TODO：error message 的管理
export default function ScanToSync({ style }: { style?: string }) {
  const [{ hasData, hasEditedPlurks }] = useContext(PlurksDataContext);
  const [openDialog, setOpenDialog] = useState(false);
  const inputAreaRef = useRef<HTMLInputElement>(null);
  const [disableReceive, setDisableReceive] = useState(true);
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
    setDisableReceive(true);
    const children = Array.from(
      inputAreaRef.current?.children || [],
    ) as HTMLInputElement[];
    children.forEach((el) => (el.value = ""));
  };

  const distributeValue = (el: HTMLInputElement) => {
    const value = el.value.trim();
    if (!value) return;

    const chars = value.split("");
    el.value = chars[0];

    let cursor: HTMLInputElement | null = el;
    for (let i = 1; i < chars.length; i++) {
      cursor = cursor?.nextElementSibling as HTMLInputElement | null;
      if (!cursor) break;
      cursor.value = chars[i].match(/[0-9a-zA-Z]/g) ? chars[i] : "";
    }
    cursor?.focus();

    disableCheck();
  };

  const disableCheck = () => {
    setDisableReceive(
      Array.from(inputAreaRef.current?.children || [])
        .filter((el) => el instanceof HTMLInputElement)
        .some((el) => el.value === ""),
    );
  };

  const handleReceiveTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    //防止中文輸入法一次會跳兩格
    if ("nativeEvent" in e) {
      const native = e.nativeEvent as InputEvent;
      if (native.isComposing) return;
    }
    const value = e.currentTarget.value.trim();
    if (!value.match(/[0-9a-zA-Z]/g)) {
      e.currentTarget.value = "";
      return;
    }

    distributeValue(e.currentTarget);
  };

  //中文輸入狀態下停止輸入時自動分配數字
  const handleReceiveCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>,
  ) => {
    distributeValue(e.currentTarget);
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
          replaceExistedData(data, plurk_id, selectedPlurksIds);
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
      await replaceExistedData(data, plurk_id, selectedPlurksIds);
      setTempData(null);
      setAskForReplace(false);
    } else {
      alert("出現錯誤請重試");
    }
    toggleQRCode();
    setLoading(false);
  };

  const handleReceiveKeyUp = (e: React.KeyboardEvent) => {
    const currentInput = e.currentTarget as HTMLInputElement;
    const value = currentInput.value.trim();
    const keyPress = e.key;

    if (keyPress === "Backspace" && !value) {
      const previousInput =
        currentInput.previousSibling as HTMLInputElement | null;
      if (previousInput) previousInput.focus();
    }

    if (keyPress === "Enter") {
      confirmInput();
    }
  };

  const sendData = async () => {
    setLoading(true);
    const data = await sendDataToCloud();
    if (data) {
      setKeyForStorage(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const firstInput = inputAreaRef.current?.querySelector("input");
    firstInput?.focus();
  }, [openDialog]);

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
          if (hasData && hasEditedPlurks) {
            sendData();
          }
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
        {!hasData && !askForReplace && (
          <div className="h-[70%] flex justify-center items-center flex-col">
            {loading && (
              <div className="h-[25%] w-[100%]">
                <div className="sendAndReceive"></div>
              </div>
            )}
            {!loading && (
              <>
                <span className="text-gray-500 mb-6 text-center text-md font-light">
                  輸入驗證碼接收編輯紀錄
                </span>
                <div
                  ref={inputAreaRef}
                  className="flex justify-center items-center gap-3 mb-8"
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input
                      className="input"
                      onChange={handleReceiveTyping}
                      onKeyUp={handleReceiveKeyUp}
                      onCompositionEnd={handleReceiveCompositionEnd}
                      key={i}
                    />
                  ))}
                </div>
                <button
                  disabled={disableReceive}
                  className="selectBtn"
                  onClick={confirmInput}
                >
                  確認
                </button>
              </>
            )}
          </div>
        )}
        {!hasData && askForReplace && (
          <div className="h-[70%] p-5 flex justify-center items-center flex-col">
            {loading && (
              <div className="h-[25%] w-[100%]">
                <div className="sendAndReceive"></div>
              </div>
            )}
            {!loading && (
              <>
                <span className="text-gray-500 mb-3 text-center text-md font-light">
                  {`本瀏覽器中存在同噗文（${tempData?.plurk_id.toString(36)}）的編輯紀錄，是否覆蓋？`}
                </span>
                <div className="flex gap-2 w-full">
                  <button
                    className="selectBtn plain"
                    onClick={() => confirmReplace(false)}
                  >
                    否
                  </button>
                  <button
                    className="selectBtn"
                    onClick={() => confirmReplace(true)}
                  >
                    是
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {hasData && (
          <div className="h-[90%] flex justify-center items-center flex-col">
            {loading && (
              <div className="h-[25%] w-[100%]">
                <div className="sendAndReceive"></div>
              </div>
            )}
            {!loading && keyForStorage && (
              <>
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
              </>
            )}
          </div>
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
