import { useEffect, useRef } from "react";

type TextAreaProps = {
  clearTexts: () => void;
  setText: (value: string) => void;
  restoredValue?: string;
};

export default function TextArea({ clearTexts, setText, restoredValue }: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // OAuth 跳轉回來時，ChunkArea 傳入還原值，直接寫入 textarea DOM
  useEffect(() => {
    if (restoredValue && textareaRef.current) {
      textareaRef.current.value = restoredValue;
    }
  }, [restoredValue]);

  return (
    <>
      <textarea
        ref={textareaRef}
        rows={10}
        className="text-[1rem] md:text-[0.9rem] dark:text-black w-full p-2 mt-2 rounded-md bg-plain/20 border-2 border-plain"
      />
      <div className="flex justify-end gap-4 mt-1">
        <button
          className="px-4 py-1 rounded-md bg-cute text-white"
          onClick={() => {
            if (textareaRef.current) textareaRef.current.value = "";
            clearTexts();
          }}
        >
          清空
        </button>
        <button
          className="px-4 py-1 rounded-md bg-main text-white"
          onClick={() => {
            const value = textareaRef.current?.value.trim();
            if (value) setText(value);
          }}
        >
          確認
        </button>
      </div>
    </>
  );
}
