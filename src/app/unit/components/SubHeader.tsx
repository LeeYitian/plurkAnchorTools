"use client";
import DeleteDB from "@/app/unit/components/DeleteDB";
import LinkInput from "@/app/unit/components/LinkInput/LinkInput";
import clsx from "clsx";
import { useEffect, useState } from "react";

export default function SubHeader() {
  const [showSubHeader, setShowSubHeader] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      requestAnimationFrame(() => {
        const headerHide = document.querySelector("header.scrollHidden");
        setShowSubHeader(!!headerHide);
      });
    });
  }, []);

  console.log("subheader", showSubHeader);
  return (
    <div
      className={clsx(
        "fixed w-full z-10 top-0 left-0 bg-white h-12 opacity-0 transition-all duration-300 ease-in-out",
        { "opacity-100": showSubHeader },
      )}
    >
      <DeleteDB style={"top-2 right-14"} />
      <LinkInput style={"top-2 right-4"} />
    </div>
  );
}
