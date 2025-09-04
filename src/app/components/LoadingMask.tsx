"use client";
import { LoadingContext } from "@/providers/LoadingProvider";
import { usePathname, useSearchParams } from "next/navigation";
import { useContext, useEffect } from "react";

export default function LoadingMask() {
  const [loading, setLoading] = useContext(LoadingContext);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-400/20 z-50">
          <div className="loading" />
        </div>
      )}
    </>
  );
}
