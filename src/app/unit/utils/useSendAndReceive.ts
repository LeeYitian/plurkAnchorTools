import { LoadingContext } from "@/providers/LoadingProvider";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useState } from "react";
import { indexedDBService } from "@/app/unit/lib/indexDB";
import useFetchPlurk from "@/app/unit/utils/useFetchPlurk";

//TODO: api 的 typescript
export default function useSenfAndReceive() {
  const [, setLoading] = useContext(LoadingContext);
  const [{ plurk_id, selectedPlurksIds }] = useContext(PlurksDataContext);
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
   * @returns {{plurk_id: number, data: Record<string, string>}} plurk_id 是數字 36 進位， data 是 { id :content }
   */
  const receiveDataFromCloud = async (value: string) => {
    setLoading(true);
    try {
      const res = await fetch("api/getData?key=" + value);
      const {
        data: { plurk_id, data, selectedPlurksIds },
      } = await res.json();

      if (res.ok && plurk_id) {
        return { plurk_id, data, selectedPlurksIds };
      }
      if (!res.ok) {
        setErrorMessage(data);
      }
    } catch (error) {
      setErrorMessage(JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const replaceExistedData = async (
    data: Record<string, string>,
    plurk_id: number,
    selectedPlurksIds: number[],
  ) => {
    setLoading(true);
    const id = plurk_id.toString(36);

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
    // fetchPlurk 會觸發 SyncPlurksData 的 useEffect 將 indexedDB 資料同步到 plurksDataContext
    await fetchPlurk(`https://www.plurk.com/p/${id}`);

    setLoading(false);
  };

  return {
    sendDataToCloud,
    receiveDataFromCloud,
    replaceExistedData,
    errorMessage,
  };
}
