"use client";
import { LoadingContext } from "@/providers/LoadingProvider";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import clsx from "clsx";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import "./LinkInput.scss";

export default function LinkInput() {
  const [url, setUrl] = useState("");
  const [openChangeUrl, setOpenChangeUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [{ hasData }, dispatch] = useContext(PlurksDataContext);
  const [, setLoading] = useContext(LoadingContext);
  const fetchPlurk = async (url: string) => {
    if (!url) return;

    const regex = new RegExp(/^https:\/\/www\.plurk\.com\/p\/[a-zA-Z0-9]+$/);
    if (regex.test(url)) {
      setLoading(true);
      const plurk_id = url.split("/").pop();
      const response = await fetch(`/api/fetchPlurks?id=${plurk_id}`);

      if (!response.ok) {
        const message = await response.json();
        setErrorMessage(
          `*取噗錯誤：${JSON.stringify(message.data)}。請檢查網址`
        );
        dispatch({ type: "SET_PLURKS", payload: [] });
        setLoading(false);
        return;
      }

      const { data } = await response.json();
      dispatch({ type: "SET_PLURKS", payload: data });
    } else {
      setErrorMessage("無效的噗文網址");
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleCloseChangeUrl = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement && !e.target.closest(".urlBtn")) {
        setOpenChangeUrl(false);
      }
    };
    document.addEventListener("click", handleCloseChangeUrl);
    return () => {
      document.removeEventListener("click", handleCloseChangeUrl);
    };
  }, [setOpenChangeUrl, openChangeUrl]);

  return (
    <>
      {!hasData && (
        <div className="flex flex-col flex-[2_1_50%] justify-center order-1 md:order-2">
          <div className="flex h-7 mt-0 md:mt-4 mb-2 md:mb-0">
            <input
              type="text"
              placeholder="貼上噗浪網址"
              value={url}
              onChange={(e) => {
                setErrorMessage("");
                if (e.target.value.trim()) {
                  setUrl(e.target.value.trim());
                } else {
                  setUrl("");
                }
              }}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  fetchPlurk(url);
                }
              }}
              className={clsx(
                "w-full bg-light rounded-md outline-main px-3 py-1 text-sm font-extralight",
                { "text-gray-400": !url }
              )}
            />
            <button
              className="ml-2 px-4 bg-cute text-white text-md whitespace-nowrap rounded-md"
              onClick={() => fetchPlurk(url)}
            >
              取噗
            </button>
          </div>
          {errorMessage && (
            <span className="block text-red-500 font-light text-xs mt-1 ml-1">
              {errorMessage}
            </span>
          )}
        </div>
      )}
      {hasData && (
        <>
          <div
            id="changeUrl"
            className="urlBtn flex items-center justify-center text-white absolute -top-1 right-2 lg:right-1 h-8 w-8 rounded-full cursor-pointer bg-cute"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName !== "IMG" && target.id !== "changeUrl") return;
              if (!openChangeUrl) {
                const btn = target.closest(".urlBtn");
                const input = btn?.querySelector("input");
                input?.select();
              }
              setOpenChangeUrl(!openChangeUrl);
            }}
            title="更換網址"
          >
            <Image src="/urlLink.svg" alt="更換網址" width={25} height={25} />
            <div
              className={clsx(
                "absolute top-4/5 right-0 z-10 w-[30vw] min-w-[300px] max-w-[450px] h-[6vh] max-h-[42px] bg-white p-1 rounded-md shadow-md flex items-center justify-between transition transition-duration-700 ease-in-out",
                !openChangeUrl && ["opacity-0", "pointer-events-none"]
              )}
            >
              <input
                type="text"
                placeholder="貼上噗浪網址"
                value={url}
                onChange={(e) => {
                  setErrorMessage("");
                  if (e.target.value.trim()) {
                    setUrl(e.target.value.trim());
                  } else {
                    setUrl("");
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    fetchPlurk(url);
                  }
                }}
                className={clsx(
                  "w-8/10 bg-light rounded-md outline-main px-3 py-1 text-xs font-extralight text-gray-800",
                  { "text-gray-400": !url }
                )}
              />
              <button
                className=" px-2 py-1 bg-cute text-white text-xs whitespace-nowrap rounded-md"
                onClick={() => {
                  if (!openChangeUrl) return; // 防止點擊圖示誤觸
                  fetchPlurk(url);
                }}
              >
                取噗
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
