"use client";
import { useMemo, useState } from "react";
import SplitResult from "../components/SplitResult";
import TextArea from "../components/TextArea";
import { splitTextUtils } from "../utils/splitText";

export default function ChunkArea() {
  const [originalText, setOriginalText] = useState("");

  const clearTexts = () => {
    setOriginalText("");
  };
  const setTexts = (value: string) => {
    setOriginalText(value);
  };

  const splitTexts = useMemo(() => {
    return splitTextUtils.countAndSplit(originalText);
  }, [originalText]);

  return (
    <>
      <TextArea clearTexts={clearTexts} setText={setTexts} />
      <SplitResult splitTexts={splitTexts} />
    </>
  );
}
