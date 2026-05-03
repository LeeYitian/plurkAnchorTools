"use client";
import Navigator from "@/app/components/Navigator";
import { useEffect, useRef, useState } from "react";
import "./Header.scss";
import clsx from "clsx";

let ticking = false;
export default function Header() {
  const lastScroll = useRef(0);
  const accumulatedUpScroll = useRef(0);
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
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
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (ticking) return;
      window.requestAnimationFrame(handleScroll);
    });
  }, []);

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
