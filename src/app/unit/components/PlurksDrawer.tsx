"use client";
import { Drawer, DrawerContent, DrawerTitle } from "@/lib/ui/drawer";
import { PlurksDataContext } from "@/providers/PlurksDataProvider";
import { useContext, useState } from "react";

const SNAP_POINTS = ["550px", "800px"];
export function PlurksDrawer({ children }: { children: React.ReactNode }) {
  const [{ hasData }] = useContext(PlurksDataContext);

  return (
    <>{hasData && <Drawer snapPoints={SNAP_POINTS}>{children}</Drawer>} </>
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
