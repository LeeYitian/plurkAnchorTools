"use client";
import { useEffect, useState } from "react";

export default function OAuthCompletePage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 使用者重新整理代表授權流程已結束，這頁沒有存在意義，直接導回主頁
    const navEntry = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (navEntry?.type === "reload") {
      window.location.href = "/chunk";
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const errorMessage = params.get("error");

    if (errorMessage) {
      setError(errorMessage);
    } else {
      // 桌面瀏覽器通常成功，使用者看不到這頁；
      // 手機瀏覽器在 cross-origin 跳轉後 close 多半被忽略，使用者需手動按按鈕。
      window.close();
    }
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-[85vw] max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
          <p className="mb-3 text-base font-bold text-main">授權失敗</p>
          <p className="mb-6 text-xs text-red-500">{`出現錯誤：${error}`}</p>
          <div className="flex justify-end">
            <button
              className="rounded-md bg-gray-300 px-4 py-1.5 text-sm text-gray-500"
              onClick={() => window.close()}
            >
              關閉分頁
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-[85vw] max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
        <p className="mb-3 text-base font-bold text-main">授權完成</p>
        <p className="mb-6 text-sm leading-relaxed text-gray-600">
          已成功取得噗浪授權，請關閉此分頁並回到原本的頁面繼續操作。
        </p>
        <div className="flex justify-end">
          <button
            className="rounded-md bg-cute px-4 py-1.5 text-sm text-white"
            onClick={() => window.close()}
          >
            關閉分頁
          </button>
        </div>
      </div>
    </div>
  );
}
