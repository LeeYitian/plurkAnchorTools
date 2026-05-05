import "@/app/unit/features/ScanToSync/ScanToSync.scss";
type TAskForReplace = {
  plurk_id: number | undefined;
  confirmReplace: (fetchPlurk: boolean) => void;
};

export default function AskForReplace({
  plurk_id,
  confirmReplace,
}: TAskForReplace) {
  return (
    <div className="h-[70%] p-5 flex justify-center items-center flex-col">
      <span className="text-gray-500 mb-3 text-center text-md font-light">
        {`本瀏覽器中存在同噗文（${plurk_id?.toString(36)}）的編輯紀錄，是否覆蓋？`}
      </span>
      <div className="flex gap-2 w-full">
        <button
          className="selectBtn plain"
          onClick={() => confirmReplace(false)}
        >
          否
        </button>
        <button className="selectBtn" onClick={() => confirmReplace(true)}>
          是
        </button>
      </div>
    </div>
  );
}
