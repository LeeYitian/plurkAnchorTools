// import Image from next/image;
import { PlurksDataProvider } from "@/providers/PlurksDataProvider";
import PlurksArea from "./features/PlurksArea/PlurksArea";
import LinkArea from "./features/LinkArea";
import ArticleArea from "./features/ArticleArea/ArticleArea";
import PlurksAreaMobile from "./features/PlurksAreaMobile/PlurksAreaMobile";
import ArticleAreaMobile from "./features/ArticleAreaMobile/ArticleAreaMobile";
import {
  PlurksDrawer,
  PlurksDrawerContent,
  PlurksDrawerSide,
} from "./components/PlurksDrawer";
import { Toaster } from "sonner";

export default function Unit() {
  return (
    <PlurksDataProvider>
      <div className="w-full px-4 lg:px-0 mx-auto mt-[calc(115px+var(--spacing)*7)] md:mt-[calc(70px+var(--spacing)*7)] relative">
        <h3 className="text-main mb-4 font-bold">把安價整理成長文 v1.0.0</h3>
        <LinkArea />
        {/* 桌面版 */}
        <div className="hidden md:flex justify-between">
          <PlurksArea />
          <ArticleArea />
        </div>
        {/* 手機版 */}
        <div className="w-full block md:hidden">
          <PlurksDrawer>
            <PlurksDrawerContent>
              <PlurksAreaMobile />
            </PlurksDrawerContent>
            <PlurksDrawerSide>
              <ArticleAreaMobile />
            </PlurksDrawerSide>
          </PlurksDrawer>
        </div>
      </div>
      <Toaster
        position="top-left"
        offset={{ left: "40%", top: "5%" }}
        visibleToasts={1}
        toastOptions={{
          style: {
            width: "250px",
            height: "40px",
          },
          classNames: {
            title: "text-main! text-sm",
            icon: "text-main",
          },
          duration: 1000,
        }}
      />
    </PlurksDataProvider>
  );
}
