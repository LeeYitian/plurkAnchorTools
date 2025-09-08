"use client";
import { Drawer, DrawerContent, DrawerTitle } from "@/lib/ui/drawer";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useState } from "react";

const SNAP_POINTS = ["500px", "750px"];
export function PlurksDrawer({ children }: { children: React.ReactNode }) {
  const [snapPoint, setSnapPoint] = useState<string | number | null>(null);
  const [{ hasData }] = useContext(PlurksDataContext);
  console.log("snapPoint", snapPoint);

  return (
    <>
      {hasData && (
        <Drawer snapPoints={SNAP_POINTS} setActiveSnapPoint={setSnapPoint}>
          {children}
        </Drawer>
      )}{" "}
    </>
  );
}

export const PlurksDrawerContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <DrawerContent>
      <DrawerTitle />
      {children}
    </DrawerContent>
  );
};

export const PlurksDrawerSide = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <>{children}</>;
};
