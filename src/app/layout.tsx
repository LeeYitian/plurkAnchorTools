import type { Metadata } from "next";
import "@/app/globals.css";
import "@/app/main.scss";
import { LoadingProvider } from "@/providers/LoadingProvider";
import LoadingMask from "@/app/components/LoadingMask";
import { Suspense } from "react";
import SidePanel from "@/app/components/SidePanel";
import Header from "@/app/components/Header/Header";

export const metadata: Metadata = {
  title: "噗浪安價小工具 | Plurk Tools",
  description: "將長文切成適合噗浪留言的小段落、製作安價好讀版的小工具",
  // manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark:bg-bg">
      <body className={"antialiased"}>
        <LoadingProvider>
          <Suspense fallback={null}>
            <LoadingMask />
          </Suspense>
          <div className="max-w-4xl mx-auto">
            <Header />
            {children}
          </div>
          <SidePanel />
        </LoadingProvider>
      </body>
    </html>
  );
}
