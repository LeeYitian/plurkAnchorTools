"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext } from "react";

export default function ArticleArea() {
  const [{ hasData }] = useContext(PlurksDataContext);
  return (
    <>
      {hasData && (
        <div className="w-[50%] p-2 border-l-main border-l-3">
          <div>ArticleArea</div>
        </div>
      )}
    </>
  );
}
