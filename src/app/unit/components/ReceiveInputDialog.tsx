import { useEffect, useState } from "react";

type TReceiveInputDialo = {
  inputAreaRef: React.RefObject<HTMLInputElement | null>;
  confirmInput: () => Promise<void>;
  openDialog: boolean;
};

export default function ReceiveInputDialog({
  inputAreaRef,
  confirmInput,
  openDialog,
}: TReceiveInputDialo) {
  const [disableReceive, setDisableReceive] = useState(true);

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

  useEffect(() => {
    const firstInput = inputAreaRef.current?.querySelector("input");
    firstInput?.focus();
    setDisableReceive(!!openDialog);
  }, [openDialog, inputAreaRef]);

  return (
    <div className="h-[70%] flex justify-center items-center flex-col">
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
    </div>
  );
}
