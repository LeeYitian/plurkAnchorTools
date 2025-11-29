"use client";
import { useEffect, useRef, useState } from "react";
import Draggable, { DraggableEvent } from "react-draggable";

type DraggableEventHandler = (
  e: DraggableEvent,
  data: DraggableData
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!panelRef.current) return;
      panelRef.current.classList.remove("open");
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const closePanel = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!panelRef.current || target.closest(".sidePanel")) return;
      panelRef.current.classList.remove("open");
    };

    document.body.addEventListener("click", closePanel, { once: true });
  }, [panelOpen]);

  // const handlePointerEnter = () => {
  //   if (!panelRef.current || noHoverDevice) return;
  //   panelRef.current.classList.add("open");
  //   setPanelOpen(true);
  // };

  // const handlePointerLeave = () => {
  //   if (!panelRef.current || noHoverDevice) return;
  //   panelRef.current.classList.remove("open");
  //   setPanelOpen(false);
  // };

  const handleClick = () => {
    if (!panelRef.current || isDragging.current) return;
    if (panelOpen) {
      panelRef.current.classList.remove("open");
    } else {
      panelRef.current.classList.add("open");
    }
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

  // const handleStop: DraggableEventHandler = (e, data) => {
  //   // 若沒有移動距離 → 視為點擊
  //   if (data.y === startPos.current.y) {
  //     console.log("stop");
  //     // handleClick();
  //   }
  // };

  return (
    <Draggable
      nodeRef={panelRef}
      axis="y"
      onStart={handleStart}
      onDrag={handleDrag}
      // onStop={handleStop}
    >
      <div
        className="sidePanel open"
        // onPointerEnter={handlePointerEnter}
        // onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        ref={panelRef}
      >
        <a
          className="p-1.5"
          href="https://www.plurk.com/p/3hpbx8t2r0"
          target="_blank"
          rel="noopener noreferrer"
        >
          問題回報
        </a>
        <div className="h-8 w-1 border-white border-l-3 rounded-sm" />
      </div>
    </Draggable>
  );
}
