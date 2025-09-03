import type { Metadata } from "next";
import "@/app/globals.css";
import "@/app/main.scss";
import Link from "next/link";

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
      <body className={"antialiased bg-light"}>
        <div className="max-w-3xl mx-auto">
          <div className="fixed z-10 w-full left-0 top-0 p-4 bg-plain">
            <div className="flex flex-col gap-2 justify-between items-center md:flex-row max-w-3xl mx-auto">
              <h1
                className="text-main font-bold text-2xl strokeText"
                data-stroke="噗浪安價小工具"
              >
                噗浪安價小工具
              </h1>
              <div className="flex gap-4 justify-end">
                <Link
                  href="/chunk"
                  className="bg-main rounded-full px-1 py-2 text-sm text-light text-center min-w-[120px] cursor-pointer hover:scale-105 transition-transform group relative"
                >
                  分段工具
                  <span className="tabHover group-hover:block">貼到噗浪上</span>
                </Link>
                <Link
                  href="/unit"
                  className="bg-main rounded-full px-1 py-2 text-sm text-light text-center min-w-[120px] cursor-pointer hover:scale-105 transition-transform group"
                >
                  組合工具
                  <span className="tabHover group-hover:block">製作好讀版</span>
                </Link>
              </div>
            </div>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
