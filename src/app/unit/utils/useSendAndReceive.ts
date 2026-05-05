import { LoadingContext } from "@/providers/LoadingProvider";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { use, useContext, useEffect, useState } from "react";
import { indexedDBService } from "@/app/unit/lib/indexDB";
import useFetchPlurk from "@/app/unit/utils/useFetchPlurk";

type TReplaceExistedData = {
  data: Record<string, string>;
  selectedPlurksIds: number[];
  plurk_id: number;
};

//TODO: api 的 typescript
export default function useSendAndReceive() {
  const [, setLoading] = useContext(LoadingContext);
  const [{ plurk_id, selectedPlurksIds }, dispatch] =
    useContext(PlurksDataContext);
  const [errorMessage, setErrorMessage] = useState("");
  const { getSavedEditedPlurks, replaceSinglePlurkData } = indexedDBService();
  const { fetchPlurk } = useFetchPlurk();

  const sendDataToCloud = async () => {
    setLoading(true);
    try {
      const allSavedPlurks = await getSavedEditedPlurks(plurk_id);

      const res = await fetch("/api/saveData", {
        method: "POST",
        body: JSON.stringify({
          data: allSavedPlurks,
          plurk_id,
          selectedPlurksIds,
        }),
      });
      const { data } = await res.json();

      if (!res.ok) {
        setErrorMessage(data);
      } else {
        return data;
      }
    } catch (error) {
      setErrorMessage(JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  /**
   * @param value redis 儲存的 key
   * @returns {{plurk_id: number, data: Record<string, string>, selectedPlurksIds: number[]}} plurk_id 是數字 36 進位， data 是 { id :content }
   */
  const receiveDataFromCloud = async (value: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/getData?key=" + value);
      const { data: resData } = await res.json();
      const { plurk_id, data: data, selectedPlurksIds } = resData;

      if (res.ok && plurk_id) {
        return { plurk_id, data, selectedPlurksIds };
      } else {
        setErrorMessage("缺少必要資料欄位，請重新上傳編輯紀錄");
      }
      if (!res.ok) {
        setErrorMessage(resData);
      }
    } catch (error) {
      setErrorMessage(JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const replaceData = async (
    data: Record<string, string>,
    selectedPlurksIds: number[],
    plurk_id: number,
  ) => {
    const parsedData = Object.entries(data).map(([key, value]) => {
      const temp = {
        plurk_id,
        id: parseInt(key),
        content: value as string,
      };
      return temp;
    });
    await replaceSinglePlurkData({
      plurk_id,
      selectedPlurksIds,
      editedPlurks: parsedData,
    });
  };

  /**
   * 覆蓋瀏覽器中已儲存的資料。必定會寫入 indexedDB，但不一定會重新 fetchPlurk
   * @param data { id : content } 的格式
   * @param selectedPlurksIds
   * @param plurk_id number，非 36 進位
   * @param shouldFetch false 代表已有噗文資料，需要首動更新 indexedDB 資料和 context 讓接下來的流程可以運作； true 代表沒有噗文資料，fetchPlurk 後會觸發把 indexedDB 資料同步到 context 的流程，所以覆蓋 indexedDB 資料即可
   */
  const replaceExistedData = async (
    { data, selectedPlurksIds, plurk_id }: TReplaceExistedData,
    shouldFetch: boolean,
  ) => {
    setLoading(true);
    await replaceData(data, selectedPlurksIds, plurk_id); // 覆蓋 indexedDB 中已儲存的資料

    if (shouldFetch) {
      // fetchPlurk 會觸發 SyncPlurksData 的 useEffect 將 indexedDB 資料同步到 plurksDataContext
      const id = plurk_id.toString(36);
      await fetchPlurk(`https://www.plurk.com/p/${id}`);
    } else {
      dispatch({ type: "SET_PLURKS_IDS", payload: selectedPlurksIds });
      dispatch({ type: "SET_EDITED_PLURKS", payload: data });
    }
    setLoading(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (errorMessage) {
      timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [errorMessage]);

  return {
    sendDataToCloud,
    receiveDataFromCloud,
    replaceExistedData,
    errorMessage,
  };
}
