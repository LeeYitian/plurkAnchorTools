"use client";
import { useEffect, useRef, useState } from "react";
import Draggable, { DraggableEvent } from "react-draggable";
import clsx from "clsx";
import MaterialSymbolsDarkModeOutlineRounded from "~icons/material-symbols/dark-mode-outline-rounded";
import MaterialSymbolsLightModeOutlineRounded from "~icons/material-symbols/light-mode-outline-rounded";

enum COLOR_MODE {
  LIGHT = "light",
  DARK = "dark",
}

type DraggableEventHandler = (
  e: DraggableEvent,
  data: DraggableData,
) => void | false;
type DraggableData = {
  node: HTMLElement;
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  lastX: number;
  lastY: number;
};

export default function SidePanel() {
  const panelRef = useRef<null | HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const startPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const [colorMode, setColorMode] = useState(COLOR_MODE.LIGHT);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPanelOpen(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const closePanel = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".sidePanel")) return;
      setPanelOpen(false);
    };

    document.body.addEventListener("click", closePanel);

    return () => {
      document.body.removeEventListener("click", closePanel);
    };
  }, []);

  const handleClick = () => {
    if (isDragging.current) return;
    setPanelOpen((prev) => !prev);
  };

  const handleStart: DraggableEventHandler = (e, data) => {
    startPos.current = { x: data.x, y: data.y };
    isDragging.current = false;
  };

  const handleDrag: DraggableEventHandler = (e, data) => {
    const dx = Math.abs(data.x - startPos.current.x);
    const dy = Math.abs(data.y - startPos.current.y);

    if (dx > 3 || dy > 3) {
      isDragging.current = true; // 判定為拖曳
    }
  };

  const handleStop: DraggableEventHandler = () => {
    isDragging.current = false;
  };

  // const handleStop: DraggableEventHandler = (e, data) => {
  //   // 若沒有移動距離 → 視為點擊
  //   if (data.y === startPos.current.y) {
  //     console.log("stop");
  //     // handleClick();
  //   }
  // };

  const changeColorMode = (mode: COLOR_MODE) => {
    setColorMode(mode);
    if (mode === COLOR_MODE.LIGHT) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  useEffect(() => {
    const colorChange = (e: MediaQueryListEvent) => {
      changeColorMode(e.matches ? COLOR_MODE.DARK : COLOR_MODE.LIGHT);
    };

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", colorChange);

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      changeColorMode(COLOR_MODE.DARK);
    }

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", colorChange);
    };
  }, []);

  return (
    <Draggable
      nodeRef={panelRef}
      axis="y"
      onStart={handleStart}
      onDrag={handleDrag}
      onStop={handleStop}
      cancel=".cancelDrag"
    >
      <div
        className={clsx("sidePanel", { open: panelOpen })}
        // onPointerEnter={handlePointerEnter}
        // onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        ref={panelRef}
      >
        <MaterialSymbolsDarkModeOutlineRounded
          className={clsx(
            "cancelDrag",
            !panelOpen && "hidden",
            colorMode === COLOR_MODE.LIGHT ? "block" : "hidden",
          )}
          width={35}
          height={35}
          onClick={(e) => {
            e.stopPropagation();
            changeColorMode(COLOR_MODE.DARK);
          }}
        />
        <MaterialSymbolsLightModeOutlineRounded
          className={clsx(
            "cancelDrag",
            !panelOpen && "hidden",
            colorMode === COLOR_MODE.DARK ? "block" : "hidden",
          )}
          width={35}
          height={35}
          onClick={(e) => {
            e.stopPropagation();
            changeColorMode(COLOR_MODE.LIGHT);
          }}
        />
        <a
          className={clsx("cancelDrag", { hidden: !panelOpen })}
          href="https://www.plurk.com/p/3hpbx8t2r0"
          target="_blank"
          rel="noopener noreferrer"
        >
          問題
          <br />
          回報
        </a>
        <div className="cancelDrag absolute top-1/2 right-1 -translate-y-1/2 h-9 w-1 border-white border-l-4 rounded-sm" />
      </div>
    </Draggable>
  );
}
