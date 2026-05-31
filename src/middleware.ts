import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "@/app/lib/redis";

const LIMIT = 10;
const WINDOW = 60;

export const config = {
  matcher: [
    "/api/saveData/:path*",
    "/api/saveData",
    "/api/getData/:path*",
    "/api/getData",
  ],
};

//避免短時間請求過多
export async function middleware(request: NextRequest) {
  console.log("middleware------");
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const pathname = request.nextUrl.pathname;

  const key = `rl:${ip}:${pathname}`;

  const allowed = await redis.eval(
    `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local ttl = tonumber(ARGV[2])

  local current = redis.call("INCR", key)

  if current == 1 then
    redis.call("EXPIRE", key, ttl)
  end

  if current > limit then
    return 0
  end

  return 1
  `,
    [key],
    [LIMIT, WINDOW],
  );
  if (allowed === 0) {
    return NextResponse.json({ error: "短時間請求過多" }, { status: 429 });
  }

  return NextResponse.next();
}
