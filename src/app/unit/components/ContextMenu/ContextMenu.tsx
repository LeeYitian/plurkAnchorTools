import clsx from "clsx";
import "./ContextMenu.scss";

export function ContextMenu({
  position,
  isOpen,
  children,
}: {
  position: { x: number; y: number };
  isOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx("contextMenu", { hidden: !isOpen })}
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      {children}
    </div>
  );
}

export function ContextMenuItem({
  label,
  action,
}: {
  label: string;
  action: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="contextMenuItem mb-1" onClick={action}>
      {label}
    </div>
  );
}
