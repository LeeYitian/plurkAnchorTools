// import Image from next/image;
import { PlurksDataProvider } from "../../providers/PlurksDataProvider";
import ArticleArea from "./features/ArticleArea";
import LinkArea from "./features/LinkArea";

export default function Unit() {
  return (
    <PlurksDataProvider>
      <div className="w-full px-4 lg:px-0 mx-auto mt-[calc(115px+var(--spacing)*7)] md:mt-[calc(75px+var(--spacing)*7)] relative">
        <h3 className="text-main mb-4 font-bold">把安價整理成長文 v1.0.0</h3>
        <LinkArea />
        <ArticleArea />
      </div>
    </PlurksDataProvider>
  );
}
