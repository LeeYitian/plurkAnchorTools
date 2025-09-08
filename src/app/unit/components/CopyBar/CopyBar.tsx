import { TPlurkResponse } from "@/types/plurks";
import CopyBarActions from "./CopyBarActions";
export type CopyBarProps = {
  selectedPlurks: TPlurkResponse[];
  articleRef?: HTMLDivElement | null;
};

export default function CopyBar({ selectedPlurks, articleRef }: CopyBarProps) {
  return (
    <>
      <div className="bg-main fixed bottom-0 left-0 right-0 h-9 flex justify-end items-center gap-2 px-5 lg:px-25 py-1">
        <CopyBarActions
          selectedPlurks={selectedPlurks}
          articleRef={articleRef}
        />
      </div>
    </>
  );
}
