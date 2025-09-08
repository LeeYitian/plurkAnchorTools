import CopyBarActions from "./CopyBarActions";
import { CopyBarProps } from "./CopyBar";
import { DrawerTrigger } from "@/lib/ui/drawer";

export default function CopyBarMobile({
  selectedPlurks,
  articleRef,
}: CopyBarProps) {
  return (
    <>
      <div className="bg-main fixed bottom-0 left-0 right-0 h-14 flex justify-between gap-2 px-5 py-1">
        <DrawerTrigger asChild>
          <div className="filterBtn bg-none text-light w-[80px] text-center">
            瀏覽噗文
          </div>
        </DrawerTrigger>
        <div className="flex gap-1">
          <CopyBarActions
            selectedPlurks={selectedPlurks}
            articleRef={articleRef}
          />
        </div>
      </div>
    </>
  );
}
