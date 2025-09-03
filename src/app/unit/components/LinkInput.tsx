"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import clsx from "clsx";
import { useContext, useRef, useState } from "react";

export default function LinkInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasUrl, setHasUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [, dispatch] = useContext(PlurksDataContext);
  const fetchPlurk = async () => {
    const url = inputRef.current?.value.trim();
    if (!url) return;

    const regex = new RegExp(/^https:\/\/www\.plurk\.com\/p\/[a-zA-Z0-9]+$/);
    if (regex.test(url)) {
      const plurk_id = url.split("/").pop();
      const response = await fetch(`/api/fetchPlurks?id=${plurk_id}`);

      if (!response.ok) {
        const message = await response.json();
        setErrorMessage(
          `*取噗錯誤：${JSON.stringify(message.data)}。請檢查網址`
        );
      }

      const data = await response.json();
      dispatch({ type: "SET_PLURKS", payload: data.data.responses });
    } else {
      setErrorMessage("無效的噗文網址");
    }
  };

  return (
    <>
      <div className="flex h-7 mt-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="貼上噗浪網址"
          onChange={(e) => {
            setErrorMessage("");
            if (e.target.value.trim()) {
              setHasUrl(true);
            } else {
              setHasUrl(false);
            }
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              fetchPlurk();
            }
          }}
          className={clsx(
            "w-full bg-light rounded-md outline-main px-3 py-1 text-sm font-light",
            { "text-gray-300": !hasUrl }
          )}
        />
        <button
          className="ml-2 px-4 bg-cute text-white text-md whitespace-nowrap rounded-md"
          onClick={fetchPlurk}
        >
          取噗
        </button>
      </div>
      {errorMessage && (
        <span className="block text-red-500 font-light text-xs mt-1 ml-1">
          {errorMessage}
        </span>
      )}
    </>
  );
}
