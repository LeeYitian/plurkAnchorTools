import { PlurksDataProvider } from "@/providers/PlurksDataProvider";
import SyncPlurksData from "@/app/unit/components/SyncPlurksData";

export default function UnitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlurksDataProvider>
      <SyncPlurksData />
      {children}
    </PlurksDataProvider>
  );
}
