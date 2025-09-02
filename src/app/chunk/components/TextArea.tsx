import { useRef } from "react";

type TextAreaProps = {
  clearTexts: () => void;
  setText: (value: string) => void;
};

export default function TextArea({ clearTexts, setText }: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <>
      <textarea
        ref={textareaRef}
        rows={10}
        className="text-sm w-full p-2 mt-2 rounded-md bg-plain/20 border-2 border-plain"
      ></textarea>
      <div className="flex justify-end gap-4 mt-1">
        <button
          className="px-4 py-1 rounded-md bg-cute text-white"
          onClick={() => {
            textareaRef.current!.value = "";
            clearTexts();
          }}
        >
          清空
        </button>
        <button
          className="px-4 py-1 rounded-md bg-main text-white"
          onClick={() => {
            if (textareaRef.current && textareaRef.current.value.trim()) {
              setText(textareaRef.current.value.trim());
            }
          }}
        >
          確認
        </button>
      </div>
    </>
  );
}
