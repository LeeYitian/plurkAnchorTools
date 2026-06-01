import { LoadingContext } from "@/providers/LoadingProvider";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { PLURK_URL_REGEX } from "@/types/constants";
import { useContext, useState } from "react";
import { APIFetch } from "@/lib/APIFetch";
import type { TPlurkResponse } from "@/types/plurks";

export default function useFetchPlurk() {
  const [, setLoading] = useContext(LoadingContext);
  const [, dispatch] = useContext(PlurksDataContext);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * 取回噗文，並將噗文（包含噗首）存進 context 裡
   * 存進 context 時會順便設定 hasData、selectedPlurksIds、plurk_id
   * @param url 從噗浪複製來的噗文網址（id 非 36 進位）
   *
   */
  const fetchPlurk = async (url: string) => {
    if (!url) return;
    const match = url.match(PLURK_URL_REGEX);
    if (!match) {
      setErrorMessage("無效的噗文網址");
      return;
    }

    setLoading(true);
    const plurk_id = match[1];
    const result = await APIFetch<TPlurkResponse[]>(`/api/fetchPlurks?id=${plurk_id}`);
    setLoading(false);

    if (!result.ok) {
      // status 0 是網路錯誤（預設訊息）；其他是 API 錯誤（附上請檢查網址）
      setErrorMessage(
        result.status === 0
          ? `*取噗錯誤：${result.data}`
          : `*取噗錯誤：${result.data}。請檢查網址`,
      );
      dispatch({ type: "SET_PLURKS", payload: [] });
      return;
    }

    dispatch({ type: "SET_PLURKS", payload: result.data });
  };

  const clearErrorMessage = () => {
    setErrorMessage("");
  };

  return {
    fetchPlurk,
    errorMessage,
    clearErrorMessage,
  };
}
