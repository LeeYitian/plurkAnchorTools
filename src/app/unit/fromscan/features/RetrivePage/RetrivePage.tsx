"use client";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import "./RetrivePage.scss";
import useSendAndReceive from "@/app/unit/utils/useSendAndReceive";
import { indexedDBService } from "@/app/unit/lib/indexDB";
import AskForReplace from "@/app/unit/components/AskForReplace";

enum STEP {
  RETRIVE = "RETRIVE",
  REPLACE = "REPLACE",
}

const loadingText = {
  [STEP.RETRIVE]: "取得資料中",
  [STEP.REPLACE]: "覆蓋資料中",
};

export default function RetrivePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const key = searchParams.get("key");
  const { receiveDataFromCloud, replaceExistedData, errorMessage } =
    useSendAndReceive();
  const { getSavedEditedPlurks } = indexedDBService();
  const [loading, setLoading] = useState(false);
  const [askForReplace, setAskForReplace] = useState(false);
  const [step, setStep] = useState(STEP.RETRIVE);
  const [tempData, setTempData] = useState<{
    data: Record<string, string>;
    plurk_id: number;
    selectedPlurksIds: number[];
  } | null>(null);

  useEffect(() => {
    if (key && key.match(/^[a-zA-Z0-9]{6}$/)) {
      const getData = async (key: string) => {
        setLoading(true);
        const res = await receiveDataFromCloud(key);
        if (res) {
          const { data, plurk_id, selectedPlurksIds } = res;

          const existedPlurks = await getSavedEditedPlurks(plurk_id);

          setStep(STEP.REPLACE);

          if (Object.keys(existedPlurks).length > 0) {
            setTempData({ data, plurk_id, selectedPlurksIds });
            setAskForReplace(true);
          } else {
            await replaceExistedData(
              { data, plurk_id, selectedPlurksIds },
              true,
            );
            router.push("/unit");
          }
        }
        setLoading(false);
      };
      getData(key);
    }
  }, [key]);

  const confirmReplace = async (confirm: boolean) => {
    if (!confirm) {
      setTempData(null);
      setAskForReplace(false);
      redirect("/unit");
    }
    if (tempData) {
      setLoading(true);
      setAskForReplace(false);
      const { data, plurk_id, selectedPlurksIds } = tempData;
      await replaceExistedData({ data, plurk_id, selectedPlurksIds }, true);
      setTempData(null);
      router.push("/unit");
    } else {
      alert("出現錯誤請重試");
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-[50vh] px-4 lg:px-0 mx-auto mt-[calc(115px+var(--spacing)*7)] md:mt-[calc(70px+var(--spacing)*7)] relative flex flex-col justify-center items-center">
      {loading && (
        <h3 className="text-main font-bold">
          {loadingText[step]}
          <div className="retriveLoading" />
        </h3>
      )}
      {askForReplace && (
        <AskForReplace
          plurk_id={tempData?.plurk_id}
          confirmReplace={confirmReplace}
        />
      )}
      {errorMessage && (
        <div className="h-[25%] w-[100%] flex flex-col justify-center items-center">
          <div className="text-red-500 font-light text-md text-center">
            {`出現錯誤：${errorMessage}`}
          </div>
          <button
            className="w-50 bg-main text-white py-1 px-2 mt-2 rounded-md"
            onClick={() => redirect("/unit")}
          >
            返回
          </button>
        </div>
      )}
    </div>
  );
}
