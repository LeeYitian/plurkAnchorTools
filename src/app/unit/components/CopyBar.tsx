"use client";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext } from "react";

export default function CopyBar() {
  const [{ hasData }] = useContext(PlurksDataContext);
  return (
    <>
      {hasData && (
        <div className="bg-main fixed bottom-0 left-0 right-0 h-8">CopyBar</div>
      )}
    </>
  );
}
