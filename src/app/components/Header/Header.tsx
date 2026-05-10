"use client";
import Navigator from "@/app/components/Navigator";
import { useContext, useEffect, useRef, useState } from "react";
import "./Header.scss";
import clsx from "clsx";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";

export default function Header() {
  const [{ hasData }] = useContext(PlurksDataContext);
  const lastScroll = useRef(0);
  const accumulatedUpScroll = useRef(0);
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    if (!hasData) return;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll.current && currentScroll > 100) {
        accumulatedUpScroll.current = 0;
        setHideHeader(true);
      } else {
        accumulatedUpScroll.current += lastScroll.current - currentScroll;

        if (accumulatedUpScroll.current >= 1500 || currentScroll < 100) {
          setHideHeader(false);
        }
      }
      lastScroll.current = currentScroll;
    };
    window.addEventListener("scroll", () => {
      window.requestAnimationFrame(handleScroll);
    });
  }, [hasData]);

  return (
    <>
      <header
        className={clsx(
          "fixed z-10 w-full left-0 top-0 p-3 bg-plain transition-all duration-300 ease-in-out",
          {
            scrollHidden: hideHeader,
          },
        )}
      >
        <div className="flex flex-col gap-2 justify-between items-center md:flex-row max-w-4xl mx-auto">
          <h1
            className="text-main font-bold text-2xl strokeText select-none"
            data-stroke="噗浪安價小工具"
          >
            噗浪安價小工具
          </h1>
          <Navigator />
        </div>
      </header>
    </>
  );
}
