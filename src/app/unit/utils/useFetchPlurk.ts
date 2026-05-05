import { LoadingContext } from "@/providers/LoadingProvider";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useState } from "react";

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

    const regex = new RegExp(/^https:\/\/www\.plurk\.com\/p\/[a-zA-Z0-9]+$/);
    if (regex.test(url)) {
      setLoading(true);
      const plurk_id = url.split("/").pop();
      const response = await fetch(`/api/fetchPlurks?id=${plurk_id}`);

      if (!response.ok) {
        const message = await response.json();
        setErrorMessage(
          `*取噗錯誤：${JSON.stringify(message.data)}。請檢查網址`,
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

  const clearErrorMessage = () => {
    setErrorMessage("");
  };

  return {
    fetchPlurk,
    errorMessage,
    clearErrorMessage,
  };
}
