import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

/**
 * IP 速率限制：每個 IP 在 WINDOW 秒內最多 LIMIT 次請求。
 *
 * saveData / getData 寫入 / 讀取 Redis，是最容易被濫用來刷免費方案額度的端點。
 * fetchPlurks 是打 Plurk 官方 API，由對方限速，不需要我們另外擋。
 *
 * Vercel 部署時應用在反向代理後方，request 的來源 IP 是代理伺服器，
 * 真正的用戶 IP 由代理放進 x-forwarded-for header 的第一個欄位。
 *
 * Redis 的 Lua script 是原子執行，不會有 race condition：
 * 若分開執行，兩個請求可能同時 INCR 後都沒設到 EXPIRE，導致 key 永遠不過期。
 */

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

export async function middleware(request: NextRequest) {
  console.log("middleware------");
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const pathname = request.nextUrl.pathname;

  // key 格式：rl:{ip}:{pathname}，區分不同 endpoint 各自計算次數
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
