"use client";
import { LoadingContext } from "@/providers/LoadingProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
export default function Navigator() {
  const [, setLoading] = useContext(LoadingContext);
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 justify-end">
      <Link
        href="/chunk"
        className="bg-main rounded-full px-1 py-1 text-sm text-light text-center min-w-[120px] cursor-pointer hover:scale-105 transition-transform group relative"
        onClick={() => {
          if (pathname === "/chunk") return;
          setLoading(true);
        }}
      >
        分段工具
        <span className="tabHover group-hover:block">貼到噗浪上</span>
      </Link>
      <Link
        href="/unit"
        className="bg-main rounded-full px-1 py-1 text-sm text-light text-center min-w-[120px] cursor-pointer hover:scale-105 transition-transform group"
        onClick={() => {
          if (pathname === "/unit") return;
          setLoading(true);
        }}
      >
        組合工具
        <span className="tabHover group-hover:block">製作好讀版</span>
      </Link>
    </nav>
  );
}
