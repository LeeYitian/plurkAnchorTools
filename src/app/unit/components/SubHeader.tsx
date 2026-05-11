"use client";
import DeleteDB from "@/app/unit/components/DeleteDB";
import LinkInput from "@/app/unit/components/LinkInput/LinkInput";
import clsx from "clsx";
import { useContext, useEffect, useState } from "react";
import ScanToSync from "@/app/unit/features/ScanToSync/ScanToSync";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";

export default function SubHeader() {
  const [{ hasData }] = useContext(PlurksDataContext);
  const [showSubHeader, setShowSubHeader] = useState(false);

  useEffect(() => {
    if (!hasData) return;
    const showSubHeader = () => {
      requestAnimationFrame(() => {
        const headerHide = document.querySelector("header.scrollHidden");
        setShowSubHeader(!!headerHide);
      });
    };
    window.addEventListener("scroll", showSubHeader);

    return () => {
      window.removeEventListener("scroll", showSubHeader);
    };
  }, [hasData]);

  return (
    <div
      className={clsx(
        "fixed w-full z-10 top-0 left-0 bg-white dark:bg-bg h-12 opacity-0 transition-all duration-300 ease-in-out",
        {
          "opacity-100 md:opacity-0 md:user-select-none md:pointer-events-none":
            showSubHeader,
        },
        { "user-select-none pointer-events-none": !showSubHeader },
      )}
    >
      <DeleteDB style={"top-2 right-14"} />
      <LinkInput style={"top-2 right-4"} />
      <ScanToSync style={"top-2 right-24"} />
    </div>
  );
}
