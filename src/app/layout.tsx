import type { Metadata } from "next";
import "@/app/globals.css";
import "@/app/main.scss";
import { LoadingProvider } from "@/providers/LoadingProvider";
import LoadingMask from "./components/LoadingMask";
import { Suspense } from "react";
import Navigator from "./components/Navigator";

export const metadata: Metadata = {
  title: "噗浪安價小工具 | Plurk Tools",
  description: "將長文切成適合噗浪留言的小段落、製作安價好讀版的小工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={"antialiased"}>
        <LoadingProvider>
          <Suspense fallback={null}>
            <LoadingMask />
          </Suspense>
          <div className="max-w-4xl mx-auto">
            <header className="fixed w-full left-0 top-0 p-3 bg-plain">
              <div className="flex flex-col gap-2 justify-between items-center md:flex-row max-w-4xl mx-auto">
                <h1
                  className="text-main font-bold text-2xl strokeText"
                  data-stroke="噗浪安價小工具"
                >
                  噗浪安價小工具
                </h1>
                <Navigator />
              </div>
            </header>
            {children}
          </div>
        </LoadingProvider>
      </body>
    </html>
  );
}
