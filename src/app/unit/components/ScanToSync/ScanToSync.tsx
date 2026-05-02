"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { Icon } from "@iconify-icon/react";
import clsx from "clsx";
import QRCode from "react-qr-code";
import { useContext, useEffect, useRef, useState } from "react";
import "./ScanToSync.scss";

enum INPUT_TYPE {
  UNCHOOSE = "UNCHOOSE",
  SEND = "SEND",
  RECEIVE = "RECEIVE",
}

export default function ScanToSync({ style }: { style: string }) {
  const [{ hasData }] = useContext(PlurksDataContext);
  const [showQRCode, setShowQRCode] = useState(false);
  const [inputType, setInputType] = useState(INPUT_TYPE.UNCHOOSE);
  const inputAreaRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setShowQRCode(!showQRCode);
    setInputType(INPUT_TYPE.UNCHOOSE);
  };

  const closeQRCode = () => {
    setShowQRCode(false);
    setInputType(INPUT_TYPE.UNCHOOSE);
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

  const checkInput = () => {
    const children = Array.from(
      inputAreaRef.current?.children || [],
    ) as HTMLInputElement[];
    const typedValue = children.map((el) => el.value).join("");

    if (typedValue.length === 6) {
      alert(typedValue);
    }
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
      checkInput();
    }
  };

  useEffect(() => {
    if (inputType === INPUT_TYPE.RECEIVE) {
      const firstInput = inputAreaRef.current?.querySelector("input");
      firstInput?.focus();
    }
  }, [inputType]);

  const disableCheck = Array.from(inputAreaRef.current?.children || [])
    .filter((el) => el instanceof HTMLInputElement)
    .every((el) => el.value);

  if (!hasData) return null;

  return (
    <>
      <button
        className={clsx(
          "outlineBtn absolute border-cute text-cute icon -top-1 right-21",
          style,
        )}
        onClick={handleClick}
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
          showQRCode && "opacity-100",
          !showQRCode && "pointer-events-none opacity-0",
        )}
      >
        <div className="text-gray-400 cursor-pointer group p-2 w-full flex justify-end items-center">
          <Icon
            icon="material-symbols:close-rounded"
            className="group-hover:scale-110"
            width={30}
            height={30}
            onClick={closeQRCode}
          />
        </div>
        {inputType === INPUT_TYPE.UNCHOOSE && (
          <div className="h-[75%] w-full p-10 flex justify-center gap-4 items-center flex-col">
            <button
              className="selectBtn"
              onClick={() => setInputType(INPUT_TYPE.SEND)}
            >
              傳送編輯紀錄
            </button>
            <span className="text-gray-700 text-md">或</span>
            <button
              className="selectBtn plain"
              onClick={() => setInputType(INPUT_TYPE.RECEIVE)}
            >
              接收編輯紀錄
            </button>
          </div>
        )}
        {inputType === INPUT_TYPE.RECEIVE && (
          <div className="h-[70%] flex justify-center items-center flex-col">
            <span className="text-gray-500 mb-6 text-center text-md font-light">
              請輸入驗證碼
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
              disabled={disableCheck}
              className="selectBtn"
              onClick={checkInput}
            >
              確認
            </button>
          </div>
        )}
        {inputType === INPUT_TYPE.SEND && (
          <div className="h-[90%] flex justify-center items-center flex-col">
            <QRCode value="123" style={{ height: "100%", width: "100%" }} />
            <span className="my-1 text-black font-bold text-4xl tracking-widest">
              090909
            </span>
            <span className="text-gray-500 mb-6 text-center text-md font-light">
              掃描 QRCode 或輸入驗證碼
              <br />
              在另一台裝置繼續編輯
            </span>
          </div>
        )}
      </div>
    </>
  );
}
