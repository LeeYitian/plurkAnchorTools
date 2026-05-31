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
      // 通知父視窗授權完成，由父視窗透過 window.open() 的 reference 關閉此 popup，
      // 不在此呼叫 window.close()，因為 cross-origin 跳轉後自我關閉在手機上會被忽略。
      window.opener?.postMessage(
        { type: "OAUTH_COMPLETE" },
        window.location.origin,
      );
    }
  }, []);

  if (error) {
    return (
      <div className="fixed left-1/2 -translate-x-1/2 w-[90vw] md:w-[60vw] inset-0 flex flex-col items-center justify-center">
        <p className="mb-3 text-base font-bold text-main">授權失敗</p>
        <p className="text-sm text-black text-center">
          請關閉此分頁並回到原本的頁面重新操作。如反覆見到此畫面請
          <a
            className="text-main underline"
            href="https://www.plurk.com/p/3hpbx8t2r0"
            target="_blank"
            rel="noopener noreferrer"
          >
            回報問題
          </a>
          。
        </p>
        <p className="mb-4 text-sm text-red-500">{`出現錯誤：${error}`}</p>
      </div>
    );
  }

  return (
    <div className="fixed left-1/2 -translate-x-1/2 w-[90vw] md:w-[60vw] inset-0 flex flex-col items-center justify-center">
      <p className="mb-3 text-base font-bold text-main">授權完成</p>
      <p className="text-sm text-black text-center">
        已成功取得噗浪授權，請關閉此分頁並回到原本的頁面繼續操作。
      </p>
    </div>
  );
}
