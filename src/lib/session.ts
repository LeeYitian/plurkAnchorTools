import { redis } from "@/lib/redis";
import { ONE_MONTH } from "@/app/api/constants";

/**
 * OAuth access token 是敏感憑證，不應直接暴露在 cookie 中，
 * 即使是 httpOnly cookie 也受到 XSS 以外的威脅（如子網域攻擊、日誌洩漏）。
 * 這裡改用 session pattern：Cookie 只存 sessionId（UUID），即使被竊取也無法直接操作 Plurk API
 *
 * TTL 設 ONE_MONTH 為專案自訂。
 */
type SessionData = { token: string; secret: string };

export async function createSession(
  token: string,
  secret: string,
): Promise<string> {
  const sessionId = crypto.randomUUID();
  await redis.set(`session:${sessionId}`, { token, secret }, { ex: ONE_MONTH });
  return sessionId;
}

export async function getSession(
  sessionId: string,
): Promise<SessionData | null> {
  return redis.get<SessionData>(`session:${sessionId}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(`session:${sessionId}`);
}
